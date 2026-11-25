(function () {
  'use strict';


  var FONTS = [['', 'Default'], ['mono', 'Monospace'], ['serif', 'Classic serif'], ['round', 'Rounded'], ['hand', 'Handwriting'], ['cond', 'Condensed'], ['type', 'Typewriter'], ['eleg', 'Elegant'], ['tech', 'Tech'], ['play', 'Playful'], ['gothic', 'Gothic'], ['script', 'Script']];
  var COLORS = [['', 'Theme default'], ['warm', 'Warm cream'], ['mint', 'Mint'], ['ice', 'Ice blue'], ['rose', 'Rose'], ['amber', 'Amber'], ['viol', 'Violet'], ['mono', 'Terminal green'], ['cyan', 'Cyan'], ['gold', 'Gold'], ['snow', 'Snow']];
  var EFFECTS = [['', 'None'], ['glow', 'Soft glow'], ['flow', 'Color flow'], ['pulse', 'Breathing glow'], ['rainbow', 'Rainbow'], ['sparkle', 'Sparkle'], ['scan', 'Shine sweep'], ['wave', 'Color wave']];
  var SURFS = [['glass', 'Glass'], ['solid', 'Solid'], ['outlined', 'Outlined'], ['neon', 'Neon']];
  var BLOCKS = [['soft', 'Soft'], ['sharp', 'Sharp'], ['outline', 'Outline'], ['neon', 'Neon glow'], ['ghost', 'Ghost'], ['glow', 'Idle glow']];
  var SCALES = [['sm', 'Compact'], ['md', 'Comfortable'], ['lg', 'Large']];
  var SITEBGS = [['auto', 'Classic orbs + grid'], ['stars', 'Starfield'], ['aurora', 'Aurora sky'], ['waves', 'Wave lines'], ['nebula', 'Nebula drift'], ['matrix', 'Digital rain'], ['bokeh', 'Bokeh'], ['orbit', 'Orbit nodes'], ['comets', 'Comet shower'], ['fireflies', 'Fireflies'], ['prism', 'Prism'], ['none', 'Clean flat']];

  var PREMIUM = {
    'font:eleg': { t: 'Earn 30 stars', ok: function (s) { return s.stars >= 30; } },
    'font:tech': { t: '7-day streak', ok: function (s) { return s.streak >= 7; } },
    'font:play': { t: '3 days with the game', ok: function (s) { return s.age >= 3; } },
    'font:gothic': { t: 'Earn 15 stars', ok: function (s) { return s.stars >= 15; } },
    'font:script': { t: '3-day account', ok: function (s) { return s.age >= 3; } },
    'fontcolor:viol': { t: 'Clear 2 chapters', ok: function (s) { return s.ch >= 2; } },
    'fontcolor:mono': { t: '5-day streak', ok: function (s) { return s.streak >= 5; } },
    'fontcolor:cyan': { t: 'Earn 10 stars', ok: function (s) { return s.stars >= 10; } },
    'fontcolor:gold': { t: 'Earn 20 stars', ok: function (s) { return s.stars >= 20; } },
    'textfx:flow': { t: 'Earn 40 stars', ok: function (s) { return s.stars >= 40; } },
    'textfx:pulse': { t: 'Clear 4 chapters', ok: function (s) { return s.ch >= 4; } },
    'textfx:rainbow': { t: 'Earn 30 stars', ok: function (s) { return s.stars >= 30; } },
    'textfx:sparkle': { t: '4-day account', ok: function (s) { return s.age >= 4; } },
    'textfx:scan': { t: 'Earn 15 stars', ok: function (s) { return s.stars >= 15; } },
    'textfx:wave': { t: '5-day streak', ok: function (s) { return s.streak >= 5; } },
    'surface:outlined': { t: 'Defeat a guardian', ok: function (s) { return s.badges >= 1; } },
    'surface:neon': { t: 'Earn 15 stars', ok: function (s) { return s.stars >= 15; } },
    'blocks:outline': { t: 'Earn 20 stars', ok: function (s) { return s.stars >= 20; } },
    'blocks:sharp': { t: '5-day streak', ok: function (s) { return s.streak >= 5; } },
    'blocks:neon': { t: 'Earn 10 stars', ok: function (s) { return s.stars >= 10; } },
    'blocks:glow': { t: 'Earn 10 stars', ok: function (s) { return s.stars >= 10; } },
    'sitebg:matrix': { t: 'Earn 20 stars', ok: function (s) { return s.stars >= 20; } },
    'sitebg:nebula': { t: '5-day streak', ok: function (s) { return s.streak >= 5; } },
    'sitebg:orbit': { t: 'Clear 3 chapters', ok: function (s) { return s.ch >= 3; } },
    'sitebg:comets': { t: 'Earn 30 stars', ok: function (s) { return s.stars >= 30; } },
    'sitebg:fireflies': { t: '7-day streak', ok: function (s) { return s.streak >= 7; } },
    'sitebg:prism': { t: 'Clear 10 chapters', ok: function (s) { return s.ch >= 10; } }
  };

  var ROWS = [
    ['sitebg', 'Site background', SITEBGS, 'auto'],
    ['font', 'Typeface', FONTS, ''],
    ['fontcolor', 'Text colour', COLORS, ''],
    ['textfx', 'Heading effect', EFFECTS, ''],
    ['surface', 'Panel style', SURFS, 'glass'],
    ['blocks', 'Block style', BLOCKS, 'soft'],
    ['uiscale', 'Text size', SCALES, 'md']
  ];
  var PREFIX = { font: 'fnt-', fontcolor: 'ftc-', textfx: 'txf-', surface: 'surf-', blocks: 'blks-', uiz: 'uiz-' };
  var ALL_CLASSES = [];
  ROWS.forEach(function (r) {
    r[2].forEach(function (o) { if (PREFIX[r[0]] && o[0]) ALL_CLASSES.push(PREFIX[r[0]] + o[0]); });
  });


  function settingsKey() {
    var id = 'guest';
    try { var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner(); if (l && l.id) id = l.id; } catch (e) {}
    return 'tlp-settings:' + id;
  }
  function settingsAll() {
    try {
      var own = JSON.parse(localStorage.getItem(settingsKey()) || '{}');
      var k = settingsKey(), merged = {};
      if (k !== 'tlp-settings:default') { try { merged = JSON.parse(localStorage.getItem('tlp-settings:default') || '{}'); } catch (e) {} }
      try {
        var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner ? TLP_AUTH.getActiveLearner() : null;
        var lk = l && l.avatar && l.avatar.look;
        if (lk && typeof lk === 'object') merged = Object.assign(merged, lk);
      } catch (e) {}
      return Object.assign(merged, own);
    } catch (e) { return {}; }
  }
  function pref(k, def) { var v = settingsAll()[k]; return v === undefined ? def : v; }
  function setPref(k, v) {
    var p = settingsAll(); p[k] = v;
    try { localStorage.setItem(settingsKey(), JSON.stringify(p)); } catch (e) {}
    try { window.dispatchEvent(new Event('tlp-prefs-change')); } catch (e) {}
    try { if (window.TLP_AVATAR && TLP_AVATAR.setLook) TLP_AVATAR.setLook({ [k]: v }); } catch (e) {}
  }


  function isAdmin() { try { return !!(window.TLP_AUTH && TLP_AUTH.isCurrentUserAdmin && TLP_AUTH.isCurrentUserAdmin()); } catch (e) { return false; } }
  function stats() {
    var st = { ch: 0, stars: 0, streak: 0, badges: 0 };
    try { if (window.TLP_AVATAR && TLP_AVATAR.stats) st = Object.assign(st, TLP_AVATAR.stats()); } catch (e) {}
    var born = 0;
    try { born = +localStorage.getItem('tlp-firstseen') || 0; if (!born) { born = Date.now(); localStorage.setItem('tlp-firstseen', String(born)); } } catch (e) {}
    try { var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner ? TLP_AUTH.getActiveLearner() : null; var c = l && (l.created_at || l.createdAt); if (c) { var t = +new Date(c); if (t > born) born = t; } } catch (e) {}
    return { ch: st.ch || 0, stars: st.stars || 0, streak: st.streak || 0, badges: st.badges || 0, age: born ? Math.floor((Date.now() - born) / 86400000) : 0 };
  }
  function premiumOK(cat, v) {
    var p = PREMIUM[cat + ':' + v]; if (!p) return true;
    if (isAdmin()) return true;
    return p.ok(stats());
  }


  function apply() {
    var b = document.body; if (!b) return;
    b.classList.remove.apply(b.classList, ALL_CLASSES);
    ROWS.forEach(function (r) {
      if (!PREFIX[r[0]]) return;
      var k = r[0], v = pref(k, r[3]), cls = PREFIX[k] + v;
      if (v && premiumOK(k, v)) b.classList.add(cls);
    });
    try { if (window.TLP_COMMON && TLP_COMMON.siteBgApply) TLP_COMMON.siteBgApply(); } catch (e) {}
  }


  var modal = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'tlpm ui-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    var rows = ROWS.map(function (r) {
      var k = r[0], label = r[1], opts = r[2], cur = pref(k, r[3]);
      var os = opts.map(function (o) {
        var v = o[0], name = o[1];
        var p = PREMIUM[k + ':' + v];
        var dis = p && !premiumOK(k, v);
        var txt = dis ? '🔒 ' + name + ' · ' + p.t : name;
        return '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + (dis ? ' disabled' : '') + '>' + esc(txt) + '</option>';
      }).join('');
      return '<label class="look-row"><span>' + esc(label) + '</span><select data-k="' + k + '">' + os + '</select></label>';
    }).join('');
    modal.innerHTML =
      '<div class="tlpm-pan ui-pan look-pan">' +
      '<header class="ui-head"><div><span class="lab">YOUR SPACE</span><h2>Make it yours</h2>' +
      '<p>The same look follows you into the game and every page — synced to your account.</p></div>' +
      '<button class="tlpm-btn" id="lookX" type="button" aria-label="Close">✕</button></header>' +
      '<div class="look-rows">' + rows + '</div>' +
      '<div class="tlpm-row"><button class="tlpm-btn pri" id="lookApply" type="button">Apply appearance</button>' +
      '<button class="tlpm-btn" id="lookCancel" type="button">Cancel</button></div>' +
      '<p class="look-note" id="lookNote"></p></div>';
    document.body.appendChild(modal);
    modal.querySelector('#lookX').onclick = close;
    modal.querySelector('#lookCancel').onclick = close;
    modal.querySelector('#lookApply').onclick = function () {
      modal.querySelectorAll('select[data-k]').forEach(function (s) {
        var k = s.dataset.k, v = s.value;
        var p = PREMIUM[k + ':' + v];
        if (p && !premiumOK(k, v)) return;
        setPref(k, v);
      });
      apply();
      close();
    };
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  }
  function open() {
    if (!modal) buildModal();

    modal.querySelectorAll('select[data-k]').forEach(function (s) {
      var k = s.dataset.k, cur = pref(k, ROWS.filter(function (r) { return r[0] === k; })[0][3]);
      s.value = String(cur);
      s.querySelectorAll('option').forEach(function (o) {
        var p = PREMIUM[k + ':' + o.value];
        o.disabled = !!(p && !premiumOK(k, o.value));
      });
    });
    modal.hidden = false;
    document.body.classList.add('tlpm-open');
  }
  function close() { if (modal) modal.hidden = true; document.body.classList.remove('tlpm-open'); }


  function injectButton() {
    if (document.getElementById('lookBtn')) return;
    var b = document.createElement('button');
    b.id = 'lookBtn';
    b.type = 'button';
    b.className = 'lookbtn';
    b.setAttribute('aria-label', 'Customize appearance');
    b.innerHTML = ' <span>look</span>';
    b.onclick = open;
    document.body.appendChild(b);
  }
  function boot() {
    injectButton();
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('tlp-auth-ready', apply);
  window.addEventListener('tlp-prefs-change', apply);

  window.TLP_LOOK = { apply: apply, open: open, pref: pref, set: setPref, premiumOK: premiumOK };
})();
