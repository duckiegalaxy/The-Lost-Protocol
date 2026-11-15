/* =============================================================================
   LEADERBOARD LOGIC  (js/pages/leaderboard.js)
   -----------------------------------------------------------------------------
   Powers leaderboard.html. Two boards share one page: individual scores and
   co-op matches. Both are read-only views over server data; nothing here can
   submit a score.
   
   Ties are ranked naturally: equal score and stars share a rank, and the next
   rank skips the tied positions.
   Areas in this file:
     - formatting helpers
     - the tab bar
     - the individual board and its shared-rank calculation
     - the co-op board
     - keyboard and swipe switching between boards
   ============================================================================= */
const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PATHS = [['g16', 'Grades 1 to 6'], ['g710', 'Grades 7 to 10'], ['g1112', 'Grades 11 to 12'], ['adult', 'College and adult']];
const DIFFS = [['beg', 'Beginner'], ['int', 'Intermediate'], ['pro', 'Professional']];
const PER = 15;
let path = 'g16', diff = 'int', indPage = 0, week = '', coPage = 0, coLoaded = false;

function fmtTime(ms) { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString(); } catch (e) { return ''; } }

/* -----------------------------------------------------------------------------
   Tab bar
   Tabs are buttons, not links, so they keep the page scroll position while
   switching data sets.
   -------------------------------------------------------------------------- */
function buildTabs() {
  $('#pathTabs').innerHTML = PATHS.map(([id, n]) => '<button type="button" role="tab" data-id="' + id + '" aria-selected="' + (id === path) + '">' + n + '</button>').join('');
  $('#diffChips').innerHTML = DIFFS.map(([id, n]) => '<button type="button" data-id="' + id + '" aria-pressed="' + (id === diff) + '">' + n + '</button>').join('');
  $('#pathTabs').querySelectorAll('button').forEach((b) => b.onclick = () => { path = b.dataset.id; indPage = 0; buildTabs(); loadInd(); });
  $('#diffChips').querySelectorAll('button').forEach((b) => b.onclick = () => { diff = b.dataset.id; indPage = 0; buildTabs(); loadInd(); });
}

async function loadInd() {
  const body = $('#indBody'); body.className = 'msg3'; body.textContent = 'Loading...';
  try {
    const { rows, hasMore } = await A().getPublicLeaderboardPage({ path, diff, offset: indPage * PER, limit: PER });
    if (!rows.length) { body.textContent = indPage ? 'No more entries.' : 'No scores yet in this group. Finish a mission to be the first.'; }
    else {
      body.className = '';
      // shared rank for equal score and stars (rank counts from the first row of the whole table)
      let html = '<table class="t"><thead><tr><th>Rank</th><th>Player ID</th><th>Name</th><th>Score</th><th>Stars</th><th>Chapters</th><th>Badges</th><th>Updated</th></tr></thead><tbody>';
      let prev = null, prevRank = 0;
      rows.forEach((r, i) => {
        const pos = indPage * PER + i + 1;
        const same = prev && prev.total_score === r.total_score && prev.total_stars === r.total_stars;
        const rank = same ? prevRank : pos; prev = r; prevRank = rank;
        html += '<tr><td class="rk">' + rank + '</td><td class="pidc">' + esc(r.player_id) + '</td><td>' + esc(r.display_name) + '</td><td>' + r.total_score + '</td><td>' + r.total_stars + '</td><td>' + r.chapters_cleared + '</td><td>' + r.badges + ' of 6</td><td>' + esc(fmtDate(r.updated_at)) + '</td></tr>';
      });
      body.innerHTML = html + '</tbody></table>';
    }
    $('#indPrev').disabled = indPage === 0; $('#indNext').disabled = !hasMore; $('#indPage').textContent = 'Page ' + (indPage + 1);
  } catch (e) { body.textContent = 'The leaderboard could not be loaded. Please try again later.'; $('#indNext').disabled = true; }
}
$('#indPrev').onclick = () => { indPage = Math.max(0, indPage - 1); loadInd(); };
$('#indNext').onclick = () => { indPage++; loadInd(); };

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
  try {
    const { rows, hasMore } = await A().getCoopLeaderboardPage({ challengeId: week, offset: coPage * PER, limit: PER });
    if (!rows.length) { body.textContent = coPage ? 'No more entries.' : 'No completed co-op matches yet. Be the first team on the board.'; }
    else {
      body.className = '';
      let html = '<table class="t"><thead><tr><th>Rank</th><th>Team</th><th>Score</th><th>Time</th><th>Steps</th><th>Mission</th><th>Date</th></tr></thead><tbody>', prev = null, prevRank = 0;
      rows.forEach((r, i) => {
        const pos = coPage * PER + i + 1, same = prev && prev.score === r.score && prev.duration_ms === r.duration_ms;
        const rank = same ? prevRank : pos; prev = r; prevRank = rank;
        html += '<tr><td class="rk">' + rank + '</td><td>' + esc(r.p1_name) + ' <span class="pidc">' + esc(r.p1_player_id) + '</span><br>' + esc(r.p2_name) + ' <span class="pidc">' + esc(r.p2_player_id) + '</span></td><td>' + r.score + '</td><td>' + fmtTime(r.duration_ms) + '</td><td>' + r.steps + '</td><td>' + esc(r.challenge_id) + '</td><td>' + esc(fmtDate(r.finished_at)) + '</td></tr>';
      });
      body.innerHTML = html + '</tbody></table>';
    }
    $('#coPrev').disabled = coPage === 0; $('#coNext').disabled = !hasMore; $('#coPage').textContent = 'Page ' + (coPage + 1);
  } catch (e) { body.textContent = 'The co-op leaderboard could not be loaded. Please try again later.'; $('#coNext').disabled = true; }
}
$('#coPrev').onclick = () => { coPage = Math.max(0, coPage - 1); loadCo(); };
$('#coNext').onclick = () => { coPage++; loadCo(); };

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

buildTabs(); loadInd();
