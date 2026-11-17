/* =============================================================================
   FRIENDS PAGE  (js/pages/friends.js)
   -----------------------------------------------------------------------------
   Powers friends.html. The friend list itself is local to this browser; live
   online state comes from TLP_PRESENCE, which only publishes a Player ID,
   display name and a short activity line.
   
   Areas in this file:
     - access gate
     - rendering the self card and friend cards
     - adding and removing a friend
     - starting a co-op room and inviting a friend
   ============================================================================= */
const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH, P = () => window.TLP_PRESENCE;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const say = (t, bad) => { const m = $('#addMsg'); m.textContent = t || ''; m.style.color = bad ? '#ef7a8c' : ''; };

function ago(ts) {
  const s = Math.max(0, Math.round((Date.now() - (ts || 0)) / 1000));
  if (!ts) return 'Offline';
  if (s < 90) return 'Seen just now';
  if (s < 3600) return 'Seen ' + Math.round(s / 60) + ' min ago';
  if (s < 86400) return 'Seen ' + Math.round(s / 3600) + ' hr ago';
  return 'Seen ' + Math.round(s / 86400) + ' days ago';
}

function card(f) {
  const initial = (f.name || '?').trim().charAt(0).toUpperCase() || '?';
  return '<article class="fcard' + (f.online ? ' on' : '') + '" data-pid="' + esc(f.pid) + '">' +
    '<div class="fava" aria-hidden="true">' + esc(initial) + '</div>' +
    '<div class="fwho"><b>' + esc(f.name) + '</b><small>' + esc(f.pid) + '</small></div>' +
    '<span class="fdot"><i></i>' + (f.online ? 'Online' : 'Offline') + '</span>' +
    '<p class="fact">' + esc(f.online ? (f.activity || 'Signed in') : ago(f.at)) + '</p>' +
    '<div class="row3">' +
    (f.online ? '<button class="btn ghost sm" type="button" data-play="' + esc(f.pid) + '">Play co-op</button>' : '') +
    '<button class="btn ghost sm danger" type="button" data-del="' + esc(f.pid) + '">Remove</button>' +
    '</div></article>';
}

let boardSig = '';
let boardReq = 0;

/* Friends play at different times, so the board compares finished scores
   instead of waiting for both people to be online. It only reloads when the
   friend list itself changes, not on every presence update. */
async function loadBoard(list) {
  const box = $('#frBoard');
  if (!box) return;
  const l = A().getActiveLearner();
  const me = l && l.player_id;
  if (!l || l.isGuest || !me || !A().isCloudConfigured()) { box.hidden = true; return; }
  /* Names are part of the signature: a friend is added with a placeholder
     name and renamed once the public display name arrives. */
  const sig = [me].concat(list.map((f) => f.pid + ':' + (f.name || ''))).join(',');
  if (sig === boardSig) return;
  boardSig = sig;
  const req = ++boardReq;
  const path = l.assigned_path || l.assignedPath || localStorage.getItem('tlp-path') || 'g710';
  const diff = l.current_diff || l.currentDiff || localStorage.getItem('tlp-diff') || 'int';
  const names = {};
  list.forEach((f) => { names[f.pid] = f.name || f.pid; });
  const pids = [...new Set([me].concat(list.map((f) => f.pid)).filter(Boolean))].slice(0, 10);
  box.hidden = false;
  box.innerHTML = '<div class="fbhead"><b>Friends on your board</b><span>Same age group and difficulty</span></div><p class="fbnote">Loading scores...</p>';
  const rows = await Promise.all(pids.map(async (pid) => {
    const isMe = pid === me;
    const base = { pid, isMe, name: isMe ? (l.name || 'You') : (names[pid] || pid), row: null, pos: 0 };
    try {
      const r = await A().getLeaderboardRank({ path, diff, playerId: pid });
      return r && r.row ? Object.assign(base, { row: r.row }) : base;
    } catch (e) { return base; }
  }));
  if (req !== boardReq) return;
  const scored = rows.filter((r) => r.row)
    .sort((a, b) => b.row.total_score - a.row.total_score || b.row.total_stars - a.row.total_stars);
  let prev = null, prevRank = 0;
  scored.forEach((r, i) => {
    const same = prev && prev.row.total_score === r.row.total_score && prev.row.total_stars === r.row.total_stars;
    r.pos = same ? prevRank : i + 1;
    prev = r; prevRank = r.pos;
  });
  const rest = rows.filter((r) => !r.row);
  const line = (r) => '<div class="fbrow' + (r.isMe ? ' me' : '') + '"><span class="fbrk">' + (r.row ? '#' + r.pos : '—') + '</span><b>' + esc(r.name) + (r.isMe ? ' (you)' : '') + '</b>' + (r.row ? '<strong>' + r.row.total_score + '</strong>' : '<span class="none">Not on this board</span>') + '</div>';
  const mine = rows.filter((r) => r.isMe)[0];
  box.innerHTML = '<div class="fbhead"><b>Friends on your board</b><span>Same age group and difficulty</span></div>' +
    scored.concat(rest).map(line).join('') +
    (mine && !mine.row ? '<p class="fbnote">Your score joins this board after one mission while signed in.</p>' : '') +
    (!scored.some((r) => !r.isMe) ? '<p class="fbnote">A friend joins this board after one mission at your age group and difficulty.</p>' : '');
}

function render(list) {
  $('#meActivity').textContent = (P().onlineMap()[P().me() && P().me().player_id] || {}).activity || 'Browsing friends';
  $('#frCount').textContent = list.length + (list.length === 1 ? ' friend' : ' friends');
  $('#frList').innerHTML = list.length ? list.map(card).join('') : '<p class="m">No friends yet. Add a Player ID above.</p>';
  loadBoard(list).catch(() => {});
}

async function addFriend() {
  const raw = $('#addPid').value;
  say('');
  try {
    const entry = P().addFriend(raw);
    $('#addPid').value = '';
    render(P().friends());
    say('Added ' + entry.pid + '. Ask them to add your Player ID too.');
    // The public display name may be available; fill it in so the card reads
    // well even while that friend is offline.
    try {
      const hit = await P().lookupPlayer(entry.pid);
      if (hit && hit.display_name) { P().addFriend(entry.pid, hit.display_name); render(P().friends()); }
    } catch (e) {}
  } catch (e) { say(e.message, true); }
}

async function playCoop(pid, btn) {
  const name = (P().friends().filter((f) => f.pid === pid)[0] || {}).name || pid;
  btn.disabled = true; say('Opening a room for ' + name + '...');
  try {
    let roomId = await A()._rpc('coop_my_active_room');
    if (!roomId) { const r = await A()._rpc('coop_create_room'); roomId = r && r.room_id; }
    if (!roomId) throw new Error('The co-op service did not return a room.');
    await A()._rpc('coop_invite', { p_room: roomId, p_player_id: pid });
    say('Invitation sent. Opening the co-op lobby...');
    location.href = 'coop.html';
  } catch (e) {
    btn.disabled = false;
    say('Could not invite them: ' + (e && e.message ? e.message : 'unknown error') + '. Make sure you are the host of the room.', true);
  }
}

$('#addBtn').onclick = addFriend;
$('#addPid').addEventListener('keydown', (e) => { if (e.key === 'Enter') addFriend(); });
$('#copyPid').onclick = () => {
  const pid = P().me() && P().me().player_id;
  if (!pid) return;
  try { navigator.clipboard.writeText(pid); $('#copyPid').textContent = 'Copied'; setTimeout(() => { $('#copyPid').textContent = 'Copy'; }, 1500); } catch (e) {}
};
$('#frList').addEventListener('click', (e) => {
  const play = e.target.closest('[data-play]');
  if (play) return playCoop(play.dataset.play, play);
  const del = e.target.closest('[data-del]');
  if (del) {
    if (!confirm('Remove ' + del.dataset.del + ' from your friend list?')) return;
    P().removeFriend(del.dataset.del);
    render(P().friends());
  }
});

(async function boot() {
  const g = $('#gate');
  try {
    await A().init();
    const u = A().getCurrentUser();
    if (!A().isCloudConfigured()) { g.hidden = false; g.textContent = 'Friends needs the online version of the site.'; return; }
    if (!u) { g.hidden = false; g.innerHTML = 'Please <a href="auth.html">sign in</a> with a learner account to use the friend list.'; return; }
    if (u.role === 'parent') { g.hidden = false; g.innerHTML = 'Parent and Educator accounts do not have a learner profile. <a href="parent.html">Back to the Parent and Educator area</a>.'; return; }
    if (u.isAdmin) { g.hidden = false; g.textContent = 'The administrator account has no learner profile, so it has no friends list. Use a learner account to test this page.'; return; }
    const l = A().getActiveLearner();
    if (!l || l.isGuest) { g.hidden = false; g.innerHTML = 'Sign in with a learner account to keep a friend list. <a href="auth.html">Sign in</a>.'; return; }
    await P().start({ activity: 'Browsing friends' });
    const me = P().me();
    if (!me) { g.hidden = false; g.textContent = 'Your learner profile could not be loaded, so presence is unavailable right now.'; return; }
    $('#meName').textContent = me.name;
    $('#mePid').textContent = me.player_id || 'No Player ID yet';
    $('#app').hidden = false;
    P().onChange(render);
    render(P().friends());
  } catch (e) {
    g.hidden = false; g.textContent = 'Something went wrong: ' + (e && e.message ? e.message : e);
  }
})();
