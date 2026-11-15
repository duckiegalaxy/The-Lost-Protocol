/* =============================================================================
   PARENT AND EDUCATOR LOGIC  (js/pages/parent.js)
   -----------------------------------------------------------------------------
   Powers parent.html. A parent or teacher account creates learner profiles here
   and reads their progress. The account itself never plays the game.
   
   Generated passwords are shown once so they can be handed to the learner; they
   are never stored in plain text in this file.
   Areas in this file:
     - card open/close helpers
     - the per-learner progress summary
     - password generation
     - loading the learner list and their records
   ============================================================================= */
const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PN = { g16: 'Grades 1 to 6', g710: 'Grades 7 to 10', g1112: 'Grades 11 to 12', adult: 'College and adult' };
const DN = { beg: 'Beginner', int: 'Intermediate', pro: 'Professional' };
const DHELP = { beg: 'Beginner: the learner completes Beginner first. Finishing it unlocks Intermediate, then Professional.',
  int: 'Intermediate: finishing it unlocks Professional. Beginner unlocks only after the whole game is finished on Professional.',
  pro: 'Professional: hints are restricted. After finishing, Beginner and Intermediate become available.' };
const BOSS_KEYS = ['3-0', '9-0', '14-0', '19-0', '24-0', '29-0'];
let learners = [], selected = null;

const open = (id) => { $(id).hidden = false; }, close = (id) => { $(id).hidden = true; };
['add', 'pw', 'del'].forEach((k) => { $('#' + k + 'X').onclick = () => close('#' + k + 'M'); });
$('#aCancel').onclick = () => close('#addM'); $('#pwCancel').onclick = () => close('#pwM'); $('#delCancel').onclick = () => close('#delM'); $('#cClose').onclick = () => { close('#addM'); load(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') ['#addM', '#pwM', '#delM'].forEach(close); });

/* -----------------------------------------------------------------------------
   Progress summary
   Turns raw progress records into the small bars and counts shown on each
   learner card. Missing records are treated as "not started", never as zero
   achievement.
   -------------------------------------------------------------------------- */
function summarize(l, recs) {
  const mine = recs.filter((r) => r.learner_id === l.id);
  const cur = mine.find((r) => r.learning_path === (l.assigned_path) && r.game_diff === l.current_diff) || mine[0];
  const prog = (cur && cur.prog) || {};
  const vals = Object.entries(prog).filter(([k, v]) => /^\d+-\d+$/.test(k) && Number(v) >= 1);
  const stars = vals.reduce((a, [, v]) => a + Math.min(3, Number(v)), 0);
  const bosses = BOSS_KEYS.filter((k) => Number(prog[k]) >= 1).length;
  return { stars, missions: vals.length, bosses, score: stars * 100 };
}

/* -----------------------------------------------------------------------------
   Password generation
   Local-only helper for educator-created accounts. The value is displayed for
   the adult to copy; the server stores only a hash.
   -------------------------------------------------------------------------- */
function genPw() {
  const w = ['Robot', 'Signal', 'Comet', 'Circuit', 'Planet', 'Rocket', 'Pixel', 'Orbit'];
  return w[Math.floor(Math.random() * w.length)] + (100 + Math.floor(Math.random() * 900)) + w[Math.floor(Math.random() * w.length)].slice(0, 3).toLowerCase();
}

/* -----------------------------------------------------------------------------
   Load
   Fetches learners for the signed-in educator and renders one card each.
   -------------------------------------------------------------------------- */
async function load() {
  $('#list').innerHTML = '<p class="meta">Loading...</p>';
  const all = await A().getLearners();
  learners = all.filter((l) => l.parent_user_id === A().getCurrentUser().id);
  const recs = learners.length ? await A().getProgressSummaries(learners.map((l) => l.id)).catch(() => []) : [];
  $('#cnt').textContent = learners.length; $('#cntLbl').textContent = learners.length === 1 ? 'learner' : 'learners';
  if (!learners.length) { $('#list').innerHTML = '<p class="meta">No learners yet. Use "Add a learner" to create the first Player ID.</p>'; $('#rankSec').hidden = true; return; }
  const sums = learners.map((l) => ({ l, s: summarize(l, recs) }));
  $('#list').innerHTML = sums.map(({ l, s }) =>
    '<div class="lc2" data-id="' + esc(l.id) + '"><h3>' + esc(l.name) + '</h3>' +
    '<div class="pid">' + esc(l.player_id) + ' <button class="btn ghost sm" data-act="copy" type="button">Copy</button></div>' +
    '<div class="meta">' + esc(PN[l.assigned_path] || '') + ' · ' + esc(DN[l.current_diff] || '') + '</div>' +
    '<div class="chips"><span class="chip">' + s.stars + ' stars</span><span class="chip">' + s.missions + ' missions</span><span class="chip">' + s.bosses + ' of 6 guardians</span><span class="chip">' + s.score + ' points</span></div>' +
    '<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="' + s.bosses + '" aria-label="Guardians defeated"><i style="width:' + Math.round(s.bosses / 6 * 100) + '%"></i></div>' +
    '<div class="row2"><button class="btn ghost sm" data-act="pw" type="button">Reset password</button><button class="btn ghost sm" data-act="del" type="button">Delete</button></div></div>').join('');
  const ranked = sums.slice().sort((a, b) => b.s.score - a.s.score || b.s.stars - a.s.stars);
  $('#rank').innerHTML = '<thead><tr><th>Rank</th><th>Learner</th><th>Player ID</th><th>Age group</th><th>Points</th><th>Stars</th></tr></thead><tbody>' +
    ranked.map((x, i) => '<tr><td>' + (i + 1) + '</td><td>' + esc(x.l.name) + '</td><td>' + esc(x.l.player_id) + '</td><td>' + esc(PN[x.l.assigned_path]) + '</td><td>' + x.s.score + '</td><td>' + x.s.stars + '</td></tr>').join('') + '</tbody>';
  $('#rankSec').hidden = false;
}

$('#list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const l = learners.find((x) => x.id === b.closest('.lc2').dataset.id); if (!l) return;
  selected = l;
  if (b.dataset.act === 'copy') { try { navigator.clipboard.writeText(l.player_id); b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1400); } catch (x) {} }
  if (b.dataset.act === 'pw') { $('#pwWho').textContent = l.name + ' (' + l.player_id + ')'; $('#pwNew').value = ''; $('#pwMsg').textContent = ''; open('#pwM'); }
  if (b.dataset.act === 'del') { $('#delLbl').textContent = 'Type the Player ID ' + l.player_id + ' to confirm'; $('#delTxt').value = ''; $('#delGo').disabled = true; $('#delMsg').textContent = ''; open('#delM'); }
});

$('#addBtn').onclick = () => { $('#addF').hidden = false; $('#aDone').hidden = true; $('#addF').reset(); $('#aMsg').textContent = ''; $('#aDiffHelp').textContent = DHELP.int; open('#addM'); };
$('#aDiff').onchange = () => { $('#aDiffHelp').textContent = DHELP[$('#aDiff').value]; };
$('#aGen').onclick = () => { $('#aPw').value = genPw(); };
$('#addF').addEventListener('submit', async (e) => {
  e.preventDefault(); const btn = $('#aGo'); btn.disabled = true; $('#aMsg').textContent = 'Creating...';
  try {
    const pw = $('#aPw').value;
    const r = await A().createLearnerViaFunction({ name: $('#aName').value, gradeRange: $('#aPath').value, startDiff: $('#aDiff').value, password: pw });
    $('#cPid').textContent = r.playerId; $('#cPw').textContent = pw; $('#addF').hidden = true; $('#aDone').hidden = false;
  } catch (err) {
    const m = String(err.message || '');
    $('#aMsg').textContent = /weak_password/.test(m) ? 'The password must be 6 to 72 characters.' : /limit_reached/.test(m) ? 'You have reached the maximum number of learners.' :
      /not_educator/.test(m) ? 'Only Parent and Educator accounts can add learners.' : /FunctionsHttpError|Failed to send|Requested function/i.test(m) ? 'The learner service is not available yet. The site owner must deploy it.' : 'Could not create the learner: ' + m;
  } finally { btn.disabled = false; }
});
$('#cCopy').onclick = () => { try { navigator.clipboard.writeText('Player ID: ' + $('#cPid').textContent + '\nPassword: ' + $('#cPw').textContent); $('#cCopy').textContent = 'Copied'; } catch (e) {} };

$('#pwGo').onclick = async () => {
  const pw = $('#pwNew').value; if (pw.length < 6) return ($('#pwMsg').textContent = 'The password must be at least 6 characters.');
  $('#pwGo').disabled = true; $('#pwMsg').textContent = 'Saving...';
  try { await A().resetLearnerPassword(selected.id, pw); $('#pwMsg').textContent = 'Saved. The new password is: ' + pw; }
  catch (err) { $('#pwMsg').textContent = 'Could not save: ' + err.message; } finally { $('#pwGo').disabled = false; }
};
$('#delTxt').addEventListener('input', () => { $('#delGo').disabled = $('#delTxt').value.trim().toUpperCase() !== (selected && selected.player_id); });
$('#delGo').onclick = async () => {
  $('#delGo').disabled = true; $('#delMsg').textContent = 'Deleting...';
  try { await A().deleteLearnerAccount(selected.id, $('#delTxt').value); close('#delM'); load(); }
  catch (err) { $('#delMsg').textContent = 'Could not delete: ' + err.message; $('#delGo').disabled = false; }
};

(async function boot() {
  const g = $('#gate');
  try {
    await A().init();
    const u = A().getCurrentUser();
    if (!u) { g.hidden = false; g.innerHTML = 'Please <a href="auth.html">sign in</a> with a Parent or Educator account.'; return; }
    if (u.role !== 'parent') { g.hidden = false; g.innerHTML = 'This area is for Parent and Educator accounts. <a href="' + (u.isAdmin ? 'admin.html' : 'webgame.html') + '">Continue</a>'; return; }
    if (!A().isCloudConfigured()) {
      g.hidden = false;
      g.style.borderColor = 'var(--a)';
      g.innerHTML = '<b>Local Demo Mode:</b> Cloud connection is not configured or offline. Learners created here are saved locally on this browser session.';
    }
    $('#app').hidden = false; await load();
  } catch (e) { g.hidden = false; g.textContent = 'Something went wrong: ' + (e && e.message || e); }
})();
window.addEventListener('unhandledrejection', (e) => { const g = $('#gate'); g.hidden = false; g.textContent = 'Something went wrong: ' + ((e.reason && e.reason.message) || e.reason); });
