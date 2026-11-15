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
          Object.values(r.prog).forEach(cp => {
            if (cp && cp.solved) {
              totalSolved++;
              totalStars += (cp.stars || 0);
            }
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
  }
};

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
    if (!A().isCurrentUserAdmin()) { gate.hidden = false; gate.textContent = 'This account is not the administrator, so nothing is shown here. The administrator account is set up once by the site owner in the Supabase SQL Editor (see the owner setup instructions).'; return; }
    $('#app').hidden = false; gate.hidden = true;
    show('overview');
  } catch (e) {
    gate.hidden = false; gate.textContent = 'Could not check your access: ' + (e && e.message ? e.message : 'unknown error');
  }
}
window.adminBoot = adminBoot;
adminBoot();
