/* =============================================================================
   ACCOUNT PAGE LOGIC  (js/pages/auth.js)

   This file drives four mutually exclusive views on auth.html:

     forms   sign in / create account                  (default)
     session who is signed in, Player ID, delete       (when a session exists)
     forgot  ask for a reset email                     (from "Forgot your password?")
     reset   choose a new password                     (after the email link)

   All backend work goes through window.TLP_AUTH (js/tlp-auth.js). Nothing here
   talks to Supabase directly, so the page keeps working in local/offline mode
   exactly as before.
   ============================================================================= */

const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* -----------------------------------------------------------------------------
   1. RECOVERY SIGNALS

   Supabase returns the user from the email link with the token in the URL hash
   (#access_token=...&type=recovery) or, if the project is configured for PKCE,
   as a ?code= query parameter. The client library consumes and rewrites that
   URL while it initialises, so it has to be read here, at parse time, before
   any call to TLP_AUTH.init().
   -------------------------------------------------------------------------- */
const initialHash = window.location.hash.replace(/^#/, '');
const hashParams = new URLSearchParams(initialHash);
const queryParams = new URLSearchParams(window.location.search);

const isRecoveryLink = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';

// A link that has already been used or has timed out arrives with an error
// instead of a token. Show the reason rather than an empty password form.
const linkError = hashParams.get('error_description')
  ? decodeURIComponent(String(hashParams.get('error_description')).replace(/\+/g, ' '))
  : '';

/* -----------------------------------------------------------------------------
   2. SELECTION STATE FOR REGISTRATION

   Age group and difficulty are plain variables until the form is submitted;
   the cards below only update these values.
   -------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------------
   3. SHARED UI HELPERS
   -------------------------------------------------------------------------- */

// Write a message into the single alert strip at the top of the page.
// kind is 'err' (default) or 'ok'.
function say(msg, kind) {
  const a = $('#alert');
  a.textContent = msg || '';
  a.className = 'alert' + (msg ? ' show ' + (kind || 'err') : '');
  if (msg) a.scrollIntoView({ block: 'nearest' });
}

// Exactly one of the four views is visible at a time.
function showView(which) {
  $('#formsView').hidden = which !== 'forms';
  $('#sessionView').hidden = which !== 'session';
  $('#forgotView').hidden = which !== 'forgot';
  $('#resetView').hidden = which !== 'reset';
}

// Render a set of choice cards and keep aria-pressed in sync with the choice.
function cards(el, list, current, onPick) {
  el.innerHTML = list.map((x) => '<button type="button" class="pick" data-id="' + x.id + '" aria-pressed="' + (x.id === current) + '"><b>' + esc(x.n) + '</b><span>' + esc(x.d) + '</span></button>').join('');
  el.querySelectorAll('.pick').forEach((b) => b.onclick = () => {
    el.querySelectorAll('.pick').forEach((o) => o.setAttribute('aria-pressed', o === b));
    onPick(b.dataset.id);
  });
}
function renderPaths() {
  cards($('#pathCards'), PATHS, pathId, (v) => pathId = v);
}
renderPaths();
cards($('#diffCards'), DIFFS, diffId, (v) => diffId = v);

/* -----------------------------------------------------------------------------
   4. SIGN IN / CREATE ACCOUNT SWITCHES

   Top switch: sign in vs create account.
   Second switch: email+password vs Player ID+password.
   The account-type cards additionally decide which registration fields appear.
   -------------------------------------------------------------------------- */
function tab(up) {
  $('#tabIn').setAttribute('aria-pressed', !up);
  $('#tabUp').setAttribute('aria-pressed', up);
  $('#loginForm').hidden = up;
  $('#regForm').hidden = !up;
  say('');
}
$('#tabIn').onclick = () => tab(false);
// The Create account tab opens the privacy summary first; see below.
$('#tabUp').onclick = () => openConsent();

/* -----------------------------------------------------------------------------
   4a. PRIVACY CONSENT BEFORE REGISTRATION

   Registering sends a name, an email address and progress to the server, and
   the learner's name appears on a public leaderboard, so the notice is shown
   before the form rather than hidden in the footer. One acknowledgement per
   page visit is enough; the form keeps its own visible checkbox as well.
   -------------------------------------------------------------------------- */
let consentSeen = false;
const pv = () => $('#pvM');

function closePv() {
  pv().hidden = true;
}

function openConsent() {
  if (consentSeen) return tab(true);
  // An earlier half-finished visit must not leave the box ticked.
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
  // Carry the acknowledgement into the form's own visible checkbox.
  $('#rgConsent').checked = true;
  closePv();
  tab(true);
  $('#rgName').focus();
};

$('#pvCancel').onclick = closePv;
$('#pvX').onclick = closePv;
// Clicking the dark backdrop closes the dialog, as on the volume panel.
pv().addEventListener('click', (e) => { if (e.target === pv()) closePv(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !pv().hidden) closePv();
});

function method(byId) {
  $('#mEmail').setAttribute('aria-pressed', !byId);
  $('#mId').setAttribute('aria-pressed', byId);
  $('#fEmail').hidden = byId;
  $('#fId').hidden = !byId;
  // A Player ID has no email address, so email recovery cannot help here.
  document.querySelector('.forgot-row').hidden = byId;
}
$('#mEmail').onclick = () => method(false);
$('#mId').onclick = () => method(true);

// Remember the last choice so the checkbox reflects what happens on the next
// sign-in; the default is on.
try { $('#liRemember').checked = localStorage.getItem('tlp-remember') !== '0'; } catch (e) {}

document.querySelectorAll('#regForm .pick[data-role]').forEach((b) => b.onclick = () => {
  role = b.dataset.role;
  document.querySelectorAll('#regForm .pick[data-role]').forEach((o) => o.setAttribute('aria-pressed', o === b));
  // The Adult learner card is a Learner account with the adult path already
  // chosen. The plain Learner card restores the default path if adult was set.
  if (b.dataset.path) pathId = b.dataset.path;
  else if (pathId === 'adult') pathId = 'g710';
  renderPaths();
  $('#pathLabel').textContent = pathId === 'adult' ? 'Learning path' : 'Age group';
  $('#learnerFields').hidden = role !== 'learner';
  $('#rgNameLabel').textContent = role === 'parent' ? 'Full name' : 'Display name';
  $('#rgName').placeholder = role === 'parent' ? 'For example: Sandra Lewis' : 'Name shown on the leaderboards';
});
$('#rgName').placeholder = 'Name shown on the leaderboards';

// Where a signed-in account belongs after login. The owner account can also be
// a parent, so the administrator dashboard wins: that is the only destination
// the session view offers it.
function where(user) {
  return user.isAdmin ? 'admin.html' : user.role === 'parent' ? 'parent.html' : 'webgame.html';
}

/* -----------------------------------------------------------------------------
   4b. PASSWORD STRENGTH METER

   Local, instant feedback while typing. The real check (length, common list,
   breach lookup) runs when the form is submitted, in js/password.js.
   -------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------------
   5. SIGN IN
   -------------------------------------------------------------------------- */
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  const btn = $('#liGo');
  btn.disabled = true;
  try {
    // The session store reads this flag, so set it before signing in:
    // "0" keeps the session in sessionStorage and signs out on browser close.
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

/* -----------------------------------------------------------------------------
   6. CREATE ACCOUNT
   -------------------------------------------------------------------------- */
$('#regForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  say('');
  const name = $('#rgName').value.trim();
  if (name.length < 2) return say('Please enter a name of at least 2 characters.');
  if (!$('#rgConsent').checked) return say('Please confirm that you have read the privacy notice.');
  const btn = $('#rgGo');
  btn.disabled = true;
  try {
    // Length, common-password and breach checks live in js/password.js. Only a
    // confirmed breach blocks the form; a network failure lets the user through.
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
      tab(false);
      say('Your account has been created. A confirmation email has been requested. It can take a few minutes, so please also check your spam folder. After confirming, sign in here.', 'ok');
    } else {
      location.href = where(r.user);
    }
  } catch (err) {
    say((err && err.message) || 'Could not create the account.');
  } finally {
    btn.disabled = false;
  }
});

/* -----------------------------------------------------------------------------
   7. PASSWORD RECOVERY — STEP 1: ASK FOR THE EMAIL

   The wording of the success message is deliberately the same whether or not
   the address belongs to an account, so this form cannot be used to test which
   emails are registered.
   -------------------------------------------------------------------------- */
$('#forgotLink').onclick = () => {
  say('');
  showView('forgot');
  // Carry the address over if one was already typed on the sign-in form.
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

/* -----------------------------------------------------------------------------
   8. PASSWORD RECOVERY — STEP 2: SAVE THE NEW PASSWORD

   Reached only through the email link, which gives this tab a short-lived
   recovery session. TLP_AUTH.updatePassword() replaces the password on that
   session, so the user is signed in normally afterwards.
   -------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------------
   9. SIGNED-IN VIEW

   Fills the account summary and wires the destructive action. The delete button
   stays disabled until the exact confirmation sentence has been typed.
   -------------------------------------------------------------------------- */
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

  // The delete section is only offered to accounts the database allows to be
  // deleted, so an administrator never sees a control that cannot work.
  const danger = document.querySelector('.acct .danger');
  if (danger) danger.hidden = !!u.isAdmin;
  // Player IDs only belong to learner profiles.
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

/* -----------------------------------------------------------------------------
   10. BOOT

   Order matters:
   - an error in the link means the token is spent, so show the forms with the
     reason instead of an unusable password form;
   - a recovery link goes straight to the new-password view, but init() still
     has to run so the recovery session is established;
   - otherwise the normal signed-in / signed-out decision is made.
   -------------------------------------------------------------------------- */
(async function boot() {
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
  refresh();
})();
