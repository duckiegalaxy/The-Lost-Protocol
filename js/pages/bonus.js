/* =============================================================================
   BONUS LAB LOGIC  (js/pages/bonus.js)
   -----------------------------------------------------------------------------
   Powers bonus.html: the logic-gate playground and the bonus missions.
   Progress is stored per learner, locally first and then mirrored to Supabase
   when a learner is signed in.
   
   The circuit evaluator is intentionally small and synchronous: it walks wires
   until values settle or a loop is detected, which is what makes the truth
   table update instantly as switches are flipped.
   Areas in this file:
     - progress persistence (localStorage + cloud mirror)
     - audio tones and the generated victory songs
     - the circuit model, evaluator, drawing and truth table
     - puzzle checking and the gate builder
     - the explorer cards
   ============================================================================= */
const $ = (s, r) => (r || document).querySelector(s);
const A = () => window.TLP_AUTH;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* -----------------------------------------------------------------------------
   Small helpers
   Seeded-free randomness is fine here: the puzzles only need variety, not
   reproducible runs. pkey() namespaces storage per learner so two learners on
   the same device never overwrite each other.
   -------------------------------------------------------------------------- */
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = (n, lo, hi) => { const s = new Set(); while (s.size < n) s.add(lo + rnd(hi - lo + 1)); return [...s]; };

/* ================= progress (separate from the main game and every ranking) ================= */
let learnerId = 'local', prog = { done: {}, ach: [] };
const pkey = () => 'tlp-bonus-' + learnerId;
function loadLocal() { try { const p = JSON.parse(localStorage.getItem(pkey()) || 'null'); if (p && p.done) prog = p; } catch (e) {} }
async function saveProg() {
  try { localStorage.setItem(pkey(), JSON.stringify(prog)); } catch (e) {}
  try { if (A().isCloudConfigured() && learnerId !== 'local' && learnerId !== 'admin-preview') await A().supabase.from('bonus_progress').upsert({ learner_id: learnerId, data: prog }); } catch (e) {}
}
async function loadCloud() {
  try { if (!A().isCloudConfigured() || learnerId === 'local' || learnerId === 'admin-preview') return; const { data } = await A().supabase.from('bonus_progress').select('data').eq('learner_id', learnerId).maybeSingle();
    if (data && data.data) { prog.ach = [...new Set([...(prog.ach || []), ...(data.data.ach || [])])]; prog.done = Object.assign({}, data.data.done, prog.done); } } catch (e) {}
}

/* ================= sound and achievements ================= */
let actx = null;
/* -----------------------------------------------------------------------------
   Audio
   Short oscillator tones double as feedback for gates opening and achievements.
   AudioContext is created lazily and only after a user gesture.
   -------------------------------------------------------------------------- */
function tone(f, t, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(.18, actx.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + t + d); o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + d + .05); } catch (e) {} }
const SONGS = [[523, 659, 784], [440, 554, 659, 880], [392, 523, 659], [349, 440, 523, 698], [587, 740, 880], [330, 415, 494, 659]];
function playSong(i) { (SONGS[i % SONGS.length]).forEach((f, k) => tone(f, k * .13, .3, i % 2 ? 'triangle' : 'square')); }
const GATE_SHAPES = {
  AND: '<path d="M6 6H26A18 18 0 0 1 26 42H6Z"/>', OR: '<path d="M6 6Q26 6 46 24Q26 42 6 42Q18 24 6 6Z"/>', NOT: '<path d="M6 6L40 24L6 42Z"/><circle cx="46" cy="24" r="4"/>',
  NAND: '<path d="M6 6H24A18 18 0 0 1 24 42H6Z"/><circle cx="46" cy="24" r="4"/>', NOR: '<path d="M6 6Q24 6 42 24Q24 42 6 42Q18 24 6 6Z"/><circle cx="46" cy="24" r="4"/>',
  XOR: '<path d="M12 6Q32 6 50 24Q32 42 12 42Q24 24 12 6Z"/><path d="M4 6Q16 24 4 42"/>', XNOR: '<path d="M12 6Q30 6 46 24Q30 42 12 42Q24 24 12 6Z"/><path d="M4 6Q16 24 4 42"/><circle cx="51" cy="24" r="4"/>'
};
const GSV = (g) => '<svg viewBox="0 0 56 48" aria-hidden="true">' + GATE_SHAPES[g] + '</svg>';
const ALG_ICONS = {
  linear: '<svg viewBox="0 0 56 48"><rect x="4" y="16" width="10" height="16"/><rect x="17" y="16" width="10" height="16"/><rect x="30" y="16" width="10" height="16"/><rect x="43" y="16" width="10" height="16"/><path d="M9 8L9 12M22 8L22 12M35 8L35 12"/></svg>',
  binary: '<svg viewBox="0 0 56 48"><path d="M4 40V10M28 40V10M52 40V10M4 24H28M28 24H52"/><path d="M16 24V16M40 24V32"/></svg>',
  jump: '<svg viewBox="0 0 56 48"><path d="M4 36Q12 10 20 36M20 36Q28 10 36 36M36 36Q44 10 52 36"/></svg>',
  bubble: '<svg viewBox="0 0 56 48"><rect x="6" y="22" width="12" height="14"/><rect x="38" y="12" width="12" height="24"/><path d="M20 18Q28 8 36 18M36 30Q28 40 20 30"/></svg>',
  selection: '<svg viewBox="0 0 56 48"><rect x="4" y="12" width="10" height="24"/><rect x="18" y="26" width="10" height="10"/><rect x="32" y="16" width="10" height="20"/><rect x="46" y="20" width="8" height="16"/><path d="M23 20V8"/></svg>',
  insertion: '<svg viewBox="0 0 56 48"><rect x="4" y="22" width="9" height="14"/><rect x="16" y="22" width="9" height="14"/><rect x="40" y="22" width="9" height="14"/><rect x="28" y="6" width="9" height="14"/><path d="M33 22V28"/></svg>'
};
const ACHS = [];
const PUZ_SHAPE = ['NOT', 'AND', 'NOT', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'AND', 'XNOR', 'AND', 'XOR', 'OR', 'XNOR', 'XNOR', 'AND'];
function achSvg(a) { return a.svg; }
function unlock(id) {
  if (prog.ach.includes(id)) return; prog.ach.push(id);
  const a = ACHS.find((x) => x.id === id); if (!a) return; saveProg();
  if (!document.documentElement.classList.contains('reduce-fx') || true) {
    const p = document.createElement('div'); p.id = 'achPop'; p.setAttribute('role', 'alertdialog'); p.setAttribute('aria-label', 'Achievement unlocked');
    p.innerHTML = '<div><div class="an' + (a.n % 4) + '">' + a.svg + '</div><h2 style="margin:10px 0 4px;font:800 26px var(--serif)">Achievement unlocked</h2><p style="font-size:20px;margin:0">' + esc(a.t) + '</p><p style="opacity:.8;margin:6px 0 16px">' + esc(a.d) + '</p><button class="bb pri" type="button">Continue</button></div>';
    document.body.appendChild(p); p.querySelector('button').onclick = () => p.remove(); p.querySelector('button').focus(); playSong(a.n);
  }
  renderAch(); renderProg();
}

/* ================= LOGIC GATE WORKSHOP ================= */
const GATE_INFO = {
  AND: ['AND', 'The output is ON only when both inputs are ON.', (a, b) => a & b], OR: ['OR', 'The output is ON when at least one input is ON.', (a, b) => a | b],
  NOT: ['NOT', 'The output is the opposite of the input.', (a) => a ? 0 : 1], NAND: ['NAND', 'NOT AND: OFF only when both inputs are ON.', (a, b) => (a & b) ? 0 : 1],
  NOR: ['NOR', 'NOT OR: ON only when both inputs are OFF.', (a, b) => (a | b) ? 0 : 1], XOR: ['XOR', 'ON when exactly one input is ON (they differ).', (a, b) => a ^ b],
  XNOR: ['XNOR', 'ON when both inputs are the same.', (a, b) => (a ^ b) ? 0 : 1]
};
const PUZZLES = [
  { t: 'First light', n: 1, f: (a) => a, goal: 'Make the bulb light up when the switch is ON.', how: 'A wire carries a signal from an output (the circle on the right of a part) to an input (the circle on the left of another part). Click the output circle of the switch, then the input circle of the bulb. Then click the switch to turn it on.', hints: ['A circuit needs a path from the switch to the bulb.', 'Look at the circles: signals leave from the right and enter on the left.', 'Connect the switch output to the bulb input with one wire.'], why: 'A switch sends ON or OFF along a wire. With no gate in between, the bulb simply copies the switch.' },
  { t: 'Both must agree', n: 2, f: (a, b) => a & b, goal: 'The bulb must be ON only when BOTH switches are ON.', how: 'Add an AND gate between the switches and the bulb.', hints: ['Think about which gate needs two things to be true.', 'Use a gate with two inputs and send both switches into it.', 'Switch A and switch B each connect to an input of the AND gate; its output goes to the bulb.'], why: 'AND is like two keys needed for one lock: if either is missing, the output stays OFF.' },
  { t: 'Flip it', n: 1, f: (a) => a ? 0 : 1, goal: 'The bulb must be ON when the switch is OFF, and OFF when it is ON.', how: 'You need a gate with a single input that inverts the signal.', hints: ['The bulb should do the opposite of the switch.', 'One gate has just one input and reverses it.', 'Place a NOT gate between the switch and the bulb.'], why: 'NOT inverts a signal. It is the simplest gate and appears inside NAND, NOR and XNOR.' },
  { t: 'Either one', n: 2, f: (a, b) => a | b, goal: 'The bulb must be ON when at least one switch is ON.', how: 'Choose the gate that accepts either input.', hints: ['Compare with the AND puzzle: here one ON switch is enough.', 'Look for the gate that is ON unless both inputs are OFF.', 'Wire both switches into an OR gate and its output to the bulb.'], why: 'OR is like two doorbells ringing the same bell: either one works.' },
  { t: 'Exactly one', n: 2, f: (a, b) => a ^ b, goal: 'The bulb must be ON when exactly one switch is ON, not when both are.', how: 'There is one gate for "they differ". You may also build it from other gates.', hints: ['Both ON must give OFF, and both OFF must also give OFF.', 'One gate outputs ON only when its inputs are different.', 'Use an XOR gate, or combine OR, NAND and AND. Check the truth table to confirm.'], why: 'XOR means "one or the other, but not both". Many different circuits can build it, and any correct one is accepted.' },
  { t: 'Not both', n: 2, f: (a, b) => (a & b) ? 0 : 1, goal: 'The bulb must be OFF only when both switches are ON.', how: 'It is the opposite of the AND puzzle.', hints: ['Look at the truth table: only the last row should be OFF.', 'It is AND followed by an inversion, and there is a single gate for it.', 'Use a NAND gate, or an AND followed by a NOT.'], why: 'NAND is "universal": every other gate can be built from NAND gates alone.' },
  { t: 'Neither', n: 2, f: (a, b) => (a | b) ? 0 : 1, goal: 'The bulb must be ON only when both switches are OFF.', how: 'It is the opposite of the OR puzzle.', hints: ['Only the first row (both OFF) should be ON.', 'It is OR followed by an inversion.', 'Use a NOR gate, or an OR followed by a NOT.'], why: 'NOR is also universal, like NAND.' },
  { t: 'Same state', n: 2, f: (a, b) => (a ^ b) ? 0 : 1, goal: 'The bulb must be ON when both switches match (both ON or both OFF).', how: 'It is the opposite of "exactly one".', hints: ['Rows 1 and 4 of the truth table should be ON.', 'It is XOR followed by an inversion.', 'Use an XNOR gate, or XOR followed by NOT.'], why: 'XNOR compares two bits and tells you whether they are equal, which is how computers check equality.' },
  { t: 'Majority vote', n: 3, f: (a, b, c) => (a + b + c) >= 2 ? 1 : 0, goal: 'With three switches, the bulb must be ON when at least two are ON.', how: 'Combine several gates. Many solutions exist.', hints: ['Split it into the pairs: A with B, A with C, B with C.', 'Each pair needs both ON (AND). The bulb should be ON if any pair succeeds (OR).', 'Three AND gates (A,B), (A,C), (B,C), then combine them with OR gates.'], why: 'Real systems use majority voting so one faulty sensor cannot decide the outcome.' },
  { t: 'Safety interlock', n: 3, f: (a, b, c) => ((a & (b ? 0 : 1)) | c) ? 1 : 0, goal: 'The bulb must be ON when switch C is ON, or when A is ON while B is OFF.', how: 'Break it into two parts joined by OR.', hints: ['Part one is "A and not B". Part two is just C.', 'Invert B with a NOT, then combine with A using AND.', 'Feed the AND result and C into an OR gate that drives the bulb.'], why: 'Machines combine conditions like this: a safety guard (B) overrides a button (A), while an emergency switch (C) always works.' },
  { t: 'Two keys or a bell', n: 3, f: (a, b, c) => ((a & b) | c) ? 1 : 0, goal: 'The bulb must be ON when A and B are both ON, or when C is ON.', how: 'Build "A and B" first, then join that result with C using OR.', hints: ['One AND gate handles A and B; the rest is a second condition.', 'C works alone, so it joins the result through an OR gate.', 'Wire A and B into AND, then feed that output and C into OR. Its output goes to the bulb.'], why: 'This is a priority override: two guards must agree, but the emergency switch works on its own.' },
  { t: 'Exactly one of three', n: 3, f: (a, b, c) => (a + b + c) === 1 ? 1 : 0, goal: 'The bulb must be ON when exactly one of the three switches is ON.', how: 'Look for the odd switch out. Several small gates can do it.', hints: ['Two ON switches must give OFF, and three ON must also give OFF.', 'XOR gives ON when its two inputs differ. Chain two XOR gates.', 'XOR A with B, then XOR that result with C. Check the table: only the three rows with a single ON should be lit.'], why: 'Chained XOR adds bits without carrying, so it detects an odd number of ON signals.' },
  { t: 'Two pairs', n: 4, f: (a, b, c, d) => ((a | b) & (c | d)) ? 1 : 0, goal: 'The bulb must be ON when at least one of A or B is ON AND at least one of C or D is ON.', how: 'Each pair needs its own OR gate, and the two results meet in an AND gate.', hints: ['Split the switches into the pairs A,B and C,D.', 'Each pair only needs one switch ON, so use OR inside each pair.', 'OR A with B, OR C with D, then send both OR outputs into an AND gate.'], why: 'Grouping conditions into pairs keeps a big rule readable, exactly how programmers break a long condition into smaller ones.' },
  { t: 'Even parity', n: 4, f: (a, b, c, d) => (a + b + c + d) % 2 === 0 ? 1 : 0, goal: 'The bulb must be ON when an even number of switches are ON (zero, two or four).', how: 'Compare the switches in pairs, then combine the two comparisons.', hints: ['An even count means the first pair and the second pair must agree in a certain way.', 'XNOR is ON when its two inputs are the same. Use it on A,B and on C,D.', 'XNOR A with B, XNOR C with D, then XNOR those two results. Four zeros, two ON or four ON all light the bulb.'], why: 'Parity bits let computers detect a single flipped bit: if the count of ON bits stops being even, the data was damaged.' },
  { t: 'Bigger number', n: 4, f: (a, b, c, d) => ((a * 2 + b) > (c * 2 + d)) ? 1 : 0, goal: 'Treat A and B as a 2-bit number (A is worth 2, B is worth 1). Do the same for C and D. The bulb must be ON when the first number is bigger.', how: 'First compare the highest bits. If they differ, that decides it; otherwise compare the low bits.', hints: ['A and C are worth 2; B and D are worth 1.', 'If A is ON and C is OFF, the first number is already bigger. If A is OFF and C is ON, it is smaller.', 'Build: (A AND NOT C) OR (A XNOR C AND B AND NOT D). Test all sixteen rows in the table.'], why: 'Comparators inside a processor decide which number is larger exactly this way: most significant bit first.' },
  { t: 'Guard and one helper', n: 3, f: (a, b, c) => (a & (b | c)) ? 1 : 0, goal: 'The bulb must be ON only when A is ON and at least one of B or C is also ON.', how: 'A is the guard. B and C are helpers that join through OR.', hints: ['A must always be ON, so it is one side of an AND gate.', 'B or C alone is enough, so combine them with OR.', 'OR B with C, then AND that result with A. The AND output drives the bulb.'], why: 'This is the shape of many login checks: a valid account AND (a password OR a recovery code).' }
];
let comps = [], wires = [], pend = null, selC = null, selW = null, nid = 1, pidx = 0, hintLv = 0, explorerBuilt = false;
const NIN = (t) => t === 'SW' ? 0 : (t === 'NOT' || t === 'LAMP') ? 1 : 2;
const PORT_Y = (t, k) => NIN(t) === 1 ? 24 : (k === 0 ? 14 : 34);
/* -----------------------------------------------------------------------------
   Circuit model and evaluator
   comps holds components, wires connects outputs to inputs. evalCircuit()
   resolves values with memoisation and a busy set to catch feedback loops.
   This is the only place that decides what a circuit outputs.
   -------------------------------------------------------------------------- */
function addComp(t, x, y) { const c = { id: nid++, t, x: x == null ? 150 + rnd(200) : x, y: y == null ? 40 + rnd(260) : y, v: 0 }; comps.push(c); drawCircuit(); return c; }
function inputsOf(c) { const arr = []; for (let k = 0; k < NIN(c.t); k++) { const w = wires.find((w) => w.to === c.id && w.port === k); arr.push(w ? w.from : null); } return arr; }
function evalCircuit(sw) { // sw: {id: 0/1}; returns {vals:{id:value}, cyc:boolean}
  const vals = {}, busy = {}; let cyc = false;
  const val = (id) => { if (id == null) return 0; if (id in vals) return vals[id]; if (busy[id]) { cyc = true; return 0; } busy[id] = 1; const c = comps.find((x) => x.id === id); let v = 0;
    if (!c) v = 0; else if (c.t === 'SW') v = sw[id] ? 1 : 0; else if (c.t === 'LAMP') v = val(inputsOf(c)[0]); else { const ins = inputsOf(c).map(val); v = GATE_INFO[c.t][2](ins[0], ins[1]) ? 1 : 0; }
    busy[id] = 0; vals[id] = v; return v; };
  comps.forEach((c) => val(c.id)); return { vals, cyc };
}
function curSwitchState() { const s = {}; comps.filter((c) => c.t === 'SW').forEach((c) => s[c.id] = c.v); return s; }
function drawCircuit() {
  const svg = $('#cv'); if (!svg) return; const ev = evalCircuit(curSwitchState());
  let h = '';
  wires.forEach((w, i) => { const a = comps.find((c) => c.id === w.from), b = comps.find((c) => c.id === w.to); if (!a || !b) return; const x1 = a.x + 56, y1 = a.y + (a.t === 'SW' || a.t === 'LAMP' ? 24 : 24), x2 = b.x, y2 = b.y + PORT_Y(b.t, w.port);
    h += '<path class="wire ' + (ev.vals[w.from] ? 'on' : '') + (selW === i ? ' sel' : '') + '" data-w="' + i + '" d="M' + x1 + ' ' + y1 + 'C' + (x1 + 50) + ' ' + y1 + ' ' + (x2 - 50) + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>'; });
  comps.forEach((c) => {
    h += '<g class="comp ' + (selC === c.id ? 'sel' : '') + (ev.vals[c.id] ? ' live' : '') + '" data-id="' + c.id + '" transform="translate(' + c.x + ' ' + c.y + ')">';
    if (c.t === 'SW') h += '<rect class="bd" x="0" y="8" width="56" height="32" rx="16" fill="' + (c.v ? 'var(--a)' : 'transparent') + '" stroke="var(--a)" stroke-width="3"/><circle cx="' + (c.v ? 40 : 16) + '" cy="24" r="11" fill="' + (c.v ? '#111' : 'var(--a)') + '"/><text x="28" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="700">' + esc(swName(c)) + (c.v ? ' ON' : ' OFF') + '</text>';
    else if (c.t === 'LAMP') h += '<circle class="bulb ' + (ev.vals[c.id] ? 'on' : '') + '" cx="28" cy="24" r="20" stroke="var(--a)" stroke-width="3"/><text x="28" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="700">Bulb ' + (ev.vals[c.id] ? 'ON' : 'OFF') + '</text>';
    else h += '<g class="bd" style="stroke:var(--a);stroke-width:3;fill:none;stroke-linejoin:round" transform="translate(0 0)">' + GATE_SHAPES[c.t] + '</g><text x="26" y="28" text-anchor="middle" fill="currentColor" font-size="11" font-weight="800">' + c.t + '</text>';
    for (let k = 0; k < NIN(c.t); k++) h += '<circle class="port in" data-id="' + c.id + '" data-k="' + k + '" cx="0" cy="' + PORT_Y(c.t, k) + '" r="9"/>';
    if (c.t !== 'LAMP') h += '<circle class="port out ' + (pend === c.id ? 'act' : '') + '" data-id="' + c.id + '" cx="56" cy="24" r="9"/>';
    h += '</g>';
  });
  svg.innerHTML = h;
  const cyc = $('#cycNote'); if (cyc) cyc.textContent = ev.cyc ? 'A wire loops back on itself. Remove the loop so the signal can flow forward.' : '';
  renderTruth();
}
const swName = (c) => 'ABCDEFGH'[comps.filter((x) => x.t === 'SW').findIndex((x) => x.id === c.id)] || '?';
function tableFor() { // evaluates every switch combination of the current circuit
  const sws = comps.filter((c) => c.t === 'SW'), lamps = comps.filter((c) => c.t === 'LAMP'); if (!sws.length || sws.length > 4 || lamps.length !== 1) return null;
  const rows = []; for (let m = 0; m < (1 << sws.length); m++) { const s = {}; sws.forEach((c, i) => s[c.id] = (m >> (sws.length - 1 - i)) & 1); const ev = evalCircuit(s); rows.push({ ins: sws.map((c) => s[c.id]), out: ev.vals[lamps[0].id] }); }
  return rows;
}
function renderTruth() {
  const el = $('#truth'); if (!el) return; const p = PUZZLES[pidx], rows = tableFor();
  if (!rows) { el.innerHTML = '<p class="mm">The truth table appears when the circuit has 1 to 4 switches and exactly one bulb.</p>'; return; }
  const n = rows[0].ins.length; let h = '<table class="tt"><tr>' + [...Array(n)].map((_, i) => '<th>' + 'ABCD'[i] + '</th>').join('') + '<th>Your bulb</th><th>Goal</th></tr>';
  rows.forEach((r) => { const want = p.f(...r.ins) ? 1 : 0, ok = (r.out ? 1 : 0) === want; h += '<tr class="' + (p.n === n ? (ok ? 'ok' : 'bad') : '') + '">' + r.ins.map((v) => '<td>' + v + '</td>').join('') + '<td>' + r.out + '</td><td>' + (p.n === n ? want : '-') + '</td></tr>'; });
  el.innerHTML = h + '</table>';
}
/* -----------------------------------------------------------------------------
   Puzzle checking
   Runs the player circuit against every switch combination and compares the
   full truth table with the target. One mismatch fails the puzzle.
   -------------------------------------------------------------------------- */
function checkPuzzle() {
  const p = PUZZLES[pidx], rows = tableFor(), fb = $('#gfb'), sws = comps.filter((c) => c.t === 'SW').length, gates = comps.filter((c) => !['SW', 'LAMP'].includes(c.t)).length;
  const say = (m, ok) => { fb.textContent = m; fb.className = 'fb ' + (ok ? 'good' : 'bad'); if (ok) { tone(660, 0, .1); tone(880, .12, .18); } else { buzz(); tone(150, 0, .14, 'square'); } };
  if (!rows) return say('This puzzle needs ' + p.n + ' switch' + (p.n > 1 ? 'es' : '') + ' and exactly one bulb.', false);
  if (sws !== p.n) return say('Use exactly ' + p.n + ' switch' + (p.n > 1 ? 'es' : '') + ' for this puzzle.', false);
  const wired = wires.some((w) => comps.find((c) => c.id === w.to && c.t === 'LAMP')); if (!wired) return say('The bulb is not connected yet. Connect something to its input circle.', false);
  const bad = rows.filter((r) => (r.out ? 1 : 0) !== (p.f(...r.ins) ? 1 : 0)); if (bad.length) { const r = bad[0]; return say('Not yet: when ' + r.ins.map((v, i) => 'ABCD'[i] + '=' + v).join(', ') + ' your bulb is ' + (r.out ? 'ON' : 'OFF') + ', but it should be ' + (p.f(...r.ins) ? 'ON' : 'OFF') + '. The red rows in the table show every mismatch.', false); }
  if (p.n > 1 && gates === 0) return say('The table matches, but a circuit with no gates cannot solve this. Check your wiring.', false);
  say('Correct! ' + p.why, true); prog.done['gate' + pidx] = 1; unlock('gate' + pidx); saveProg(); renderProg();
  $('#gnext').hidden = pidx >= PUZZLES.length - 1;
}
/* A wrong answer shakes the board itself, which reads faster than the message. */
function buzz(){const cv=$('#cv');if(!cv)return;cv.classList.remove('shake');void cv.getBoundingClientRect();cv.classList.add('shake');setTimeout(()=>cv.classList.remove('shake'),500)}
function loadPuzzle(i) {
  pidx = Math.max(0, Math.min(PUZZLES.length - 1, i)); hintLv = 0; comps = []; wires = []; nid = 1; pend = null; selC = null; selW = null; const p = PUZZLES[pidx];
  for (let k = 0; k < p.n; k++) addComp('SW', 40, 40 + k * 82); addComp('LAMP', 640, 150);
  $('#pTitle').textContent = 'Puzzle ' + (pidx + 1) + ' of ' + PUZZLES.length + ': ' + p.t; $('#pGoal').textContent = p.goal; $('#pHow').textContent = p.how; $('#ghint').textContent = ''; $('#gfb').textContent = ''; $('#gnext').hidden = true;
  $('#gprev').disabled = pidx === 0; drawCircuit();
}
function buildGate() {
  const el = $('#pGate'); if (el.dataset.b) return; el.dataset.b = 1;
  el.innerHTML = '<div class="bp"><h2>Gate Explorer</h2><p>A logic gate takes one or two signals, each either ON (1) or OFF (0), and produces one new signal. Computers are built from billions of them. Flip the inputs below and watch each gate respond.</p><div class="gg" id="gex"></div></div>' +
    '<div class="bp"><h2 id="pTitle"></h2><p><b id="pGoal"></b></p><p class="mm" id="pHow"></p>' +
    '<div class="ctl"><button class="bb sm" data-add="SW" type="button">Add switch</button>' + Object.keys(GATE_INFO).map((g) => '<button class="bb sm" data-add="' + g + '" type="button">' + g + '</button>').join('') + '<button class="bb sm" id="gdel" type="button">Remove selected</button><button class="bb sm" id="gclr" type="button">Reset puzzle</button></div>' +
    '<svg id="cv" viewBox="0 0 760 360" role="img" aria-label="Circuit board. Drag parts, click an output circle then an input circle to connect them."></svg><p class="mm" id="cycNote" role="status"></p>' +
    '<p class="mm">How to use: add parts with the buttons, drag them to move, click a switch to turn it on or off. To connect, click the output circle (right side of a part) and then the input circle (left side of another part). Click a wire or a part, then Remove selected to delete it.</p>' +
    '<div class="ctl"><button class="bb pri" id="gcheck" type="button">Check my circuit</button><button class="bb" id="ghbtn" type="button">Give me a hint</button><button class="bb" id="gprev" type="button">Previous puzzle</button><button class="bb" id="gnext" type="button" hidden>Next puzzle</button><button class="bb sm" id="glisten" type="button">Listen to the goal</button></div>' +
    '<p class="fb" id="ghint"></p><p class="fb" id="gfb" role="status" aria-live="polite"></p><h3>Truth table (updates live)</h3><div id="truth"></div></div>';
/* -----------------------------------------------------------------------------
   Explorer cards
   Reference cards for each gate, shown beside the sandbox so players can read
   the behaviour instead of guessing it.
   -------------------------------------------------------------------------- */
  // explorer cards
  $('#gex').innerHTML = Object.keys(GATE_INFO).map((g) => { const two = NIN(g) === 2; return '<div class="gc" data-g="' + g + '">' + GSV(g) + '<b>' + g + '</b><p class="mm" style="margin:2px 0 6px">' + GATE_INFO[g][1] + '</p><div class="tg"><button type="button" data-in="0" aria-pressed="false" aria-label="Input A">A 0</button>' + (two ? '<button type="button" data-in="1" aria-pressed="false" aria-label="Input B">B 0</button>' : '') + '</div><span class="out">0</span></div>'; }).join('');
  $('#gex').querySelectorAll('.gc').forEach((card) => { const g = card.dataset.g, v = [0, 0]; const upd = () => { const o = GATE_INFO[g][2](v[0], v[1]) ? 1 : 0; const ob = card.querySelector('.out'); ob.textContent = o; ob.classList.toggle('on', !!o); };
    card.querySelectorAll('.tg button').forEach((b) => b.onclick = () => { const k = +b.dataset.in; v[k] = v[k] ? 0 : 1; b.setAttribute('aria-pressed', !!v[k]); b.textContent = 'AB'[k] + ' ' + v[k]; tone(v[k] ? 660 : 440, 0, .08); upd(); }); upd(); });
  el.querySelectorAll('[data-add]').forEach((b) => b.onclick = () => addComp(b.dataset.add));
  $('#gdel').onclick = () => { if (selW != null) { wires.splice(selW, 1); selW = null; } else if (selC != null) { const c = comps.find((x) => x.id === selC); if (c && c.t !== 'LAMP') { comps = comps.filter((x) => x.id !== selC); wires = wires.filter((w) => w.from !== selC && w.to !== selC); selC = null; } } drawCircuit(); };
  $('#gclr').onclick = () => loadPuzzle(pidx); $('#gcheck').onclick = checkPuzzle;
  $('#ghbtn').onclick = () => { const p = PUZZLES[pidx]; hintLv = Math.min(3, hintLv + 1); $('#ghint').textContent = 'Hint ' + hintLv + ' of 3: ' + p.hints[hintLv - 1]; };
  $('#gprev').onclick = () => loadPuzzle(pidx - 1); $('#gnext').onclick = () => loadPuzzle(pidx + 1);
  $('#glisten').onclick = () => TLP.Voice.speak(PUZZLES[pidx].goal + ' ' + PUZZLES[pidx].how);
  // board interaction: drag, connect, toggle
  const svg = $('#cv'); let drag = null;
  const pt = (e) => { const m = svg.getScreenCTM().inverse(), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(m); };
  svg.addEventListener('pointerdown', (e) => {
    const port = e.target.closest('.port'), wire = e.target.closest('.wire'), g = e.target.closest('.comp');
    if (port) { const id = +port.dataset.id; if (port.classList.contains('out')) { pend = pend === id ? null : id; drawCircuit(); } else if (pend != null && pend !== id) { const k = +port.dataset.k; wires = wires.filter((w) => !(w.to === id && w.port === k)); wires.push({ from: pend, to: id, port: k }); pend = null; tone(520, 0, .1); drawCircuit(); } return; }
    if (wire) { selW = +wire.dataset.w; selC = null; drawCircuit(); return; }
    if (g) { const c = comps.find((x) => x.id === +g.dataset.id), p = pt(e); drag = { c, dx: p.x - c.x, dy: p.y - c.y, moved: false }; selC = c.id; selW = null; svg.setPointerCapture(e.pointerId); }
    else { selC = selW = null; pend = null; drawCircuit(); }
  });
  svg.addEventListener('pointermove', (e) => { if (!drag) return; const p = pt(e); const nx = Math.max(0, Math.min(704, p.x - drag.dx)), ny = Math.max(0, Math.min(290, p.y - drag.dy)); if (Math.abs(nx - drag.c.x) + Math.abs(ny - drag.c.y) > 3) drag.moved = true; drag.c.x = nx; drag.c.y = ny; drawCircuit(); });
  svg.addEventListener('pointerup', () => { if (drag && !drag.moved && drag.c.t === 'SW') { drag.c.v = drag.c.v ? 0 : 1; tone(drag.c.v ? 660 : 440, 0, .08); } drag = null; drawCircuit(); });
  loadPuzzle(0);
}

/* ================= ALGORITHM WORKSHOP ================= */
const ALGS = [
  { id: 'linear', name: 'Linear Search', sorted: false, real: 'Finding one package among a pile of unsorted parcels: you have no choice but to look at each one in turn.', how: 'Start at the first item. Compare it with what you are looking for. If it matches, stop. If not, move to the next item. Repeat until you find it or run out of items.', when: 'Use it when the list is small or not sorted. It works on any list.', limit: 'It can be slow: with 1,000 items you may need 1,000 checks.', hints: ['Linear search simply looks at the items one after another.', 'Start at the very first position. Which position comes next after that?', 'Click the items from left to right, never skipping a position.', 'Click the next position in order. The rule is always "the position right after the last one you checked".'] },
  { id: 'binary', name: 'Binary Search', sorted: true, real: 'Looking up a name in a phone book: you open near the middle, decide whether to go left or right, and halve the pages left each time.', how: 'Look at the middle item of the current range. If it is the target, stop. If the target is smaller, keep only the left half. If larger, keep only the right half. Repeat on the smaller range.', when: 'Use it on a SORTED list, especially a long one: 1,000 items need only about 10 checks.', limit: 'The list must be sorted first. On an unsorted list the halving logic is wrong, because the target could be on either side.', hints: ['Binary search always inspects the middle of the range that is still possible.', 'The possible range is shown by the bright items. Find the position halfway between its two ends.', 'After checking the middle, decide: is the target smaller or larger than it? That tells you which half to keep.', 'Count the positions in the range, take the position in the middle (round down), and click it.'] },
  { id: 'jump', name: 'Jump Search', sorted: true, real: 'Skipping through a long book in steps of several pages until you pass the page you want, then going back to read page by page.', how: 'Choose a step size, about the square root of the list length. Jump forward by that step, checking only the item you land on, until you reach an item that is bigger than or equal to the target. Then go back to the start of that block and check item by item.', when: 'Use it on a sorted list when going backwards is expensive, as a middle path between linear and binary search.', limit: 'The list must be sorted, and it needs more checks than binary search on large lists.', hints: ['Jump search leaps ahead in equal steps, then searches one block carefully.', 'The step size is shown. You land on the last item of each block.', 'Keep jumping while the landing item is smaller than the target. Stop when it is bigger than or equal to the target.', 'After you stop jumping, search one by one inside that block, starting just after the previous landing spot.'] },
  { id: 'bubble', name: 'Bubble Sort', sorted: null, real: 'Lining up students by height by swapping neighbours who are in the wrong order, over and over, until nobody needs to swap.', how: 'Compare two neighbours. If the left one is bigger, swap them. Move one step right and repeat to the end. After each pass the biggest unsorted item has bubbled to the end. Repeat until a pass makes no swaps.', when: 'It is easy to understand and good for teaching or very small lists.', limit: 'It is slow on long lists, because it makes many comparisons and swaps.', hints: ['Bubble sort only ever compares two neighbours at a time.', 'Look at the highlighted pair. Which of the two is bigger?', 'If the left item is bigger than the right one, they are in the wrong order.', 'Swap when the left value is greater than the right value. Otherwise keep them.'] },
  { id: 'selection', name: 'Selection Sort', sorted: null, real: 'Sorting a hand of packages by priority: find the most urgent one, put it first, then find the most urgent among the rest, and so on.', how: 'Find the smallest item in the unsorted part and swap it into the first unsorted position. The sorted part grows by one. Repeat for the rest.', when: 'Use it when swaps are costly, since it makes at most one swap per round.', limit: 'It always scans the whole unsorted part, so it is slow on long lists even if they are almost sorted.', hints: ['Selection sort picks the smallest remaining item each round.', 'Only the items that are not yet sorted (the ones without a green outline) are candidates.', 'Compare all the unsorted values and find the smallest one.', 'Click the smallest value among the unsorted items. It will then be moved to the front of the unsorted part.'] },
  { id: 'insertion', name: 'Insertion Sort', sorted: null, real: 'Sorting playing cards in your hand: you take each new card and slide it into the correct place among the cards you already hold.', how: 'Treat the first item as a sorted group. Take the next item and insert it into the right place in the sorted group. Repeat until every item has been inserted.', when: 'It is quick on small or nearly sorted lists.', limit: 'On a long, badly ordered list it needs many moves.', hints: ['Insertion sort keeps a sorted group on the left and inserts one new item at a time.', 'The highlighted item is the "card in your hand". Compare it with the sorted items.', 'Find the first sorted item that is bigger than your card. Your card goes just before it.', 'Click the gap between the last sorted item that is smaller than your card and the next bigger one.'] }
];
let curAlg = 0, curTier = 'n', st = null, watch = null, wTimer = null, hintN = 0;
const labelBox = (v, i, cls, idx) => '<button type="button" class="bx ' + (cls || '') + '" data-i="' + i + '" aria-label="Position ' + (i + 1) + (cls && cls.includes('hid') ? ', hidden' : ', value ' + v) + '">' + v + '<small>' + (i + 1) + '</small></button>';

/* ---- step generators for the animated demonstration (each step is a full snapshot) ---- */
function genSteps(id, arr, target) {
  const S = []; const a = arr.slice(); const snap = (o) => S.push(Object.assign({ arr: a.slice(), hl: [], range: null, sorted: 0, found: -1, note: '' }, o));
  if (id === 'linear') { for (let i = 0; i < a.length; i++) { if (a[i] === target) { snap({ hl: [i], found: i, note: 'Position ' + (i + 1) + ' holds ' + a[i] + ', which is the target. Found it after ' + (i + 1) + ' check' + (i ? 's' : '') + '.' }); return S; } snap({ hl: [i], note: 'Check position ' + (i + 1) + ': ' + a[i] + ' is not ' + target + ', so move on.' }); } snap({ note: 'The end of the list was reached: the target is not in it.' }); }
  if (id === 'binary') { let lo = 0, hi = a.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; snap({ range: [lo, hi], hl: [m], note: 'Possible range: positions ' + (lo + 1) + ' to ' + (hi + 1) + '. The middle is position ' + (m + 1) + ', holding ' + a[m] + '.' }); if (a[m] === target) { snap({ range: [lo, hi], hl: [m], found: m, note: a[m] + ' is the target. Found it.' }); return S; } if (a[m] < target) { snap({ range: [lo, hi], hl: [m], note: a[m] + ' is smaller than ' + target + ', so the target must be to the right. Discard the left half.' }); lo = m + 1; } else { snap({ range: [lo, hi], hl: [m], note: a[m] + ' is larger than ' + target + ', so the target must be to the left. Discard the right half.' }); hi = m - 1; } } snap({ note: 'The range is empty: the target is not in the list.' }); }
  if (id === 'jump') { const n = a.length, step = Math.max(2, Math.floor(Math.sqrt(n))); let prev = 0, cur = step - 1; while (cur < n - 1 && a[cur] < target) { snap({ hl: [cur], note: 'Jump to position ' + (cur + 1) + ': ' + a[cur] + ' is smaller than ' + target + '. Jump again.' }); prev = cur + 1; cur += step; } cur = Math.min(cur, n - 1); snap({ hl: [cur], note: 'Landed on position ' + (cur + 1) + ' holding ' + a[cur] + (a[cur] >= target ? ', which is not smaller than the target. The target (if present) is in this block.' : ', the end of the list.') }); for (let i = prev; i <= cur; i++) { if (a[i] === target) { snap({ hl: [i], found: i, note: 'Position ' + (i + 1) + ' holds ' + a[i] + '. Found it.' }); return S; } snap({ hl: [i], note: 'Check position ' + (i + 1) + ': ' + a[i] + ' is not the target.' }); } snap({ note: 'The block was searched: the target is not in the list.' }); }
  if (id === 'bubble') { const n = a.length; for (let p = 0; p < n - 1; p++) { let sw = false; for (let i = 0; i < n - 1 - p; i++) { snap({ hl: [i, i + 1], sorted: p, note: 'Compare ' + a[i] + ' and ' + a[i + 1] + '.' }); if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; sw = true; snap({ hl: [i, i + 1], sorted: p, note: 'The left one was bigger, so swap them.' }); } } snap({ sorted: p + 1, note: 'End of pass ' + (p + 1) + ': the biggest remaining value has bubbled to the right end.' }); if (!sw) break; } snap({ sorted: n, note: 'Sorted.' }); }
  if (id === 'selection') { const n = a.length; for (let i = 0; i < n - 1; i++) { let m = i; for (let j = i + 1; j < n; j++) { snap({ hl: [m, j], sorted: i, note: 'Is ' + a[j] + ' smaller than the smallest so far (' + a[m] + ')?' }); if (a[j] < a[m]) m = j; } snap({ hl: [m], sorted: i, note: 'The smallest of the unsorted items is ' + a[m] + '. Swap it into position ' + (i + 1) + '.' }); [a[i], a[m]] = [a[m], a[i]]; snap({ sorted: i + 1, note: 'Position ' + (i + 1) + ' is now sorted.' }); } snap({ sorted: n, note: 'Sorted.' }); }
  if (id === 'insertion') { const n = a.length; for (let i = 1; i < n; i++) { const key = a[i]; let j = i - 1; snap({ hl: [i], sorted: i, note: 'Take ' + key + ' and insert it into the sorted group on the left.' }); while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; snap({ hl: [j], sorted: i, note: a[j + 1] + ' is bigger than ' + key + ', so shift it one place right.' }); j--; } a[j + 1] = key; snap({ hl: [j + 1], sorted: i + 1, note: key + ' goes into position ' + (j + 2) + '.' }); } snap({ sorted: n, note: 'Sorted.' }); }
  return S;
}
function renderWatch() {
  const w = watch, s = w.steps[w.i], el = $('#wArr');
  el.innerHTML = s.arr.map((v, i) => labelBox(v, i, (s.hl.includes(i) ? 'hl ' : '') + (s.found === i ? 'fnd ' : '') + (i < s.sorted && ALGS[curAlg].sorted === null ? 'srt ' : '') + (s.range && (i < s.range[0] || i > s.range[1]) ? 'dim ' : ''))).join('');
  $('#wNote').textContent = 'Step ' + (w.i + 1) + ' of ' + w.steps.length + '. ' + s.note;
  $('#wBack').disabled = w.i === 0; $('#wFwd').disabled = w.i >= w.steps.length - 1;
}
function newWatch() { const A0 = ALGS[curAlg]; let arr = A0.sorted === false ? shuffle(uniq(7, 10, 60)) : A0.sorted ? uniq(10, 5, 90).sort((x, y) => x - y) : shuffle(uniq(6, 10, 60)); const target = A0.sorted === null ? null : arr[rnd(arr.length)]; watch = { arr, target, steps: genSteps(A0.id, arr, target), i: 0 }; clearInterval(wTimer); $('#wGoal').textContent = A0.sorted === null ? 'Watch the list get sorted.' : 'Looking for the value ' + target + '.'; $('#wPlay').textContent = 'Play'; renderWatch(); }
function stepWatch(d) { watch.i = Math.max(0, Math.min(watch.steps.length - 1, watch.i + d)); renderWatch(); }
function togglePlay() { if (wTimer) { clearInterval(wTimer); wTimer = null; $('#wPlay').textContent = 'Play'; return; } if (watch.i >= watch.steps.length - 1) watch.i = 0; $('#wPlay').textContent = 'Pause'; wTimer = setInterval(() => { if (watch.i >= watch.steps.length - 1) { clearInterval(wTimer); wTimer = null; $('#wPlay').textContent = 'Play'; return; } stepWatch(1); }, +$('#wSpeed').value); }

/* ---- hands-on activities (you perform the algorithm; mistakes get specific feedback) ---- */
function newTry(tier) {
  const A0 = ALGS[curAlg], id = A0.id; curTier = tier || 'n'; const ch = curTier === 'c'; hintN = 0; $('#tHint').textContent = '';
  let arr; if (A0.sorted === false) arr = shuffle(uniq(ch ? 12 : curTier === 's' ? 6 : 8, 10, 99)); else if (A0.sorted) arr = uniq(ch ? 15 : (id === 'jump' ? (curTier === 's' ? 9 : 12) : (curTier === 's' ? 8 : 11)), 5, 99).sort((a, b) => a - b); else arr = shuffle(uniq(ch ? 7 : curTier === 's' ? 5 : 6, 10, 60));
  st = { id, ch, tier: curTier, arr, orig: arr.slice(), done: false, checks: 0, swaps: 0, revealed: new Set(), target: A0.sorted === null ? null : arr[rnd(arr.length)] };
  if (ch && A0.sorted !== null) st.mode = 'freeSearch'; else if (ch) st.mode = 'freeSort';
  if (id === 'linear') st.next = 0;
  if (id === 'binary') { st.lo = 0; st.hi = arr.length - 1; st.phase = 'pick'; st.lastMid = -1; }
  if (id === 'jump') { st.step = Math.max(2, Math.floor(Math.sqrt(arr.length))); st.prev = 0; st.cur = st.step - 1; st.phase = 'jump'; st.blk = 0; }
  if (id === 'bubble') { st.pass = 0; st.i = 0; st.sw = false; st.sortedFrom = arr.length; }
  if (id === 'selection') { st.k = 0; }
  if (id === 'insertion') { st.k = 1; }
  drawTry();
}
function fbk(m, good) { const f = $('#tFb'); f.textContent = m; f.className = 'fb ' + (good ? 'good' : 'bad'); }
function goalText() { const s = st; if (s.mode === 'freeSearch') return 'Challenge: find ' + s.target + ' using the fewest checks. The list is sorted, so you may use any method you like: click an item to reveal it.'; if (s.mode === 'freeSort') return 'Challenge: sort the list from smallest to largest. Click two items to swap them. Any method that ends sorted is correct; try to use few swaps.'; if (s.target != null) return 'Find the value ' + s.target + '. Reveal items by clicking them, the way ' + ALGS[curAlg].name + ' would.'; return { bubble: 'Sort from smallest to largest. The highlighted pair is being compared: choose Swap or Keep.', selection: 'Sort from smallest to largest. In each round click the smallest value among the items that are not yet sorted.', insertion: 'Sort from smallest to largest. The highlighted item is your card in hand: click the gap where it belongs among the sorted items on its left.' }[s.id]; }
function drawTry() {
  const s = st, el = $('#tArr'), id = s.id; $('#tGoal').textContent = goalText(); let h = '';
  const search = s.target != null;
  if (search) { h = s.arr.map((v, i) => { const open = s.revealed.has(i); return labelBox(open ? v : '?', i, (open ? '' : 'hid ') + (s.done && v === s.target ? 'fnd ' : '') + (id === 'binary' && !s.ch && (i < s.lo || i > s.hi) ? 'dim ' : '') + (id === 'jump' && !s.ch && s.phase === 'jump' && i === s.cur ? 'hl ' : '')); }).join(''); }
  else if (s.mode === 'freeSort') { h = s.arr.map((v, i) => labelBox(v, i, (s.pick === i ? 'hl ' : '') + (s.done ? 'srt' : ''))).join(''); }
  else if (id === 'bubble') { h = s.arr.map((v, i) => labelBox(v, i, (!s.done && (i === s.i || i === s.i + 1) ? 'hl ' : '') + (i >= s.sortedFrom ? 'srt' : ''))).join(''); }
  else if (id === 'selection') { h = s.arr.map((v, i) => labelBox(v, i, i < s.k ? 'srt' : '')).join(''); }
  else if (id === 'insertion') { for (let i = 0; i < s.arr.length; i++) { if (!s.done && i < s.k && i === 0) h += '<button type="button" class="gap" data-g="0" aria-label="Insert at the very start">+</button>'; h += labelBox(s.arr[i], i, (i < s.k ? 'srt ' : '') + (i === s.k && !s.done ? 'hl' : '')); if (!s.done && i < s.k) h += '<button type="button" class="gap" data-g="' + (i + 1) + '" aria-label="Insert after position ' + (i + 1) + '">+</button>'; } }
  el.innerHTML = h;
  const ctl = $('#tCtl'); ctl.innerHTML = '';
  if (id === 'binary' && !s.ch && !s.done && s.phase === 'dir') ctl.innerHTML = '<button class="bb" data-dir="L" type="button">The target is on the left</button><button class="bb" data-dir="R" type="button">The target is on the right</button>';
  if (id === 'bubble' && !s.ch && !s.done) ctl.innerHTML = '<button class="bb pri" data-bb="swap" type="button">Swap</button><button class="bb" data-bb="keep" type="button">Keep</button>';
  $('#tStat').textContent = search ? 'Checks so far: ' + s.checks : (s.swaps ? 'Swaps so far: ' + s.swaps : '');
}
function finishTry() {
  const s = st, A0 = ALGS[curAlg]; s.done = true; drawTry();
  let cmp = ''; const n = s.arr.length;
  if (s.target != null) { const lin = n, bin = Math.ceil(Math.log2(n + 1)); cmp = ' You used ' + s.checks + ' check' + (s.checks === 1 ? '' : 's') + '. In the worst case linear search needs ' + lin + (A0.sorted ? ', while binary search needs about ' + bin : '') + '.'; }
  else cmp = ' You made ' + s.swaps + ' swap' + (s.swaps === 1 ? '' : 's') + ' to sort ' + n + ' items.';
  fbk('Well done!' + cmp, true);
  $('#tSum').hidden = false; $('#tSum').innerHTML = '<h3>Summary: ' + A0.name + '</h3><p><b>What you used:</b> ' + esc(A0.how) + '</p><p><b>Where it is useful:</b> ' + esc(A0.when) + '</p><p><b>Limitation:</b> ' + esc(A0.limit) + '</p>';
  if (s.tier === 'c') { prog.done['alg-ch-' + A0.id] = 1; } else { prog.done['alg-' + A0.id] = 1; unlock('alg-' + A0.id); }
  saveProg(); renderProg(); if (ALGS.every((a) => prog.done['alg-' + a.id]) && PUZZLES.every((_, i) => prog.done['gate' + i])) unlock('master');
}
function onTryClick(e) {
  const s = st; if (!s || s.done) return; const A0 = ALGS[curAlg], id = s.id;
  const dirB = e.target.closest('[data-dir]'), bb = e.target.closest('[data-bb]'), gap = e.target.closest('.gap'), box = e.target.closest('.bx');
  if (dirB && id === 'binary') { const m = s.lastMid, v = s.arr[m], goLeft = s.target < v, said = dirB.dataset.dir === 'L'; if (goLeft === said) { if (said) s.hi = m - 1; else s.lo = m + 1; s.phase = 'pick'; fbk('Correct. ' + v + (goLeft ? ' is larger' : ' is smaller') + ' than ' + s.target + ', so the target can only be on the ' + (goLeft ? 'left' : 'right') + '. The range shrinks to positions ' + (s.lo + 1) + ' to ' + (s.hi + 1) + '.', true); } else fbk('Not quite. Compare ' + v + ' with ' + s.target + ': the list is sorted, so if the middle value is ' + (v > s.target ? 'larger' : 'smaller') + ' than the target, the target lies on the ' + (v > s.target ? 'left' : 'right') + '.', false); drawTry(); return; }
  if (bb && id === 'bubble') { const i = s.i, need = s.arr[i] > s.arr[i + 1], swapped = bb.dataset.bb === 'swap';
    if (need !== swapped) return fbk(need ? s.arr[i] + ' is bigger than ' + s.arr[i + 1] + ', so they are in the wrong order. Swap them.' : s.arr[i] + ' is not bigger than ' + s.arr[i + 1] + ', so they are already in order. Keep them.', false);
    if (swapped) { [s.arr[i], s.arr[i + 1]] = [s.arr[i + 1], s.arr[i]]; s.swaps++; s.sw = true; } s.i++; fbk('Correct.', true);
    if (s.i >= s.sortedFrom - 1) { s.sortedFrom--; s.i = 0; if (!s.sw || s.sortedFrom <= 1) { s.sortedFrom = 0; return finishTry(); } s.sw = false; fbk('Correct. The pass is over: the biggest remaining value is now at the right end.', true); }
    return drawTry(); }
  if (gap && id === 'insertion') { const g = +gap.dataset.g, key = s.arr[s.k]; const sortedPart = s.arr.slice(0, s.k); let right = sortedPart.filter((x) => x < key).length;
    if (g !== right) return fbk(g < right ? key + ' is bigger than the item just before that gap, so it belongs further to the right.' : key + ' is smaller than the item just after that gap, so it belongs further to the left.', false);
    s.arr.splice(s.k, 1); s.arr.splice(g, 0, key); s.swaps += s.k - g; s.k++; fbk('Correct: ' + key + ' is now in its place.', true); if (s.k >= s.arr.length) return finishTry(); return drawTry(); }
  if (!box) return; const i = +box.dataset.i;
  if (s.mode === 'freeSearch') { if (s.revealed.has(i)) return; s.revealed.add(i); s.checks++; if (s.arr[i] === s.target) return finishTry(); fbk(s.arr[i] + ' is ' + (s.arr[i] < s.target ? 'smaller' : 'larger') + ' than ' + s.target + '. Use that: the list is sorted.', false); return drawTry(); }
  if (s.mode === 'freeSort') { if (s.pick == null) { s.pick = i; return drawTry(); } if (s.pick !== i) { [s.arr[s.pick], s.arr[i]] = [s.arr[i], s.arr[s.pick]]; s.swaps++; } s.pick = null; if (s.arr.every((v, k) => k === 0 || s.arr[k - 1] <= v)) return finishTry(); fbk('', true); return drawTry(); }
  if (id === 'linear') { if (s.revealed.has(i)) return; if (i !== s.next) return fbk('Linear search never skips ahead: the next position to check is ' + (s.next + 1) + '.', false); s.revealed.add(i); s.checks++; s.next++; if (s.arr[i] === s.target) return finishTry(); fbk(s.arr[i] + ' is not ' + s.target + '. Check the next position.', true); return drawTry(); }
  if (id === 'binary') { if (s.phase !== 'pick') return fbk('First say which side the target is on, using the buttons.', false); const m = (s.lo + s.hi) >> 1; if (i !== m) return fbk('The possible range is positions ' + (s.lo + 1) + ' to ' + (s.hi + 1) + '. Binary search checks the middle of that range, which is not position ' + (i + 1) + '.', false); s.revealed.add(i); s.checks++; s.lastMid = m; if (s.arr[m] === s.target) return finishTry(); s.phase = 'dir'; fbk('Position ' + (m + 1) + ' holds ' + s.arr[m] + '. Is the target on the left or the right?', true); return drawTry(); }
  if (id === 'jump') { if (s.phase === 'jump') { if (i !== s.cur) return fbk('Jump search lands on position ' + (s.cur + 1) + ' next (a jump of ' + s.step + ' from the last landing).', false); s.revealed.add(i); s.checks++; if (s.arr[i] === s.target) return finishTry(); if (s.arr[i] > s.target || i >= s.arr.length - 1) { s.phase = 'block'; s.blk = s.prev; fbk(s.arr[i] + ' is bigger than the target, so it must be in the last block. Now go back and check one by one from position ' + (s.prev + 1) + '.', true); } else { s.prev = i + 1; s.cur = Math.min(s.cur + s.step, s.arr.length - 1); fbk(s.arr[i] + ' is still smaller than ' + s.target + '. Jump again.', true); } return drawTry(); }
    if (s.revealed.has(i)) return; if (i !== s.blk) return fbk('In the block, check items one by one in order. The next position is ' + (s.blk + 1) + '.', false); s.revealed.add(i); s.checks++; s.blk++; if (s.arr[i] === s.target) return finishTry(); fbk(s.arr[i] + ' is not the target. Check the next one.', true); return drawTry(); }
  if (id === 'selection') { const rest = s.arr.slice(s.k), mn = Math.min(...rest); if (i < s.k) return fbk('That item is already sorted. Pick from the unsorted items.', false); if (s.arr[i] !== mn) return fbk(s.arr[i] + ' is not the smallest of the unsorted items. Look for a smaller value among them.', false); const j = s.arr.indexOf(mn, s.k); if (j !== s.k) { [s.arr[s.k], s.arr[j]] = [s.arr[j], s.arr[s.k]]; s.swaps++; } s.k++; fbk('Correct: ' + mn + ' is the smallest remaining and now sits in position ' + s.k + '.', true); if (s.k >= s.arr.length - 1) return finishTry(); return drawTry(); }
}
/* ---- "Which algorithm?" drill: five situations drawn from eight ---- */
const QUIZ = [
  { q: 'A sorted list holds 2,000 student IDs and you need to find one ID.', a: 'binary', why: 'The list is already sorted, so each check can throw away half of what remains. About 11 checks beat 2,000.' },
  { q: 'A drawer holds 8 unsorted charging cables and you want the USB-C one.', a: 'linear', why: 'With only eight unsorted items, looking at them one by one is the simplest and fastest choice.' },
  { q: 'A sorted archive sits on a tape drive, and rewinding is very slow. Skip ahead in blocks, then read only the last block.', a: 'jump', why: 'Jump search moves forward in steps and never needs to rewind far, which suits a tape.' },
  { q: 'Students must be lined up by height, and you may only swap two students standing next to each other.', a: 'bubble', why: 'Bubble sort only ever swaps neighbours, which is exactly the rule you were given.' },
  { q: 'Writing to a memory chip is expensive. Sort 40 records using as few swaps as possible, with at most one swap per round.', a: 'selection', why: 'Selection sort makes at most one swap per round, so it writes far less than the other sorts.' },
  { q: 'Playing cards arrive one at a time and must join a hand that is already in order.', a: 'insertion', why: 'Insertion sort takes each new item and slides it into its place in the sorted part.' },
  { q: 'A sorted contact list has one new name added in the wrong spot; the rest is already in order.', a: 'insertion', why: 'Insertion sort is quick on a nearly sorted list: one item moves and everything else stays put.' },
  { q: 'You guess a number from 1 to 100 and are told "higher" or "lower" after every guess.', a: 'binary', why: 'Each answer removes half the remaining numbers, which is binary search in disguise.' }
];
let quizRun = null;
function startQuiz() { quizRun = { list: shuffle(QUIZ).slice(0, 5), i: 0, score: 0, answered: false, pick: null }; drawQuiz(); }
function drawQuiz() {
  const q = quizRun, box = $('#quizBox'); if (!q || !box) return;
  if (q.i >= q.list.length) {
    box.innerHTML = '<div class="qend"><b>' + q.score + ' / 5</b><p class="mm">' + (q.score === 5 ? 'Every situation matched the right algorithm.' : q.score >= 3 ? 'Good instincts. Read the explanations again and try for five.' : 'The situations are worth re-reading: each one points at a clear best choice.') + '</p><button class="bb pri" id="qAgain" type="button">Play again</button></div>';
    $('#qAgain').onclick = startQuiz;
    if (q.score === 5) unlock('quiz');
    return;
  }
  const it = q.list[q.i], right = ALGS.find((a) => a.id === it.a);
  box.innerHTML = '<div class="qmeta"><span>Question ' + (q.i + 1) + ' of ' + q.list.length + '</span><span>Score ' + q.score + '</span></div><p class="quizq">' + esc(it.q) + '</p><div class="qopts">' + ALGS.map((a) => '<button type="button" data-q="' + a.id + '"' + (q.answered ? ' disabled' : '') + '>' + esc(a.name) + '</button>').join('') + '</div><p class="fb ' + (q.answered ? (q.pick === it.a ? 'good' : 'bad') : '') + '" role="status" aria-live="polite">' + (q.answered ? '<b>' + esc(right.name) + ':</b> ' + esc(it.why) : '') + '</p>' + (q.answered ? '<div class="ctl"><button class="bb pri" id="qNext" type="button">' + (q.i === q.list.length - 1 ? 'See my score' : 'Next situation') + '</button></div>' : '');
  if (q.answered) {
    box.querySelectorAll('.qopts button').forEach((b) => { if (b.dataset.q === it.a) b.classList.add('right'); else if (b.dataset.q === q.pick) b.classList.add('wrong'); });
    $('#qNext').onclick = () => { q.i++; q.answered = false; q.pick = null; drawQuiz(); };
  } else box.querySelectorAll('.qopts button').forEach((b) => b.onclick = () => { q.pick = b.dataset.q; q.answered = true; if (q.pick === it.a) { q.score++; tone(660, 0, .1); tone(880, .12, .18); } else tone(150, 0, .14, 'square'); drawQuiz(); });
}
function buildAlg() {
  const el = $('#pAlg'); if (el.dataset.b) return; el.dataset.b = 1;
  el.innerHTML = '<div class="bp"><div class="nt" id="algNav" role="tablist" aria-label="Algorithms"></div><div id="algInfo"></div></div>' +
    '<div class="bp"><h2>1. Watch it work</h2><p id="wGoal"></p><div class="arr" id="wArr" aria-live="off"></div><p class="fb" id="wNote" aria-live="polite"></p><div class="ctl"><button class="bb" id="wBack" type="button">Step back</button><button class="bb" id="wFwd" type="button">Step forward</button><button class="bb pri" id="wPlay" type="button">Play</button><button class="bb" id="wReset" type="button">Replay</button><button class="bb sm" id="wNew" type="button">New example</button><label class="mm">Speed <select id="wSpeed"><option value="1500">Slow</option><option value="900" selected>Normal</option><option value="450">Fast</option></select></label></div></div>' +
    '<div class="bp"><h2>2. Now you do it</h2><p><b id="tGoal"></b></p><div class="arr" id="tArr"></div><div class="ctl" id="tCtl"></div><p class="mm" id="tStat"></p><p class="fb" id="tFb" role="status" aria-live="polite"></p><p class="fb" id="tHint"></p><div class="ctl"><button class="bb" id="tHbtn" type="button">Give me a hint</button><button class="bb" id="tNew" type="button">New puzzle</button><span class="tiers" id="tTier" role="group" aria-label="Exercise size"><button type="button" data-tier="s" aria-pressed="false">Small</button><button type="button" data-tier="n" class="on" aria-pressed="true">Normal</button><button type="button" data-tier="c" aria-pressed="false">Challenge</button></span><button class="bb sm" id="tListen" type="button">Listen to the explanation</button></div><div id="tSum" class="bp" hidden></div></div>' +
    '<div class="bp"><h2>3. Which algorithm?</h2><p class="mm">Five situations, one choice each. Pick the algorithm you would reach for, then read why.</p><div id="quizBox"></div></div>';
  $('#algNav').innerHTML = ALGS.map((a, i) => '<button role="tab" type="button" data-a="' + i + '" aria-selected="' + (i === curAlg) + '">' + a.name + '</button>').join('');
  $('#algNav').querySelectorAll('button').forEach((b) => b.onclick = () => { curAlg = +b.dataset.a; $('#algNav').querySelectorAll('button').forEach((o) => o.setAttribute('aria-selected', o === b)); loadAlg(); });
  $('#wBack').onclick = () => stepWatch(-1); $('#wFwd').onclick = () => stepWatch(1); $('#wPlay').onclick = togglePlay; $('#wReset').onclick = () => { watch.i = 0; clearInterval(wTimer); wTimer = null; $('#wPlay').textContent = 'Play'; renderWatch(); }; $('#wNew').onclick = newWatch;
  $('#tNew').onclick = () => { $('#tSum').hidden = true; fbk('', true); newTry(curTier); };
  $('#tTier').querySelectorAll('button').forEach((b) => b.onclick = () => { curTier = b.dataset.tier; $('#tTier').querySelectorAll('button').forEach((o) => { o.classList.toggle('on', o === b); o.setAttribute('aria-pressed', o === b); }); $('#tSum').hidden = true; fbk('', true); newTry(curTier); });
  $('#tHbtn').onclick = () => { const A0 = ALGS[curAlg]; hintN = Math.min(4, hintN + 1); $('#tHint').textContent = 'Hint ' + hintN + ' of 4: ' + A0.hints[hintN - 1]; };
  $('#tListen').onclick = () => { const A0 = ALGS[curAlg]; TLP.Voice.speak(A0.name + '. ' + A0.real + ' ' + A0.how); };
  $('#pAlg').addEventListener('click', (e) => { if (e.target.closest('#tArr,#tCtl')) onTryClick(e); });
  loadAlg(); startQuiz();
}
function loadAlg() {
  const A0 = ALGS[curAlg]; clearInterval(wTimer); wTimer = null;
  $('#algInfo').innerHTML = '<h2>' + A0.name + '</h2><p><b>A real-world problem:</b> ' + esc(A0.real) + '</p><p><b>How it works:</b> ' + esc(A0.how) + '</p><p><b>When it is useful:</b> ' + esc(A0.when) + '</p><p><b>Its limitation:</b> ' + esc(A0.limit) + '</p>';
  $('#tSum').hidden = true; fbk('', true); newWatch(); newTry(curTier);
}

/* ================= achievements ================= */
function buildAchList() {
  PUZZLES.forEach((p, i) => ACHS.push({ id: 'gate' + i, n: i, t: p.t, d: 'Solved logic gate puzzle ' + (i + 1) + '.', svg: '<svg viewBox="0 0 56 48">' + GATE_SHAPES[PUZ_SHAPE[i]] + '</svg>' }));
  ALGS.forEach((a, i) => ACHS.push({ id: 'alg-' + a.id, n: 10 + i, t: a.name + ' Expert', d: 'Completed the ' + a.name + ' activity.', svg: ALG_ICONS[a.id] }));
  ACHS.push({ id: 'master', n: 16, t: 'Bonus Lab Master', d: 'Finished every gate puzzle and algorithm activity.', svg: '<svg viewBox="0 0 56 48"><path d="M6 40L6 14L18 26L28 8L38 26L50 14L50 40Z"/></svg>' });
  ACHS.push({ id: 'quiz', n: 21, t: 'Algorithm Scout', d: 'Answered all five scenario questions in one drill correctly.', svg: '<svg viewBox="0 0 56 48"><path d="M28 42V10"/><path d="M28 14H12L6 22L12 30H28"/><path d="M28 14H44L50 22L44 30H28"/></svg>' });
}
/* Progress strip above the tabs. It reuses the same prog.done and prog.ach
   keys the activities write, so there is no separate counter to drift. */
function renderProg() {
  const el = $('#bprog'); if (!el) return;
  const gates = PUZZLES.filter((_, i) => prog.done['gate' + i]).length;
  const algs = ALGS.filter((a) => prog.done['alg-' + a.id]).length;
  const chal = ALGS.filter((a) => prog.done['alg-ch-' + a.id]).length;
  const ach = ACHS.filter((a) => prog.ach.includes(a.id)).length;
  const bar = (n, tot) => '<i><em class="' + (n >= tot ? 'full' : '') + '" style="width:' + Math.round((n / tot) * 100) + '%"></em></i>';
  el.innerHTML =
    '<div class="bseg"><b>Gate puzzles</b><span>' + gates + ' <small>/ ' + PUZZLES.length + '</small></span>' + bar(gates, PUZZLES.length) + '</div>' +
    '<div class="bseg"><b>Algorithm runs</b><span>' + algs + ' <small>/ ' + ALGS.length + ' · ' + chal + ' on challenge</small></span>' + bar(algs, ALGS.length) + '</div>' +
    '<div class="bseg"><b>Achievements</b><span>' + ach + ' <small>/ ' + ACHS.length + '</small></span>' + bar(ach, ACHS.length) + '</div>';
}
function renderAch() {
  const el = $('#pAch'); if (!el) return;
  el.innerHTML = '<div class="bp"><h2>Your achievements</h2><p class="mm">These are shown only here. They are separate from your score and do not affect any leaderboard, co-op result or ranking.</p>' + ACHS.map((a) => '<div class="ach ' + (prog.ach.includes(a.id) ? '' : 'lk') + '">' + a.svg + '<br><b>' + esc(prog.ach.includes(a.id) ? a.t : 'Locked') + '</b><br><span class="mm">' + esc(a.d) + '</span></div>').join('') + '</div>';
}

/* ================= mastery missions =================
   These are the four extra chapters and the final guardian that used to sit
   on the chapter map as "Section 6". They now live here, after the five story
   sections, and open the game directly on the chosen chapter. */
const MASTERY = [
  { c: 25, t: 'Debugging', d: 'Find the broken step and repair the program.' },
  { c: 26, t: 'Searching', d: 'Search through data in a smart order.' },
  { c: 27, t: 'Finding the Biggest', d: 'Compare a whole list and keep the winner.' },
  { c: 28, t: 'Optimising', d: 'Do the same job with fewer blocks.' },
  { c: 29, t: 'The Origin', d: 'The first bug. Use everything you have learned.', boss: 1 }
];
function buildMas() {
  const el = $('#pMas'); if (!el) return;
  el.innerHTML = '<div class="bp"><h2>Mastery missions</h2><p class="mm">Four extra chapters and one final guardian. They open with this page, after the five story sections. Stars and points count in the game like any mission, but none of this is needed to finish the story.</p><div class="mas">' +
    MASTERY.map((m) => '<a class="mcard' + (m.boss ? ' boss' : '') + '" href="webgame.html?bonus=' + m.c + '"><span class="tag">' + (m.boss ? 'Bonus guardian' : 'Bonus chapter') + '</span><b>' + esc(m.t) + '</b><span class="mm">' + esc(m.d) + '</span><em>Open mission →</em></a>').join('') +
    '</div></div>';
}

/* ================= unlock check and start ================= */
async function isUnlocked(l, u) {
  if (u && u.isAdmin) return true;
  if (l && (l.completed_diffs || []).length) return true;
  try { const recs = await A().getProgressSummaries([l.id]); const hid = (TLP.HIDDEN[l.assigned_path] || []);
    // Two workshops and Mastery open together: the five story guardians are
    // the gate, and the optional Mastery guardian is never required here.
    const need = TLP.BOSS_CH.filter((c) => !hid.includes(c) && c !== 29);
    return recs.some((r) => need.every((c) => Number((r.prog || {})[c + '-0']) >= 1)); } catch (e) { return false; }
}
function tab(n) {
  ['Gate', 'Alg', 'Mas', 'Ach'].forEach((k) => { $('#t' + k).setAttribute('aria-selected', k === n); $('#p' + k).hidden = k !== n; });
  renderProg();
  if (n === 'Gate') buildGate(); if (n === 'Alg') buildAlg(); if (n === 'Mas') buildMas(); if (n === 'Ach') renderAch();
}
$('#tGate').onclick = () => tab('Gate'); $('#tAlg').onclick = () => tab('Alg'); $('#tMas').onclick = () => tab('Mas'); $('#tAch').onclick = () => tab('Ach');
window.BONUS = { evalCircuit, genSteps, PUZZLES, ALGS, get comps() { return comps; }, set comps(v) { comps = v; }, get wires() { return wires; }, set wires(v) { wires = v; }, tableFor, onTryClick, newTry, get st() { return st; }, set curAlg(v) { curAlg = v; } };
(async function boot() {
  const g = $('#gate'); buildAchList();
  try {
    await A().init(); const u = A().getCurrentUser();
    if (A().isCloudConfigured() && !u) { g.hidden = false; g.innerHTML = 'Please <a href="auth.html">sign in</a> to open the Bonus sections.'; return; }
    const admin = !!(u && u.isAdmin);
    // The owner account is also a parent, but it may inspect every section.
    if (u && u.role === 'parent' && !admin) { g.hidden = false; g.innerHTML = 'Parent and Educator accounts do not play. <a href="parent.html">Back to the Parent and Educator area</a>.'; return; }
    const l = A().getActiveLearner(); if (admin) learnerId = 'admin-preview'; else if (l && !l.isGuest) learnerId = l.id;
    if (A().isCloudConfigured() && !(await isUnlocked(l || {}, u))) { g.hidden = false; g.innerHTML = '<h2>Locked</h2><p>The Bonus areas unlock after you finish the five story sections, on any difficulty. Keep going: the guardians are waiting. <a href="webgame.html">Back to the game</a></p>'; return; }
    // Grades 1-6 do not have the Mastery chapters in their game, so the tab is
    // hidden rather than offering links that would not open. The game picks its
    // chapters from this same saved path, including for guests.
    let lp = 'g710'; try { lp = localStorage.getItem('tlp-path') || 'g710'; } catch (e) {}
    if (!admin && lp === 'g16') { $('#tMas').hidden = true; $('#pMas').hidden = true; }
    loadLocal(); await loadCloud(); $('#app').hidden = false; tab('Gate');
  } catch (e) { g.hidden = false; g.textContent = 'Something went wrong: ' + (e && e.message || e); }
})();
