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
let practice = false;

/* -----------------------------------------------------------------------------
   Practice missions
   Five local missions built from the same rules the server checks. A preset
   bot program covers the lane the player is not practising, so the full grid
   can be tested without a second person. Practice never reaches the server.
   The last two change the puzzle, not the rules: Mirror Relay gives both lanes
   the same targets, and Signal Drift starts some stations partly charged.
   -------------------------------------------------------------------------- */
const PRACTICE = {
  easy: { title: 'Relay Basics', bus: 3, pours: 2, host: [2, 3, 4, 2, 3], guest: [2, 3, 4, 2, 3] },
  medium: { title: 'Split Signal', bus: 4, pours: 3, host: [5, 4, 3, 5, 4], guest: [5, 4, 3, 5, 4] },
  hard: { title: 'Relay Overload', bus: 6, pours: 3, host: [5, 4, 5, 4, 5], guest: [5, 4, 5, 4, 5] },
  mirror: { title: 'Mirror Relay', bus: 4, pours: 3, host: [2, 4, 6, 4, 8], guest: [2, 4, 6, 4, 8] },
  drift: { title: 'Signal Drift', bus: 3, pours: 3, host: [4, 6, 2, 5, 6], guest: [5, 3, 4, 6, 4], hostStart: [1, 2, 0, 3, 1], guestStart: [2, 0, 1, 4, 2] }
};
function practiceInstance(level) {
  const d = PRACTICE[level];
  const starts = (d.hostStart || []).concat(d.guestStart || []);
  return {
    title: d.title,
    maxStatements: 80,
    stations: d.host.concat(d.guest).map((k, i) => ({ start: starts[i] || 0, target: k })),
    core: { target: d.bus * d.pours }
  };
}
function solvedLane(lane, level) {
  const d = PRACTICE[level], out = [];
  const targets = lane === 'host' ? d.host : d.guest;
  const starts = (lane === 'host' ? d.hostStart : d.guestStart) || [];
  const base = lane === 'host' ? 0 : 5;
  if (lane === 'host') out.push({ op: 'bus', k: d.bus });
  else for (let p = 0; p < d.pours; p++) out.push({ op: 'addbus', st: 10 });
  targets.forEach((k, i) => {
    let need = k - (starts[i] || 0);
    while (need > 0) { const step = Math.min(5, need); out.push({ op: 'add', st: base + i, k: step }); need -= step; }
  });
  return out;
}
function startPractice(level, side) {
  const d = PRACTICE[level];
  if (!d) return;
  const l = A().getActiveLearner() || {};
  const my = { name: l.name || 'You', player_id: l.player_id || 'YOU', ready: true };
  const bot = { name: 'Practice bot', player_id: 'BOT', ready: true };
  practice = true; submitted = false;
  role = side === 'guest' ? 'guest' : 'host';
  inst = practiceInstance(level);
  lanes = { host: [], guest: [] };
  lanes[role === 'host' ? 'guest' : 'host'] = solvedLane(role === 'host' ? 'guest' : 'host', level);
  room = {
    room_id: 'practice-' + level + '-' + role, code: 'PRACTICE', challenge_id: 'Practice',
    host: role === 'host' ? my : bot, guest: role === 'guest' ? my : bot,
    started_at: new Date().toISOString()
  };
  try { localStorage.removeItem('tlp-coop-' + room.room_id + '-' + role); } catch (e) {}
  offset = 0;
  sayIn('#pracMsg', '');
  startMission();
}
/* -----------------------------------------------------------------------------
   Views
   One of five screens is visible at a time: gate, lobby, waiting, mission,
   result. show() hides the others so state can never leak between screens.
   -------------------------------------------------------------------------- */
const show = (id) => {
  ['gate', 'lobby', 'waiting', 'mission', 'result'].forEach((x) => { $('#' + x).hidden = x !== id; });
  document.body.classList.toggle('in-mission', id === 'mission');
};

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
  $('#weekInfo').textContent = 'This week\'s puzzle: ' + (room.challenge_id || 'Restore the Relay Grid') + '. Both teams solve the same puzzle, so scores are comparable.';
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
  if (practice) { cleanup(); loadLobby(); return; }
  try { if (room) await A()._rpc('coop_leave', { p_room: room.room_id }); } catch (e) {}
  cleanup(); loadLobby();
}
$('#leaveBtn').onclick = leave; $('#mLeave').onclick = () => { if (confirm(practice ? 'Leave this practice run?' : 'Leaving ends the mission for both players, and no result is recorded. Leave?')) leave(); };
$('#copyCode').onclick = () => { try { navigator.clipboard.writeText(room.code); $('#copyCode').textContent = 'Copied'; setTimeout(() => { $('#copyCode').textContent = 'Copy code'; }, 1500); } catch (e) {} };

function cleanup() {
  clearInterval(pollT); clearInterval(tickT);
  try { if (ch) A().supabase.removeChannel(ch); } catch (e) {} ch = null; room = null; submitted = false; practice = false;
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
  // The player who submits gets the official result in the HTTP response. Share it
  // with the teammate so both of them see the same score and explanation.
  ch.on('broadcast', { event: 'result' }, ({ payload }) => {
    if (payload && typeof payload.score === 'number' && $('#result').hidden) showResult(payload);
  });
  ch.on('presence', { event: 'sync' }, () => {
    const keys = Object.keys(ch.presenceState()); const other = role === 'host' ? 'guest' : 'host';
    const here = keys.includes(other);
    $('#pPresence').textContent = here ? 'Your teammate is connected.' : 'Your teammate is not connected right now. They can reopen this page to rejoin.';
    if ($('#pipDot')) {
      $('#pipDot').classList.toggle('on', here);
      $('#pipAct').textContent = here ? 'live' : 'away';
      $('#pipPresence').textContent = here ? 'Your teammate is connected. Their lane updates as they edit.' : 'Your teammate is not connected right now.';
    }
  });
  ch.on('broadcast', { event: 'test' }, ({ payload }) => {
    if (!payload) return;
    const line = 'Teammate test: ' + payload.correct + ' of ' + (payload.total || 11) + ' correct, ' + payload.steps + ' steps.';
    if ($('#pipTest')) $('#pipTest').textContent = line;
    logMsg('Teammate', 'Test run: ' + payload.correct + ' of ' + (payload.total || 11) + ' correct, ' + payload.steps + ' steps.');
  });
  ch.subscribe((status) => { if (status === 'SUBSCRIBED') { ch.track({ role }); ch.send({ type: 'broadcast', event: 'hello', payload: {} }); sendLane(); } });
}
function sendLane() { if (ch) ch.send({ type: 'broadcast', event: 'lane', payload: { role, program: lanes[role] } }); try { localStorage.setItem('tlp-coop-' + room.room_id + '-' + role, JSON.stringify(lanes[role])); } catch (e) {} }
function logMsg(who, text) { const d = document.createElement('div'); d.textContent = who + ': ' + text; $('#log').prepend(d); }

/* ---------- mission ---------- */
function startMission() {
  show('mission'); submitted = false;
  $('#subBtn').disabled = !!practice;
  $('#subBtn').textContent = practice ? 'Practice only' : 'Submit as a team';
  sayIn('#subMsg', '');
  if (window.TLP_PRESENCE) TLP_PRESENCE.setActivity((practice ? 'Practising co-op · ' : 'Playing co-op · ') + (inst.title || 'mission'));
  try { const saved = JSON.parse(localStorage.getItem('tlp-coop-' + room.room_id + '-' + role) || '[]'); if (Array.isArray(saved)) lanes[role] = saved.slice(0, 40); } catch (e) {}
  $('#mTitle').textContent = (inst.title || 'Mission') + ' · ' + room.challenge_id;
  const me = role === 'host' ? room.host : room.guest, mate = role === 'host' ? room.guest : room.host;
  $('#mWho').textContent = 'You: ' + me.name + ' (' + me.player_id + ') with ' + (mate ? mate.name + ' (' + mate.player_id + ')' : 'your teammate');
  $('#myLaneT').textContent = role === 'host' ? 'Your lane: Stations 1 to 5 and the bus' : 'Your lane: Stations 6 to 10 and the Core';
  $('#pLaneT').textContent = role === 'host' ? "Teammate's lane: Stations 6 to 10 and the Core" : "Teammate's lane: Stations 1 to 5 and the bus";
  $('#mRules').innerHTML = 'Bring every station to its target and the Core to <b>' + esc(inst.core.target) + '</b>. Adds are 1 to ' + C().MAXADD + ', repeats are 2 to ' + C().MAXREP + ' times. The host sets the <b>bus</b>; the guest pours it into the Core. Bus value times pours must equal the Core target, so agree on the numbers. Score comes from correct stations, a full grid and fewer steps. Time only breaks ties.';
  buildComposer(); renderLanes(); renderTable(null);
  const quick = $('#quick'); quick.innerHTML = QUICK.map((q) => '<button type="button">' + esc(q) + '</button>').join('');
  quick.querySelectorAll('button').forEach((b) => b.onclick = () => { const nm = (role === 'host' ? room.host : room.guest).name; logMsg('You', b.textContent); if (ch) ch.send({ type: 'broadcast', event: 'chat', payload: { text: b.textContent, name: nm } }); });
  const partner = role === 'host' ? room.guest : room.host;
  $('#pipName').textContent = partner ? partner.name : 'Teammate';
  $('#pipAct').textContent = practice ? 'practice bot' : 'live';
  $('#pipDot').classList.toggle('on', !!practice);
  $('#pipPresence').textContent = practice ? 'The practice bot holds the other lane. Use Test run to check the whole grid.' : 'Waiting for your teammate to connect...';
  $('#pipTest').textContent = '';
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
  const mateLane = role === 'host' ? 'guest' : 'host', mate = lanes[mateLane];
  const draw = (arr, mine, el) => {
    $(el).innerHTML = arr.length ? arr.map((s, i) => '<li>' + esc(describe(s)) + (mine ? '<button type="button" data-i="' + i + '" aria-label="Remove step ' + (i + 1) + '">Remove</button>' : '') + '</li>').join('') : '<li class="m">No steps yet.</li>';
  };
  draw(lanes[role], true, '#myProg'); draw(mate, false, '#pProg');
  if ($('#pipProg')) $('#pipProg').innerHTML = mate.length ? mate.map((s) => '<li>' + esc(describe(s)) + '</li>').join('') : '<li class="m">No steps yet.</li>';
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
  if (ch) ch.send({ type: 'broadcast', event: 'test', payload: { role, correct: r.correct, total: r.total, steps: r.steps } });
};
$('#subBtn').onclick = async () => {
  if (practice) return sayIn('#subMsg', 'Practice runs are not submitted. Create a room to play for a leaderboard score.');
  if (submitted) return; const r = C().simulate(inst, lanes);
  if (!r.ok) return sayIn('#subMsg', 'Fix this first: ' + r.error);
  if (r.correct < r.total && !confirm('Not every station matches yet (' + r.correct + ' of ' + r.total + '). Submit anyway? Only one result can be recorded for this room.')) return;
  submitted = true; $('#subBtn').disabled = true; sayIn('#subMsg', 'Submitting...');
  try {
    const d = await A()._invoke('coop-submit', { roomId: room.room_id, program: lanes });
    if (ch) ch.send({ type: 'broadcast', event: 'result', payload: d });
    showResult(d);
  }
  catch (e) { submitted = false; $('#subBtn').disabled = false; sayIn('#subMsg', /Failed to send|FunctionsFetch|Requested function/i.test(e.message) ? 'The co-op service is not available yet. The site owner must deploy it.' : 'Could not submit: ' + e.message); }
};
function scoreBreakdown(r, official) {
  const base = Math.round(1000 * r.correct / r.total);
  const perfect = r.correct === r.total;
  const grid = perfect ? 200 : 0;
  const eff = perfect ? Math.min(200, 8 * Math.max(0, C().PAR - r.steps)) : 0;
  return { base, grid, eff, computed: base + grid + eff, official, perfect };
}
function resultRows(r) {
  const rows = inst.stations.map((s, i) => ({ name: stName(i), start: s.start, target: s.target, got: r.vals[i] }));
  rows.push({ name: 'Core', start: 0, target: inst.core.target, got: r.vals[10] });
  return rows;
}
function fixFor(row) {
  const diff = row.target - row.got;
  if (row.name === 'Core') {
    return diff > 0
      ? 'The Core is ' + diff + ' short. Raise the bus value or pour the bus one more time.'
      : 'The Core is ' + (-diff) + ' over. Lower the bus value or pour it fewer times.';
  }
  return diff > 0
    ? 'Add ' + diff + ' more to ' + esc(row.name) + ', for example one add of ' + Math.min(diff, C().MAXADD) + ' repeated until it reaches the target.'
    : esc(row.name) + ' is ' + (-diff) + ' too high. Remove or shrink one of the steps that touches it.';
}
function showResult(d) {
  const host = room && room.host, guest = room && room.guest, week = room && room.challenge_id;
  const r = inst ? C().simulate(inst, lanes) : null;
  const parts = r && r.ok ? scoreBreakdown(r, d.score) : null;
  const rows = r && r.ok ? resultRows(r) : [];
  const wrong = rows.filter((x) => x.got !== x.target);
  let html = '<p class="res-sub">' + (d.already ? 'This mission was already recorded. ' : '') +
    (d.rebuilt ? 'Rebuilt from the program saved in this browser; the official score is on the server.' : 'Your team result is stored on the server.') + '</p>' +
    '<div class="res-hero"><span class="res-score">' + esc(d.score) + '</span><span class="res-of">team score</span>' +
    '<span class="pill2 ' + (d.correct === 11 ? 'on' : '') + '">' + esc(d.correct) + ' of 11 correct</span>' +
    '<span class="pill2">' + esc(d.steps) + ' steps</span>' + (d.durationMs ? '<span class="pill2">Time ' + fmtTime(d.durationMs) + '</span>' : '') + '</div>' +
    '<p class="res-team">Team: ' + (host ? esc(host.name) + ' (' + esc(host.player_id) + ')' : 'Host') + ' and ' + (guest ? esc(guest.name) + ' (' + esc(guest.player_id) + ')' : 'teammate') + (week ? ' · Weekly puzzle ' + esc(week) : '') + '</p>';

  if (parts) {
    html += '<h3>Why you got this score</h3><ul class="why">' +
      '<li><b>' + parts.base + ' points</b> from ' + esc(d.correct) + ' of 11 targets correct (' + 1000 + ' × ' + esc(d.correct) + ' ÷ 11).</li>' +
      '<li><b>' + parts.grid + ' points</b> for a fully working grid' + (parts.grid ? '.' : ' (all 11 targets must match).') + '</li>' +
      '<li><b>' + parts.eff + ' points</b> for efficiency' + (parts.perfect ? ' (par is ' + C().PAR + ' steps, you used ' + esc(d.steps) + ').' : ' (only counted after a perfect grid).') + '</li>' +
      (d.durationMs ? '<li>Time (' + fmtTime(d.durationMs) + ') only breaks ties between equal scores.</li>' : '') + '</ul>';
  }

  html += '<h3>What went wrong</h3>';
  if (!r || !r.ok) {
    html += '<p class="res-sub">The detailed table could not be rebuilt in this browser. The server result above is still official.</p>';
  } else if (!wrong.length) {
    html += '<p class="res-good">Nothing went wrong: every station and the Core matched its target.</p>';
  } else {
    html += '<ul class="miss">' + wrong.map((x) =>
      '<li><b>' + esc(x.name) + '</b> started at ' + x.start + ', needed ' + x.target + ', finished at <span>' + x.got + '</span>. ' + fixFor(x) + '</li>'
    ).join('') + '</ul>';
  }

  html += '<h3>How to improve</h3><ul class="tips">';
  if (r && r.ok) {
    if (wrong.some((x) => x.name === 'Core')) html += '<li>Agree on the bus value first: Core target ÷ pours must equal the bus, so pick two numbers before writing steps.</li>';
    if (wrong.length) html += '<li>Work station by station: target − start is the amount to add. Split it into adds of ' + C().MAXADD + ' or less and use a repeat for equal amounts.</li>';
    if (r.steps > C().PAR) html += '<li>You used ' + r.steps + ' steps; par is ' + C().PAR + '. Group repeated additions into a repeat block to save steps.</li>';
    if (!wrong.length && r.steps <= C().PAR) html += '<li>You beat par. The next improvement is speed, which only matters as a tie-break, and using fewer steps for the same grid.</li>';
    if (parts && parts.perfect && r.steps < C().PAR && parts.eff < 200) html += '<li>A few more steps can be removed before the efficiency bonus stops growing.</li>';
  }
  html += '</ul>';

  html += '<h3>What to play next</h3><ul class="tips">' +
    (d.correct === 11
      ? '<li>Try next week\'s co-op puzzle when it appears, and chase a faster tie-break time.</li>'
      : '<li>Create a new room and replay this week\'s puzzle with the fixes above. Results are stored once per room, so a new room is needed.</li>') +
    '<li>Sharpen the single-player skills used here in <a href="webgame.html">Variables and Loops</a>, then return to co-op.</li>' +
    '<li>Compare your team with other pairs on the <a href="leaderboard.html">co-op leaderboard</a>.</li></ul>';

  cleanup(); show('result');
  if (window.TLP_PRESENCE) TLP_PRESENCE.setActivity('Finished a co-op mission');
  $('#resBody').innerHTML = html;
}
async function fetchResultFallback() {
  // The room finished while this player was connected but the official result
  // message was missed. Rebuild the explanation from the programs in memory so
  // both teammates still get feedback; the server keeps the official score.
  const r = inst ? C().simulate(inst, lanes) : null;
  if (r && r.ok && lanes.host.length && lanes.guest.length) {
    showResult({ score: C().score(r), correct: r.correct, steps: r.steps, durationMs: 0, rebuilt: true });
    return;
  }
  cleanup(); show('result'); $('#resBody').innerHTML = '<p>The mission is finished and the result has been recorded.</p>';
}
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
let adminPreview = false;
function adminLobby() {
  adminPreview = true;
  show('lobby'); sayIn('#lobbyMsg', '');
  clearInterval(inviteT);
  if (window.TLP_PRESENCE) TLP_PRESENCE.setActivity('In the co-op lobby');
  $('#adminNote').hidden = false;
  $('#teamCard').hidden = true;
  $('#invitesCard').hidden = true;
}
async function loadLobby() {
  if (adminPreview) { adminLobby(); return; }
  show('lobby'); sayIn('#lobbyMsg', '');
  if (window.TLP_PRESENCE) TLP_PRESENCE.setActivity('In the co-op lobby');
  const l = A().getActiveLearner(); $('#myPid').textContent = (l && l.player_id) || '';
  try { const rid = await A()._rpc('coop_my_active_room'); if (rid) { await openRoom(rid); return; } } catch (e) {}
  loadInvites(); clearInterval(inviteT); inviteT = setInterval(loadInvites, 4000);
}

/* -----------------------------------------------------------------------------
   Teammate preview (PiP)
   A small floating copy of the teammate lane. Drag the header to move it,
   double-click the header to enlarge it, and use the minus button to fold it
   back into a strip. The position is remembered per browser.
   -------------------------------------------------------------------------- */
(function initPip() {
  const pip = $('#pip'); if (!pip) return;
  const head = $('#pipHead');
  try {
    const p = JSON.parse(localStorage.getItem('tlp-pip-pos') || 'null');
    if (p && typeof p.left === 'number' && typeof p.top === 'number') {
      pip.style.left = Math.max(6, Math.min(window.innerWidth - 250, p.left)) + 'px';
      pip.style.top = Math.max(6, Math.min(window.innerHeight - 90, p.top)) + 'px';
      pip.style.right = 'auto';
    }
  } catch (e) {}
  let drag = null;
  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || pip.classList.contains('open')) return;
    drag = { x: e.clientX, y: e.clientY, left: pip.offsetLeft, top: pip.offsetTop };
    pip.classList.add('dragging');
    try { head.setPointerCapture(e.pointerId); } catch (x) {}
  });
  head.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const w = pip.offsetWidth, h = pip.offsetHeight;
    const l = Math.max(6, Math.min(window.innerWidth - w - 6, drag.left + e.clientX - drag.x));
    const t = Math.max(6, Math.min(window.innerHeight - h - 6, drag.top + e.clientY - drag.y));
    pip.style.left = l + 'px'; pip.style.top = t + 'px'; pip.style.right = 'auto';
  });
  const stop = () => {
    if (!drag) return;
    drag = null; pip.classList.remove('dragging');
    try { localStorage.setItem('tlp-pip-pos', JSON.stringify({ left: pip.offsetLeft, top: pip.offsetTop })); } catch (e) {}
  };
  head.addEventListener('pointerup', stop);
  head.addEventListener('pointercancel', stop);
  head.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    pip.classList.toggle('open');
  });
  head.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (pip.classList.contains('min')) pip.classList.remove('min');
  });
  $('#pipMin').addEventListener('click', (e) => { e.stopPropagation(); pip.classList.toggle('min'); });
})();

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-prac]');
  if (b) startPractice(b.dataset.prac, b.dataset.side);
});

(async function boot() {
  const g = $('#gate');
  try {
    await A().init(); const u = A().getCurrentUser();
    if (!A().isCloudConfigured()) {
      show('gate');
      g.innerHTML = '<h2>Online only</h2><p class="m">Co-op needs the online version of the site, because teams are matched and scored on the server. The practice levels on this page still work on their own.</p><div class="gateacts"><a class="btn" href="webgame.html">Play the solo game</a></div>';
      return;
    }
    if (!u) {
      show('gate');
      g.innerHTML = '<h2>Sign in to play co-op</h2><p class="m">Co-op pairs you with another learner, so the page needs a learner account. A guest save has no Player ID to invite.</p><div class="gateacts"><a class="btn" href="auth.html">Sign in or create an account</a><a class="btn ghost" href="webgame.html">Play the solo game</a></div>';
      return;
    }
    if (u.isAdmin) {
      show('gate');
      g.innerHTML = '<h2>Owner preview</h2><p class="m">This account has no learner profile, so rooms, invitations and team scores are off. You can still open the lobby and test a lane in the practice levels, which record nothing.</p><div class="gateacts"><button class="btn" id="gatePrac" type="button">Open practice levels</button><a class="btn ghost" href="parent.html">Parent area</a></div>';
      $('#gatePrac').onclick = adminLobby;
      return;
    }
    if (u.role === 'parent') {
      show('gate');
      g.innerHTML = '<h2>Learner accounts only</h2><p class="m">Parent and Educator accounts do not play co-op missions. Sign in with a learner account to join a team.</p><div class="gateacts"><a class="btn" href="parent.html">Back to the Parent and Educator area</a><a class="btn ghost" href="auth.html">Switch account</a></div>';
      return;
    }
    const learner = A().getActiveLearner() || {};
    const path = learner.assigned_path || learner.assignedPath;
    if (window.TLP_MUSIC && path) TLP_MUSIC.setTheme('coop-' + path);
    await loadLobby();
  } catch (e) { show('gate'); g.textContent = 'Something went wrong: ' + (e && e.message || e); }
})();
window.addEventListener('beforeunload', () => { try { if (ch) A().supabase.removeChannel(ch); } catch (e) {} });
