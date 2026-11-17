/* =============================================================================
   LEADERBOARD LOGIC  (js/pages/leaderboard.js)
   -----------------------------------------------------------------------------
   Powers leaderboard.html. Two boards share one page: individual scores and
   co-op matches. Both are read-only views over server data; nothing here can
   submit a score.
   
   The individual board changes shape with the age group:
     Grades 1-6    sticker cards with a friendly robot face
     Grades 7-10   podium plus a clean scoreboard
     Grades 11-12  dense terminal grid with score bars
     College/adult a quiet editorial list
   Search and the "Active today" filter work on every layout and are also
   available for co-op teams. Equal score and stars share a rank.
   Areas in this file:
     - formatting and rank helpers
     - the tab bar and filters
     - the individual board (four layouts)
     - the co-op board
     - search, keyboard and swipe controls
   ============================================================================= */
const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PATHS = [['g16', 'Grades 1 to 6'], ['g710', 'Grades 7 to 10'], ['g1112', 'Grades 11 to 12'], ['adult', 'College and adult']];
const DIFFS = [['beg', 'Beginner'], ['int', 'Intermediate'], ['pro', 'Professional']];
const PER = 15;
let path = 'g16', diff = 'int', indPage = 0, week = '', coPage = 0, coLoaded = false;
let indSearch = '', coSearch = '', today = false, weekOnly = false, indReq = 0, coReq = 0;

function fmtTime(ms) { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString(); } catch (e) { return ''; } }
function ago(d) {
  const t = new Date(d).getTime();
  if (!t) return '';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return days + ' days ago';
  return fmtDate(d);
}
function medal(n) { return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : ''; }

/* -----------------------------------------------------------------------------
   Tab bar
   Tabs are buttons, not links, so they keep the page scroll position while
   switching data sets.
   -------------------------------------------------------------------------- */
function buildTabs() {
  $('#pathTabs').innerHTML = PATHS.map(([id, n]) => '<button type="button" role="tab" data-id="' + id + '" aria-selected="' + (id === path) + '">' + n + '</button>').join('');
  $('#diffChips').innerHTML = DIFFS.map(([id, n]) => '<button type="button" data-id="' + id + '" aria-pressed="' + (id === diff) + '">' + n + '</button>').join('');
  $('#pathTabs').querySelectorAll('button').forEach((b) => b.onclick = () => { path = b.dataset.id; indPage = 0; today = false; weekOnly = false; $('#todayChip').setAttribute('aria-pressed', 'false'); $('#weekChip').setAttribute('aria-pressed', 'false'); buildTabs(); loadInd(); });
  $('#diffChips').querySelectorAll('button').forEach((b) => b.onclick = () => { diff = b.dataset.id; indPage = 0; buildTabs(); loadInd(); });
}

/* Rank is the position in the full table, so equal rows keep the same number. */
function ranked(rows) {
  let prev = null, prevRank = 0;
  return rows.map((r, i) => {
    const pos = indPage * PER + i + 1;
    const same = prev && prev.total_score === r.total_score && prev.total_stars === r.total_stars;
    const rank = same ? prevRank : pos;
    prev = r; prevRank = rank;
    return Object.assign({ rank: rank }, r);
  });
}

/* -----------------------------------------------------------------------------
   The four age layouts. All of them read the same row shape, so switching the
   age tab changes the presentation and nothing else.
   -------------------------------------------------------------------------- */
function kidCards(list) {
  return '<div class="lbkid">' + list.map((r) =>
    '<article class="kcard r' + (r.rank <= 3 ? r.rank : 0) + '">' +
      '<span class="krank" aria-label="Rank ' + r.rank + '">' + r.rank + '</span>' +
      '<span class="kface" aria-hidden="true"><i></i><i></i></span>' +
      '<div class="kwho"><b>' + esc(r.display_name) + '</b><small>' + esc(r.player_id) + '</small></div>' +
      '<div class="kscore"><b>' + r.total_score + '</b><span>points</span></div>' +
      '<div class="kstars">★ ' + r.total_stars + ' stars · ' + r.chapters_cleared + ' chapters · ' + r.badges + ' guardians</div>' +
    '</article>').join('') + '</div>';
}
function podium(list) {
  const order = [list[1], list[0], list[2]].filter(Boolean);
  return '<div class="lbpodium">' + order.map((r) =>
    '<article class="pcard p' + r.rank + '"><span class="prank">' + medal(r.rank) + '</span><b>' + esc(r.display_name) + '</b><small>' + esc(r.player_id) + '</small><strong>' + r.total_score + '</strong><span>' + r.total_stars + ' stars · ' + r.chapters_cleared + ' chapters</span></article>').join('') + '</div>';
}
function teenTable(list) {
  return '<div class="tw"><table class="t lbt"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Stars</th><th>Chapters</th><th>Guardians</th><th>Updated</th></tr></thead><tbody>' +
    list.map((r) => '<tr class="' + (r.rank <= 3 ? 'top' + r.rank : '') + '"><td class="rk">' + r.rank + '</td><td><b>' + esc(r.display_name) + '</b> <span class="pidc">' + esc(r.player_id) + '</span></td><td class="n">' + r.total_score + '</td><td class="n">' + r.total_stars + '</td><td class="n">' + r.chapters_cleared + '</td><td class="n">' + r.badges + '/6</td><td class="n">' + esc(fmtDate(r.updated_at)) + '</td></tr>').join('') +
    '</tbody></table></div>';
}
function seniorGrid(list) {
  const max = Math.max.apply(null, list.map((r) => r.total_score).concat([1]));
  return '<div class="lbterm"><div class="thead"><span>#</span><span>player</span><span>score</span><span>sig</span></div>' +
    list.map((r) => '<div class="trow' + (r.rank <= 3 ? ' hot' : '') + '"><span class="trk">' + String(r.rank).padStart(2, '0') + '</span><span class="twho"><b>' + esc(r.display_name) + '</b><small>' + esc(r.player_id) + ' · ' + esc(fmtDate(r.updated_at)) + '</small></span><span class="tnum">' + r.total_score + '</span><span class="tbar" aria-hidden="true"><i style="width:' + Math.max(4, Math.round(r.total_score / max * 100)) + '%"></i></span></div>').join('') +
    '</div><p class="tfootline">stars ' + list.reduce((a, r) => a + r.total_stars, 0) + ' · chapters ' + list.reduce((a, r) => a + r.chapters_cleared, 0) + ' · guardians ' + list.reduce((a, r) => a + r.badges, 0) + '</p>';
}
function adultList(list) {
  const max = Math.max.apply(null, list.map((r) => r.total_score).concat([1]));
  const initial = (r) => { const n = String(r.display_name || '?').trim(); return esc((n.charAt(0) || '?').toUpperCase()); };
  return '<div class="lbadult">' +
    '<div class="ahead" aria-hidden="true"><span>Rank</span><span>Player</span><span>Progress</span><span>Score</span></div>' +
    list.map((r) =>
      '<article class="arow' + (r.rank <= 3 ? ' lead r' + r.rank : '') + '">' +
        '<span class="arank">' + r.rank + '</span>' +
        '<div class="awho"><span class="aav" aria-hidden="true">' + initial(r) + '</span><div class="aname"><b>' + esc(r.display_name) + '</b><small title="' + esc(fmtDate(r.updated_at)) + '">' + esc(r.player_id) + ' · ' + esc(ago(r.updated_at)) + '</small></div></div>' +
        '<div class="ameta"><span><b>' + r.total_stars + '</b> stars</span><span><b>' + r.chapters_cleared + '</b> chapters</span><span><b>' + r.badges + '</b> guardians</span></div>' +
        '<div class="ascore"><strong>' + r.total_score + '</strong><span class="abar" aria-hidden="true"><i style="width:' + Math.max(3, Math.round(r.total_score / max * 100)) + '%"></i></span></div>' +
      '</article>').join('') +
    '</div>';
}

function renderInd(rows) {
  const body = $('#indBody');
  const slide = body.closest('.slide');
  if (slide) slide.classList.toggle('adultBoard', path === 'adult' && rows.length > 0);
  if (!rows.length) {
    body.className = 'msg3';
    body.textContent = indSearch ? 'No player matches "' + indSearch + '" in this group.' : today ? 'Nobody has played this group today yet.' : weekOnly ? 'Nobody has played this group this week yet.' : indPage ? 'No more entries.' : 'No scores yet in this group. Finish a mission to be the first.';
    return;
  }
  body.className = 'lb-' + path;
  const list = ranked(rows);
  if (path === 'g16') { body.innerHTML = kidCards(list); return; }
  if (path === 'adult') { body.innerHTML = adultList(list); return; }
  if (path === 'g1112') { body.innerHTML = seniorGrid(list); return; }
  const showPod = indPage === 0 && !indSearch && !today && !weekOnly && list.length > 1;
  body.innerHTML = (showPod ? podium(list.slice(0, 3)) : '') + teenTable(showPod ? list.slice(3) : list);
}

async function loadInd() {
  const body = $('#indBody'); body.className = 'msg3'; body.textContent = 'Loading...';
  const req = ++indReq;
  const note = $('#indNote');
  if (note) { note.hidden = !(indSearch || today || weekOnly); note.textContent = indSearch ? 'Search results for "' + indSearch + '".' : today ? 'Only players who finished something today are listed.' : 'Only players who played this week are listed.'; }
  try {
    const { rows, hasMore } = await A().getPublicLeaderboardPage({ path, diff, offset: indPage * PER, limit: PER, search: indSearch, today: today, week: weekOnly });
    if (req !== indReq) return;
    // A parent or teacher usually knows the name, not the age group and
    // difficulty, so an empty scoped search also checks every other group.
    if (indSearch && !rows.length) {
      const hits = await searchEveryGroup(indSearch);
      if (req !== indReq) return;
      if (hits.length) { renderSearchAll(hits); $('#indPrev').disabled = true; $('#indNext').disabled = true; $('#indPage').textContent = 'Search'; return; }
    }
    renderInd(rows);
    $('#indPrev').disabled = indPage === 0; $('#indNext').disabled = !hasMore; $('#indPage').textContent = 'Page ' + (indPage + 1);
    loadMyRank();
  } catch (e) {
    if (req !== indReq) return;
    body.className = 'msg3'; body.textContent = 'The leaderboard could not be loaded. Please try again later.';
    $('#indNext').disabled = true;
  }
}
/* One row per matching player, with the group it belongs to. */
async function searchEveryGroup(term) {
  const jobs = [];
  PATHS.forEach(([p]) => DIFFS.forEach(([d]) => {
    if (p === path && d === diff) return;
    jobs.push(A().getPublicLeaderboardPage({ path: p, diff: d, offset: 0, limit: 5, search: term, today: today, week: weekOnly })
      .then((r) => r.rows.map((row) => Object.assign({ path: p, diff: d }, row)))
      .catch(() => []));
  }));
  const parts = await Promise.all(jobs);
  return parts.reduce((a, b) => a.concat(b), []).sort((a, b) => b.total_score - a.total_score);
}
function renderSearchAll(hits) {
  const body = $('#indBody');
  const pn = Object.fromEntries(PATHS), dn = Object.fromEntries(DIFFS);
  body.className = 'lbsrch';
  body.textContent = '';
  const head = document.createElement('p');
  head.className = 'srnote';
  head.textContent = 'Not in this group. ' + hits.length + ' other ' + (hits.length === 1 ? 'player matches' : 'players match') + ' "' + indSearch + '".';
  body.appendChild(head);
  hits.forEach((h) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'srrow';
    b.dataset.path = h.path; b.dataset.diff = h.diff;
    b.innerHTML = '<b>' + esc(h.display_name) + '</b><small>' + esc(h.player_id) + ' · ' + esc(pn[h.path] || h.path) + ' · ' + esc(dn[h.diff] || h.diff) + '</small><strong>' + (h.total_score || 0) + '</strong>';
    body.appendChild(b);
  });
}
async function loadMyRank() {
  const el = $('#myRank'); if (!el) return;
  let l = null;
  try { l = A().getActiveLearner(); } catch (e) {}
  if (!l || l.isGuest || !l.player_id) { el.hidden = true; return; }
  try {
    const r = await A().getLeaderboardRank({ path, diff, playerId: l.player_id });
    if (!r) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<span class="mr-lbl">Your position</span><b>#' + r.rank + '</b><span>' + esc(r.row.display_name) + ' · ' + r.row.total_score + ' points · ' + esc(r.row.player_id) + '</span>';
  } catch (e) { el.hidden = true; }
}
$('#indPrev').onclick = () => { indPage = Math.max(0, indPage - 1); loadInd(); };
$('#indNext').onclick = () => { indPage++; loadInd(); };

function doIndSearch() {
  const v = $('#indSearch').value.trim();
  indSearch = v; indPage = 0;
  const c = $('#indClear'); if (c) c.hidden = !v;
  loadInd();
}
$('#indFind').onclick = doIndSearch;
$('#indSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doIndSearch(); } });
$('#indClear').onclick = () => { $('#indSearch').value = ''; indSearch = ''; indPage = 0; $('#indClear').hidden = true; loadInd(); };
$('#todayChip').onclick = () => {
  today = !today; if (today) weekOnly = false; indPage = 0;
  $('#todayChip').setAttribute('aria-pressed', String(today));
  $('#weekChip').setAttribute('aria-pressed', String(weekOnly));
  loadInd();
};
$('#weekChip').onclick = () => {
  weekOnly = !weekOnly; if (weekOnly) today = false; indPage = 0;
  $('#weekChip').setAttribute('aria-pressed', String(weekOnly));
  $('#todayChip').setAttribute('aria-pressed', String(today));
  loadInd();
};

/* -----------------------------------------------------------------------------
   Co-op board
   Loaded on first use. Matches are already finished server-side, so this view
   only formats them.
   -------------------------------------------------------------------------- */
async function initCo() {
  coLoaded = true;
  try {
    const weeks = await A().getCoopChallenges();
    if (weeks.length) week = weeks[0];
    $('#weekChips').innerHTML = weeks.length ? weeks.map((w) => '<button type="button" data-id="' + esc(w) + '" aria-pressed="' + (w === week) + '">Mission ' + esc(w) + '</button>').join('') : '';
    $('#weekChips').querySelectorAll('button').forEach((b) => b.onclick = () => { week = b.dataset.id; coPage = 0; $('#weekChips').querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', o === b)); loadCo(); });
  } catch (e) {}
  loadCo();
}
async function loadCo() {
  const body = $('#coBody'); body.className = 'msg3'; body.textContent = 'Loading...';
  const req = ++coReq;
  try {
    const { rows, hasMore } = await A().getCoopLeaderboardPage({ challengeId: week, offset: coPage * PER, limit: PER, search: coSearch });
    if (req !== coReq) return;
    if (!rows.length) { body.textContent = coSearch ? 'No team matches "' + coSearch + '".' : coPage ? 'No more entries.' : 'No completed co-op matches yet. Be the first team on the board.'; }
    else {
      body.className = '';
      let html = '<div class="tw"><table class="t lbt"><thead><tr><th>Rank</th><th>Team</th><th>Score</th><th>Time</th><th>Steps</th><th>Mission</th><th>Date</th></tr></thead><tbody>', prev = null, prevRank = 0;
      rows.forEach((r, i) => {
        const pos = coPage * PER + i + 1, same = prev && prev.score === r.score && prev.duration_ms === r.duration_ms;
        const rank = same ? prevRank : pos; prev = r; prevRank = rank;
        html += '<tr class="' + (rank <= 3 ? 'top' + rank : '') + '"><td class="rk">' + rank + '</td><td><b>' + esc(r.p1_name) + '</b> <span class="pidc">' + esc(r.p1_player_id) + '</span><br><b>' + esc(r.p2_name) + '</b> <span class="pidc">' + esc(r.p2_player_id) + '</span></td><td class="n">' + r.score + '</td><td class="n">' + fmtTime(r.duration_ms) + '</td><td class="n">' + r.steps + '</td><td class="n">' + esc(r.challenge_id) + '</td><td class="n">' + esc(fmtDate(r.finished_at)) + '</td></tr>';
      });
      body.innerHTML = html + '</tbody></table></div>';
    }
    $('#coPrev').disabled = coPage === 0; $('#coNext').disabled = !hasMore; $('#coPage').textContent = 'Page ' + (coPage + 1);
  } catch (e) {
    if (req !== coReq) return;
    body.className = 'msg3'; body.textContent = 'The co-op leaderboard could not be loaded. Please try again later.';
    $('#coNext').disabled = true;
  }
}
$('#coPrev').onclick = () => { coPage = Math.max(0, coPage - 1); loadCo(); };
$('#coNext').onclick = () => { coPage++; loadCo(); };
function doCoSearch() {
  coSearch = $('#coSearch').value.trim(); coPage = 0;
  const c = $('#coClear'); if (c) c.hidden = !coSearch;
  loadCo();
}
$('#coFind').onclick = doCoSearch;
$('#coSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doCoSearch(); } });
$('#coClear').onclick = () => { $('#coSearch').value = ''; coSearch = ''; coPage = 0; $('#coClear').hidden = true; loadCo(); };

// sliding between Individual and Co-op: buttons, arrow keys on the buttons, and a swipe on touch screens
function show(co) {
  $('#slides').classList.toggle('co', co);
  $('#tInd').setAttribute('aria-selected', !co); $('#tCo').setAttribute('aria-selected', co);
  if (co && !coLoaded) initCo();
}
$('#tInd').onclick = () => show(false); $('#tCo').onclick = () => show(true);
document.querySelector('.swt').addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { show(true); $('#tCo').focus(); } if (e.key === 'ArrowLeft') { show(false); $('#tInd').focus(); } });
let sx = null;
$('#view').addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
$('#view').addEventListener('touchend', (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 70 && !e.target.closest('.tw,.tabs2')) show(dx < 0); }, { passive: true });

// A cross-group search result opens the board that player belongs to.
$('#indBody').addEventListener('click', (e) => {
  const b = e.target.closest('.srrow');
  if (!b) return;
  path = b.dataset.path; diff = b.dataset.diff; indPage = 0;
  indSearch = ''; today = false; weekOnly = false;
  $('#indSearch').value = ''; $('#indClear').hidden = true;
  $('#todayChip').setAttribute('aria-pressed', 'false'); $('#weekChip').setAttribute('aria-pressed', 'false');
  buildTabs(); loadInd();
});

buildTabs(); loadInd();
