/* =============================================================================
   THE LOST PROTOCOL — STREAK ENGINE  (js/streak.js)
   -----------------------------------------------------------------------------
   A streak counts days, not hours. Opening the game on a new local day adds one
   day. Missing a day starts again at one. The record is kept per learner on this
   device, so a shared classroom browser keeps each Player ID separate.

   Milestones run from 2 days to a full year. The last one is deliberately very
   rare: 365 days earns the Protocol Keeper crest.

   This file also injects its own small style block so the streak card looks the
   same on the game page, the parent area and the admin dashboard.
   ============================================================================= */
(function () {
  'use strict';
  if (window.TLP_STREAK) return;

  var MILESTONES = [
    { d: 2,   name: 'Signal Found',      tier: 'common',    line: 'Two days in a row. The network noticed you.' },
    { d: 3,   name: 'Warm Circuit',      tier: 'common',    line: 'Three days. The lights stay on a little longer.' },
    { d: 5,   name: 'Steady Signal',     tier: 'common',    line: 'Five days. Your robot is starting to trust the routine.' },
    { d: 7,   name: 'Week Signal',       tier: 'common',    line: 'A full week. That is a real habit now.' },
    { d: 10,  name: 'Ten Day Relay',     tier: 'common',    line: 'Ten days. The relay has never been this stable.' },
    { d: 14,  name: 'Two Week Link',     tier: 'rare',      line: 'Fourteen days. A rare link is forming.' },
    { d: 21,  name: 'Habit Protocol',    tier: 'rare',      line: 'Twenty one days. This is automatic now.' },
    { d: 30,  name: 'Month of Logic',    tier: 'rare',      line: 'Thirty days. A whole month of thinking clearly.' },
    { d: 45,  name: 'Deep Archive',      tier: 'rare',      line: 'Forty five days. Your archive is getting deep.' },
    { d: 60,  name: 'Two Month Core',    tier: 'epic',      line: 'Sixty days. The core runs on your rhythm.' },
    { d: 75,  name: 'Diamond Signal',    tier: 'epic',      line: 'Seventy five days. Very few players get here.' },
    { d: 100, name: 'Century Circuit',   tier: 'epic',      line: 'One hundred days. A century of small steps.' },
    { d: 150, name: 'Deep Protocol',     tier: 'legendary', line: 'One hundred and fifty days. This is legendary.' },
    { d: 200, name: 'Long Haul',         tier: 'legendary', line: 'Two hundred days. The whole network knows your name.' },
    { d: 250, name: 'Nexus Regular',     tier: 'legendary', line: 'Two hundred and fifty days. You are part of the system now.' },
    { d: 300, name: 'Almost a Year',     tier: 'legendary', line: 'Three hundred days. The last stretch.' },
    { d: 365, name: 'Protocol Keeper',   tier: 'legendary', line: 'One full year. The rarest crest in the game.', rare: true }
  ];

  function lid() {
    try {
      var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner();
      return (l && l.id && !l.isGuest) ? l.id : 'guest';
    } catch (e) { return 'guest'; }
  }
  function key() { return 'tlp-streak:' + lid(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayNum(s) {
    if (!s) return null;
    var p = String(s).split('-');
    if (p.length !== 3) return null;
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(key()) || 'null');
      if (v && typeof v === 'object') return v;
    } catch (e) {}
    return { v: 1, last: '', count: 0, best: 0, total: 0, earned: [], log: [] };
  }
  function save(s) { try { localStorage.setItem(key(), JSON.stringify(s)); } catch (e) {} }

  /* ------------------------------ Day check ------------------------------ */
  function check() {
    var s = load(), t = today(), result = { newDay: false, count: s.count || 0, best: s.best || 0, milestone: null, broken: false };
    if (s.last === t) return result;

    var gap = s.last ? (dayNum(t) - dayNum(s.last)) : null;
    if (gap !== null && gap < 0) return result;       // clock moved backwards; do not punish
    if (gap !== null && gap > 1) { result.broken = true; s.count = 1; }
    else s.count = (s.count || 0) + 1;

    s.last = t;
    s.total = (s.total || 0) + 1;
    s.best = Math.max(s.best || 0, s.count);
    s.log = (s.log || []).filter(function (d) { return d !== t; }).concat(t).slice(-120);
    s.earned = s.earned || [];
    var ms = null;
    for (var i = 0; i < MILESTONES.length; i++) if (MILESTONES[i].d === s.count) { ms = MILESTONES[i]; break; }
    if (ms && s.earned.indexOf(ms.d) < 0) s.earned.push(ms.d);
    save(s);
    result.newDay = true; result.count = s.count; result.best = s.best; result.milestone = ms;
    return result;
  }

  /* ------------------------------ Readers ------------------------------ */
  function get() {
    var s = load(), next = null;
    for (var i = 0; i < MILESTONES.length; i++) if (MILESTONES[i].d > s.count) { next = MILESTONES[i]; break; }
    return {
      count: s.count || 0, best: s.best || 0, total: s.total || 0,
      last: s.last || '', earned: s.earned || [], next: next,
      left: next ? next.d - (s.count || 0) : 0,
      tier: tierFor(s.count || 0)
    };
  }
  function tierFor(n) {
    if (n >= 150) return 'legendary';
    if (n >= 60) return 'epic';
    if (n >= 14) return 'rare';
    return 'common';
  }
  function strip(n) {
    var s = load(), log = s.log || [], out = [], now = new Date();
    n = n || 7;
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var k = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      out.push({ key: k, day: d.getDay(), on: log.indexOf(k) >= 0 });
    }
    return out;
  }
  function tierName(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ------------------------------ Markup ------------------------------ */
  function weekHtml() {
    var names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return '<div class="tsweek" aria-label="Last seven days">' + strip(7).map(function (x) {
      return '<span class="tsdot' + (x.on ? ' on' : '') + '" title="' + x.key + '">' + names[x.day] + '</span>';
    }).join('') + '</div>';
  }

  function cardHtml(opts) {
    opts = opts || {};
    var s = get(), t = s.tier;
    var next = s.next ? ('Next reward in ' + s.left + ' day' + (s.left === 1 ? '' : 's') + ': ' + s.next.name) : 'Every milestone earned. You are a Protocol Keeper.';
    return '<div class="tstreak tier-' + t + (opts.compact ? ' compact' : '') + '">' +
      '<div class="tshead"><div class="tsflame" aria-hidden="true"><i class="ic ic-flame"></i></div>' +
      '<div class="tscopy"><b>' + s.count + ' day streak</b><span>' + (s.count ? next : 'Play today to start a streak.') + '</span></div>' +
      '<div class="tsbest"><small>Best</small><b>' + s.best + '</b></div></div>' +
      weekHtml() +
      '<div class="tsfoot"><span>Total days ' + s.total + '</span><span class="tspill tier-' + t + '">' + tierName(t) + '</span></div>' +
      '</div>';
  }

  function listHtml() {
    var s = get();
    return '<div class="tslist">' + MILESTONES.map(function (m) {
      var got = s.earned.indexOf(m.d) >= 0;
      return '<div class="tsms ' + m.tier + (got ? ' got' : '') + '">' +
        '<span class="tsmd">' + m.d + '</span>' +
        '<div><b>' + m.name + '</b><small>' + m.line + '</small></div>' +
        '<span class="tsmt">' + (m.rare ? 'Very rare' : tierName(m.tier)) + '</span></div>';
    }).join('') + '</div>';
  }

  function popHtml(m) {
    return '<div class="ts-pop ' + m.tier + '">' +
      '<div class="ts-pop-art" aria-hidden="true"><i class="ic ic-flame"></i></div>' +
      '<small>' + (m.rare ? 'Very rare streak reward' : 'Streak milestone') + '</small>' +
      '<b>' + m.name + '</b><span>' + m.d + ' days in a row. ' + m.line + '</span></div>';
  }

  /* ------------------------------ Styles ------------------------------ */
  var css = '' +
    '.tstreak{--tier:#35c9e8;border:1px solid color-mix(in srgb,var(--tier) 45%,transparent);border-radius:16px;padding:12px 14px;background:linear-gradient(160deg,color-mix(in srgb,var(--tier) 12%,transparent),transparent 70%);font-family:var(--sans,system-ui,sans-serif);color:var(--fg,#f3efe8)}' +
    '.tstreak.tier-common{--tier:#35c9e8}.tstreak.tier-rare{--tier:#8d7bff}.tstreak.tier-epic{--tier:#ff9f43}.tstreak.tier-legendary{--tier:#ff4d6d}' +
    '.tshead{display:flex;align-items:center;gap:12px}.tsflame{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--tier) 22%,transparent);font-size:20px;color:var(--tier)}' +
    '.tscopy{display:flex;flex-direction:column;gap:2px;min-width:0}.tscopy b{font-size:16px}.tscopy span{font-size:12px;color:var(--mut,#aab);line-height:1.35}' +
    '.tsbest{margin-left:auto;text-align:right;line-height:1}.tsbest small{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut,#aab)}.tsbest b{font-size:20px}' +
    '.tsweek{display:flex;gap:6px;margin:10px 0 8px}.tsdot{flex:1;text-align:center;padding:5px 0;border-radius:8px;font-size:11px;font-weight:700;background:rgba(255,255,255,.05);color:var(--mut,#889)}' +
    '.tsdot.on{background:var(--tier);color:#071018;box-shadow:0 0 12px color-mix(in srgb,var(--tier) 55%,transparent)}' +
    '.tsfoot{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--mut,#aab)}' +
    '.tspill{padding:2px 8px;border-radius:999px;border:1px solid var(--tier);color:var(--tier);font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:9px}' +
    '.tstreak.compact .tsweek{display:none}.tstreak.compact{padding:10px 12px}' +
    '.tslist{display:grid;gap:8px}.tsms{display:grid;grid-template-columns:38px 1fr auto;gap:10px;align-items:center;padding:9px 11px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);opacity:.55;transition:opacity .3s,transform .3s}' +
    '.tsms.common{--tier:#35c9e8}.tsms.rare{--tier:#8d7bff}.tsms.epic{--tier:#ff9f43}.tsms.legendary{--tier:#ff4d6d}' +
    '.ts-pop.common{--tier:#35c9e8}.ts-pop.rare{--tier:#8d7bff}.ts-pop.epic{--tier:#ff9f43}.ts-pop.legendary{--tier:#ff4d6d}' +
    '.tsms.got{opacity:1;border-color:color-mix(in srgb,var(--tier,#35c9e8) 55%,transparent);background:color-mix(in srgb,var(--tier,#35c9e8) 10%,transparent);transform:translateX(2px)}' +
    '.tsms.rare{border-style:double;border-width:3px}.tsmd{font:800 15px var(--sans,system-ui,sans-serif);text-align:center;color:var(--tier,#35c9e8)}' +
    '.tsms b{display:block;font-size:14px}.tsms small{display:block;font-size:12px;color:var(--mut,#aab);line-height:1.35}.tsmt{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut,#aab)}' +
    '.ts-pop{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px;border-radius:18px;border:2px solid var(--tier,#35c9e8);background:radial-gradient(circle at 50% 0,color-mix(in srgb,var(--tier,#35c9e8) 26%,transparent),transparent 70%),#080d16;text-align:center;animation:tsPop .5s cubic-bezier(.2,1.6,.4,1) both}' +
    '.ts-pop small{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--tier,#35c9e8)}.ts-pop b{font:800 24px var(--serif,Georgia,serif)}.ts-pop span{font-size:13px;color:var(--mut,#aab);max-width:34ch}' +
    '.ts-pop-art{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:32px;color:var(--tier,#35c9e8);border:2px solid var(--tier,#35c9e8);box-shadow:0 0 28px color-mix(in srgb,var(--tier,#35c9e8) 55%,transparent)}' +
    '.ts-pop.legendary{animation:tsPop .5s cubic-bezier(.2,1.6,.4,1) both,tsGlow 1.4s ease-in-out .5s infinite alternate}' +
    '@keyframes tsPop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}' +
    '@keyframes tsGlow{to{box-shadow:0 0 26px color-mix(in srgb,var(--tier,#ff4d6d) 45%,transparent)}}' +
    'html.reduce-fx .ts-pop,html.reduce-fx .ts-pop.legendary{animation:none}' +
    '@media (prefers-reduced-motion:reduce){.ts-pop,.ts-pop.legendary{animation:none}}';
  var st = document.createElement('style');
  st.id = 'tlp-streak-css'; st.textContent = css;
  if (document.head) document.head.appendChild(st);

  window.TLP_STREAK = {
    MILESTONES: MILESTONES,
    check: check,
    get: get,
    strip: strip,
    cardHtml: cardHtml,
    weekHtml: weekHtml,
    listHtml: listHtml,
    popHtml: popHtml,
    today: today,
    tierName: tierName
  };
})();
