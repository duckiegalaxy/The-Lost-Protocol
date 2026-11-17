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
const QUICK = ['Which shared number should we use?', 'Let us use 3', 'Let us use 4', 'Let us use 6', 'My side is done', 'Looks right to me', 'I need help', 'Ready to submit'];
let room = null, role = 'host', inst = null, offset = 0, lanes = { host: [], guest: [] }, ch = null, pollT = null, tickT = null, inviteT = null, submitted = false;
let practice = false, testedPerfect = false, testRan = false;
let homeKind = 'gate', landingKind = 'signedout', tutStep = -1;

const otherRole = () => role === 'host' ? 'guest' : 'host';
const stName = (i) => i === 10 ? 'Core' : 'Station ' + (i + 1);
const innerOf = (s) => s.op === 'rep' ? s.body : s.op === 'if' ? s.then : [];
const CMP = { lt: 'is below', gt: 'is above', eq: 'is exactly' };
const tutSeen = () => { try { return localStorage.getItem('tlp-coop-tutor') === '1'; } catch (e) { return false; } };
const markTutSeen = () => { try { localStorage.setItem('tlp-coop-tutor', '1'); } catch (e) {} };

/* -----------------------------------------------------------------------------
   Practice missions
   Five local missions built from the same rules the server checks. A preset
   bot program covers the lane the player is not practising, so the full grid
   can be tested without a second person. Practice never reaches the server.
   The last two change the puzzle, not the rules: Mirror Relay gives both lanes
   the same targets, and Signal Drift starts some stations partly charged.
   -------------------------------------------------------------------------- */
const PRACTICE = {
  // The first-run tutorial level: one station and the Core need work, so the
  // learner makes two moves and sees the whole grid match. Not listed in
  // PRACTICE_INFO; Relay Basics is the first level they play afterwards.
  learn: { title: 'First relay', bus: 3, pours: 2, host: [2, 0, 0, 0, 0], guest: [0, 0, 0, 0, 0] },
  easy: { title: 'Relay Basics', bus: 3, pours: 2, host: [2, 3, 4, 2, 3], guest: [2, 3, 4, 2, 3] },
  medium: { title: 'Split Signal', bus: 4, pours: 3, host: [5, 4, 3, 5, 4], guest: [5, 4, 3, 5, 4] },
  hard: { title: 'Relay Overload', bus: 6, pours: 3, host: [5, 4, 5, 4, 5], guest: [5, 4, 5, 4, 5] },
  mirror: { title: 'Mirror Relay', bus: 4, pours: 3, host: [2, 4, 6, 4, 8], guest: [2, 4, 6, 4, 8] },
  drift: { title: 'Signal Drift', bus: 3, pours: 3, host: [4, 6, 2, 5, 6], guest: [5, 3, 4, 6, 4], hostStart: [1, 2, 0, 3, 1], guestStart: [2, 0, 1, 4, 2] }
};
const PRACTICE_INFO = [
  ['easy', 'Relay Basics', 'Small targets, and the Core needs the shared number twice.'],
  ['medium', 'Split Signal', 'Bigger targets, and the Core needs three adds.'],
  ['hard', 'Relay Overload', 'Large amounts and a heavier Core.'],
  ['mirror', 'Mirror Relay', 'Both sides have the same targets, so agree on one plan.'],
  ['drift', 'Signal Drift', 'Stations start partly charged, so work out every gap.']
];
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
function startPractice(level, side, guide) {
  const d = PRACTICE[level];
  if (!d) return;
  let l = {};
  try { l = A().getActiveLearner() || {}; } catch (e) { /* signed-out practice has no learner */ }
  const my = { name: l.name || 'You', player_id: l.player_id || 'YOU', ready: true };
  const bot = { name: 'Practice bot', player_id: 'BOT', ready: true };
  practice = true; submitted = false; testedPerfect = false; testRan = false;
  role = side === 'guest' ? 'guest' : 'host';
  tutStep = guide && !tutSeen() && role === 'host' ? 0 : -1;
  inst = practiceInstance(level);
  lanes = { host: [], guest: [] };
  lanes[otherRole()] = solvedLane(otherRole(), level);
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
   Views and the landing page
   One of five screens is visible at a time: gate, lobby, waiting, mission,
   result. The practice card belongs to the gate and the lobby; show() puts it
   under the right card each time so the markup stays in one place.
   -------------------------------------------------------------------------- */
const show = (id) => {
  ['gate', 'lobby', 'waiting', 'mission', 'result'].forEach((x) => { $('#' + x).hidden = x !== id; });
  const pc = $('#pracCard');
  if (pc) {
    pc.hidden = !(id === 'gate' || id === 'lobby');
    if (id === 'gate') $('#gate').after(pc);
    else if (id === 'lobby') $('#teamCard').after(pc);
  }
  document.body.classList.toggle('in-mission', id === 'mission');
};

function renderPracticeList() {
  const seen = tutSeen();
  $('#pracList').innerHTML = PRACTICE_INFO.map(([k, t, d], i) => {
    const first = i === 0
      ? seen
        ? '<button class="btn sm" type="button" data-prac="easy" data-side="host">Play Relay Basics</button>'
        : '<button class="btn sm" type="button" data-prac="learn" data-side="host" data-guide="1">Start the tutorial</button>'
      : '<button class="btn ghost sm" type="button" data-prac="' + k + '" data-side="host">Play</button>';
    const title = i === 0 && !seen ? 'Learn the relay' : t;
    const desc = i === 0 && !seen ? 'Two cells, two moves, then Relay Basics.' : d;
    return '<div class="pracrow"><div><b>' + esc(title) + '</b><small>' + esc(desc) + '</small></div><div class="pracbtns">' + first +
      '<button class="btn ghost sm" type="button" data-prac="' + k + '" data-side="guest" title="Practise the side that adds to the Core">Core side</button></div></div>';
  }).join('');
}

function loadLanding(kind) {
  landingKind = kind; homeKind = 'gate';
  show('gate');
  if (window.TLP_PRESENCE) TLP_PRESENCE.setActivity('Visiting the co-op page');
  const how = '<ol class="how">' +
    '<li><span>1</span><b>Make a room</b><em>Share the short code with your teammate.</em></li>' +
    '<li><span>2</span><b>Split the work</b><em>Each of you writes steps for your own five stations.</em></li>' +
    '<li><span>3</span><b>Test, then submit</b><em>One shared grid and one team result.</em></li></ol>';
  let acts, foot;
  if (kind === 'offline') {
    acts = '<a class="btn" href="webgame.html">Play the solo game</a>';
    foot = 'Practice below works without a connection. Rooms and team results need the online version of the site.';
  } else if (kind === 'signedout') {
    acts = '<a class="btn" href="auth.html">Sign in or create an account</a><a class="btn ghost" href="webgame.html">Play the solo game</a>';
    foot = 'Rooms and team results are kept on the server, so they need a learner account. Practice is open to everyone.';
  } else if (kind === 'admin') {
    acts = '<a class="btn ghost" href="parent.html">Parent area</a>';
    foot = 'Owner preview: rooms, invitations and team scores are off on this account. Practice below works normally and records nothing.';
  } else if (kind === 'parent') {
    acts = '<a class="btn" href="parent.html">Back to the Parent and Educator area</a><a class="btn ghost" href="auth.html">Switch account</a>';
    foot = 'Parent and Educator accounts do not play co-op. Sign in with a learner account to join a team.';
  } else {
    acts = '<a class="btn" href="webgame.html">Play the solo game</a>';
    foot = 'The co-op service could not start. Practice below still works.';
  }
  $('#gate').innerHTML = '<div class="pn"><h2>Two players, one relay grid</h2>' +
    '<p class="m">The relay has ten stations and a Core. You and your teammate own different stations, so the whole grid only works when both programs do. You see each other\u2019s steps as they are written, and the team result goes on the leaderboard.</p>' +
    how + '<div class="gateacts">' + acts + '</div><p class="m gatefoot">' + foot + '</p></div>';
}

function sayIn(el, msg) { $(el).textContent = msg || ''; }
function fmtTime(ms) { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function describe(st) {
  if (!st) return '';
  const inner = (l) => (l || []).map(describe).join(', then ');
  if (st.op === 'add') return 'Add ' + (st.k | 0) + ' to ' + stName(st.st | 0);
  if (st.op === 'bus') return 'Set the shared number to ' + (st.k | 0);
  if (st.op === 'addbus') return 'Add the shared number to the Core';
  if (st.op === 'rep') return 'Repeat ' + (st.n | 0) + ' times: ' + inner(st.body);
  if (st.op === 'if') return 'If ' + stName(st.st | 0) + ' ' + (CMP[st.cmp] || '?') + ' ' + (st.v | 0) + ': ' + inner(st.then);
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
  const wasPractice = practice, back = landingKind;
  if (wasPractice) { cleanup(); if (homeKind === 'lobby') loadLobby(); else loadLanding(back); return; }
  try { if (room) await A()._rpc('coop_leave', { p_room: room.room_id }); } catch (e) {}
  cleanup(); loadLobby();
}
$('#leaveBtn').onclick = leave;
$('#mLeave').onclick = () => { if (confirm(practice ? 'Leave this practice run? Your steps stay saved in this browser.' : 'Leaving ends the mission for both players, and no result is recorded. Leave?')) leave(); };
$('#copyCode').onclick = () => { try { navigator.clipboard.writeText(room.code); $('#copyCode').textContent = 'Copied'; setTimeout(() => { $('#copyCode').textContent = 'Copy code'; }, 1500); } catch (e) {} };

function cleanup() {
  clearInterval(pollT); clearInterval(tickT);
  try { if (ch) A().supabase.removeChannel(ch); } catch (e) {} ch = null; room = null; submitted = false; practice = false;
  testedPerfect = false; testRan = false; tutStep = -1;
  const cg = $('#cguide'); if (cg) cg.hidden = true; tutPaint();
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
    lanes[payload.role] = payload.program.slice(0, 40);
    testedPerfect = false; testRan = false;
    renderMate();
  });
  ch.on('broadcast', { event: 'hello' }, () => sendLane());
  ch.on('broadcast', { event: 'chat' }, ({ payload }) => { if (payload && QUICK.includes(payload.text)) logMsg(payload.name || 'Teammate', payload.text); });
  // The player who submits gets the official result in the HTTP response. Share it
  // with the teammate so both of them see the same score and explanation.
  ch.on('broadcast', { event: 'result' }, ({ payload }) => {
    if (payload && typeof payload.score === 'number' && $('#result').hidden) showResult(payload);
  });
  ch.on('presence', { event: 'sync' }, () => {
    const keys = Object.keys(ch.presenceState()); const here = keys.includes(otherRole());
    $('#pPresence').textContent = here ? 'Your teammate is connected.' : 'Your teammate is not connected right now. They can reopen this page to rejoin.';
    if ($('#pipDot')) {
      $('#pipDot').classList.toggle('on', here);
      $('#pipAct').textContent = here ? 'live' : 'away';
      $('#pipPresence').textContent = here ? 'Your teammate is connected. Their steps update as they edit.' : 'Your teammate is not connected right now.';
    }
  });
  ch.on('broadcast', { event: 'test' }, ({ payload }) => {
    if (!payload) return;
    const line = 'Teammate test: ' + payload.correct + ' of ' + (payload.total || 11) + ' match, ' + payload.steps + ' steps.';
    if ($('#pipTest')) $('#pipTest').textContent = line;
    logMsg('Teammate', 'Test run: ' + payload.correct + ' of ' + (payload.total || 11) + ' match, ' + payload.steps + ' steps.');
  });
  ch.subscribe((status) => { if (status === 'SUBSCRIBED') { ch.track({ role }); ch.send({ type: 'broadcast', event: 'hello', payload: {} }); sendLane(); } });
}
function sendLane() { if (ch) ch.send({ type: 'broadcast', event: 'lane', payload: { role, program: lanes[role] } }); try { localStorage.setItem('tlp-coop-' + room.room_id + '-' + role, JSON.stringify(lanes[role])); } catch (e) {} }
function logMsg(who, text) { const d = document.createElement('div'); d.textContent = who + ': ' + text; $('#log').prepend(d); }

/* ---------- mission ---------- */
function startMission() {
  show('mission'); submitted = false; testedPerfect = false; testRan = false;
  sayIn('#subMsg', ''); sayIn('#preview', ''); sayIn('#bErr', ''); sayIn('#pracMsg', '');
  if (window.TLP_PRESENCE) TLP_PRESENCE.setActivity((practice ? 'Practising co-op \u00b7 ' : 'Playing co-op \u00b7 ') + (inst.title || 'mission'));
  try { const saved = JSON.parse(localStorage.getItem('tlp-coop-' + room.room_id + '-' + role) || '[]'); if (Array.isArray(saved)) lanes[role] = saved.slice(0, 40); } catch (e) {}
  $('#mTitle').textContent = (inst.title || 'Mission') + (practice ? ' \u00b7 practice' : ' \u00b7 ' + room.challenge_id);
  const me = role === 'host' ? room.host : room.guest, mate = role === 'host' ? room.guest : room.host;
  $('#mWho').textContent = 'You: ' + me.name + ' (' + me.player_id + ') with ' + (mate ? mate.name + ' (' + mate.player_id + ')' : 'your teammate');
  $('#myLaneT').textContent = role === 'host' ? 'Your side \u00b7 Stations 1\u20135 and the shared number' : 'Your side \u00b7 Stations 6\u201310 and the Core';
  $('#pLaneT').textContent = role === 'host' ? 'Teammate\u2019s side \u00b7 Stations 6\u201310 and the Core' : 'Teammate\u2019s side \u00b7 Stations 1\u20135 and the shared number';
  $('#myLaneHint').textContent = role === 'host' ? 'Only you edit these five stations and the shared number.' : 'Only you edit these five stations and the Core.';
  $('#pLaneHint').textContent = 'Their steps appear here as they write them.';
  const core = esc(inst.core.target);
  $('#mRules').innerHTML = tutStep >= 0
    ? 'Goal: make every number match its target. Green cells are done; the coach shows the next move.'
    : 'Every station has to reach its target, and the Core has to reach <b>' + core + '</b>. ' +
      (role === 'host'
        ? 'You set the <b>shared number</b>. Your teammate adds it to the Core, so shared number \u00d7 how many times it is added must equal ' + core + '.'
        : 'Your teammate sets the <b>shared number</b>, and you add it to the Core. Shared number \u00d7 how many times you add it must equal ' + core + '.') +
      ' Score comes from correct cells, a full grid, then fewer steps. Time only breaks ties.';
  renderPalette(); renderLanes(); renderTable(null);
  const quick = $('#quick'); quick.innerHTML = QUICK.map((q) => '<button type="button">' + esc(q) + '</button>').join('');
  quick.querySelectorAll('button').forEach((b) => b.onclick = () => { const nm = (role === 'host' ? room.host : room.guest).name; logMsg('You', b.textContent); if (ch) ch.send({ type: 'broadcast', event: 'chat', payload: { text: b.textContent, name: nm } }); });
  const partner = role === 'host' ? room.guest : room.host;
  // In practice the other side is already shown in the lane column, so the
  // floating preview would only cover the mission text.
  $('#pip').hidden = practice;
  $('#pipName').textContent = partner ? partner.name : 'Teammate';
  $('#pipAct').textContent = practice ? 'practice bot' : 'live';
  $('#pipDot').classList.toggle('on', !!practice);
  $('#pipPresence').textContent = practice ? 'The practice bot holds the other side. Use Test run to check the whole grid.' : 'Waiting for your teammate to connect...';
  $('#pipTest').textContent = '';
  tutSetup();
  clearInterval(tickT); tickT = setInterval(updateMission, 500);
  updateMission(); updateSubmit();
}
function updateMission() { if (!room || !room.started_at) return; $('#timer').textContent = fmtTime(Date.now() + offset - new Date(room.started_at).getTime()); }
function myStations() { const lo = role === 'host' ? 0 : 5; return [0, 1, 2, 3, 4].map((i) => lo + i); }
function otherStations() { const lo = otherRole() === 'host' ? 0 : 5; return [0, 1, 2, 3, 4].map((i) => lo + i); }

/* -----------------------------------------------------------------------------
   Block editor
   Blocks are the same statements the server checks: add, bus, addbus, rep and
   if. Values are edited in place with menus, and nested bodies accept only
   simple adds, matching what coop-core.js allows. Reordering and deleting is
   limited to the player's own side.
   -------------------------------------------------------------------------- */
const numOpts = (a, b, sel) => { let o = ''; for (let k = a; k <= b; k++) o += '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + k + '</option>'; return o; };
const stOpts = (sel, list) => (list || myStations()).map((i) => '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + stName(i) + '</option>').join('');
const cmpOpts = (sel) => Object.keys(CMP).map((k) => '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + CMP[k] + '</option>').join('');

function renderPalette() {
  const defs = [['add', 'Add to a station'], ['rep', 'Repeat steps'], ['if', 'If a station \u2026']];
  if (role === 'host') defs.push(['bus', 'Set the shared number']);
  else defs.push(['addbus', 'Add the shared number to the Core']);
  $('#pal').innerHTML = defs.map(([t, l]) => '<button type="button" class="blk pal ' + t + '" data-new="' + t + '"><span class="plus">+</span>' + esc(l) + '</button>').join('');
  $('#palHint').textContent = role === 'host'
    ? 'Your tray adds blocks to your side. Only your five stations and the shared number are offered.'
    : 'Your tray adds blocks to your side. Only your five stations and the Core are offered.';
}

function blockHTML(s, i, editable, j) {
  const nested = j != null;
  const dis = editable ? '' : ' disabled';
  const sts = editable ? myStations() : otherStations();
  const attrs = ' data-i="' + i + '"' + (nested ? ' data-j="' + j + '"' : '');
  const ctl = editable ? '<span class="bctl">'
    + (nested ? '' : '<button type="button" data-a="up" aria-label="Move this step up">\u2191</button><button type="button" data-a="down" aria-label="Move this step down">\u2193</button>')
    + '<button type="button" data-a="del" aria-label="Delete this step">\u2715</button></span>' : '';
  const head = '<div class="blk ' + s.op + '"' + attrs + '>';
  if (s.op === 'add') return head + '<span>Add</span><select data-k="k" aria-label="Amount"' + dis + '>' + numOpts(1, C().MAXADD, s.k) + '</select><span>to</span><select data-k="st" aria-label="Station"' + dis + '>' + stOpts(s.st, sts) + '</select>' + ctl + '</div>';
  if (s.op === 'bus') return head + '<span>Set the shared number to</span><select data-k="k" aria-label="Shared number"' + dis + '>' + numOpts(1, 9, s.k) + '</select>' + ctl + '</div>';
  if (s.op === 'addbus') return head + '<span>Add the shared number to the Core</span>' + ctl + '</div>';
  const list = innerOf(s);
  let h = head + '<div class="bline"><span>' + (s.op === 'rep' ? 'Repeat' : 'If') + '</span>';
  if (s.op === 'rep') h += '<select data-k="n" aria-label="Times"' + dis + '>' + numOpts(2, C().MAXREP, s.n) + '</select><span>times</span>';
  else h += '<select data-k="st" aria-label="Station"' + dis + '>' + stOpts(s.st, sts) + '</select><select data-k="cmp" aria-label="Comparison"' + dis + '>' + cmpOpts(s.cmp) + '</select><input type="number" data-k="v" min="0" max="99" value="' + s.v + '" aria-label="Compare value"' + dis + '><span>then</span>';
  h += ctl + '</div><div class="zone in">' + (list.length ? list.map((x, xj) => blockHTML(x, i, editable, xj)).join('') : '<span class="zw">Add at least one step inside.</span>') + '</div>';
  if (editable && list.length < 6) h += '<button type="button" class="addin" data-a="in">+ Add a step inside</button>';
  return h + '</div>';
}

function renderPip() {
  const mate = lanes[otherRole()] || [];
  if ($('#pipProg')) $('#pipProg').innerHTML = mate.length ? mate.map((s) => '<li>' + esc(describe(s)) + '</li>').join('') : '<li class="m">No steps yet.</li>';
}
function renderLanes() {
  const mine = lanes[role] || [], mate = lanes[otherRole()] || [];
  $('#myBlocks').innerHTML = mine.length ? mine.map((s, i) => blockHTML(s, i, true)).join('') : '<p class="zempty">No steps yet. Tap a block in the tray to add it.</p>';
  $('#pBlocks').innerHTML = mate.length ? mate.map((s, i) => blockHTML(s, i, false)).join('') : '<p class="zempty">No steps from your teammate yet.</p>';
  renderPip(); renderRelay(); updateSubmit();
}
function renderMate() {
  if (!$('#pBlocks')) return;
  const mate = lanes[otherRole()] || [];
  $('#pBlocks').innerHTML = mate.length ? mate.map((s, i) => blockHTML(s, i, false)).join('') : '<p class="zempty">No steps from your teammate yet.</p>';
  renderPip(); renderRelay(); updateSubmit();
}

function renderRelay() {
  if (!inst || !$('#relay')) return;
  const r = C().simulate(inst, lanes);
  const vals = r.ok ? r.vals : inst.stations.map((s) => s.start).concat([0]);
  const cells = [];
  let matches = 0;
  for (let i = 0; i < 11; i++) {
    const target = i === 10 ? inst.core.target : inst.stations[i].target;
    const v = vals[i] == null ? 0 : vals[i];
    const ok = v === target;
    if (ok) matches++;
    cells.push('<div class="rcell ' + (ok ? 'ok' : '') + (testRan && !ok ? ' miss' : '') + '"><small>' + (i === 10 ? 'Core' : 'S' + (i + 1)) + '</small><b>' + v + '</b><em>target ' + target + '</em></div>');
  }
  $('#relay').innerHTML = cells.join('');
  $('#relayCount').textContent = matches + ' of 11 match';
  $('#relayCount').classList.toggle('on', matches === 11);
  const bus = (lanes.host || []).find((s) => s && s.op === 'bus');
  $('#sharedChip').textContent = bus ? 'Shared number ' + bus.k : 'Shared number not set';
  $('#sharedChip').classList.toggle('on', !!bus);
  $('#relayCap').textContent = !r.ok
    ? 'A step is not valid yet: ' + friendly(r.error)
    : testRan
      ? (matches === 11 ? 'Every cell matches its target.' : 'Red cells finish on a different number from their target.')
      : 'The big number is the current value; the small line is the target.';
}

function addBlock(type) {
  const list = lanes[role];
  if (list.length >= 40) return sayIn('#bErr', 'That is the most steps one side can hold.');
  const first = myStations()[0];
  const make = {
    add: () => ({ op: 'add', st: first, k: 1 }),
    bus: () => ({ op: 'bus', k: 3 }),
    addbus: () => ({ op: 'addbus', st: 10 }),
    rep: () => ({ op: 'rep', n: 2, body: [{ op: 'add', st: first, k: 1 }] }),
    if: () => ({ op: 'if', st: first, cmp: 'lt', v: 10, then: [{ op: 'add', st: first, k: 1 }] })
  };
  if (!make[type] || (type === 'bus' && role !== 'host') || (type === 'addbus' && role !== 'guest')) return;
  list.push(make[type]());
  sayIn('#bErr', '');
  laneEdited(true);
}
function laneEdited(full) {
  testedPerfect = false; testRan = false;
  if (full) renderLanes(); else { renderRelay(); updateSubmit(); }
  sendLane();
  tutCheck();
}

document.addEventListener('click', (e) => {
  const prac = e.target.closest('[data-prac]');
  if (prac) { startPractice(prac.dataset.prac, prac.dataset.side, !!prac.dataset.guide); return; }
  const pal = e.target.closest('#pal [data-new]');
  if (pal) { addBlock(pal.dataset.new); return; }
  const btn = e.target.closest('#myBlocks [data-a]');
  if (!btn) return;
  const blk = btn.closest('.blk'), i = +blk.dataset.i, j = blk.dataset.j, a = btn.dataset.a;
  const list = lanes[role], s = list[i];
  if (!s) return;
  if (a === 'up' && j == null && i > 0) { list[i] = list[i - 1]; list[i - 1] = s; }
  else if (a === 'down' && j == null && i < list.length - 1) { list[i] = list[i + 1]; list[i + 1] = s; }
  else if (a === 'del') {
    if (j == null) list.splice(i, 1);
    else {
      const inner = innerOf(s);
      if (inner.length <= 1) return sayIn('#bErr', 'A repeat or if needs at least one step inside. Delete the whole block instead.');
      inner.splice(+j, 1);
    }
  } else if (a === 'in') {
    const inner = innerOf(s);
    if (inner.length >= 6) return;
    inner.push({ op: 'add', st: myStations()[0], k: 1 });
  } else return;
  sayIn('#bErr', '');
  laneEdited(true);
});

document.addEventListener('change', (e) => {
  const f = e.target;
  if (!f.matches || !f.matches('#myBlocks .blk [data-k]')) return;
  const blk = f.closest('.blk'), i = +blk.dataset.i, j = blk.dataset.j;
  const s = j == null ? lanes[role][i] : innerOf(lanes[role][i])[+j];
  if (!s) return;
  const k = f.dataset.k;
  if (k === 'st' || k === 'n' || k === 'k') s[k] = +f.value;
  else if (k === 'cmp') s.cmp = f.value;
  else if (k === 'v') { const v = Math.max(0, Math.min(99, Math.round(+f.value) || 0)); s.v = v; f.value = v; }
  sayIn('#bErr', '');
  laneEdited(false);
});

/* -----------------------------------------------------------------------------
   First-run tutorial
   Five steps over the tiny "First relay" level: Station 1 needs 2, the shared
   number needs 3, and everything else is already correct. One action per step,
   each moving on only when its part is done, so a first-time player meets one
   idea at a time. The seen flag is remembered in this browser, and Skip leaves
   the tutorial straight away.
   -------------------------------------------------------------------------- */
const TUT = [
  { t: 'Add your first block', d: 'Tap + Add to a station in the tray. It lands on Station 1.', hit: '#pal [data-new="add"]' },
  { t: 'Make it add 2', d: 'Change the amount to 2. The station is already Station 1.', hit: '#myBlocks .blk.add' },
  { t: 'Set the shared number', d: 'Tap + Set the shared number. Your teammate adds it to the Core twice, so 3 + 3 reaches 6.', hit: '#pal [data-new="bus"]' },
  { t: 'Test the whole grid', d: 'The bot has already written the other five stations. Press Test run and check all eleven numbers.', hit: '#testBtn' },
  { t: 'That is one co-op round', d: 'Your block fixed Station 1, and your number fixed the Core. In a real room another player writes the other five stations. Create a room when you are ready.', hit: '' }
];
const hasAdd = (st, k) => (lanes[role] || []).some((s) => s && s.op === 'add' && s.st === st && s.k === k);
function tutDone(step) {
  if (step === 0) return hasAdd(0, 1) || hasAdd(0, 2);
  if (step === 1) return hasAdd(0, 2);
  if (step === 2) return (lanes[role] || []).some((s) => s && s.op === 'bus' && s.k === 3);
  if (step === 3) return testedPerfect;
  return false;
}
function tutPaint() {
  document.querySelectorAll('.tut-hit').forEach((el) => el.classList.remove('tut-hit'));
  if (tutStep < 0 || !TUT[tutStep] || !TUT[tutStep].hit) return;
  document.querySelectorAll(TUT[tutStep].hit).forEach((el) => el.classList.add('tut-hit'));
}
function tutSetup() {
  const box = $('#cguide'); if (!box) return;
  if (tutStep < 0) { box.hidden = true; tutPaint(); return; }
  const s = TUT[tutStep];
  box.hidden = false;
  $('#cgStep').textContent = (tutStep + 1) + ' of ' + TUT.length;
  $('#cgTitle').textContent = s.t;
  $('#cgText').textContent = tutStep === 3 && testRan && !testedPerfect
    ? 'Some numbers are red. Station 1 needs exactly 2 and the shared number needs 3. Then press Test run again.'
    : s.d;
  const last = tutStep === TUT.length - 1;
  $('#cgNext').hidden = !last;
  $('#cgNext').textContent = 'Finish tutorial';
  $('#cgSkip').textContent = 'Skip tutorial';
  tutPaint();
}
function tutCheck() {
  if (tutStep < 0) return;
  while (tutStep < TUT.length - 1 && tutDone(tutStep)) tutStep++;
  tutSetup();
}
function tutFinish() {
  markTutSeen(); tutStep = -1;
  const box = $('#cguide'); if (box) box.hidden = true;
  tutPaint(); renderPracticeList(); leave();
}
$('#cgNext').onclick = tutFinish;
$('#cgSkip').onclick = tutFinish;
/* -----------------------------------------------------------------------------
   Results
   Renders the server result (station-by-station) and falls back to a fetch
   when the realtime message was missed.
   -------------------------------------------------------------------------- */
function renderTable(res) {
  if (!inst || !$('#stTable')) return;
  const rows = ['<tr><th>Station</th><th>Starts at</th><th>Target</th><th>After the test</th></tr>'];
  inst.stations.forEach((s, i) => { const v = res && res.vals[i]; rows.push('<tr><td>' + stName(i) + '</td><td>' + s.start + '</td><td>' + s.target + '</td><td class="' + (res ? (v === s.target ? 'ok' : 'no') : '') + '">' + (res ? v + (v === s.target ? ' matches' : ' needs ' + s.target) : '-') + '</td></tr>'); });
  const cv = res && res.vals[10]; rows.push('<tr><td>Core</td><td>0</td><td>' + inst.core.target + '</td><td class="' + (res ? (cv === inst.core.target ? 'ok' : 'no') : '') + '">' + (res ? cv + (cv === inst.core.target ? ' matches' : ' needs ' + inst.core.target) : '-') + '</td></tr>');
  $('#stTable').innerHTML = rows.join('');
}
function friendly(err) {
  return String(err || '').replace(/\blane\b/g, 'side').replace(/\bbus\b/g, 'shared number').replace(/\bpour\b/g, 'add');
}
function updateSubmit() {
  const b = $('#subBtn'); if (!b) return;
  if (practice) {
    b.disabled = true; b.textContent = 'Practice only';
    $('#subHint').textContent = 'Practice runs stay in this browser and are never submitted.';
    return;
  }
  b.disabled = !testedPerfect || submitted;
  b.textContent = submitted ? 'Submitting\u2026' : 'Submit as a team';
  $('#subHint').textContent = testedPerfect
    ? 'All 11 cells match. Submit to record the team result.'
    : 'Run Test after every change. Submit unlocks when all 11 cells match.';
}
$('#testBtn').onclick = () => {
  if (!inst) return;
  const r = C().simulate(inst, lanes);
  testRan = true; testedPerfect = r.ok && r.correct === r.total;
  if (!r.ok) {
    $('#preview').textContent = 'A step is not valid yet: ' + friendly(r.error);
    renderTable(null);
  } else {
    const miss = r.total - r.correct;
    $('#preview').innerHTML = testedPerfect
      ? '<b class="good">All 11 cells match.</b> ' + (practice ? 'Practice score would be ' + C().score(r) + '.' : 'Your team can submit now.') + ' ' + r.steps + ' step' + (r.steps === 1 ? '' : 's') + '.'
      : '<b class="bad">' + miss + ' cell' + (miss === 1 ? ' does' : 's do') + 'n\u2019t match yet.</b> ' + r.correct + ' of 11 correct, ' + r.steps + ' steps. The red cells show what to fix.';
    renderTable(r);
    $('#stWrap').open = !testedPerfect;
    if (ch) ch.send({ type: 'broadcast', event: 'test', payload: { role, correct: r.correct, total: r.total, steps: r.steps } });
  }
  renderRelay(); updateSubmit(); tutCheck();
};
$('#subBtn').onclick = async () => {
  if (practice || submitted) return;
  const r = C().simulate(inst, lanes);
  if (!r.ok) return sayIn('#subMsg', 'A step needs fixing first: ' + friendly(r.error));
  if (r.correct < r.total) {
    testedPerfect = false; testRan = true;
    renderRelay(); renderTable(r); updateSubmit(); $('#stWrap').open = true;
    return sayIn('#subMsg', (r.total - r.correct) + ' cells still don\u2019t match. Fix the red cells, then run Test again.');
  }
  submitted = true; updateSubmit(); sayIn('#subMsg', 'Submitting\u2026');
  try {
    const d = await A()._invoke('coop-submit', { roomId: room.room_id, program: lanes });
    if (ch) ch.send({ type: 'broadcast', event: 'result', payload: d });
    showResult(d);
  }
  catch (e) {
    submitted = false; updateSubmit();
    sayIn('#subMsg', /Failed to send|FunctionsFetch|Requested function/i.test(e.message) ? 'The co-op service is not available yet. The site owner must deploy it.' : 'Could not submit: ' + e.message);
  }
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
      ? 'The Core is ' + diff + ' short. Raise the shared number, or add it one more time.'
      : 'The Core is ' + (-diff) + ' over. Lower the shared number, or add it fewer times.';
  }
  return diff > 0
    ? 'Add ' + diff + ' more to ' + esc(row.name) + ', in steps of ' + Math.min(diff, C().MAXADD) + ' or less.'
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
    if (wrong.some((x) => x.name === 'Core')) html += '<li>Agree on the shared number first: Core target \u00f7 how many times it is added = shared number.</li>';
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
    const has = rows && rows.length;
    const badge = $('#invCount');
    if (badge) { badge.hidden = !has; badge.textContent = has ? String(rows.length) : ''; }
    $('#invites').innerHTML = has ? rows.map((r) => '<div class="row3"><span>' + esc(r.from_name) + ' (' + esc(r.from_player_id) + ') invited you.</span><button class="btn ghost sm" data-code="' + esc(r.code) + '" type="button">Join</button></div>').join('') : 'None right now.';
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
  homeKind = 'lobby';
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

/* The tutorial opens by itself once per browser, so a first-time visitor is
   shown how a round works before meeting the room controls. Skip marks it seen
   and returns them to whichever screen they started from. */
function autoTutorial() {
  if (tutSeen()) return;
  setTimeout(() => {
    if (room || practice) return;
    if ($('#mission').hidden === false || $('#waiting').hidden === false) return;
    startPractice('learn', 'host', true);
  }, 600);
}

(async function boot() {
  renderPracticeList();
  try {
    await A().init(); const u = A().getCurrentUser();
    if (!A().isCloudConfigured()) { loadLanding('offline'); return; }
    if (!u) { loadLanding('signedout'); autoTutorial(); return; }
    if (u.isAdmin) { loadLanding('admin'); return; }
    if (u.role === 'parent') { loadLanding('parent'); return; }
    const learner = A().getActiveLearner() || {};
    const path = learner.assigned_path || learner.assignedPath;
    if (window.TLP_MUSIC && path) TLP_MUSIC.setTheme('coop-' + path);
    await loadLobby();
    autoTutorial();
  } catch (e) {
    loadLanding('error');
    const foot = $('#gate .gatefoot');
    if (foot) foot.textContent = 'Something went wrong: ' + (e && e.message || e) + ' Practice below still works.';
  }
})();
window.addEventListener('beforeunload', () => { try { if (ch) A().supabase.removeChannel(ch); } catch (e) {} });
