/* =============================================================================
   THE LOST PROTOCOL — CO-OP MISSION RULES (shared by the browser and the server)
   The server (Edge Function "coop-submit") runs this SAME file to verify results,
   so what a team sees in the browser is exactly what is scored.
   Mission: "Restore the Relay Grid". Ten relay stations plus the Core.
   Host lane controls stations 0-4 and sets the shared BUS value.
   Guest lane controls stations 5-9 and pours the BUS value into the Core (station 10).
   The Core needs (bus value x number of pours) to equal its target, so the two
   players must agree on the numbers.
   ============================================================================= */
(function (root) {
  'use strict';
  var PAR = 30, MAXREP = 9, MAXADD = 5, BODY_MAX = 6;
  var LANES = { host: { lo: 0, hi: 4 }, guest: { lo: 5, hi: 9 } };

  function isInt(x, a, b) { return typeof x === 'number' && isFinite(x) && Math.floor(x) === x && x >= a && x <= b; }

  // Check one statement. Returns an error string or '' when fine. Counts steps into ctx.steps.
  function check(st, lane, ctx, inBody) {
    if (!st || typeof st !== 'object') return 'Invalid statement';
    var L = LANES[lane];
    ctx.steps++;
    switch (st.op) {
      case 'add':
        if (!isInt(st.st, L.lo, L.hi)) return 'A ' + lane + ' statement uses a station outside its lane';
        if (!isInt(st.k, 1, MAXADD)) return 'Add amount must be 1 to ' + MAXADD;
        return '';
      case 'bus':
        if (lane !== 'host' || inBody) return 'Only the host can set the bus, outside a repeat';
        return isInt(st.k, 1, 9) ? '' : 'Bus value must be 1 to 9';
      case 'addbus':
        if (lane !== 'guest') return 'Only the guest can pour the bus';
        return st.st === 10 ? '' : 'The bus can only be poured into the Core';
      case 'rep':
      case 'if':
        if (inBody) return 'Repeats and ifs cannot be nested';
        var body = st.op === 'rep' ? st.body : st.then;
        if (!Array.isArray(body) || body.length < 1 || body.length > BODY_MAX) return 'A repeat or if needs 1 to ' + BODY_MAX + ' statements inside';
        if (st.op === 'rep' && !isInt(st.n, 2, MAXREP)) return 'Repeat count must be 2 to ' + MAXREP;
        if (st.op === 'if') {
          if (['lt', 'gt', 'eq'].indexOf(st.cmp) < 0) return 'Unknown comparison';
          if (!isInt(st.st, L.lo, L.hi)) return 'An if must test a station in your own lane';
          if (!isInt(st.v, 0, 99)) return 'Compare value must be 0 to 99';
        }
        for (var i = 0; i < body.length; i++) { var e = check(body[i], lane, ctx, true); if (e) return e; }
        return '';
      default: return 'Unknown statement';
    }
  }

  function run(st, vals, bus) {
    switch (st.op) {
      case 'add': vals[st.st] += st.k; break;
      case 'bus': bus.v = st.k; break;
      case 'addbus': vals[10] += bus.v; break;
      case 'rep': for (var n = 0; n < st.n; n++) for (var i = 0; i < st.body.length; i++) run(st.body[i], vals, bus); break;
      case 'if':
        var a = vals[st.st], c = st.cmp === 'lt' ? a < st.v : st.cmp === 'gt' ? a > st.v : a === st.v;
        if (c) for (var j = 0; j < st.then.length; j++) run(st.then[j], vals, bus);
        break;
    }
  }

  // program = { host: [...statements], guest: [...statements] }
  function simulate(instance, program) {
    var out = { ok: false, error: '', correct: 0, total: 11, steps: 0, vals: [] };
    if (!instance || !Array.isArray(instance.stations) || instance.stations.length !== 10) { out.error = 'Bad challenge'; return out; }
    var ctx = { steps: 0 }, lanes = ['host', 'guest'];
    for (var l = 0; l < 2; l++) {
      var list = program && program[lanes[l]];
      if (!Array.isArray(list) || list.length > 40) { out.error = 'Bad program'; return out; }
      for (var i = 0; i < list.length; i++) { var e = check(list[i], lanes[l], ctx, false); if (e) { out.error = e; return out; } }
    }
    out.steps = ctx.steps;
    if (ctx.steps > (instance.maxStatements || 80)) { out.error = 'Too many statements'; return out; }
    var vals = instance.stations.map(function (s) { return s.start; }); vals.push(0);
    var bus = { v: 0 };
    for (var h = 0; h < program.host.length; h++) run(program.host[h], vals, bus);
    for (var g = 0; g < program.guest.length; g++) run(program.guest[g], vals, bus);
    for (var k = 0; k < 10; k++) if (vals[k] === instance.stations[k].target) out.correct++;
    if (vals[10] === instance.core.target) out.correct++;
    out.vals = vals; out.ok = true; return out;
  }

  // Score: correctness first (up to 1000), then +200 for a fully working grid, then up to +200 for efficiency.
  // Time is NOT part of the score; it is only the tie-break on the leaderboard.
  function score(res) {
    if (!res || !res.ok) return 0;
    var s = Math.round(1000 * res.correct / res.total);
    if (res.correct === res.total) s += 200 + Math.min(200, 8 * Math.max(0, PAR - res.steps));
    return s;
  }

  var api = { simulate: simulate, score: score, PAR: PAR, MAXREP: MAXREP, MAXADD: MAXADD, LANES: LANES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TLP_COOP = api;
})(typeof window !== 'undefined' ? window : globalThis);