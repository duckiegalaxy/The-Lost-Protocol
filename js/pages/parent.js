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
// The five story guardians. Mastery (The Origin) is an optional bonus mission
// and is never counted against a learner's progress.
const BOSS_KEYS = ['3-0', '9-0', '14-0', '19-0', '24-0'];
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
  const below = vals.filter(([, v]) => Number(v) < 3).length;
  return { stars, missions: vals.length, bosses, score: stars * 100, below, lastActive: (cur && cur.updated_at) || null };
}

/* -----------------------------------------------------------------------------
   Daily report
   The cloud keeps one progress row per learner, not a history, so today's work
   is measured against a small snapshot this browser takes on the first visit of
   each day. A missing snapshot simply makes today's gain zero; it never invents
   progress. The grade is deliberately simple and explained in the card.
   -------------------------------------------------------------------------- */
const GRADE_WHY = {
  A: 'A strong session today: 300 or more points, or a guardian defeated.',
  B: 'Progress today: new stars or missions.',
  C: 'Active in the last three days, but nothing new today.',
  D: 'No activity for three days or more.'
};
function dayId() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function snapshot(s) { return { score: s.score, stars: s.stars, missions: s.missions, bosses: s.bosses }; }
function difference(a, b) {
  const cut = (x, y) => Math.max(0, (Number(x) || 0) - (Number(y) || 0));
  return { score: cut(a.score, b.score), stars: cut(a.stars, b.stars), missions: cut(a.missions, b.missions), bosses: cut(a.bosses, b.bosses) };
}
function dailyDigest(l, s) {
  const key = 'tlp-digest:' + l.id;
  let box = null;
  try { box = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  const snap = snapshot(s), today = dayId();
  let delta;
  if (!box || !box.snap) { box = { day: today, start: snap, snap: snap }; delta = difference(snap, snap); }
  else if (box.day !== today) { delta = difference(snap, box.snap); box = { day: today, start: snap, snap: snap }; }
  else { delta = difference(snap, box.start); box.snap = snap; }
  try { localStorage.setItem(key, JSON.stringify(box)); } catch (e) {}
  const days = s.lastActive ? Math.floor((Date.now() - new Date(s.lastActive).getTime()) / 86400000) : 99;
  let grade = 'D';
  if (delta.score >= 300 || delta.bosses > 0) grade = 'A';
  else if (delta.score > 0 || delta.stars > 0 || delta.missions > 0) grade = 'B';
  else if (days <= 2) grade = 'C';
  return { delta, grade, days };
}
function timeAgo(d) {
  const n = Date.now() - new Date(d).getTime();
  if (!isFinite(n)) return '';
  const m = Math.round(n / 60000);
  if (m < 2) return 'just now';
  if (m < 60) return m + ' minutes ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + ' hour' + (h === 1 ? '' : 's') + ' ago';
  const dd = Math.round(h / 24);
  return dd + ' day' + (dd === 1 ? '' : 's') + ' ago';
}
function adviceFor(l, s) {
  const kid = l.assigned_path === 'g16';
  if (!s.missions) return kid ? 'Start with the first chapter together and read the lesson out loud before building the script.' : 'No missions finished yet. Start with Chapter 1 and read the lesson before building the script.';
  if (s.below > 0) return 'Replay ' + s.below + ' mission' + (s.below === 1 ? '' : 's') + ' that scored below three stars. Fewer blocks and a first-try clear raise the score fastest.';
  if (s.bosses < 5) return 'Every finished mission is at three stars. The next guardian is the right step up.';
  if (l.assigned_path === 'g1112' || l.assigned_path === 'adult') return 'All three stars everywhere. Try the next difficulty, then switch on Hardcore mode for the 1.5x score bonus.';
  return 'Every mission is at three stars. The Bonus sections and co-op missions are the next challenge.';
}
function reportText(l, s) {
  const g = dailyDigest(l, s);
  return [
    'The Lost Protocol - daily report', '',
    'Learner: ' + l.name + ' (' + l.player_id + ')',
    'Age group: ' + (PN[l.assigned_path] || '') + ' - ' + (DN[l.current_diff] || ''),
    'Date: ' + new Date().toLocaleDateString(),
    'Total score: ' + s.score + ' (today +' + g.delta.score + ')',
    'Stars: ' + s.stars + ', missions: ' + s.missions + ', guardians: ' + s.bosses + ' of 5',
    'Grade today: ' + g.grade + ' - ' + GRADE_WHY[g.grade],
    'What to work on: ' + adviceFor(l, s),
    'Last activity: ' + (s.lastActive ? new Date(s.lastActive).toLocaleString() : 'none yet')
  ].join('\n');
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
let sums = [];
function paint() {
  const q = ($('#pSearch').value || '').trim().toLowerCase();
  const shown = sums.filter(({ l }) => !q || String(l.name).toLowerCase().includes(q) || String(l.player_id).toLowerCase().includes(q));
  $('#cnt').textContent = shown.length;
  $('#cntLbl').textContent = shown.length === 1 ? 'learner' : 'learners';
  const note = $('#pFindNote');
  if (note) { note.hidden = !q; note.textContent = q ? shown.length + ' match' + (shown.length === 1 ? '' : 'es') + ' for "' + q + '"' : ''; }
  if (!shown.length) {
    $('#list').innerHTML = '<p class="meta">' + (q ? 'No learner matches that search.' : 'No learners yet. Use "Add a learner" to create the first Player ID.') + '</p>';
    return;
  }
  $('#list').innerHTML = shown.map(({ l, s }) => {
    const g = dailyDigest(l, s);
    return '<div class="lc2" data-id="' + esc(l.id) + '">' +
      '<div class="lhead"><div><h3>' + esc(l.name) + '</h3>' +
      '<div class="pid">' + esc(l.player_id) + ' <button class="btn ghost sm" data-act="copy" type="button">Copy</button></div></div>' +
      '<span class="grade g' + g.grade + '" title="' + esc(GRADE_WHY[g.grade]) + '">' + g.grade + '</span></div>' +
      '<div class="meta">' + esc(PN[l.assigned_path] || '') + ' · ' + esc(DN[l.current_diff] || '') + ' · ' + (s.lastActive ? 'last active ' + esc(timeAgo(s.lastActive)) : 'not started') + '</div>' +
      '<div class="chips"><span class="chip">' + s.stars + ' stars</span><span class="chip">' + s.missions + ' missions</span><span class="chip">' + s.bosses + ' of 5 guardians</span><span class="chip">' + s.score + ' points</span><span class="chip today">+' + g.delta.score + ' today</span></div>' +
      '<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="' + s.bosses + '" aria-label="Guardians defeated"><i style="width:' + Math.round(s.bosses / 5 * 100) + '%"></i></div>' +
      '<div class="digest"><b>Daily report · grade ' + g.grade + '</b><span>' + esc(GRADE_WHY[g.grade]) + '</span><span>' + esc(adviceFor(l, s)) + '</span></div>' +
      '<div class="row2"><button class="btn ghost sm" data-act="pw" type="button">Reset password</button><button class="btn ghost sm" data-act="del" type="button">Delete</button><button class="btn ghost sm" data-act="mail" type="button">Email report</button><button class="btn ghost sm" data-act="copyrep" type="button">Copy report</button></div></div>';
  }).join('');
}

async function load() {
  $('#list').innerHTML = '<p class="meta">Loading...</p>';
  const all = await A().getLearners();
  learners = all.filter((l) => l.parent_user_id === A().getCurrentUser().id);
  const recs = learners.length ? await A().getProgressSummaries(learners.map((l) => l.id)).catch(() => []) : [];
  sums = learners.map((l) => ({ l, s: summarize(l, recs) }));
  $('#rankSec').hidden = !learners.length;
  paint();
  if (!learners.length) return;
  const ranked = sums.slice().sort((a, b) => b.s.score - a.s.score || b.s.stars - a.s.stars);
  $('#rank').innerHTML = '<thead><tr><th>Rank</th><th>Learner</th><th>Player ID</th><th>Age group</th><th>Points</th><th>Stars</th><th>Today</th></tr></thead><tbody>' +
    ranked.map((x, i) => {
      const g = dailyDigest(x.l, x.s);
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(x.l.name) + '</td><td>' + esc(x.l.player_id) + '</td><td>' + esc(PN[x.l.assigned_path]) + '</td><td>' + x.s.score + '</td><td>' + x.s.stars + '</td><td>+' + g.delta.score + '</td></tr>';
    }).join('') + '</tbody>';
}

$('#list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const l = learners.find((x) => x.id === b.closest('.lc2').dataset.id); if (!l) return;
  selected = l;
  if (b.dataset.act === 'copy') { try { navigator.clipboard.writeText(l.player_id); b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1400); } catch (x) {} }
  if (b.dataset.act === 'pw') { $('#pwWho').textContent = l.name + ' (' + l.player_id + ')'; $('#pwNew').value = ''; $('#pwMsg').textContent = ''; open('#pwM'); }
  if (b.dataset.act === 'del') { $('#delLbl').textContent = 'Type the Player ID ' + l.player_id + ' to confirm'; $('#delTxt').value = ''; $('#delGo').disabled = true; $('#delMsg').textContent = ''; open('#delM'); }
  const sum = (sums.find((x) => x.l.id === l.id) || {}).s;
  if (b.dataset.act === 'mail' && sum) {
    const u = A().getCurrentUser() || {};
    location.href = 'mailto:' + encodeURIComponent(u.email || '') + '?subject=' + encodeURIComponent('Daily report for ' + l.name + ' (' + l.player_id + ')') + '&body=' + encodeURIComponent(reportText(l, sum));
  }
  if (b.dataset.act === 'copyrep' && sum) {
    try { navigator.clipboard.writeText(reportText(l, sum)); b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy report', 1400); } catch (x) {}
  }
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

$('#pSearch').addEventListener('input', paint);
$('#pPrint').onclick = () => window.print();

(async function boot() {
  const g = $('#gate');
  try {
    await A().init();
    const u = A().getCurrentUser();
    if (!u) { g.hidden = false; g.innerHTML = 'Please <a href="auth.html">sign in</a> with a Parent or Educator account. If you are an adult who wants to play the game yourself, create an <a href="auth.html">Adult learner</a> account instead.'; return; }
    if (u.role !== 'parent') { g.hidden = false; g.innerHTML = 'This area is for Parent and Educator accounts. Adult learners play the game and do not need this area. <a href="' + (u.isAdmin ? 'admin.html' : 'webgame.html') + '">Continue</a>'; return; }
    if (!A().isCloudConfigured()) {
      g.hidden = false;
      g.style.borderColor = 'var(--a)';
      g.innerHTML = '<b>Local Demo Mode:</b> Cloud connection is not configured or offline. Learners created here are saved locally on this browser session.';
    }
    $('#app').hidden = false; await load();
  } catch (e) { g.hidden = false; g.textContent = 'Something went wrong: ' + (e && e.message || e); }
})();
window.addEventListener('unhandledrejection', (e) => { const g = $('#gate'); g.hidden = false; g.textContent = 'Something went wrong: ' + ((e.reason && e.reason.message) || e.reason); });
