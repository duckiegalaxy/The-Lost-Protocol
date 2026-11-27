const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH, P = () => window.TLP_PRESENCE;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const say = (t, bad) => { const m = $('#addMsg'); m.textContent = t || ''; m.style.color = bad ? '#ef7a8c' : ''; };
let currentList = [], lookupTimer = 0, lookupSeq = 0, pendingRemove = '', pendingAction = 'remove', bannerTimer = 0;
let boardSig = '', boardReq = 0, boardTimer = 0;
let safetyOpener = null, bodyOverflow = '', blocked = [], blockedOwner = '';

function pidKey(pid) { return String(pid || '').trim().toUpperCase(); }
function blockStorageKey() { const l = A().getActiveLearner(); return 'tlp-blocked-players:' + ((l && l.id) || 'default'); }
function loadBlocked() {
  const key = blockStorageKey();
  if (blockedOwner === key) { if (P().setBlockedPlayers) P().setBlockedPlayers(blocked); return; }
  blockedOwner = key; blocked = [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) blocked = saved.filter((x) => x && x.pid).map((x) => ({ pid: pidKey(x.pid), name: String(x.name || x.pid).slice(0, 60) }));
  } catch (e) {}
  if (P().setBlockedPlayers) P().setBlockedPlayers(blocked);
}
function saveBlocked() { try { localStorage.setItem(blockStorageKey(), JSON.stringify(blocked)); } catch (e) {} if (P().setBlockedPlayers) P().setBlockedPlayers(blocked); }
function isBlocked(pid) { return blocked.some((x) => x.pid === pidKey(pid)); }
function renderBlocked() {
  $('#blockedCount').textContent = blocked.length;
  $('#blockedPanel').hidden = !blocked.length;
  $('#blockedList').innerHTML = blocked.map((x) => '<div class="fr-blocked-row"><span><b>' + esc(x.name) + '</b><small>' + esc(x.pid) + '</small></span><button class="btn ghost sm" type="button" data-unblock="' + esc(x.pid) + '">Unblock</button></div>').join('');
}

function avatarHtml(cfg, px, name) {
  try {
    if (cfg && typeof cfg === 'object' && Object.keys(cfg).length && window.TLP_AVATAR && TLP_AVATAR.mini) return TLP_AVATAR.mini(cfg, px || 44);
  } catch (e) {}
  const initial = String(name || '?').trim().charAt(0).toUpperCase() || '?';
  return '<span class="avatar-fallback">' + esc(initial) + '</span>';
}

function timeAgo(ts) {
  const t = typeof ts === 'string' ? Date.parse(ts) : Number(ts || 0);
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (!t) return 'Offline';
  if (s < 90) return 'Seen just now';
  if (s < 3600) return 'Seen ' + Math.round(s / 60) + ' min ago';
  if (s < 86400) return 'Seen ' + Math.round(s / 3600) + ' hr ago';
  return 'Seen ' + Math.round(s / 86400) + ' days ago';
}

function card(f) {
  const status = f.online ? 'Online' : 'Offline';
  const detail = f.online ? (f.activity || 'Signed in') : timeAgo(f.at);
  return '<article class="fcard' + (f.online ? ' on' : '') + '" data-pid="' + esc(f.pid) + '">' +
    '<div class="fava" aria-hidden="true">' + avatarHtml(f.avatar, 46, f.name) + '</div>' +
    '<div class="fwho"><b>' + esc(f.name) + '</b><small>' + esc(f.pid) + '</small></div>' +
    '<span class="fdot"><i></i>' + status + '</span>' +
    '<p class="fact">' + esc(detail) + '</p>' +
    '<div class="fcard-actions"><span class="flocal">' + (f.legacy ? 'On this device' : 'Synced friend') + '</span><span class="fcard-buttons">' +
    '<button class="btn ghost sm danger" type="button" data-del="' + esc(f.pid) + '" data-name="' + esc(f.name) + '" aria-label="Remove ' + esc(f.name) + ' from friends">Remove</button>' +
    '<button class="btn ghost sm" type="button" data-block="' + esc(f.pid) + '" data-name="' + esc(f.name) + '" aria-label="Block ' + esc(f.name) + ' on this device">Block</button>' +
    '<button class="btn ghost sm" type="button" data-report="' + esc(f.pid) + '" data-name="' + esc(f.name) + '" aria-label="Report a concern about ' + esc(f.name) + '">Report</button></span></div></article>';
}

function requestCard(r, incoming) {
  return '<article class="frequest' + (incoming ? ' incoming' : ' outgoing') + '" data-request="' + esc(r.request_id) + '">' +
    '<div class="fava" aria-hidden="true">' + avatarHtml(r.avatar, 42, r.name) + '</div>' +
    '<div class="fwho"><b>' + esc(r.name) + '</b><small>' + esc(r.player_id) + ' · ' + timeAgo(r.created_at) + '</small></div>' +
    '<div class="frequest-actions">' + (incoming ?
      '<button class="btn sm" type="button" data-accept="' + esc(r.request_id) + '" data-name="' + esc(r.name) + '">Accept</button>' +
      '<button class="btn ghost sm" type="button" data-decline="' + esc(r.request_id) + '">Decline</button>' :
      '<button class="btn ghost sm" type="button" data-cancel="' + esc(r.request_id) + '">Cancel request</button>') + '</div></article>';
}

function notificationItem(n) {
  return '<article class="fnotification' + (n.read_at ? '' : ' unread') + '">' +
    '<div class="fava" aria-hidden="true">' + avatarHtml(n.actor_avatar, 38, n.actor_name) + '</div>' +
    '<div><b>' + esc(n.title || 'Friends notification') + '</b><p>' + esc(n.body || '') + '</p><small>' + esc(timeAgo(n.created_at)) + '</small></div></article>';
}

function renderFriends(list) {
  const box = $('#frList');
  const active = document.activeElement;
  const activeWrap = active && active.closest ? active.closest('.fcard-wrap') : null;
  const focusKey = activeWrap && active.dataset ? activeWrap.dataset.pid + ':' + ['del', 'block', 'report'].find((k) => active.dataset[k]) : '';
  const existing = {};
  box.querySelectorAll('.fcard-wrap').forEach((el) => { existing[el.dataset.pid] = el; });
  const keep = {};
  list.forEach((f) => {
    keep[f.pid] = 1;
    let el = existing[f.pid];
    const html = card(f);
    const sig = [f.online ? 1 : 0, f.name, f.activity, f.at, f.legacy ? 1 : 0, JSON.stringify(f.avatar || {})].join('|');
    if (!el) {
      el = document.createElement('div');
      el.className = 'fcard-wrap enter';
      el.dataset.pid = f.pid;
      el.dataset.sig = sig;
      el.innerHTML = html;
      box.appendChild(el);
    } else if (el.dataset.sig !== sig) {
      el.dataset.sig = sig;
      el.innerHTML = html;
    }
  });
  Object.keys(existing).forEach((pid) => {
    if (keep[pid]) return;
    const el = existing[pid];
    el.classList.add('leaving');
    setTimeout(() => { if (!currentList.some((f) => f.pid === pid)) el.remove(); }, 220);
  });
  const empty = box.querySelector('.frempty');
  if (!list.length && !empty) {
    const p = document.createElement('p'); p.className = 'm frempty'; p.textContent = 'No friends yet. Add a Player ID above.'; box.appendChild(p);
  } else if (list.length && empty) empty.remove();
  if (focusKey) setTimeout(() => {
    const parts = focusKey.split(':'), wrap = box.querySelector('.fcard-wrap[data-pid="' + parts[0] + '"]');
    const target = wrap && wrap.querySelector('[data-' + parts[1] + ']');
    (target || box.closest('section').querySelector('h2')).focus();
  }, 0);
}

function renderRequests() {
  const req = P().requests();
  const incoming = (req.incoming || []).filter((r) => !isBlocked(r.player_id));
  const outgoing = (req.outgoing || []).filter((r) => !isBlocked(r.player_id));
  const active = document.activeElement;
  const focusAttr = active && ['accept', 'decline', 'cancel'].find((k) => active.dataset && active.dataset[k]);
  const focusId = focusAttr && active.dataset[focusAttr];
  const restore = () => setTimeout(() => {
    if (!focusAttr) return;
    const target = focusId && $('#requestPanel [data-' + focusAttr + '="' + focusId + '"]');
    (target || $('#requestPanel h2')).focus();
  }, 0);
  $('#requestCount').textContent = (incoming.length + outgoing.length) + ' open';
  if (P().mode() !== 'server') {
    $('#incomingList').innerHTML = '<p class="m">' + (P().mode() === 'error' ? 'The connection paused. Your last synced list is still here. Use Retry connection above.' : 'Friend requests need the online service. Friends already saved on this device still appear below.') + '</p>';
    $('#outgoingList').innerHTML = '';
    restore();
    return;
  }
  $('#incomingList').innerHTML = incoming.length ? '<h3>Received</h3>' + incoming.map((r) => requestCard(r, true)).join('') : '';
  $('#outgoingList').innerHTML = outgoing.length ? '<h3>Sent</h3>' + outgoing.map((r) => requestCard(r, false)).join('') : '';
  if (!incoming.length && !outgoing.length) $('#incomingList').innerHTML = '<p class="m">No open requests. Send a Player ID above to start.</p>';
  restore();
}

function renderNotifications() {
  const list = P().notifications().filter((n) => !isBlocked(n.actor_player_id || n.actor_pid || n.player_id));
  const unread = list.filter((n) => !n.read_at).length;
  const badge = $('#notifCount');
  badge.textContent = unread > 99 ? '99+' : String(unread);
  badge.hidden = !unread;
  $('#notificationList').innerHTML = list.length ? list.map(notificationItem).join('') : '<p class="m">No notifications yet. Requests and friend updates will appear here.</p>';
}

function renderMe() {
  const me = P().me();
  if (!me) return;
  $('#meName').textContent = me.name;
  $('#mePid').textContent = me.player_id || 'No Player ID yet';
  $('#meAvatar').innerHTML = avatarHtml(me.avatar, 62, me.name);
  const mode = P().mode(), sync = P().syncStatus();
  $('#syncMode').textContent = mode === 'error' ? 'Connection paused' : mode === 'server' ? (sync.error ? 'Synced · live updates reconnecting' : 'Friends synced online') : mode === 'local' ? 'Browser backup mode' : 'Connecting…';
  $('#syncRetry').hidden = mode !== 'error';
  const here = P().onlineMap()[me.player_id];
  $('#meActivity').textContent = (here && here.activity) || 'Browsing friends';
}

function render(list) {
  loadBlocked();
  currentList = (list || P().friends()).filter((f) => !isBlocked(f.pid));
  renderMe();
  $('#frCount').textContent = currentList.length + (currentList.length === 1 ? ' friend' : ' friends');
  renderFriends(currentList);
  renderRequests();
  renderNotifications();
  renderBlocked();
  loadBoard(currentList).catch(() => {});
}

function banner(text, bad) {
  const el = $('#friendBanner');
  el.textContent = text;
  el.className = 'fr-banner' + (bad ? ' bad' : '');
  el.hidden = false;
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { el.hidden = true; }, 6500);
}

function toast(text) {
  const el = $('#friendToast');
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 3800);
}

async function loadBoard(list, force) {
  const box = $('#frBoard');
  if (!box) return;
  list = (list || P().friends()).filter((f) => !isBlocked(f.pid));
  const l = A().getActiveLearner();
  const me = l && l.player_id;
  if (!l || l.isGuest || !me || !A().isCloudConfigured()) { box.hidden = true; return; }
  const avatarSig = (cfg) => JSON.stringify(cfg || {});
  const sig = [me, avatarSig(l.avatar)].concat(list.map((f) => f.pid + ':' + (f.name || '') + ':' + avatarSig(f.avatar))).join(',');
  if (!force && sig === boardSig) return;
  boardSig = sig;
  const req = ++boardReq;
  const path = l.assigned_path || l.assignedPath || localStorage.getItem('tlp-path') || 'g710';
  const diff = l.current_diff || l.currentDiff || localStorage.getItem('tlp-diff') || 'int';
  const names = {}, avatars = {};
  list.forEach((f) => { names[f.pid] = f.name || f.pid; avatars[f.pid] = f.avatar; });
  const pids = [...new Set([me].concat(list.map((f) => f.pid)).filter(Boolean))].slice(0, 10);
  box.hidden = false;
  box.innerHTML = '<div class="fbhead"><b>Friends on your board</b><span>Same age group and difficulty</span></div><p class="fbnote">Loading scores...</p>';
  const rows = await Promise.all(pids.map(async (pid) => {
    const isMe = pid === me;
    const base = { pid, isMe, name: isMe ? (l.name || 'You') : (names[pid] || pid), avatar: isMe ? l.avatar : avatars[pid], row: null, pos: 0 };
    try {
      const r = await A().getLeaderboardRank({ path, diff, playerId: pid });
      return r && r.row ? Object.assign(base, { row: r.row, avatar: r.row.avatar || base.avatar }) : base;
    } catch (e) { return base; }
  }));
  if (req !== boardReq) return;
  const scored = rows.filter((r) => r.row).sort((a, b) => b.row.total_score - a.row.total_score || b.row.total_stars - a.row.total_stars);
  let prev = null, prevRank = 0;
  scored.forEach((r, i) => {
    const same = prev && prev.row.total_score === r.row.total_score && prev.row.total_stars === r.row.total_stars;
    r.pos = same ? prevRank : i + 1;
    prev = r; prevRank = r.pos;
  });
  const rest = rows.filter((r) => !r.row);
  const line = (r) => '<div class="fbrow' + (r.isMe ? ' me' : '') + '"><span class="fbrk">' + (r.row ? '#' + r.pos : '—') + '</span>' +
    '<div class="fbplayer"><span class="fbavatar" aria-hidden="true">' + avatarHtml(r.avatar, 30, r.name) + '</span><b>' + esc(r.name) + (r.isMe ? ' (you)' : '') + '</b></div>' +
    (r.row ? '<strong>' + r.row.total_score + '</strong>' : '<span class="none">Not on this board</span>') + '</div>';
  const mine = rows.filter((r) => r.isMe)[0];
  box.innerHTML = '<div class="fbhead"><b>Friends on your board</b><span>Same age group and difficulty</span></div>' +
    scored.concat(rest).map(line).join('') +
    (mine && !mine.row ? '<p class="fbnote">Your score joins this board after one mission while signed in.</p>' : '') +
    (!scored.some((r) => !r.isMe) ? '<p class="fbnote">A friend joins this board after one mission at your age group and difficulty.</p>' : '');
}

function scheduleLookup() {
  clearTimeout(lookupTimer);
  const seq = ++lookupSeq;
  const raw = $('#addPid').value.trim();
  const preview = $('#addPreview');
  if (!P().validPid(raw) || isBlocked(raw)) { preview.hidden = true; preview.innerHTML = ''; return; }
  lookupTimer = setTimeout(async () => {
    try {
      const hit = await P().lookupPlayer(raw);
      if (seq !== lookupSeq) return;
      preview.hidden = false;
      preview.innerHTML = hit ?
        '<div class="fava" aria-hidden="true">' + avatarHtml(hit.avatar, 40, hit.display_name) + '</div><div><b>' + esc(hit.display_name) + '</b><small>' + esc(hit.player_id) + '</small></div><span class="fr-found">Found</span>' :
        '<div class="fr-preview-copy"><b>Ready to check</b><small>This Player ID will be verified when you send the request.</small></div>';
    } catch (e) { if (seq === lookupSeq) preview.hidden = true; }
  }, 320);
}

async function addFriend() {
  const raw = $('#addPid').value;
  const button = $('#addBtn');
  say('');
  if (!P().validPid(raw)) { say('Enter a Player ID like TLP-12345678.', true); $('#addPid').focus(); return; }
  if (isBlocked(raw)) { say('This player is blocked on this device. Unblock them below your friends list first.', true); return; }
  button.disabled = true;
  button.textContent = 'Sending…';
  try {
    const result = await P().sendFriendRequest(raw);
    $('#addPid').value = '';
    $('#addPreview').hidden = true;
    lookupSeq++;
    render(P().friends());
    const status = result && result.status;
    if (status === 'sent') banner('Request sent. You will see them in Friends when they accept.');
    else if (status === 'incoming') banner('They already sent you a request. Accept it in the Requests panel.');
    else if (status === 'pending') banner('That request is already waiting for a response.');
    else if (status === 'friends') banner('You are already friends.');
    else if (status === 'local') banner('Added on this device. Online requests need the updated online service.');
    say('');
  } catch (e) { say(e && e.message ? e.message : 'Could not send the request.', true); }
  finally { button.disabled = false; button.textContent = 'Send request'; }
}

function openSafety(action, pid, name) {
  pendingAction = action; pendingRemove = pid; safetyOpener = document.activeElement;
  bodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  $('#app').inert = true; $('#notifBtn').inert = true;
  $('#removeYes').classList.toggle('danger', action !== 'report');
  if (action === 'block') {
    $('#removeTitle').textContent = 'Block on this device?';
    $('#removeText').textContent = 'Block ' + (name || pid) + ' and remove the friendship. This block stays in this browser and is not synced to other devices.';
    $('#removeYes').textContent = 'Block player'; $('#removeNo').textContent = 'Keep friend';
  } else if (action === 'report') {
    $('#removeTitle').textContent = 'Report a concern?';
    $('#removeText').textContent = 'Next, write a short private report for the site owner about ' + (name || pid) + '. Do not include passwords, addresses or other private details.';
    $('#removeYes').textContent = 'Continue'; $('#removeNo').textContent = 'Cancel';
  } else {
    $('#removeTitle').textContent = 'Remove friend?';
    $('#removeText').textContent = 'Remove ' + (name || pid) + '? This removes the friendship for both players.';
    $('#removeYes').textContent = 'Remove friend'; $('#removeNo').textContent = 'Keep friend';
  }
  $('#removeConfirm').hidden = false;
  $('#removeNo').focus();
}
function closeSafety() {
  if ($('#removeConfirm').hidden) return;
  $('#removeConfirm').hidden = true;
  pendingRemove = ''; pendingAction = 'remove';
  document.body.style.overflow = bodyOverflow;
  $('#app').inert = false; $('#notifBtn').inert = false;
  if (safetyOpener && document.documentElement.contains(safetyOpener)) safetyOpener.focus();
}
function trapSafetyFocus(e) {
  if (e.key !== 'Tab') return;
  const items = [$('#removeNo'), $('#removeYes')], first = items[0], last = items[1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

$('#addForm').addEventListener('submit', (e) => { e.preventDefault(); addFriend(); });
$('#addPid').addEventListener('input', scheduleLookup);
$('#copyPid').onclick = () => {
  const pid = P().me() && P().me().player_id;
  if (!pid) return;
  try {
    navigator.clipboard.writeText(pid);
    $('#copyPid').textContent = 'Copied';
    setTimeout(() => { $('#copyPid').textContent = 'Copy'; }, 1500);
  } catch (e) { toast('Could not copy. Select the Player ID and copy it manually.'); }
};
$('#syncRetry').onclick = async () => {
  $('#syncRetry').disabled = true;
  $('#syncRetry').textContent = 'Retrying…';
  try {
    await P().retryServer();
    render(P().friends());
    banner(P().mode() === 'server' ? 'Friends are connected again.' : 'Online friend requests are not available yet. Device friends are still here.');
  } catch (e) { toast(e && e.message ? e.message : 'Could not reconnect. Please try again.'); }
  finally { $('#syncRetry').disabled = false; $('#syncRetry').textContent = 'Retry connection'; }
};
$('#frList').addEventListener('click', (e) => {
  const del = e.target.closest('[data-del]'), block = e.target.closest('[data-block]'), report = e.target.closest('[data-report]');
  if (del) openSafety('remove', del.dataset.del, del.dataset.name);
  else if (block) openSafety('block', block.dataset.block, block.dataset.name);
  else if (report) openSafety('report', report.dataset.report, report.dataset.name);
});
$('#blockedList').addEventListener('click', (e) => {
  const button = e.target.closest('[data-unblock]');
  if (!button) return;
  const pid = button.dataset.unblock, activePid = pidKey(pid);
  blocked = blocked.filter((x) => x.pid !== activePid);
  saveBlocked(); render(P().friends());
  const next = $('#blockedList [data-unblock]') || $('#addPid');
  next.focus(); banner('Player unblocked on this device. Send a new request if you want to connect.');
});
$('#removeNo').onclick = closeSafety;
$('#removeConfirm').addEventListener('click', (e) => { if (e.target === $('#removeConfirm')) closeSafety(); });
$('#removeConfirm').addEventListener('keydown', trapSafetyFocus);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#removeConfirm').hidden) { e.preventDefault(); closeSafety(); } });
$('#removeYes').onclick = async () => {
  if (!pendingRemove) return;
  const pid = pendingRemove, action = pendingAction;
  const friend = currentList.find((f) => f.pid === pid) || P().friends().find((f) => f.pid === pid);
  const name = friend ? friend.name : pid;
  $('#removeYes').disabled = true;
  try {
    if (action === 'report') {
      try {
        sessionStorage.setItem('tlp-feedback-prefill', JSON.stringify({ message: 'Friend safety concern about ' + name + ' (' + pid + ').\n\nWhat happened? ', page: 'friends' }));
        window.location.href = 'index.html';
      } catch (e) { toast('Could not open the report form. Please use Feedback on the home page.'); }
      return;
    }
    const cardEl = $('#frList [data-pid="' + pid + '"]');
    if (cardEl) cardEl.classList.add('leaving');
    await P().removeFriend(pid);
    if (action === 'block') {
      blocked = blocked.filter((x) => x.pid !== pidKey(pid));
      blocked.push({ pid: pidKey(pid), name: name || pid });
      saveBlocked();
    }
    closeSafety();
    render(P().friends());
    banner(action === 'block' ? 'Player blocked on this device and removed from Friends. The block is not synced to other devices.' : 'Friend removed. The friendship was removed for both players.');
  } catch (e) { toast(e && e.message ? e.message : 'Could not update this friend.'); render(P().friends()); }
  finally { $('#removeYes').disabled = false; }
};
$('#requestPanel').addEventListener('click', async (e) => {
  const accept = e.target.closest('[data-accept]'), decline = e.target.closest('[data-decline]'), cancel = e.target.closest('[data-cancel]');
  const button = accept || decline || cancel;
  if (!button) return;
  button.disabled = true;
  try {
    if (accept) {
      const result = await P().respondRequest(accept.dataset.accept, true);
      const name = accept.dataset.name || result.name || 'Your friend';
      banner('You and ' + name + ' are now friends.');
      $('#friendLive').textContent = 'Friend request accepted. ' + name + ' was added to your friends.';
    } else if (decline) {
      const result = await P().respondRequest(decline.dataset.decline, false);
      banner(result.status === 'accepted' ? 'That request was already accepted.' : 'Request declined.');
    } else {
      await P().cancelRequest(cancel.dataset.cancel);
      banner('Request cancelled.');
    }
    render(P().friends());
  } catch (err) { toast(err && err.message ? err.message : 'Could not update the request.'); render(P().friends()); }
  finally { button.disabled = false; }
});
function closeNotifications(returnFocus) {
  const panel = $('#notificationPanel');
  if (panel.hidden) return;
  if (returnFocus && panel.contains(document.activeElement)) $('#notifBtn').focus();
  panel.hidden = true;
  $('#notifBtn').setAttribute('aria-expanded', 'false');
}
$('#notifBtn').onclick = () => {
  const panel = $('#notificationPanel');
  panel.hidden = !panel.hidden;
  $('#notifBtn').setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) P().markNotificationsRead().catch(() => {});
};
document.addEventListener('click', (e) => {
  if (!$('#notificationPanel').hidden && !$('#notificationPanel').contains(e.target) && !$('#notifBtn').contains(e.target)) closeNotifications(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#notificationPanel').hidden && $('#removeConfirm').hidden) { e.preventDefault(); closeNotifications(true); }
});
$('#markRead').onclick = () => { P().markNotificationsRead().then(() => renderNotifications()).catch((e) => toast(e.message)); };

document.addEventListener('tlp-avatar-change', () => { if (!$('#app').hidden) render(P().friends()); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#app').hidden) loadBoard(P().friends(), true).catch(() => {}); });

(async function boot() {
  const g = $('#gate');
  try {
    await A().init();
    const u = A().getCurrentUser();
    if (!A().isCloudConfigured()) { g.hidden = false; g.textContent = 'Friends needs the online version of the site.'; return; }
    if (!u) { g.hidden = false; g.innerHTML = 'Please <a href="auth.html">sign in</a> with a learner account to use Friends.'; return; }
    if (u.role !== 'learner') { g.hidden = false; g.innerHTML = 'Friends is available with a learner account. <a href="parent.html">Back to the Parent and Educator area</a>.'; return; }
    if (u.isAdmin) { g.hidden = false; g.textContent = 'The administrator account has no learner profile, so it has no friends list. Use a learner account to test this page.'; return; }
    const l = A().getActiveLearner();
    if (!l || l.isGuest) { g.hidden = false; g.innerHTML = 'Sign in with a learner account to keep a friend list. <a href="auth.html">Sign in</a>.'; return; }
    loadBlocked();
    await P().start({ activity: 'Browsing friends' });
    const me = P().me();
    if (!me) { g.hidden = false; g.textContent = 'Your learner profile could not be loaded, so Friends is unavailable right now.'; return; }
    $('#app').hidden = false;
    P().onChange(render);
    render(P().friends());
    boardTimer = setInterval(() => { if (!document.hidden) loadBoard(P().friends(), true).catch(() => {}); }, 45000);
  } catch (e) {
    g.hidden = false; g.textContent = 'Something went wrong: ' + (e && e.message ? e.message : e);
  }
})();
