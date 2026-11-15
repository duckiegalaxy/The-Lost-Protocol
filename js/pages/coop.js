/* =============================================================================
   CO-OP MISSION LOBBY  (js/pages/coop.js)
   -----------------------------------------------------------------------------
   Powers coop.html. Two players share a room, each writes half of the program,
   and the server runs the combined result.
   
   Security note: the browser never computes the score. It sends the chosen
   program to the Edge Function and renders the result that comes back. Treat
   every value in a room object as untrusted and pass it through esc().
   Areas in this file:
     - view switching and small formatters
     - room creation, polling and cleanup
     - the realtime broadcast channel
     - the program composer and lane rendering
     - mission timing and the result screen
   ============================================================================= */
const $ = (s) => document.querySelector(s);
const A = () => window.TLP_AUTH, C = () => window.TLP_COOP;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const QUICK = ['I will take my lane', 'Which bus value should we use?', 'Let us use bus 3', 'Let us use bus 4', 'Let us use bus 6', 'My lane is done', 'Looks right to me', 'I need help', 'Ready to submit'];
let room = null, role = 'host', inst = null, offset = 0, lanes = { host: [], guest: [] }, ch = null, pollT = null, tickT = null, inviteT = null, draftInner = [], submitted = false;
/* -----------------------------------------------------------------------------
   Views
   One of five screens is visible at a time: gate, lobby, waiting, mission,
   result. show() hides the others so state can never leak between screens.
   -------------------------------------------------------------------------- */
const show = (id) => ['gate', 'lobby', 'waiting', 'mission', 'result'].forEach((x) => { $('#' + x).hidden = x !== id; });

function sayIn(el, msg) { $(el).textContent = msg || ''; }
function fmtTime(ms) { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
const stName = (i) => i === 10 ? 'Core' : 'Station ' + (i + 1);

function describe(st) {
  if (!st) return '';
  const inner = (l) => (l || []).map(describe).join(', then ');
  if (st.op === 'add') return 'Add ' + (st.k | 0) + ' to ' + stName(st.st | 0);
  if (st.op === 'bus') return 'Set the bus to ' + (st.k | 0);
  if (st.op === 'addbus') return 'Pour the bus into the Core';
  if (st.op === 'rep') return 'Repeat ' + (st.n | 0) + ' times: ' + inner(st.body);
  if (st.op === 'if') return 'If ' + stName(st.st | 0) + ' is ' + ({ lt: 'less than', gt: 'greater than', eq: 'equal to' }[st.cmp] || '?') + ' ' + (st.v | 0) + ': ' + inner(st.then);
  return '';
}

/* -----------------------------------------------------------------------------
   Room lifecycle
   Joining, polling and leaving. poll() is the fallback when the realtime
   channel is unavailable, so the UI still advances on slow networks.
   -------------------------------------------------------------------------- */
async function openRoom(roomId) {
  const st = await A()._rpc('coop_room_state', { p_room: roomId });
  applyState(st); connect();
  clearInterval(pollT); pollT = setInterval(poll, 2500);
}
async function poll() {
  try { applyState(await A()._rpc('coop_room_state', { p_room: room.room_id })); } catch (e) { /* temporary network problem: keep the last state */ }
}
function applyState(st) {
  room = st; role = st.role; inst = st.instance; offset = new Date(st.server_now).getTime() - Date.now();
  if (st.status === 'abandoned') { cleanup(); show('lobby'); sayIn('#lobbyMsg', 'The room was closed or left. You can create a new one.'); return; }
  if (st.status === 'finished' && $('#result').hidden) { fetchResultFallback(); return; }
  if (st.status === 'waiting') { renderWaiting(); }
  else if (st.status === 'playing') { if ($('#mission').hidden) startMission(); updateMission(); }
}
function renderWaiting() {
  show('waiting');
  $('#roomCode').textContent = room.code;
  const p = (x, label) => x ? '<span class="pill2 ' + (x.ready ? 'on' : '') + '">' + label + ': ' + esc(x.name) + ' (' + esc(x.player_id) + ') ' + (x.ready ? 'ready' : 'not ready') + '</span>' : '<span class="pill2">' + label + ': waiting for a teammate</span>';
  $('#whoRow').innerHTML = p(room.host, 'Host') + ' ' + p(room.guest, 'Teammate');
  $('#invRow').hidden = role !== 'host';
  const mine = role === 'host' ? room.host : room.guest;
  $('#readyBtn').textContent = mine && mine.ready ? 'Not ready' : 'I am ready';
  $('#readyBtn').disabled = !room.guest;
}
$('#readyBtn').onclick = async () => {
  const mine = role === 'host' ? room.host : room.guest;
  try { applyState(await A()._rpc('coop_set_ready', { p_room: room.room_id, p_ready: !(mine && mine.ready) })); } catch (e) { sayIn('#waitMsg', e.message); }
};
$('#invBtn').onclick = async () => {
  try { sayIn('#waitMsg', await A()._rpc('coop_invite', { p_room: room.room_id, p_player_id: $('#invPid').value })); $('#invPid').value = ''; } catch (e) { sayIn('#waitMsg', e.message); }
};
async function leave() {
  try { if (room) await A()._rpc('coop_leave', { p_room: room.room_id }); } catch (e) {}
  cleanup(); loadLobby();
}
$('#leaveBtn').onclick = leave; $('#mLeave').onclick = () => { if (confirm('Leaving ends the mission for both players, and no result is recorded. Leave?')) leave(); };

function cleanup() {
  clearInterval(pollT); clearInterval(tickT);
  try { if (ch) A().supabase.removeChannel(ch); } catch (e) {} ch = null; room = null; submitted = false;
}

/* ---------- realtime: each player sees the other's lane live ---------- */
/* -----------------------------------------------------------------------------
   Realtime channel
   Broadcast-only: players exchange lane edits and ready flags. Anything that
   decides the outcome goes to the server, never through this channel.
   -------------------------------------------------------------------------- */
function connect() {
  if (ch) return;
  const sb = A().supabase;
  ch = sb.channel('coop-' + room.room_id, { config: { broadcast: { self: false }, presence: { key: role } } });
  ch.on('broadcast', { event: 'lane' }, ({ payload }) => {
    if (!payload || (payload.role !== 'host' && payload.role !== 'guest') || payload.role === role || !Array.isArray(payload.program)) return;
    lanes[payload.role] = payload.program.slice(0, 40); renderLanes();
  });
  ch.on('broadcast', { event: 'hello' }, () => sendLane());
  ch.on('broadcast', { event: 'chat' }, ({ payload }) => { if (payload && QUICK.includes(payload.text)) logMsg(payload.name || 'Teammate', payload.text); });
  ch.on('presence', { event: 'sync' }, () => {
    const keys = Object.keys(ch.presenceState()); const other = role === 'host' ? 'guest' : 'host';
    $('#pPresence').textContent = keys.includes(other) ? 'Your teammate is connected.' : 'Your teammate is not connected right now. They can reopen this page to rejoin.';
  });
  ch.subscribe((status) => { if (status === 'SUBSCRIBED') { ch.track({ role }); ch.send({ type: 'broadcast', event: 'hello', payload: {} }); sendLane(); } });
}
function sendLane() { if (ch) ch.send({ type: 'broadcast', event: 'lane', payload: { role, program: lanes[role] } }); try { localStorage.setItem('tlp-coop-' + room.room_id + '-' + role, JSON.stringify(lanes[role])); } catch (e) {} }
function logMsg(who, text) { const d = document.createElement('div'); d.textContent = who + ': ' + text; $('#log').prepend(d); }

/* ---------- mission ---------- */
function startMission() {
  show('mission'); submitted = false;
  try { const saved = JSON.parse(localStorage.getItem('tlp-coop-' + room.room_id + '-' + role) || '[]'); if (Array.isArray(saved)) lanes[role] = saved.slice(0, 40); } catch (e) {}
  $('#mTitle').textContent = (inst.title || 'Mission') + ' · ' + room.challenge_id;
  const me = role === 'host' ? room.host : room.guest, mate = role === 'host' ? room.guest : room.host;
  $('#mWho').textContent = 'You: ' + me.name + ' (' + me.player_id + ') with ' + (mate ? mate.name + ' (' + mate.player_id + ')' : 'your teammate');
  $('#myLaneT').textContent = role === 'host' ? 'Your lane: Stations 1 to 5 and the bus' : 'Your lane: Stations 6 to 10 and the Core';
  $('#pLaneT').textContent = role === 'host' ? "Teammate's lane: Stations 6 to 10 and the Core" : "Teammate's lane: Stations 1 to 5 and the bus";
  $('#mRules').innerHTML = 'Bring every station to its target number, and bring the Core to <b>' + esc(inst.core.target) + '</b>. Add amounts are 1 to ' + C().MAXADD + ', repeats are 2 to ' + C().MAXREP + ' times. The host sets the <b>bus</b> value first; the teammate then pours the bus into the Core some number of times. The bus value multiplied by the number of pours must equal the Core target, so agree on the numbers together. Score: up to 1000 for correct stations, 200 more when everything is right, up to 200 more for using fewer steps. Time only breaks ties.';
  buildComposer(); renderLanes(); renderTable(null);
  const quick = $('#quick'); quick.innerHTML = QUICK.map((q) => '<button type="button">' + esc(q) + '</button>').join('');
  quick.querySelectorAll('button').forEach((b) => b.onclick = () => { const nm = (role === 'host' ? room.host : room.guest).name; logMsg('You', b.textContent); if (ch) ch.send({ type: 'broadcast', event: 'chat', payload: { text: b.textContent, name: nm } }); });
  clearInterval(tickT); tickT = setInterval(updateMission, 500);
}
function updateMission() { if (!room || !room.started_at) return; $('#timer').textContent = fmtTime(Date.now() + offset - new Date(room.started_at).getTime()); }
function myStations() { const lo = role === 'host' ? 0 : 5; return [0, 1, 2, 3, 4].map((i) => lo + i); }
const opt = (v, t) => '<option value="' + v + '">' + t + '</option>';
/* -----------------------------------------------------------------------------
   Program composer
   Each player edits only their own half of the mission. The composer keeps
   edits small and local so simultaneous typing cannot corrupt the other lane.
   -------------------------------------------------------------------------- */
function buildComposer() {
  const types = [opt('add', 'Add to a station'), opt('rep', 'Repeat'), opt('if', 'If')].concat(role === 'host' ? [opt('bus', 'Set the bus')] : [opt('addbus', 'Pour the bus into the Core')]);
  $('#bType').innerHTML = types.join('');
  $('#bSt').innerHTML = myStations().map((i) => opt(i, stName(i))).join('');
  $('#iSt').innerHTML = $('#bSt').innerHTML;
  const ks = [1, 2, 3, 4, 5].map((k) => opt(k, k)).join('');
  $('#bK').innerHTML = role === 'host' ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => opt(k, k)).join('') : ks; $('#iK').innerHTML = ks;
  $('#bN').innerHTML = [2, 3, 4, 5, 6, 7, 8, 9].map((k) => opt(k, k)).join('');
  $('#iKind').innerHTML = opt('add', 'Add to a station') + (role === 'guest' ? opt('addbus', 'Pour the bus into the Core') : '');
  syncComposer();
}
function syncComposer() {
  const t = $('#bType').value, nested = t === 'rep' || t === 'if';
  $('#fSt').hidden = !(t === 'add' || t === 'if'); $('#fK').hidden = !(t === 'add' || t === 'bus'); $('#fN').hidden = t !== 'rep';
  $('#fCmp').hidden = $('#fV').hidden = t !== 'if'; $('#innerBox').hidden = !nested;
  $('#bK').innerHTML = (t === 'bus' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5]).map((k) => opt(k, k)).join('');
  const kind = $('#iKind').value; $('#iStF').hidden = $('#iKF').hidden = kind === 'addbus';
  $('#iList').textContent = draftInner.length ? 'Inside: ' + draftInner.map(describe).join(', then ') : '';
}
$('#bType').onchange = () => { draftInner = []; syncComposer(); }; $('#iKind').onchange = syncComposer;
$('#iAdd').onclick = () => {
  if (draftInner.length >= 6) return sayIn('#bErr', 'At most 6 steps inside a repeat or if.');
  draftInner.push($('#iKind').value === 'addbus' ? { op: 'addbus', st: 10 } : { op: 'add', st: +$('#iSt').value, k: +$('#iK').value }); sayIn('#bErr', ''); syncComposer();
};
$('#bAdd').onclick = () => {
  const t = $('#bType').value; let st;
  if (t === 'add') st = { op: 'add', st: +$('#bSt').value, k: +$('#bK').value };
  else if (t === 'bus') st = { op: 'bus', k: +$('#bK').value };
  else if (t === 'addbus') st = { op: 'addbus', st: 10 };
  else if (t === 'rep') st = { op: 'rep', n: +$('#bN').value, body: draftInner.slice() };
  else st = { op: 'if', st: +$('#bSt').value, cmp: $('#bCmp').value, v: Math.max(0, Math.min(99, parseInt($('#bV').value, 10) || 0)), then: draftInner.slice() };
  if ((t === 'rep' || t === 'if') && !draftInner.length) return sayIn('#bErr', 'Add at least one inside step first.');
  const trial = lanes[role].concat([st]), probe = { host: role === 'host' ? trial : [], guest: role === 'guest' ? trial : [] };
  const r = C().simulate(inst, probe);
  if (!r.ok) return sayIn('#bErr', r.error);
  lanes[role] = trial; draftInner = []; sayIn('#bErr', ''); syncComposer(); renderLanes(); sendLane();
};
function renderLanes() {
  const draw = (arr, mine, el) => {
    $(el).innerHTML = arr.length ? arr.map((s, i) => '<li>' + esc(describe(s)) + (mine ? '<button type="button" data-i="' + i + '" aria-label="Remove step ' + (i + 1) + '">Remove</button>' : '') + '</li>').join('') : '<li class="m">No steps yet.</li>';
  };
  draw(lanes[role], true, '#myProg'); draw(lanes[role === 'host' ? 'guest' : 'host'], false, '#pProg');
  $('#myProg').querySelectorAll('button').forEach((b) => b.onclick = () => { lanes[role].splice(+b.dataset.i, 1); renderLanes(); sendLane(); });
}
/* -----------------------------------------------------------------------------
   Results
   Renders the server result (station-by-station) and falls back to a fetch
   when the realtime message was missed.
   -------------------------------------------------------------------------- */
function renderTable(res) {
  const rows = ['<tr><th>Station</th><th>Starts at</th><th>Target</th><th>After your test</th></tr>'];
  inst.stations.forEach((s, i) => { const v = res && res.vals[i]; rows.push('<tr><td>' + stName(i) + '</td><td>' + s.start + '</td><td>' + s.target + '</td><td class="' + (res ? (v === s.target ? 'ok' : 'no') : '') + '">' + (res ? v + (v === s.target ? ' matches' : ' needs ' + s.target) : '-') + '</td></tr>'); });
  const cv = res && res.vals[10]; rows.push('<tr><td>Core</td><td>0</td><td>' + inst.core.target + '</td><td class="' + (res ? (cv === inst.core.target ? 'ok' : 'no') : '') + '">' + (res ? cv + (cv === inst.core.target ? ' matches' : ' needs ' + inst.core.target) : '-') + '</td></tr>');
  $('#stTable').innerHTML = rows.join('');
}
$('#testBtn').onclick = () => {
  const r = C().simulate(inst, lanes);
  if (!r.ok) { $('#preview').textContent = 'The combined program is not valid: ' + r.error; return; }
  renderTable(r); $('#preview').textContent = r.correct + ' of ' + r.total + ' correct, ' + r.steps + ' steps. Practice score: ' + C().score(r) + '. The official score is calculated by the server when you submit.';
};
$('#subBtn').onclick = async () => {
  if (submitted) return; const r = C().simulate(inst, lanes);
  if (!r.ok) return sayIn('#subMsg', 'Fix this first: ' + r.error);
  if (r.correct < r.total && !confirm('Not every station matches yet (' + r.correct + ' of ' + r.total + '). Submit anyway? Only one result can be recorded for this room.')) return;
  submitted = true; $('#subBtn').disabled = true; sayIn('#subMsg', 'Submitting...');
  try { const d = await A()._invoke('coop-submit', { roomId: room.room_id, program: lanes }); showResult(d); }
  catch (e) { submitted = false; $('#subBtn').disabled = false; sayIn('#subMsg', /Failed to send|FunctionsFetch|Requested function/i.test(e.message) ? 'The co-op service is not available yet. The site owner must deploy it.' : 'Could not submit: ' + e.message); }
};
function showResult(d) {
  cleanup(); show('result');
  $('#resBody').innerHTML = '<p>' + (d.already ? 'This mission was already recorded. ' : '') + 'Team score: <b>' + d.score + '</b>. Correct: ' + d.correct + ' of 11. Steps: ' + d.steps + '. Time: <b>' + fmtTime(d.durationMs) + '</b> (kept by the server).</p><p class="m">Your team appears on the co-op leaderboard with both Player IDs.</p>';
}
async function fetchResultFallback() { cleanup(); show('result'); $('#resBody').innerHTML = '<p>The mission is finished and the result has been recorded.</p>'; }
$('#again').onclick = () => { $('#result').hidden = true; loadLobby(); };

/* ---------- lobby ---------- */
async function loadInvites() {
  try {
    const rows = await A()._rpc('coop_my_invites');
    $('#invites').innerHTML = rows && rows.length ? rows.map((r) => '<div class="row3"><span>' + esc(r.from_name) + ' (' + esc(r.from_player_id) + ') invited you.</span><button class="btn ghost sm" data-code="' + esc(r.code) + '" type="button">Join</button></div>').join('') : 'None right now.';
    $('#invites').querySelectorAll('button[data-code]').forEach((b) => b.onclick = () => join(b.dataset.code));
  } catch (e) {}
}
async function join(code) {
  try { const id = await A()._rpc('coop_join_room', { p_code: code }); clearInterval(inviteT); await openRoom(id); }
  catch (e) { sayIn('#lobbyMsg', e.message); }
}
$('#joinBtn').onclick = () => join($('#joinCode').value);
$('#mkRoom').onclick = async () => { try { const r = await A()._rpc('coop_create_room'); clearInterval(inviteT); await openRoom(r.room_id); } catch (e) { sayIn('#lobbyMsg', e.message); } };
async function loadLobby() {
  show('lobby'); sayIn('#lobbyMsg', '');
  const l = A().getActiveLearner(); $('#myPid').textContent = (l && l.player_id) || '';
  try { const rid = await A()._rpc('coop_my_active_room'); if (rid) { await openRoom(rid); return; } } catch (e) {}
  loadInvites(); clearInterval(inviteT); inviteT = setInterval(loadInvites, 4000);
}

(async function boot() {
  const g = $('#gate');
  try {
    await A().init(); const u = A().getCurrentUser();
    if (!A().isCloudConfigured()) { show('gate'); g.textContent = 'Co-op needs the online version of the site.'; return; }
    if (!u) { show('gate'); g.innerHTML = 'Please <a href="auth.html">sign in</a> with a learner account to play co-op.'; return; }
    if (u.role === 'parent') { show('gate'); g.innerHTML = 'Parent and Educator accounts do not play. <a href="parent.html">Back to the Parent and Educator area</a>.'; return; }
    if (u.isAdmin) { show('gate'); g.textContent = 'The administrator account has no learner profile, so it cannot play co-op. Use a learner account to test.'; return; }
    await loadLobby();
  } catch (e) { show('gate'); g.textContent = 'Something went wrong: ' + (e && e.message || e); }
})();
window.addEventListener('beforeunload', () => { try { if (ch) A().supabase.removeChannel(ch); } catch (e) {} });
