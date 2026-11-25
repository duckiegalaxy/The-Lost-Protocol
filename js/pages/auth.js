const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));










const initialHash = window.location.hash.replace(/^#/, '');
const hashParams = new URLSearchParams(initialHash);
const queryParams = new URLSearchParams(window.location.search);

const isRecoveryLink = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';



const qrRaw = String(hashParams.get('qr') || '');
const qrCode = /^[A-Za-z0-9_-]{40,64}$/.test(qrRaw) ? qrRaw : '';



const linkError = hashParams.get('error_description')
  ? decodeURIComponent(String(hashParams.get('error_description')).replace(/\+/g, ' '))
  : '';







const PATHS = [
  { id: 'g16', n: 'Grades 1 to 6', d: 'For primary-school learners. Each idea is introduced in the simplest possible way, with short explanations, generous hints and plenty of encouragement.' },
  { id: 'g710', n: 'Grades 7 to 10', d: 'For lower-secondary learners. Ideas are explained clearly, and the challenge increases steadily as the learner progresses.' },
  { id: 'g1112', n: 'Grades 11 to 12', d: 'For upper-secondary learners. Explanations are concise, hints are limited, and tasks call for more independent reasoning.' },
  { id: 'adult', n: 'College and adult', d: 'For university students and adults. Material is presented directly, with minimal guidance and more demanding problems.' }
];
const DIFFS = [
  { id: 'beg', n: 'Beginner', d: 'For learners with no programming experience. Complete Beginner first. Finishing it unlocks Intermediate, and finishing Intermediate unlocks Professional.' },
  { id: 'int', n: 'Intermediate', d: 'For learners with some experience. Finishing Intermediate unlocks Professional. Beginner stays locked until the whole game has been finished on Professional.' },
  { id: 'pro', n: 'Professional', d: 'For experienced learners. Hints are restricted and block limits apply. After finishing Professional, Beginner and Intermediate become available to revisit.' }
];
let role = 'learner', pathId = 'g710', diffId = 'int';
try { const _a = JSON.parse(localStorage.getItem('tlp-auth-sel') || 'null'); if (_a) { if (_a.role) role = _a.role; if (_a.pathId) pathId = _a.pathId; if (_a.diffId) diffId = _a.diffId; } } catch (e) {}







function say(msg, kind) {
  const a = $('#alert');
  a.textContent = msg || '';
  a.className = 'alert' + (msg ? ' show ' + (kind || 'err') : '');
  if (msg) a.scrollIntoView({ block: 'nearest' });
}


function showView(which) {
  $('#formsView').hidden = which !== 'forms';
  $('#sessionView').hidden = which !== 'session';
  $('#forgotView').hidden = which !== 'forgot';
  $('#resetView').hidden = which !== 'reset';
  $('#qrView').hidden = which !== 'qr';
}


function cards(el, list, current, onPick) {
  el.innerHTML = list.map((x) => '<button type="button" class="pick" data-id="' + x.id + '" aria-pressed="' + (x.id === current) + '"><b>' + esc(x.n) + '</b><span>' + esc(x.d) + '</span></button>').join('');
  el.querySelectorAll('.pick').forEach((b) => b.onclick = () => {
    el.querySelectorAll('.pick').forEach((o) => o.setAttribute('aria-pressed', o === b));
    onPick(b.dataset.id);
  });
}
function renderPaths() {
  cards($('#pathCards'), PATHS, pathId, (v) => { pathId = v; try { localStorage.setItem('tlp-auth-sel', JSON.stringify({ role, pathId, diffId })); } catch (e) {} });
}
renderPaths();
cards($('#diffCards'), DIFFS, diffId, (v) => { diffId = v; try { localStorage.setItem('tlp-auth-sel', JSON.stringify({ role, pathId, diffId })); } catch (e) {} });








function tab(up) {
  $('#tabIn').setAttribute('aria-pressed', !up);
  $('#tabUp').setAttribute('aria-pressed', up);
  $('#loginForm').hidden = up;
  $('#regForm').hidden = !up;
  try { localStorage.setItem('tlp-auth-tab', up ? '1' : '0'); } catch (e) {}
  say('');
}
$('#tabIn').onclick = () => tab(false);

$('#tabUp').onclick = () => openConsent();









let consentSeen = false;
const pv = () => $('#pvM');

function closePv() {
  pv().hidden = true;
}

function openConsent() {
  if (consentSeen) return tab(true);

  $('#pvOk').checked = false;
  $('#pvGo').disabled = true;
  pv().hidden = false;
  $('#pvOk').focus();
}

$('#pvOk').addEventListener('change', () => {
  $('#pvGo').disabled = !$('#pvOk').checked;
});

$('#pvGo').onclick = () => {
  if (!$('#pvOk').checked) return;
  consentSeen = true;

  $('#rgConsent').checked = true;
  closePv();
  tab(true);
  $('#rgName').focus();
};

$('#pvCancel').onclick = closePv;
$('#pvX').onclick = closePv;

pv().addEventListener('click', (e) => { if (e.target === pv()) closePv(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !pv().hidden) closePv();
});

function method(byId) {
  $('#mEmail').setAttribute('aria-pressed', !byId);
  $('#mId').setAttribute('aria-pressed', byId);
  $('#fEmail').hidden = byId;
  $('#fId').hidden = !byId;

  document.querySelector('.forgot-row').hidden = byId;
}
$('#mEmail').onclick = () => method(false);
$('#mId').onclick = () => method(true);



try { $('#liRemember').checked = localStorage.getItem('tlp-remember') !== '0'; } catch (e) {}

document.querySelectorAll('#regForm .pick[data-role]').forEach((b) => b.onclick = () => {
  role = b.dataset.role;
  document.querySelectorAll('#regForm .pick[data-role]').forEach((o) => o.setAttribute('aria-pressed', o === b));


  if (b.dataset.path) pathId = b.dataset.path;
  else if (pathId === 'adult') pathId = 'g710';
  renderPaths();
  $('#pathLabel').textContent = pathId === 'adult' ? 'Learning path' : 'Age group';
  $('#learnerFields').hidden = role !== 'learner';
  try { localStorage.setItem('tlp-auth-sel', JSON.stringify({ role, pathId, diffId })); } catch (e) {}
  $('#rgNameLabel').textContent = role === 'parent' ? 'Full name' : 'Display name';
  $('#rgName').placeholder = role === 'parent' ? 'For example: Sandra Lewis' : 'Name shown on the leaderboards';
});
$('#rgName').placeholder = 'Name shown on the leaderboards';




function where(user) {
  return user.isAdmin ? 'admin.html' : user.role === 'parent' ? 'parent.html' : 'webgame.html';
}







function wireMeter(inputSel, meterSel, hintSel, idleText) {
  const input = $(inputSel), meter = $(meterSel), hint = $(hintSel);
  if (!input || !meter) return;
  const words = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];
  const update = () => {
    const pw = input.value;
    const min = (window.TLP_PASSWORD && TLP_PASSWORD.MIN) || 10;
    const s = window.TLP_PASSWORD ? TLP_PASSWORD.score(pw) : 0;
    meter.dataset.score = s;
    meter.setAttribute('aria-hidden', 'true');
    if (!pw) { hint.textContent = idleText; return; }
    hint.textContent = pw.length < min ? 'At least ' + min + ' characters, please.' : words[s] + ' password.';
  };
  input.addEventListener('input', update);
  update();
}
wireMeter('#rgPw', '#rgMeter', '#rgHint', 'Three unrelated words make a strong, easy password.');
wireMeter('#npPw', '#npMeter', '#npHint', 'Use at least 10 characters. Three unrelated words work well.');




$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  const btn = $('#liGo');
  btn.disabled = true;
  try {


    try { localStorage.setItem('tlp-remember', $('#liRemember').checked ? '1' : '0'); } catch (e) {}
    const byId = !$('#fId').hidden;
    const r = byId
      ? await A().loginWithPlayerId({ playerId: $('#liId').value, password: $('#liPw').value })
      : await A().loginUser({ email: $('#liEmail').value, password: $('#liPw').value });
    location.href = where(r.user);
  } catch (err) {
    const m = (err && err.message) || 'Could not sign in.';
    say(/confirm/i.test(m)
      ? 'Your email address has not been confirmed yet. Please open the confirmation email, or contact the site owner.'
      : /invalid login/i.test(m)
        ? 'The email or password is not correct.'
        : m);
  } finally {
    btn.disabled = false;
  }
});




$('#regForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  const name = $('#rgName').value.trim();
  if (name.length < 2) return say('Please enter a name of at least 2 characters.');
  if (!$('#rgConsent').checked) return say('Please confirm that you have read the privacy notice.');
  const btn = $('#rgGo');
  btn.disabled = true;
  try {


    const pw = $('#rgPw').value;
    const pwCheck = await window.TLP_PASSWORD.check(pw);
    if (!pwCheck.ok) return say(pwCheck.msg);
    const r = await A().registerUser({
      email: $('#rgEmail').value,
      password: pw,
      role,
      displayName: name,
      learnerName: name,
      gradeRange: pathId,
      currentDiff: diffId
    });
    if (r.requiresEmailConfirmation) {

      showView('forms');
      tab(false);
      const alertEl = $('#alert');
      alertEl.className = 'alert show ok';
      alertEl.innerHTML = `
        <div style="text-align:center;padding:8px 0">
          <div style="font-size:40px;margin-bottom:8px">✉️</div>
          <strong style="font-size:17px;display:block;margin-bottom:6px">Check your inbox</strong>
          <span>A confirmation email is on its way to <b>${esc($('#rgEmail').value)}</b>. It can take a few minutes — check your spam folder too. Once you click the link in the email, come back here and sign in.</span>
        </div>`;
      alertEl.scrollIntoView({ block: 'nearest' });
    } else {
      location.href = where(r.user);
    }
  } catch (err) {
    say((err && err.message) || 'Could not create the account.');
  } finally {
    btn.disabled = false;
  }
});








$('#forgotLink').onclick = () => {
  say('');
  showView('forgot');

  $('#fpEmail').value = $('#liEmail').value.trim();
  $('#fpEmail').focus();
};

$('#forgotBack').onclick = () => {
  say('');
  showView('forms');
};

$('#forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  const email = $('#fpEmail').value.trim();
  if (!email) return say('Please enter the email address for your account.');
  const btn = $('#fpGo');
  btn.disabled = true;
  try {
    await A().requestPasswordReset(email);
    say('If an account exists for ' + email + ', a reset link is on its way. Open the link on this device to choose a new password. It can take a few minutes, so please also check your spam folder.', 'ok');
  } catch (err) {
    say((err && err.message) || 'Could not send the reset link. Please try again.');
  } finally {
    btn.disabled = false;
  }
});








$('#resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  const p1 = $('#npPw').value;
  const p2 = $('#npPw2').value;
  if (p1 !== p2) return say('The two passwords do not match.');
  const btn = $('#npGo');
  btn.disabled = true;
  try {
    const pwCheck = await window.TLP_PASSWORD.check(p1);
    if (!pwCheck.ok) return say(pwCheck.msg);
    await A().updatePassword(p1);
    say('Your password has been changed. Taking you to the game…', 'ok');
    setTimeout(() => { location.href = 'index.html'; }, 900);
  } catch (err) {
    say((err && err.message) || 'Could not change the password. Open the reset link again.');
    btn.disabled = false;
  }
});









$('#qrBack').onclick = () => {


  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  say('');
  refresh();
};

$('#qrGo').onclick = async () => {
  say('');
  const btn = $('#qrGo');
  btn.disabled = true;
  $('#qrIntro').textContent = 'Signing in…';
  let spent = false;
  try {
    const r = await A().redeemLearnerSignInToken(qrCode);
    spent = true;
    await A().completeLearnerSignIn(r.magicToken, $('#qrRemember').checked);
    $('#qrIntro').textContent = 'Signed in as ' + r.learner.name + ' (' + r.learner.playerId + '). Opening the game…';

    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    setTimeout(() => { location.href = 'webgame.html'; }, 900);
  } catch (err) {
    const m = String((err && err.message) || '');
    $('#qrIntro').textContent = 'A parent or teacher made a one-time code for this device. Continuing signs it in to that learner\'s account.';
    say(spent ? 'The code was accepted, but this browser could not finish signing in. Ask the parent or teacher for a new one.'
      : /expired/.test(m) ? 'This code has expired or has already been used. Ask the parent or teacher to show a new one.'
        : /network|fetch|failed to send|requested function/i.test(m) ? 'The sign-in service could not be reached. Check the connection and try again.'
          : 'That code could not be used. Ask the parent or teacher to show a new one.');
    btn.disabled = false;
  }
};







async function refresh() {
  await A().init();
  if (!A().isCloudConfigured()) say('The online service is not configured, so accounts are stored only in this browser.', 'err');
  const u = A().getCurrentUser();

  if (!u) {
    showView('forms');
    return;
  }

  showView('session');
  const l = A().getActiveLearner();
  const isAdult = u.role === 'learner' && l && !l.isGuest && (l.assigned_path || l.assignedPath) === 'adult';
  $('#sName').textContent = u.displayName;
  $('#sRole').textContent = u.isAdmin ? 'Administrator' : u.role === 'parent' ? 'Parent or Educator account' : isAdult ? 'Adult learner account' : 'Learner account';
  $('#goAdmin').hidden = !u.isAdmin;
  $('#goMain').textContent = u.role === 'parent' ? 'Open the Parent and Educator area' : 'Open the game';
  $('#goMain').href = u.role === 'parent' ? 'parent.html' : 'webgame.html';
  if (u.isAdmin) $('#goMain').hidden = true;



  const danger = document.querySelector('.acct .danger');
  if (danger) danger.hidden = !!u.isAdmin;

  $('#sId').hidden = true;

  if (u.role === 'learner' && l && !l.isGuest) {
    $('#sId').hidden = false;
    $('#sPid').textContent = l.player_id || '';
    const p = PATHS.find((x) => x.id === (l.assigned_path || l.assignedPath));
    const d = DIFFS.find((x) => x.id === (l.current_diff || l.currentDiff));
    $('#sInfo').textContent = (p ? p.n : '') + ' · ' + (d ? d.n : '') + '. Your Player ID is shown on the leaderboards. Keep your password private.';
  } else if (u.role === 'parent') {
    $('#sInfo').textContent = 'Create learner profiles in the Parent and Educator area. Each learner receives a Player ID that they use to sign in.';
  }

  $('#delWarn').textContent = u.isAdmin
    ? 'The owner administrator account cannot be deleted from here.'
    : u.role === 'parent'
      ? 'Deleting this account permanently removes all learner profiles you created, with their progress and scores. This cannot be undone.'
      : 'Deleting this account permanently removes your progress, scores and Player ID. This cannot be undone.';

  $('#delText').disabled = $('#delBtn').disabled = !!u.isAdmin;
}

$('#delText').addEventListener('input', () => {
  $('#delBtn').disabled = $('#delText').value !== 'DELETE MY ACCOUNT AND ALL PROGRESS' || !!(A().getCurrentUser() || {}).isAdmin;
});

$('#delBtn').onclick = async () => {
  if (!confirm('This permanently deletes the account and all progress. Continue?')) return;
  try {
    await A().deleteMyAccount($('#delText').value);
    location.href = 'index.html';
  } catch (err) {
    say(err.message || 'Could not delete the account.');
  }
};

$('#signOut').onclick = async () => {
  await A().logoutUser();
  location.reload();
};

$('#copyPid').onclick = () => {
  try {
    navigator.clipboard.writeText($('#sPid').textContent);
    $('#copyPid').textContent = 'Copied';
    setTimeout(() => { $('#copyPid').textContent = 'Copy'; }, 1500);
  } catch (e) {}
};











(async function boot() {
  if (qrRaw) {
    if (!qrCode) {
      showView('forms');
      say('That sign-in code is not valid. Ask the parent or teacher to show a new one.', 'err');
      return;
    }
    showView('qr');


    try { await A().init(); } catch (e) {}
    const other = $('#qrOther');
    const u = A().getCurrentUser();
    if (u) {
      other.hidden = false;
      other.textContent = (u.displayName || u.email || 'Another account') + ' is already signed in on this device. Signing in will replace that session.';
    }
    try { $('#qrRemember').checked = localStorage.getItem('tlp-remember') !== '0'; } catch (e) {}
    $('#qrGo').focus();
    return;
  }
  if (linkError) {
    showView('forms');
    say('That reset link is no longer valid: ' + linkError + ' Please request a new one.', 'err');
    return;
  }
  if (isRecoveryLink) {
    showView('reset');
    try {
      await A().init();
      $('#npPw').focus();
    } catch (e) {
      say('This reset link could not be verified. Please request a new one.', 'err');
      showView('forgot');
    }
    return;
  }

  try {
    await A().init();
    const confirmStatus = await A().getEmailConfirmationStatus();
    if (confirmStatus && confirmStatus.confirmed) {
      const alertEl = $('#alert');
      alertEl.className = 'alert show ok';
      alertEl.innerHTML = `
        <div style="text-align:center;padding:6px 0">
          <div style="font-size:32px;margin-bottom:6px">🎉</div>
          <strong style="font-size:16px;display:block;margin-bottom:4px">Email confirmed!</strong>
          <span>Your account is active. You are now signed in — heading to the game.</span>
        </div>`;
      alertEl.scrollIntoView({ block: 'nearest' });
      const u = A().getCurrentUser();
      setTimeout(() => { location.href = u ? where(u) : 'webgame.html'; }, 1800);
      return;
    }
  } catch (e) {}
  refresh();
})();
