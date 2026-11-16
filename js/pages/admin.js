/* =============================================================================
   ADMIN DASHBOARD LOGIC  (js/pages/admin.js)
   -----------------------------------------------------------------------------
   Powers admin.html. Every action here is already permission-checked in the
   database: this file only renders what the server returns. If an admin is not
   signed in, adminBoot() shows the gate and stops.
   
   Nothing in this file touches gameplay or learner progress directly; the only
   write actions are the maintenance buttons (bug status, test-data purge).
   Areas in this file:
     - helpers and the table renderer
     - one loader per tab (profiles, leaderboard, co-op, feedback, bugs, test data)
     - tab switching and the permission gate in adminBoot()
   ============================================================================= */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const A = () => window.TLP_AUTH;
const fmt = (d) => { try { return d ? new Date(d).toLocaleString() : ''; } catch (e) { return ''; } };
const say = (t, bad) => { const m = $('#msg'); m.textContent = t || ''; m.style.color = bad ? '#ef7a8c' : ''; };
let current = 'overview';

/* -----------------------------------------------------------------------------
   Story map
   The game itself owns the text (js/story.js) and the chapter order
   (js/pages/webgame.js SEC). This table only mirrors that order so the
   dashboard can show every scene in the exact sequence a player meets it.
   -------------------------------------------------------------------------- */
const STORY_ACTS = [
  { t: 'The Basics', d: 'How programs think: steps, boxes, repeats and decisions.', ch: [4, 0, 1, 2], boss: 3 },
  { t: 'Data', d: 'What information is, and how to handle it safely.', ch: [5, 6, 7, 8], boss: 9 },
  { t: 'Tools', d: 'Do more with less code: maths, lists, input and notes.', ch: [10, 11, 12, 13], boss: 14 },
  { t: 'Structure', d: 'Build bigger programs from small reusable parts.', ch: [15, 16, 17, 18], boss: 19 },
  { t: 'Bits and Bytes', d: 'Go deep on the switches inside every computer.', ch: [20, 21, 22, 23], boss: 24 },
  { t: 'Mastery', d: 'Optional bonus: debug, search and optimise like a real programmer.', ch: [25, 26, 27, 28], boss: 29, bonus: true }
];
const CH_TITLES = {
  0: 'Variables', 1: 'Loops', 2: 'Logic', 3: 'The Glitch',
  4: 'Programming', 5: 'Constants', 6: 'Data Types', 7: 'Type Casting', 8: 'Strings', 9: 'The Hoarder',
  10: 'Operators', 11: 'Arrays', 12: 'Input and Output', 13: 'Comments', 14: 'The Cipher',
  15: 'Functions', 16: 'Scope', 17: 'Recursion', 18: 'Bits and Binary', 19: 'The Echo',
  20: 'Bits and Bytes', 21: 'Binary Counting', 22: 'Binary Maths', 23: 'Bit Operations', 24: 'The Byte',
  25: 'Debugging', 26: 'Searching', 27: 'Finding the Biggest', 28: 'Optimising', 29: 'The Origin'
};
let storyVer = 'std';
const S = () => window.TLP_STORY;
const SPATH = () => (storyVer === 'kid' ? 'g16' : 'adult');

/* One story card: where it appears on screen, when it fires, and the lines. */
function storyBlock(title, where, when, arr) {
  if (!arr || !arr.length) return '';
  return '<div class="stblock"><h4>' + esc(title) + '</h4>' +
    '<p class="stmeta"><b>Where</b> ' + esc(where) + '<br><b>When</b> ' + esc(when) + '</p>' +
    '<div class="stlines">' + S().lines(arr) + '</div></div>';
}

/* CSV export so the same figures can be pasted into the Google Sheet. */
function csvText(rows) {
  return rows.map((r) => r.map((v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\r\n');
}
function downloadCsv(name, rows) {
  const blob = new Blob(['\ufeff' + csvText(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name + '-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* -----------------------------------------------------------------------------
   Table renderer
   All tabs share one markup shape: a header row plus body rows built by a
   loader. esc() is applied to every database value before it reaches HTML.
   -------------------------------------------------------------------------- */
function table(head, rows) {
  if (!rows.length) return '<p>Nothing to show.</p>';
  return '<table><thead><tr>' + head.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
}

const TABS = {
  async overview() {
    let d = null;
    try { d = await A().runDiagnostics(); } catch (e) {}
    const profiles = await A().getAllProfiles().catch(() => []);
    const learners = await A().getAllLearners().catch(() => []);
    const bugs = await A().getBugReports().catch(() => []);
    const open = bugs.filter((b) => b.status === 'new' || b.status === 'investigating').length;
    return '<div class="kv"><div><b>' + profiles.length + '</b>accounts</div><div><b>' + learners.length + '</b>learners</div><div><b>' + bugs.length + '</b>bug reports</div><div><b>' + open + '</b>open bugs</div></div>' +
      (d ? '<h3>Diagnostics</h3><pre style="white-space:pre-wrap;font-size:13px">' + esc(JSON.stringify(d, null, 2)) + '</pre>' : '');
  },
  async users() {
    const rows = (await A().getAllProfiles()).map((p) => '<tr><td>' + esc(p.display_name || p.displayName) + '</td><td>' + esc(p.role) + (p.is_admin ? ' (admin)' : '') + '</td><td>' + (p.is_test_account || p.isTestAccount ? 'test' : '') + '</td><td>' + esc(fmt(p.created_at || p.createdAt)) + '</td></tr>');
    return '<p>Admin rights can only be granted by you in the Supabase SQL Editor, never from this page.</p>' + table(['Name', 'Role', 'Flag', 'Created'], rows);
  },
  async learners() {
    const list = await A().getAllLearners();
    let sumMap = {};
    try {
      const summaries = await A().getProgressSummaries(list.map(l => l.id || l.user_id));
      summaries.forEach(s => {
        const lid = s.learner_id;
        if (!sumMap[lid]) sumMap[lid] = [];
        sumMap[lid].push(s);
      });
    } catch (e) {}

    const rows = list.map((l) => {
      const pRecs = sumMap[l.id] || sumMap[l.user_id] || [];
      let totalSolved = 0, totalStars = 0;
      pRecs.forEach(r => {
        if (r.prog) {
          // Saved progress stores a star count (0-3) per level, not an object.
          Object.values(r.prog).forEach(stars => {
            const n = Number(stars) || 0;
            if (n >= 1) { totalSolved++; totalStars += Math.min(3, n); }
          });
        }
      });
      const progText = pRecs.length ? (totalSolved + ' missions (' + totalStars + ' ★)') : 'No missions yet';
      return '<tr><td><b>' + esc(l.player_id || l.playerId || '-') + '</b></td><td>' + esc(l.name) + '</td><td>' + esc(l.assigned_path || l.assignedPath) + '</td><td>' + esc(l.current_diff || l.currentDiff) + '</td><td>' + ((l.parent_user_id || l.parentUserId) ? 'linked to a parent' : 'self') + '</td><td>' + esc(progText) + '</td><td>' + ((l.is_test || l.isTest) ? 'test' : '') + '</td></tr>';
    });
    return table(['Player ID', 'Learner', 'Path', 'Difficulty', 'Owner', 'Progress', 'Flag'], rows);
  },
  async bugs() {
    const bugs = await A().getBugReports();
    const rows = bugs.map((b) => '<tr data-id="' + esc(b.id) + '"><td>' + esc(fmt(b.created_at)) + '</td><td><b>' + esc(b.title) + '</b><br><small>' + esc(b.page_feature) + '</small><br>' + esc(b.description) +
      (b.steps_to_reproduce ? '<br><small>Steps: ' + esc(b.steps_to_reproduce) + '</small>' : '') + (b.attachment_path ? '<br><button class="row-btn batt" type="button" data-path="' + esc(b.attachment_path) + '">Open attachment</button>' : '') + '</td><td><select class="bst" aria-label="Status">' +
      ['new', 'investigating', 'fixed', 'closed'].map((s) => '<option' + (b.status === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td>' +
      '<td><input type="text" class="bnote" maxlength="500" value="' + esc(b.admin_notes || '') + '" aria-label="Admin note" placeholder="Note"></td><td><button class="row-btn bsave" type="button">Save</button></td></tr>');
    return table(['Date', 'Report', 'Status', 'Note', ''], rows);
  },
  async board() {
    const rows = (await A().getAdminLeaderboardEntries()).map((e) => '<tr data-id="' + esc(e.id) + '"><td>' + esc(e.display_name) + '</td><td>' + esc(e.learning_path) + ' / ' + esc(e.game_diff) + '</td><td>' + esc(e.total_score) + '</td><td>' + esc(e.total_stars) + '</td><td>' + (e.is_test ? 'test' : '') + '</td><td><button class="row-btn danger bdel" type="button">Remove</button></td></tr>');
    return '<p>Scores are calculated by the database from saved progress. Remove an entry only if it looks wrong.</p>' + table(['Name', 'Path / level', 'Score', 'Stars', 'Flag', ''], rows);
  },
  async coop() {
    const rows = (await A().getCoopMatchesAdmin()).map((m) => '<tr><td>' + esc(fmt(m.finished_at)) + '</td><td>' + esc(m.challenge_id) + '</td><td>' + esc(m.score) + '</td><td>' + esc(m.correct) + ' of 11</td><td>' + esc(m.steps) + '</td><td>' + esc(Math.round(m.duration_ms / 1000)) + ' s</td><td>' + (m.is_test ? 'test' : '') + '</td></tr>');
    return '<p>Every completed co-op match, including test matches. Results are verified by the server.</p>' + table(['Finished', 'Mission', 'Score', 'Correct', 'Steps', 'Time', 'Flag'], rows);
  },
  async feedback() {
    const rows = (await A().getAllFeedback()).map((f) => '<tr><td>' + esc(fmt(f.created_at)) + '</td><td>' + esc(f.rating) + '</td><td>' + esc(f.age_group) + '</td><td>' + esc(f.tags) + '</td><td>' + esc(f.message) + '</td><td>' + esc(f.name) + '</td></tr>');
    return '<p>Copies of feedback sent from the home page since this feature was installed.</p>' + table(['Date', 'Rating', 'Age group', 'Tags', 'Message', 'Name'], rows);
  },
  async test() {
    const p = await A().previewTestData();
    const total = p.testProfiles + p.testLearners + p.testProgress + p.testLeaderboard;
    return '<h3>Preview (nothing is deleted yet)</h3><div class="kv"><div><b>' + p.testProfiles + '</b>test accounts</div><div><b>' + p.testLearners + '</b>test learners</div><div><b>' + p.testProgress + '</b>test progress records</div><div><b>' + p.testLeaderboard + '</b>test leaderboard rows</div></div>' +
      '<p>Only rows flagged as test data are affected. Genuine learners and scores are never touched.</p>' +
      (total ? '<div class="warn"><label><input type="checkbox" id="tconfirm"> I have read the preview above and want to permanently delete these test records.</label><p><label for="ttype">Type <b>DELETE TEST DATA</b> to continue:</label><br><input type="text" id="ttype" autocomplete="off"></p><button class="row-btn danger" id="tgo" type="button" disabled>Delete test data</button></div>' : '<p>No test data found.</p>');
  },

  /* ---------------------------------------------------------------------------
     Story: every line the game can show, in the order it appears, with the
     screen it uses and the moment it fires. The text comes from js/story.js,
     so this tab can never drift out of date with the game.
     ------------------------------------------------------------------------ */
  async story() {
    if (!S()) return '<p>The story file did not load, so there is nothing to show.</p>';
    const path = SPATH();
    const flat = (arr) => (arr || []).reduce((a, s) => a.concat(s), []);
    const op = S().opening(path), en = S().ending(path);
    let h = '<div class="stbar"><div class="stver" role="group" aria-label="Story version">' +
      [['kid', 'Ages 6–10'], ['teen', 'Ages 11–14'], ['std', 'Ages 15+']].map((v) =>
        '<button type="button" data-ver="' + v[0] + '" aria-pressed="' + (storyVer === v[0]) + '">' + v[1] + '</button>'
      ).join('') + '</div>' +
      '<a class="row-btn" href="webgame.html">Open the game with everything unlocked</a></div>' +
      '<p class="stnote">Players meet these scenes in this order. The version buttons show the exact lines each age group sees. As an administrator, the game opens with every section and chapter available, including the optional Mastery section.</p>';

    h += '<details class="stsec" open><summary><span class="sttag">Start</span><b>' + esc(op.title) + '</b><em>Opening · before Chapter 1</em></summary><div class="stbody">' +
      storyBlock('Opening cinematic', 'Full-screen story screen ending with the Begin Mission button', 'First visit, once per learner; replayable from Settings', flat(op.scenes)) +
      '<p class="stobj"><b>Objective line</b> ' + esc(op.objective) + '</p>' +
      '</div></details>';

    STORY_ACTS.forEach((a, i) => {
      const act = S().act(i, path), end = S().actEnd(i, path);
      h += '<details class="stsec"><summary><span class="sttag">Act ' + (i + 1) + '</span><b>' + esc(a.t) + '</b><em>' +
        a.ch.length + ' chapters then the guardian · ' + esc(CH_TITLES[a.boss]) + (a.bonus ? ' · optional bonus' : '') + '</em></summary><div class="stbody">' +
        storyBlock('Act opening', 'Act title card', 'First time this section is entered', act && act.lines);
      a.ch.forEach((c, j) => {
        const brief = S().brief(c), win = S().win(c, path);
        if (!brief.length && !win.length) return;
        h += '<div class="stchap"><h3>Section ' + (i + 1) + ' · Chapter ' + (j + 1) + ' · ' + esc(CH_TITLES[c]) + '</h3>' +
          storyBlock('Briefing', 'Story card above the mission', 'Each time this chapter is opened', brief) +
          storyBlock('Chapter complete', 'Story card after the last mission', 'When the chapter is finished', win) +
          '</div>';
      });
      h += '<div class="stchap"><h3>Section ' + (i + 1) + ' · Guardian · ' + esc(CH_TITLES[a.boss]) + '</h3>' +
        storyBlock('Guardian intro', 'Guardian screen before the fight', 'When the guardian level starts', S().bossIntro(a.boss)) +
        storyBlock('Guardian defeated', 'Victory card', 'When the guardian is defeated', S().bossOutro(a.boss)) +
        '</div>' +
        storyBlock('Act closing', 'Closing card between acts', a.bonus ? 'After the bonus guardian, leading into the ending' : 'After the guardian, before the next section', end) +
        '</div></details>';
    });

    h += '<details class="stsec"><summary><span class="sttag">End</span><b>' + esc(en.title) + '</b><em>Ending · after the final guardian</em></summary><div class="stbody">' +
      storyBlock('Ending cinematic', 'Full-screen ending with the Back to menu button', 'After the final guardian; also plays when the bonus section is skipped', flat(en.scenes)) +
      '</div></details>';
    return h;
  },

  /* ---------------------------------------------------------------------------
     Streaks: the whole ladder with the exact reward popup players get.
     ------------------------------------------------------------------------ */
  async streaks() {
    const M = (window.TLP_STREAK && TLP_STREAK.MILESTONES) || [];
    if (!M.length) return '<p>The streak file did not load, so there is nothing to show.</p>';
    const rows = M.map((m, i) =>
      '<button type="button" class="msrow ' + m.tier + (m.rare ? ' veryrare' : '') + '" data-ms="' + m.d + '" style="animation-delay:' + (i * 45) + 'ms">' +
      '<span class="msday">' + m.d + '<small>days</small></span>' +
      '<span class="msname"><b>' + esc(m.name) + '</b><small>' + esc(m.line) + '</small></span>' +
      '<span class="mstier">' + (m.rare ? 'Very rare' : TLP_STREAK.tierName(m.tier)) + '</span>' +
      '</button>').join('');
    return '<p class="stnote">One streak per learner. It counts one local day at a time, a missed day resets it, and each milestone is earned once. Day 365 is the rare reward.</p>' +
      '<div class="msdemo" id="msDemo"><small>Popup preview</small><p>Click a milestone to see the exact reward popup players receive.</p></div>' +
      '<div class="mstair">' + rows + '</div>';
  },

  /* ---------------------------------------------------------------------------
     Sync: live Supabase counts plus spreadsheet-ready exports. The Google
     Sheet is fed by the Apps Script endpoint in js/script.js; these exports
     carry the same rows so nothing has to be retyped.
     ------------------------------------------------------------------------ */
  async sync() {
    const A2 = A();
    const grab = (p) => Promise.resolve(p).catch(() => null);
    const [d, profs, learners, board, coop, bugs, fb] = await Promise.all([
      grab(A2.runDiagnostics()),
      grab(A2.getAllProfiles()),
      grab(A2.getAllLearners()),
      grab(A2.getAdminLeaderboardEntries()),
      grab(A2.getCoopMatchesAdmin()),
      grab(A2.getBugReports()),
      grab(A2.getAllFeedback())
    ]);
    const n = (x) => (x ? x.length : 0);
    const cloud = A2.isCloudConfigured ? A2.isCloudConfigured() : !!d;
    const live = cloud ? (d ? 'Connected' : 'Reachable, diagnostics empty') : 'Not configured';
    const row = (label, count, csv) =>
      '<tr><td><b>' + label + '</b></td><td>' + count + '</td><td>' +
      (csv ? '<button class="row-btn" type="button" data-csv="' + csv + '">Download CSV</button>' : '') + '</td></tr>';
    return '<h3>Supabase</h3><div class="kv">' +
      '<div><b>' + esc(live) + '</b>connection</div>' +
      '<div><b>' + n(profs) + '</b>accounts</div>' +
      '<div><b>' + n(learners) + '</b>learners</div>' +
      '<div><b>' + n(board) + '</b>leaderboard rows</div>' +
      '<div><b>' + n(coop) + '</b>co-op matches</div>' +
      '<div><b>' + n(fb) + '</b>feedback</div></div>' +
      '<p>Supabase is the live record. Everything on every other tab is read from it when you open that tab.</p>' +
      '<table><thead><tr><th>Data</th><th>Rows</th><th>Export</th></tr></thead><tbody>' +
      row('Learners', n(learners), 'learners') +
      row('Accounts', n(profs), 'users') +
      row('Individual leaderboard', n(board), 'board') +
      row('Co-op matches', n(coop), 'coop') +
      row('Feedback', n(fb), 'feedback') +
      row('Bug reports', n(bugs), 'bugs') +
      '</tbody></table>' +
      '<h3>Google Sheets</h3><p>The home page sends its player tally to the Apps Script endpoint in <code>js/script.js</code>, and feedback is copied there too. Use the CSV buttons above to drop the same rows into the sheet without retyping anything. Nothing leaves this browser except when you download or use the sheet itself.</p>' +
      (d ? '<h3>Diagnostics</h3><pre class="diag">' + esc(JSON.stringify(d, null, 2)) + '</pre>' : '');
  }
};

/* Spreadsheet export. Fetches fresh rows so a stale tab can never export old data. */
async function exportCsv(kind) {
  const A2 = A();
  try {
    let rows = [];
    if (kind === 'learners') {
      const list = await A2.getAllLearners();
      rows = [['player_id', 'name', 'path', 'difficulty', 'owner', 'is_test']].concat(list.map((l) =>
        [l.player_id || l.playerId || '', l.name || '', l.assigned_path || l.assignedPath || '', l.current_diff || l.currentDiff || '',
         (l.parent_user_id || l.parentUserId) ? 'parent' : 'self', (l.is_test || l.isTest) ? 'test' : '']));
    } else if (kind === 'users') {
      const list = await A2.getAllProfiles();
      rows = [['name', 'role', 'admin', 'test', 'created']].concat(list.map((p) =>
        [p.display_name || p.displayName || '', p.role || '', p.is_admin ? 'yes' : '', p.is_test_account || p.isTestAccount ? 'test' : '', p.created_at || p.createdAt || '']));
    } else if (kind === 'board') {
      const list = await A2.getAdminLeaderboardEntries();
      rows = [['name', 'path', 'difficulty', 'score', 'stars', 'test', 'updated']].concat(list.map((e) =>
        [e.display_name || '', e.learning_path || '', e.game_diff || '', e.total_score || 0, e.total_stars || 0, e.is_test ? 'test' : '', e.updated_at || '']));
    } else if (kind === 'coop') {
      const list = await A2.getCoopMatchesAdmin();
      rows = [['finished', 'challenge', 'score', 'correct', 'steps', 'seconds', 'test']].concat(list.map((m) =>
        [m.finished_at || '', m.challenge_id || '', m.score || 0, m.correct || 0, m.steps || 0, Math.round((m.duration_ms || 0) / 1000), m.is_test ? 'test' : '']));
    } else if (kind === 'feedback') {
      const list = await A2.getAllFeedback();
      rows = [['date', 'rating', 'age_group', 'tags', 'message', 'name']].concat(list.map((f) =>
        [f.created_at || '', f.rating || '', f.age_group || '', f.tags || '', f.message || '', f.name || '']));
    } else if (kind === 'bugs') {
      const list = await A2.getBugReports();
      rows = [['date', 'title', 'page', 'description', 'steps', 'status', 'admin_notes']].concat(list.map((b) =>
        [b.created_at || '', b.title || '', b.page_feature || '', b.description || '', b.steps_to_reproduce || '', b.status || '', b.admin_notes || '']));
    }
    if (rows.length) downloadCsv(kind, rows);
  } catch (e) {
    say('Could not export: ' + (e && e.message ? e.message : 'unknown error'), true);
  }
}

/* -----------------------------------------------------------------------------
   Tab switching
   Each tab maps to one loader above. Loading is lazy: a tab fetches its data
   the first time it is opened, so the dashboard does not query everything at
   once. Errors are reported through say() in the page message bar.
   -------------------------------------------------------------------------- */
async function show(name) {
  current = name;
  document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === name));
  const panel = $('#panel');
  panel.textContent = 'Loading...'; say('');
  try { panel.innerHTML = await TABS[name](); }
  catch (e) { panel.textContent = ''; say('Could not load: ' + (e && e.message ? e.message : 'unknown error'), true); }
}

document.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.matches('.tabs button')) return show(t.dataset.tab);
  if (t.closest('.stver button')) {
    const v = t.closest('.stver button').dataset.ver;
    if (v && v !== storyVer) { storyVer = v; show('story'); }
    return;
  }
  if (t.closest('.msrow')) {
    const b = t.closest('.msrow');
    const m = (window.TLP_STREAK && TLP_STREAK.MILESTONES || []).find((x) => String(x.d) === b.dataset.ms);
    const demo = $('#msDemo');
    if (m && demo) demo.innerHTML = TLP_STREAK.popHtml(m);
    return;
  }
  if (t.dataset.csv) { exportCsv(t.dataset.csv); return; }
  if (t.classList.contains('bsave')) {
    const tr = t.closest('tr');
    try { await A().updateBugReportStatus(tr.dataset.id, tr.querySelector('.bst').value, tr.querySelector('.bnote').value); say('Saved.'); }
    catch (err) { say('Could not save: ' + err.message, true); }
  }
  if (t.classList.contains('batt')) {
    try { const url = await A().getAttachmentUrl(t.dataset.path); window.open(url, '_blank', 'noopener'); } catch (err) { say('Could not open the attachment: ' + err.message, true); }
  }
  if (t.classList.contains('bdel')) {
    if (!confirm('Remove this leaderboard entry?')) return;
    try { await A().deleteLeaderboardEntry(t.closest('tr').dataset.id); say('Entry removed.'); show('board'); }
    catch (err) { say('Could not remove: ' + err.message, true); }
  }
  if (t.id === 'tgo') {
    try { const r = await A().purgeTestData(); say('Done. ' + JSON.stringify(r)); show('test'); }
    catch (err) { say('Could not delete: ' + err.message, true); }
  }
});
document.addEventListener('input', () => {
  const c = $('#tconfirm'), ty = $('#ttype'), go = $('#tgo');
  if (c && ty && go) go.disabled = !(c.checked && ty.value.trim() === 'DELETE TEST DATA');
});

/* -----------------------------------------------------------------------------
   Boot and permission gate
   Waits for TLP_AUTH, checks the signed-in role, then wires the tabs and the
   maintenance controls. A non-admin never sees the panels.
   -------------------------------------------------------------------------- */
async function adminBoot() {
  const gate = $('#gate');
  try {
    await A().init();
    const u = A().getCurrentUser();
    if (!u) { gate.hidden = false; gate.innerHTML = 'Please <a href="auth.html">sign in</a> with an administrator account.'; return; }
    if (!A().isCurrentUserAdmin()) { gate.hidden = false; gate.innerHTML = 'This page is for the site administrator only. <a href="auth.html">Sign in</a> with an administrator account to continue.'; return; }
    $('#app').hidden = false; gate.hidden = true;
    show('overview');
  } catch (e) {
    gate.hidden = false; gate.textContent = 'Could not check your access: ' + (e && e.message ? e.message : 'unknown error');
  }
}
window.adminBoot = adminBoot;
adminBoot();
