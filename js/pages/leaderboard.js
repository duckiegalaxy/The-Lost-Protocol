const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PATHS = [['g16', 'Grades 1 to 6'], ['g710', 'Grades 7 to 10'], ['g1112', 'Grades 11 to 12'], ['adult', 'College and adult']];
const DIFFS = [['beg', 'Beginner'], ['int', 'Intermediate'], ['pro', 'Professional']];
const PER = 15;
let path = 'g16', diff = 'int', indPage = 0;
let indSearch = '', today = false, weekOnly = false, indReq = 0;

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


const PLATES = {
  rookie:  ['Rookie',          't-rookie',  'Fresh compile, fresh start.'],
  coder:   ['Certified Coder', 't-coder',   'Syntax approved by the Protocol.'],
  hero:    ['Hero',            't-hero',    'Guardians fear this one.'],
  legend:  ['Living Legend',   't-legend',  'The leaderboard bows to you.'],
  star:    ['Star Coder',      't-star',    'Bright enough to navigate by.'],
  champ:   ['Champion',        't-champ',   'Undefeated. Mostly.'],
  overlord:['Overlord',        't-overlord','The Protocol fears you.'],
  mythic:  ['Mythic',          't-mythic',  'Legends are printed with your name.'],
  coadmin: ['Co-Admin',        't-coadmin', 'Second-in-command of the Protocol.']
};
function plate(r) {
  const t = r && r.avatar && r.avatar.look && r.avatar.look.title;
  const p = t && PLATES[t];
  return p ? '<span class="lb-plate ' + p[1] + '" title="' + esc(p[2]) + '">' + p[0] + '</span>' : '';
}


function av(r, px) {
  if (r.avatar && typeof r.avatar === 'object' && Object.keys(r.avatar).length && window.TLP_AVATAR) return TLP_AVATAR.mini(r.avatar, px || 26);
  const initial = String((r && (r.display_name || r.player_id)) || '?').trim().charAt(0).toUpperCase() || '?';
  return '<span class="avatar-fallback">' + esc(initial) + '</span>';
}






function buildTabs() {
  $('#pathTabs').innerHTML = PATHS.map(([id, n]) => '<button type="button" role="tab" data-id="' + id + '" aria-selected="' + (id === path) + '">' + n + '</button>').join('');
  $('#diffChips').innerHTML = DIFFS.map(([id, n]) => '<button type="button" data-id="' + id + '" aria-pressed="' + (id === diff) + '">' + n + '</button>').join('');
  $('#pathTabs').querySelectorAll('button').forEach((b) => b.onclick = () => { path = b.dataset.id; indPage = 0; today = false; weekOnly = false; $('#todayChip').setAttribute('aria-pressed', 'false'); $('#weekChip').setAttribute('aria-pressed', 'false'); buildTabs(); loadInd(); });
  $('#diffChips').querySelectorAll('button').forEach((b) => b.onclick = () => { diff = b.dataset.id; indPage = 0; buildTabs(); loadInd(); });
}


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





function kidCards(list) {
  return '<div class="lbkid">' + list.map((r) =>
    '<article class="kcard r' + (r.rank <= 3 ? r.rank : 0) + '">' +
      '<span class="krank" aria-label="Rank ' + r.rank + '">' + r.rank + '</span>' +
      '<span class="kface" aria-hidden="true"><i></i><i></i></span>' +
      '<div class="kwho"><span class="kwav">' + av(r, 30) + '</span><b>' + esc(r.display_name) + plate(r) + '</b><small>' + esc(r.player_id) + '</small></div>' +
      '<div class="kscore"><b>' + r.total_score + '</b><span>points</span></div>' +
      '<div class="kstars">★ ' + r.total_stars + ' stars · ' + r.chapters_cleared + ' chapters · ' + r.badges + ' guardians</div>' +
    '</article>').join('') + '</div>';
}
function podium(list) {
  const order = [list[1], list[0], list[2]].filter(Boolean);
  return '<div class="lbpodium">' + order.map((r) =>
    '<article class="pcard p' + r.rank + '"><span class="prank">' + medal(r.rank) + '</span><span class="pav">' + av(r, 40) + '</span><b>' + esc(r.display_name) + plate(r) + '</b><small>' + esc(r.player_id) + '</small><strong>' + r.total_score + '</strong><span>' + r.total_stars + ' stars · ' + r.chapters_cleared + ' chapters</span></article>').join('') + '</div>';
}
function teenTable(list) {
  return '<div class="tw"><table class="t lbt"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Stars</th><th>Chapters</th><th>Guardians</th><th>Updated</th></tr></thead><tbody>' +
    list.map((r) => '<tr class="' + (r.rank <= 3 ? 'top' + r.rank : '') + '"><td class="rk">' + r.rank + '</td><td><span class="tav">' + av(r, 24) + '</span><b>' + esc(r.display_name) + plate(r) + '</b> <span class="pidc">' + esc(r.player_id) + '</span></td><td class="n">' + r.total_score + '</td><td class="n">' + r.total_stars + '</td><td class="n">' + r.chapters_cleared + '</td><td class="n">' + r.badges + '/6</td><td class="n">' + esc(fmtDate(r.updated_at)) + '</td></tr>').join('') +
    '</tbody></table></div>';
}
function seniorGrid(list) {
  const max = Math.max.apply(null, list.map((r) => r.total_score).concat([1]));
  return '<div class="lbterm"><div class="thead"><span>#</span><span>player</span><span>score</span><span>sig</span></div>' +
    list.map((r) => '<div class="trow' + (r.rank <= 3 ? ' hot' : '') + '"><span class="trk">' + String(r.rank).padStart(2, '0') + '</span><span class="twho"><span class="tav">' + av(r, 24) + '</span><b>' + esc(r.display_name) + plate(r) + '</b><small>' + esc(r.player_id) + ' · ' + esc(fmtDate(r.updated_at)) + '</small></span><span class="tnum">' + r.total_score + '</span><span class="tbar" aria-hidden="true"><i style="width:' + Math.max(4, Math.round(r.total_score / max * 100)) + '%"></i></span></div>').join('') +
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
        '<div class="awho"><span class="aav" aria-hidden="true">' + av(r, 30) + '</span><div class="aname"><b>' + esc(r.display_name) + plate(r) + '</b><small title="' + esc(fmtDate(r.updated_at)) + '">' + esc(r.player_id) + ' · ' + esc(ago(r.updated_at)) + '</small></div></div>' +
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


$('#indBody').addEventListener('click', (e) => {
  const b = e.target.closest('.srrow');
  if (!b) return;
  path = b.dataset.path; diff = b.dataset.diff; indPage = 0;
  indSearch = ''; today = false; weekOnly = false;
  $('#indSearch').value = ''; $('#indClear').hidden = true;
  $('#todayChip').setAttribute('aria-pressed', 'false'); $('#weekChip').setAttribute('aria-pressed', 'false');
  buildTabs(); loadInd();
});

let _lb = null; try { _lb = JSON.parse(localStorage.getItem('tlp-lb') || 'null'); } catch (e) {}
if (_lb) {
  if (_lb.path) path = _lb.path;
  if (_lb.diff) diff = _lb.diff;
  if (typeof _lb.indPage === 'number') indPage = _lb.indPage;
  if (typeof _lb.today === 'boolean') today = _lb.today;
  if (typeof _lb.weekOnly === 'boolean') weekOnly = _lb.weekOnly;
  if (typeof _lb.indSearch === 'string') { indSearch = _lb.indSearch; const _i = $('#indSearch'); if (_i) _i.value = indSearch; }
  if (indSearch) { const _cl = $('#indClear'); if (_cl) _cl.hidden = false; }
  if (today) { const _tc = $('#todayChip'); if (_tc) _tc.setAttribute('aria-pressed', 'true'); }
  if (weekOnly) { const _wc = $('#weekChip'); if (_wc) _wc.setAttribute('aria-pressed', 'true'); }
}
buildTabs(); loadInd();

function saveLb() { try { localStorage.setItem('tlp-lb', JSON.stringify({ path, diff, indPage, today, weekOnly, indSearch })); } catch (e) {} }
window.addEventListener('beforeunload', saveLb);
window.addEventListener('pagehide', saveLb);
document.addEventListener('visibilitychange', function () { if (document.hidden) saveLb(); });
