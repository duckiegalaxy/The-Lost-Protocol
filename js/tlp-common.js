(function () {
  'use strict';
  if (window.TLP) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var osReduce = function () { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); };










  var VOL_KEY = 'tlp-volumes';
  var VOL_DEF = { master: 85, music: 60, narr: 100, fx: 80 };
  var VOL_LABEL = { master: 'Master volume', music: 'Music', narr: 'Narration voice', fx: 'Game sounds' };
  var VOL_DESC = {
    master: 'Moves everything up or down at once.',
    music: 'The background music.',
    narr: 'The voice that reads text aloud.',
    fx: 'Clicks, alarms and reward sounds.'
  };
  function volClamp(n) { n = Math.round(Number(n)); if (!isFinite(n)) return 0; return Math.max(0, Math.min(100, n)); }
  var Vol = {
    defaults: VOL_DEF,
    get: function () {
      var saved = null, out = {};
      try { saved = JSON.parse(store.get(VOL_KEY) || 'null'); } catch (e) {}
      Object.keys(VOL_DEF).forEach(function (k) {
        out[k] = saved && saved[k] != null ? volClamp(saved[k]) : VOL_DEF[k];
      });
      return out;
    },
    set: function (key, value) {
      if (!(key in VOL_DEF)) return;
      var all = Vol.get();
      all[key] = volClamp(value);
      store.set(VOL_KEY, JSON.stringify(all));
      Vol.apply(all);
      try { window.dispatchEvent(new CustomEvent('tlp-vol-change', { detail: all })); } catch (e) {}
    },

    factor: function (channel) {
      var all = Vol.get(), m = all.master / 100;
      return channel ? m * (all[channel] / 100) : m;
    },

    apply: function (all) {
      all = all || Vol.get();
      var outs = document.querySelectorAll('[data-vol-out]');
      for (var i = 0; i < outs.length; i++) {
        var k = outs[i].getAttribute('data-vol-out');
        outs[i].textContent = all[k] + '%';
      }
      var sl = document.querySelectorAll('[data-vol]');
      for (var j = 0; j < sl.length; j++) {
        var kk = sl[j].getAttribute('data-vol');
        sl[j].value = all[kk];
        sl[j].style.setProperty('--pct', all[kk] + '%');
      }
      try { if (window.TLP_MUSIC && window.TLP_MUSIC.setVolume) window.TLP_MUSIC.setVolume(); } catch (e) {}
    },

    ui: function () {
      var all = Vol.get();
      return '<div class="volset">' + Object.keys(VOL_DEF).map(function (k) {
        var id = 'vol-' + Math.random().toString(36).slice(2, 7) + '-' + k;
        return '<div class="volrow">' +
          '<label class="volhead" for="' + id + '"><b>' + VOL_LABEL[k] + '</b><small>' + VOL_DESC[k] + '</small></label>' +
          '<output class="volout" data-vol-out="' + k + '" for="' + id + '">' + all[k] + '%</output>' +
          '<input class="volrange" id="' + id + '" data-vol="' + k + '" type="range" min="0" max="100" step="5" value="' + all[k] + '" style="--pct:' + all[k] + '%">' +
          '</div>';
      }).join('') + '</div>';
    },
    wire: function (root, preview) {
      root = root || document;
      var sl = root.querySelectorAll('input[data-vol]');
      for (var i = 0; i < sl.length; i++) {
        sl[i].addEventListener('input', function () {
          Vol.set(this.getAttribute('data-vol'), this.value);
          this.style.setProperty('--pct', this.value + '%');
        });
        if (preview && sl[i].getAttribute('data-vol') === 'fx') {
          sl[i].addEventListener('change', function () { try { preview('chime'); } catch (e) {} });
        }
      }
      Vol.apply();
    }
  };


  var FX = {
    get: function () {
      var v = store.get('tlp-reduce-fx');
      if (v === '1') return true;
      if (v === '0') return false;
      if (store.get('tlp-fx') === 'off') return true;
      if (store.get('tlp-fx') === 'on') return false;



      return true;
    },
    set: function (on) {
      store.set('tlp-reduce-fx', on ? '1' : '0');
      store.set('tlp-fx', on ? 'off' : 'on');
      FX.apply();
    },
    apply: function () {
      var on = FX.get();
      document.documentElement.classList.toggle('reduce-fx', on);
      if (document.body) document.body.classList.toggle('calm', on);
      var h = $('#fx');
      if (h) { h.textContent = 'Reduce visual effects: ' + (on ? 'on' : 'off'); h.setAttribute('aria-pressed', on); }
      try { window.dispatchEvent(new CustomEvent('tlp-fx-change', { detail: { on: on } })); } catch (e) {}
    }
  };


  var Voice = {
    _isKid: function () {

      try {
        if (document.body && document.body.classList.contains('path-g16')) return true;
        return (localStorage.getItem('tlp-path') || '') === 'g16';
      } catch (e) { return false; }
    },
    localize: function (text) {
      var clean = String(text == null ? '' : text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return window.TLP_ARABIC && window.TLP_ARABIC.isActive() ? window.TLP_ARABIC.t(clean) : clean;
    },
    pick: function (arabic) {
      var vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
      if (arabic) return vs.filter(function (v) { return /^ar/i.test(v.lang); })[0] || null;
      var en = vs.filter(function (v) { return /^en/i.test(v.lang); });
      var pref;
      if (Voice._isKid()) {

        pref = en.filter(function (v) {
          return /(samantha|victoria|karen|moira|fiona|google us english|zira|hazel|susan|female|zoe|aria|jenny|sonia|ava)/i.test(v.name);
        })[0];

        if (!pref) pref = en.filter(function (v) {
          return !/(male|man|david|mark|guy|daniel|alex)/i.test(v.name);
        })[0];
      } else {

        pref = en.filter(function (v) {
          return /(google uk english male|daniel|alex|microsoft (guy|david|mark)|male)/i.test(v.name);
        })[0];
      }
      return pref || en[0] || null;
    },
    speak: function (text, onend) {
      if (!window.speechSynthesis) { if (onend) onend(); return; }
      if (Vol.factor('narr') <= 0) { if (onend) onend(); return; }
      Voice.stop();
      var clean = Voice.localize(text);
      var arabic = /[\u0600-\u06ff]/.test(clean);
      var parts = clean.match(/[^.!?]+[.!?]*/g) || [clean];
      var voice = Voice.pick(arabic), i = 0;
      var next = function () {
        if (i >= parts.length) { if (onend) onend(); return; }
        var t = parts[i++].trim();
        if (!t) return next();
        var u = new SpeechSynthesisUtterance(t);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = arabic ? 'ar-SA' : 'en-US'; }
        u.rate = Voice._isKid() ? 0.82 : 0.92;
        u.pitch = Voice._isKid() ? 1.15 : 0.75;
        u.volume = Vol.factor('narr');
        u.onend = function () { setTimeout(next, 160); };
        u.onerror = function () { setTimeout(next, 0); };
        speechSynthesis.speak(u);
      };
      next();
    },
    stop: function () { try { speechSynthesis.cancel(); } catch (e) {} }
  };


  Voice.speakSteps = function (texts, onstep, onend) {
    var list = (texts || []).map(function (t) {
      return Voice.localize(t);
    });
    if (!window.speechSynthesis) {
      list.forEach(function (_, i) { setTimeout(function () { if (onstep) onstep(i); }, i * 2100); });
      setTimeout(function () { if (onend) onend(); }, Math.max(600, list.length * 2100));
      return;
    }
    if (Vol.factor('narr') <= 0) {
      list.forEach(function (_, i) { setTimeout(function () { if (onstep) onstep(i); }, i * 2100); });
      setTimeout(function () { if (onend) onend(); }, Math.max(600, list.length * 2100));
      return;
    }
    Voice.stop();
    var i = 0;
    var next = function () {
      if (i >= list.length) { if (onend) onend(); return; }
      if (onstep) onstep(i);
      var t = list[i++];
      if (!t) return next();
      var arabic = /[\u0600-\u06ff]/.test(t);
      var voice = Voice.pick(arabic);
      var u = new SpeechSynthesisUtterance(t);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = arabic ? 'ar-SA' : 'en-US'; }
      u.rate = Voice._isKid() ? 0.82 : 0.92;
      u.pitch = Voice._isKid() ? 1.15 : 0.75;
      u.volume = Vol.factor('narr');
      u.onend = function () { setTimeout(next, 160); };
      u.onerror = function () { setTimeout(next, 0); };
      speechSynthesis.speak(u);
    };
    next();
  };
  if (window.speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = function () {};


  function profileName() {
    try {
      var A = window.TLP_AUTH;
      var u = A && A.getCurrentUser ? A.getCurrentUser() : null;
      if (u) {
        var l = A.getActiveLearner && A.getActiveLearner();
        var n = (l && l.name && l.name !== 'default' && !l.isGuest ? l.name : '') || u.displayName || '';
        if (n) return String(n).trim().slice(0, 30);
      }


      var local = '';
      try { local = localStorage.getItem('tlp-name') || ''; } catch (e2) {}
      local = String(local).trim();
      return local && local !== 'Player' ? local.slice(0, 30) : '';
    } catch (e) { return ''; }
  }



  function idleName() {
    var n = profileName();
    if (!n) return '';
    var s = ' ' + n + ' ';
    s = s.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ');
    s = s.replace(/\b(grades?|level|class|year|stage)\s*\d{1,2}(?:\s*(?:[-\u2013\u2014]+|to)\s*\d{1,2})?\b/gi, ' ');
    s = s.replace(/\b\d{1,2}\s*(?:[-\u2013\u2014]+|to)\s*\d{1,2}\b/g, ' ');
    s = s.replace(/\b(beginner|intermediate|professional|pro|adult|college|university|learner|qa|test|beg|int)\b/gi, ' ');
    s = s.replace(/[|·•,;/\\:_-]+/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    if (s.length < 2) return '';
    return s.slice(0, 30);
  }



  var IC = {
    star: '<polygon fill="black" points="12,2 15,9 22,9.3 16.5,14 18.2,21 12,17.2 5.8,21 7.5,14 2,9.3 9,9"/>',
    heart: '<path fill="black" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    bolt: '<polygon fill="black" points="13,2 4,14 11,14 10,22 20,9 13,9"/>',
    check: '<path d="M4 12l5 5L20 6" fill="none" stroke="black" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M5 5l14 14M19 5L5 19" fill="none" stroke="black" stroke-width="3" stroke-linecap="round"/>',
    user: '<circle cx="12" cy="8" r="4.2" fill="black"/><path d="M4 21c0-4.6 3.6-7 8-7s8 2.4 8 7z" fill="black"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="black"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="black" stroke-width="2.4"/>',
    key: '<circle cx="8" cy="12" r="4.5" fill="none" stroke="black" stroke-width="2.6"/><path d="M12.5 12H22M18 12v4M21 12v3" fill="none" stroke="black" stroke-width="2.6" stroke-linecap="round"/>',
    bulb: '<circle cx="12" cy="10" r="6.5" fill="black"/><rect x="9" y="17.5" width="6" height="3" rx="1" fill="black"/>',
    book: '<path fill="black" d="M3 4h8v16H3zM13 4h8v16h-8z"/>',
    chat: '<path fill="black" d="M3 4h18v12H11l-5 4v-4H3z"/>',
    bug: '<ellipse cx="12" cy="14" rx="5" ry="6.5" fill="black"/><circle cx="12" cy="6.5" r="3" fill="black"/><path d="M3 12h4M17 12h4M4 19l3-2M20 19l-3-2M5 6l3 2M19 6l-3 2" stroke="black" stroke-width="2" stroke-linecap="round" fill="none"/>',
    gear: '<circle cx="12" cy="12" r="4" fill="none" stroke="black" stroke-width="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="black" stroke-width="3" stroke-linecap="round"/>',
    volume: '<polygon fill="black" points="3,9 8,9 13,4 13,20 8,15 3,15"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="black" stroke-width="2.2" stroke-linecap="round"/>',
    mute: '<polygon fill="black" points="3,9 8,9 13,4 13,20 8,15 3,15"/><path d="M16 9l5 6M21 9l-5 6" stroke="black" stroke-width="2.4" stroke-linecap="round" fill="none"/>',
    chart: '<rect x="3" y="12" width="4" height="9" fill="black"/><rect x="10" y="6" width="4" height="15" fill="black"/><rect x="17" y="3" width="4" height="18" fill="black"/>',
    shield: '<path fill="black" d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z"/>',
    gem: '<polygon fill="black" points="6,3 18,3 22,9 12,22 2,9"/>',
    box: '<path fill="black" d="M12 2l9 5v10l-9 5-9-5V7z"/>',
    puzzle: '<path fill="black" d="M4 8h5a3 3 0 1 1 6 0h5v5a3 3 0 1 0 0 6v3H4z"/>',
    sparkle: '<polygon fill="black" points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10"/>',
    target: '<circle cx="12" cy="12" r="9" fill="none" stroke="black" stroke-width="2.4"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="black" stroke-width="2.4"/><circle cx="12" cy="12" r="1.6" fill="black"/>',
    flame: '<path fill="black" d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 4 1-3 1-6 1-9z"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5" fill="none" stroke="black" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    sun: '<circle cx="12" cy="12" r="4.5" fill="black"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="black" stroke-width="2.4" stroke-linecap="round"/>',
    crown: '<polygon fill="black" points="3,19 3,8 8,12 12,5 16,12 21,8 21,19"/>',
    gate: '<path fill="black" d="M3 4h7c6 0 11 3.5 11 8s-5 8-11 8H3z"/>',
    mask: '<circle cx="12" cy="12" r="9" fill="black"/>'
  };
  var iconCss = '.ic,i[class^=ic-]{display:inline-block;width:1.1em;height:1.1em;vertical-align:-.18em;background-color:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat}';
  Object.keys(IC).forEach(function (k) {
    iconCss += '.ic-' + k + '{--ic:url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + IC[k] + '</svg>') + '")}';
  });
  iconCss += '.navlink .sp{font-size:0;width:7px;height:7px;background:var(--a,#35c9e8);transform:rotate(45deg);border-radius:1px;display:inline-block}';
  var ico = function (n) { return '<i class="ic ic-' + n + '" aria-hidden="true"></i>'; };


  var css = '' +
    'html.reduce-fx *,html.reduce-fx *::before,html.reduce-fx *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;scroll-behavior:auto!important}' +


    'html.reduce-fx #rain,html.reduce-fx #scan,html.reduce-fx .spark{display:none!important}' +
    'html.reduce-fx .aurora,html.reduce-fx #ambOrbs i{animation:none!important}' +



    '#bgGrid{display:none;position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(color-mix(in srgb,var(--a,#35c9e8) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--a,#35c9e8) 9%,transparent) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,#000 30%,transparent 100%);mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,#000 30%,transparent 100%)}' +
    'body.bg-grid #bgGrid{display:block}' +
    'body.bg-grid #ambOrbs{opacity:.4}' +
    'body.bg-orbs #ambOrbs i{opacity:.3;filter:blur(100px)}' +
    'body.bg-aurora #ambOrbs i{opacity:.3;filter:blur(90px) saturate(1.4);animation-duration:22s,30s}' +
    'body.bg-aurora #ambOrbs{filter:hue-rotate(0deg);animation:bgAuroraHue 26s linear infinite}' +
    'body.bg-none #ambOrbs,body.bg-none #bgGrid,body.bg-none #ambientCanvas{display:none!important}' +
    '@keyframes bgAuroraHue{0%{filter:hue-rotate(0deg)}50%{filter:hue-rotate(60deg)}100%{filter:hue-rotate(0deg)}}' +


    '#ambOrbs{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}' +
    '#ambOrbs i{position:absolute;border-radius:50%;filter:blur(80px);opacity:.15;animation:ambOrbA 30s ease-in-out infinite,ambOrbB 38s ease-in-out infinite}' +
    '#ambOrbs i:nth-child(1){width:46vmax;height:46vmax;left:-14vmax;top:-12vmax;background:radial-gradient(circle,var(--a,#35c9e8),transparent 66%)}' +
    '#ambOrbs i:nth-child(2){width:38vmax;height:38vmax;right:-12vmax;top:28%;background:radial-gradient(circle,#a78bfa,transparent 66%);animation-delay:-11s,-17s}' +
    '#ambOrbs i:nth-child(3){width:32vmax;height:32vmax;left:32%;bottom:-16vmax;background:radial-gradient(circle,#34d399,transparent 66%);animation-delay:-21s,-8s}' +
    '@keyframes ambOrbA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(7vmax,-4vmax) scale(1.12)}}' +
    '@keyframes ambOrbB{0%,100%{transform:translate(0,0)}50%{transform:translate(-6vmax,5vmax)}}' +
    '#tlpFxBtn{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:40;min-height:36px;padding:6px 14px;border-radius:999px;border:1px solid var(--line,rgba(255,255,255,.2));background:color-mix(in srgb,var(--bg,#0b0f14) 80%,transparent);color:var(--fg,#f3efe8);font:600 13px var(--sans,system-ui,sans-serif);cursor:pointer}' +
    '#tlpFxBtn:focus-visible{outline:2px solid var(--a,#35c9e8);outline-offset:2px}' +

    '#tlpIdle{position:fixed;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:20px;background:rgba(5,8,12,.82);color:#f3efe8;font-family:var(--sans,system-ui,sans-serif);animation:tlpFade .4s ease both}' +
    '#tlpIdle.out{animation:tlpFadeOut .5s ease both}' +
    '@keyframes tlpFade{from{opacity:0}to{opacity:1}}@keyframes tlpFadeOut{to{opacity:0}}' +
    '#tlpIdle .bubble{position:relative;max-width:min(88vw,460px);padding:18px 24px;border-radius:20px;background:linear-gradient(180deg,#fbf8f2,#efe9dd);color:#0b0f14;font:700 clamp(18px,3.6vw,24px)/1.35 var(--sans,system-ui,sans-serif);text-align:center;box-shadow:0 18px 46px #0007,inset 0 1px 0 #fff}' +
    '#tlpIdle .bubble:after{content:"";position:absolute;left:50%;bottom:-12px;margin-left:-12px;border:12px solid transparent;border-top-color:#efe9dd;border-bottom:0}' +
    '#tlpIdle .bubble b{font-weight:900;color:var(--a,#35c9e8)}' +
    '#tlpIdle svg{width:clamp(130px,26vw,210px);height:auto;overflow:visible}' +
    '#tlpIdle .rb *{stroke:var(--a,#35c9e8);stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round}' +
    '#tlpIdle .rb .fl{fill:var(--a,#35c9e8);stroke:none}' +
    '#tlpIdle .eye{transform-box:fill-box;transform-origin:center;animation:tlpBlink 3.2s infinite}' +
    '#tlpIdle .arm{transform-box:fill-box;transform-origin:20% 90%;animation:tlpWave 1.2s ease-in-out infinite}' +
    '#tlpIdle .ant{transform-box:fill-box;transform-origin:50% 100%;animation:tlpSway 2s ease-in-out infinite}' +
    '@keyframes tlpBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}' +
    '@keyframes tlpWave{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(22deg)}}' +
    '@keyframes tlpSway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}' +
    '#tlpIdle button{min-height:52px;padding:0 34px;border-radius:999px;border:0;background:var(--a,#35c9e8);color:#0b0f14;font:800 18px var(--sans,system-ui,sans-serif);cursor:pointer}' +
    '#tlpIdle button:focus-visible{outline:3px solid #fff;outline-offset:3px}' +


    '#tlpIdle.idle-jump{background:#02040a;animation:jdFade .5s ease-out both,jdQuake .62s .04s cubic-bezier(.36,.07,.19,.97) 1}' +
    '#tlpIdle.idle-jump .jd-face{position:relative;width:clamp(150px,30vw,230px);height:clamp(150px,30vw,230px);border-radius:42% 42% 38% 38%;background:#0b0f14;border:3px solid #ff3355;box-shadow:0 0 44px #ff335566,inset 0 0 44px #000;display:grid;grid-template-columns:1fr 1fr;align-content:center;gap:20px;padding:32px;animation:jdShake .5s .05s 1}' +
    '#tlpIdle.idle-jump .jd-eye{height:clamp(18px,3.4vw,26px);border-radius:50%;background:#ff3355;box-shadow:0 0 18px #ff3355;animation:jdBlink 1.8s .5s infinite}' +
    '#tlpIdle.idle-jump .jd-mouth{grid-column:1/-1;height:12px;border-radius:0 0 16px 16px;background:#ff3355;opacity:.9;margin:8px 24px 0}' +
    '#tlpIdle.idle-jump .bubble{background:linear-gradient(165deg,#220a12,#0c0207 72%);color:#ffd7de;border:1px solid #ff335540;border-radius:22px;padding:22px 28px;font:600 clamp(18px,3.4vw,26px)/1.4 var(--sans,system-ui,sans-serif);letter-spacing:.01em;box-shadow:0 26px 70px #000b,0 0 42px #ff33551c,inset 0 1px 0 #ffffff10;animation:jdGlow 2.6s ease-in-out infinite}' +
    '#tlpIdle.idle-jump .bubble:after{display:none}' +
    '#tlpIdle.idle-jump .bubble b{color:#ff5c78;font-weight:900;text-shadow:0 0 24px #ff335588}' +
    '@keyframes jdGlow{0%,100%{box-shadow:0 26px 70px #000b,0 0 42px #ff33551c,inset 0 1px 0 #ffffff10}50%{box-shadow:0 26px 70px #000b,0 0 58px #ff335534,inset 0 1px 0 #ffffff10}}' +
    '#tlpIdle.idle-jump button{background:#ff3355;color:#0b0f14}' +
    '#tlpIdle.idle-jump .jd-off{min-height:32px;padding:0 10px;border:0;background:transparent;color:#a9b6c7;font:600 13px var(--sans,system-ui,sans-serif);text-decoration:underline}' +
    '@keyframes jdFade{0%{opacity:0}18%{opacity:1}100%{opacity:1}}' +
    '@keyframes jdShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-9px,4px)}40%{transform:translate(8px,-5px)}60%{transform:translate(-6px,-3px)}80%{transform:translate(4px,3px)}}' +
    '@keyframes jdQuake{0%,100%{transform:translate(0,0)}10%{transform:translate(-12px,6px)}20%{transform:translate(11px,-8px)}30%{transform:translate(-9px,-5px)}40%{transform:translate(10px,7px)}50%{transform:translate(-7px,4px)}60%{transform:translate(6px,-5px)}70%{transform:translate(-4px,3px)}80%{transform:translate(3px,-2px)}90%{transform:translate(-2px,1px)}}' +
    '@keyframes jdBlink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.08)}}' +


    '#tlpIdle.idle-kid{background:radial-gradient(circle at 50% 35%,#24163a,#0a0714 70%);animation:tlpFade .4s ease both}' +
    '#tlpIdle.idle-kid .bubble{background:#ffe9f3;color:#3a1230;border:2px dashed #ff9ec7;box-shadow:0 10px 30px #ff9ec733}' +
    '#tlpIdle.idle-kid .bubble:after{border-top-color:#ffe9f3}' +
    '#tlpIdle.idle-kid .bubble b{color:#d81b74}' +
    '#tlpIdle.idle-kid .rb{animation:kidBob 1.5s ease-in-out infinite}' +
    '#tlpIdle.idle-kid .rb *{stroke:#ff9ec7}' +
    '#tlpIdle.idle-kid .rb .fl{fill:#ff9ec7}' +
    '#tlpIdle.idle-kid button{background:#ff9ec7;color:#2a0a1d}' +
    '@keyframes kidBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}' +
    'html.reduce-fx #tlpIdle.idle-jump{animation:jdFade .5s ease-out both}' +
    'html.reduce-fx #tlpIdle.idle-kid .rb{animation:none}' +
    'html.reduce-fx #tlpIdle.idle-jump .jd-eye{animation:none}' +

    '.tlpm{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px;background:rgba(5,8,12,.72)}' +
    '.tlpm[hidden]{display:none!important}' +
    '.tlpm-pan{position:relative;width:min(520px,100%);max-height:92vh;overflow:auto;padding:24px 22px;border-radius:20px;border:1px solid var(--a,#35c9e8);background:var(--bg,#0b0f14);color:var(--fg,#f3efe8);font-family:var(--sans,system-ui,sans-serif)}' +
    '.tlpm-pan h2{margin:0 36px 6px 0;font:800 24px var(--serif,Georgia,serif)}' +
    '.tlpm-pan p.s{margin:0 0 14px;color:var(--mut,#aab);font-size:14px}' +
    '.tlpm-x{position:absolute;top:12px;right:12px;width:44px;height:44px;border-radius:50%;border:1px solid var(--line,rgba(255,255,255,.2));background:transparent;color:inherit;font-size:18px;cursor:pointer}' +
    '.tlpm-pan label{display:block;margin:12px 0 4px;font:700 12px var(--sans,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase;color:var(--mut,#aab)}' +
    '.tlpm-pan input,.tlpm-pan select,.tlpm-pan textarea{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:12px;border:1px solid var(--line,rgba(255,255,255,.2));background:transparent;color:inherit;font:15px var(--sans,system-ui,sans-serif)}' +
    '.tlpm-pan select option{color:var(--fg,#111)}' +
    '.tlpm-row{display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}' +
    '.tlpm-btn{min-height:44px;padding:0 22px;border-radius:999px;border:1px solid var(--line,rgba(255,255,255,.25));background:transparent;color:inherit;font:700 15px var(--sans,system-ui,sans-serif);cursor:pointer}' +
    '.tlpm-btn.pri{background:var(--a,#35c9e8);border-color:transparent;color:var(--ink,#0b0f14)}' +
    '.tlpm-btn:disabled{opacity:.6;cursor:default}' +
    '.tlpm-note{min-height:1.2em;margin-top:10px;font-size:14px}' +

    '.tlpm-pan a{color:var(--a,#35c9e8);text-underline-offset:3px}' +

    '.story{margin:14px 0;padding:14px 16px;border:1px solid color-mix(in srgb,var(--a,#35c9e8) 30%,transparent);border-left:3px solid var(--a,#35c9e8);border-radius:14px;background:linear-gradient(160deg,color-mix(in srgb,var(--a,#35c9e8) 11%,transparent),color-mix(in srgb,var(--a,#35c9e8) 4%,transparent));box-shadow:0 8px 24px rgba(0,0,0,.18);animation:storyPanelIn .5s ease both}' +
    '.sline{position:relative;display:flex;flex-direction:column;gap:2px;margin:9px 0 9px 14px;padding-left:13px;font-size:14px;line-height:1.5;border-left:2px solid color-mix(in srgb,var(--a,#35c9e8) 30%,transparent)}' +
    '.sline:before{content:"";position:absolute;left:-5px;top:5px;width:8px;height:8px;border-radius:50%;background:var(--a,#35c9e8);box-shadow:0 0 8px var(--a,#35c9e8)}' +
    '.sp-l:before{background:#f2c94c;box-shadow:0 0 8px #f2c94c}.sp-u:before{background:#3ddc84;box-shadow:0 0 8px #3ddc84}.sp-r:before{background:#35c9e8;box-shadow:0 0 8px #35c9e8}.sp-s:before{background:#ef7a8c;box-shadow:0 0 8px #ef7a8c}' +
    '.sline b{font:800 11px var(--sans,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase;opacity:.8}' +
    '.sp-l b{color:#f2c94c}.sp-u b{color:#3ddc84}.sp-r b{color:#35c9e8}.sp-s b{color:#ef7a8c}' +
    '@keyframes storyPanelIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
    '@keyframes storyLineIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +


    'header nav .wrap{position:relative}' +
    '.navmenu-btn{display:inline-flex;align-items:center;gap:9px;height:40px;padding:0 17px;border-radius:999px;border:1px solid var(--line,rgba(255,255,255,.2));background:color-mix(in srgb,var(--a,#35c9e8) 10%,transparent);color:var(--fg,#f3efe8);font:700 13px var(--sans,system-ui,sans-serif);letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,background .2s}' +
    '.navmenu-btn:hover,.navmenu-btn[aria-expanded=true]{border-color:var(--a,#35c9e8);background:color-mix(in srgb,var(--a,#35c9e8) 20%,transparent)}' +
    '.navmenu-btn:focus-visible{outline:2px solid var(--a,#35c9e8);outline-offset:3px}' +
    '.navmenu-btn .mbars{display:grid;gap:4px;width:15px;flex:none}' +
    '.navmenu-btn .mbars i{display:block;height:2px;border-radius:2px;background:currentColor;transition:transform .25s,opacity .2s}' +
    '.navmenu-btn[aria-expanded=true] .mbars i:nth-child(1){transform:translateY(6px) rotate(45deg)}' +
    '.navmenu-btn[aria-expanded=true] .mbars i:nth-child(2){opacity:0}' +
    '.navmenu-btn[aria-expanded=true] .mbars i:nth-child(3){transform:translateY(-6px) rotate(-45deg)}' +
    '.navpanel{position:absolute;top:calc(100% + 8px);right:0;z-index:40;width:min(330px,calc(100vw - 32px));max-height:min(76vh,600px);overflow:auto;padding:10px;border:1px solid var(--line,rgba(255,255,255,.2));border-radius:18px;background:color-mix(in srgb,var(--bg,#0b0f14) 94%,#000);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 26px 70px #000a;display:grid;gap:4px;animation:navpanelIn .18s ease both}' +
    '.navpanel[hidden]{display:none!important}' +
    '@keyframes navpanelIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}' +
    '.navpanel .navlinks{display:grid;gap:3px}' +
    '.navpanel .navlink{display:flex;width:100%;box-sizing:border-box;justify-content:flex-start;gap:12px;background:transparent;box-shadow:none;transform:none;padding:12px 14px;border-radius:12px;font:700 14.5px var(--sans,system-ui,sans-serif);letter-spacing:.01em;color:var(--fg,#f3efe8);white-space:normal;height:auto;min-height:0}' +
    '.navpanel .navlink::before,.navpanel .navlink::after{display:none}' +
    '.navpanel .navlink .sp{color:var(--a,#35c9e8);font-size:12px;animation:none}' +
    '.navpanel .navlink:hover,.navpanel .navlink:focus-visible{background:color-mix(in srgb,var(--a,#35c9e8) 13%,transparent);transform:none;box-shadow:none;outline:none}' +
    '.navpanel .navlink.on{background:color-mix(in srgb,var(--a,#35c9e8) 17%,transparent);color:var(--fg,#f3efe8);box-shadow:inset 3px 0 0 var(--a,#35c9e8)}' +
    '.navpanel .navlink.on .sp{color:var(--a,#35c9e8)}' +
    '.navpanel .navpanel-tools{margin-top:4px;padding:12px 6px 4px;border-top:1px solid var(--line,rgba(255,255,255,.2))}' +
    '.navpanel .tools{display:flex;flex-wrap:wrap;gap:9px;align-items:center;width:100%}' +
    'header nav .wrap.has-menu{height:60px;flex-wrap:nowrap;justify-content:space-between;gap:10px;padding-top:0;padding-bottom:0}' +
    '@media(max-width:900px){header nav .wrap.has-menu{height:56px;padding-top:0;padding-bottom:0}header nav .wrap.has-menu .logo{flex:0 1 auto;text-align:left;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}' +
    '@media(max-width:620px){header nav .wrap.has-menu .navmenu-btn{padding:0 11px}}' +
    '@media(max-width:520px){header nav .wrap.has-menu .themetog{width:34px;height:34px;padding:0;justify-content:center}header nav .wrap.has-menu .themetog span{width:26px;height:26px}header nav .wrap.has-menu .themetog span:not(.on){display:none}}' +
    '@media(max-width:420px){header nav .wrap.has-menu .navmenu-btn{width:40px;padding:0;justify-content:center}header nav .wrap.has-menu .navmenu-btn>span:not(.mbars){display:none}}' +

    '.volset{display:grid;gap:10px;margin:6px 0 2px}' +
    '.volrow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:2px 12px;padding:10px 12px;border:1px solid var(--line,rgba(255,255,255,.2));border-radius:13px;background:color-mix(in srgb,var(--bg,#0b0f14) 55%,transparent)}' +
    '.volrow .volhead{display:grid;gap:1px;grid-column:1;cursor:pointer}' +
    '.volrow .volhead b{font:700 14px var(--sans,system-ui,sans-serif);color:var(--fg,#f3efe8)}' +
    '.volrow .volhead small{font-size:12.5px;color:var(--mut,#aab);line-height:1.35}' +
    '.volrow .volout{grid-column:2;grid-row:1;font:700 13px var(--sans,system-ui,sans-serif);color:var(--a,#35c9e8);font-variant-numeric:tabular-nums;min-width:42px;text-align:right}' +
    '.volrow .volrange{grid-column:1/-1;width:100%;height:22px;margin:6px 0 0;padding:0;background:transparent;border:0;cursor:pointer;-webkit-appearance:none;appearance:none}' +
    '.volrange::-webkit-slider-runnable-track{height:6px;border-radius:99px;background:linear-gradient(90deg,var(--a,#35c9e8) 0 var(--pct,50%),color-mix(in srgb,var(--fg,#fff) 18%,transparent) var(--pct,50%) 100%)}' +
    '.volrange::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#fff;border:2px solid var(--a,#35c9e8);box-shadow:0 2px 8px #0006}' +
    '.volrange::-moz-range-track{height:6px;border-radius:99px;background:color-mix(in srgb,var(--fg,#fff) 18%,transparent)}' +
    '.volrange::-moz-range-progress{height:6px;border-radius:99px;background:var(--a,#35c9e8)}' +
    '.volrange::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--a,#35c9e8)}' +
    '.volrange:focus-visible{outline:2px solid var(--a,#35c9e8);outline-offset:4px;border-radius:999px}' +
    '.volnote{margin:0 0 8px;font-size:13px;color:var(--mut,#aab)}';
  var st = document.createElement('style');
  st.id = 'tlp-common-css';
  st.textContent = css + iconCss;
  document.head.appendChild(st);


  function openBugReport(area) {
    var m = $('#tlpBug');
    if (!m) {
      m = document.createElement('div');
      m.id = 'tlpBug';
      m.className = 'tlpm';
      m.hidden = true;
      m.innerHTML = '<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="tlpBugT">' +
        '<button class="tlpm-x" type="button" aria-label="Close" id="tlpBugX"><i class="ic ic-close"></i></button>' +
        '<h2 id="tlpBugT">Report a bug</h2><p class="s">Tell us what went wrong. Please do not include passwords.</p>' +
        '<form id="tlpBugF" autocomplete="off">' +
        '<label for="tbTitle">Short title</label><input id="tbTitle" maxlength="120" required>' +
        '<label for="tbArea">Where did it happen?</label><select id="tbArea"><option>Home page</option><option>Sign in or register</option><option>Parent area</option><option>Game</option><option>Leaderboard</option><option>Chat robot</option><option>Other</option></select>' +
        '<label for="tbDesc">What happened?</label><textarea id="tbDesc" rows="3" maxlength="1500" required></textarea>' +
        '<label for="tbSteps">Steps to repeat it (optional)</label><textarea id="tbSteps" rows="2" maxlength="1500"></textarea>' +
        '<label for="tbExp">What did you expect? (optional)</label><textarea id="tbExp" rows="2" maxlength="1000"></textarea>' +
        '<label for="tbFile">Picture or short video (optional)</label><input id="tbFile" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm">' +
        '<p class="s" style="margin:6px 0 0;font-size:13px">Pictures up to 5 MB, videos up to 20 MB. Only the site administrator can see attachments. You must be signed in to attach a file.</p>' +
        '<input id="tbHp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">' +
        '<p class="tlpm-note" id="tbNote" role="status" aria-live="polite"></p>' +
        '<div class="tlpm-row"><button type="button" class="tlpm-btn" id="tbCancel">Cancel</button><button type="submit" class="tlpm-btn pri" id="tbSend">Send report</button></div></form></div>';
      document.body.appendChild(m);
      var close = function () { m.hidden = true; };
      $('#tlpBugX').onclick = close; $('#tbCancel').onclick = close;
      m.addEventListener('click', function (e) { if (e.target === m) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) close(); });
      $('#tlpBugF').addEventListener('submit', async function (e) {
        e.preventDefault();
        if ($('#tbHp').value) return;
        var note = $('#tbNote'), btn = $('#tbSend');
        var last = +store.get('tlp-bug-last') || 0;
        if (Date.now() - last < 20000) { note.textContent = 'Please wait a moment before sending another report.'; return; }
        if (!window.TLP_AUTH) { note.textContent = 'Bug reports are not available on this page.'; return; }
        btn.disabled = true; note.textContent = 'Sending...';
        try {
          await window.TLP_AUTH.init();
          var att = null, file = $('#tbFile').files && $('#tbFile').files[0];
          if (file) { note.textContent = 'Uploading the attachment...'; att = await window.TLP_AUTH.uploadBugAttachment(file); }
          var r = await window.TLP_AUTH.submitBugReport({
            title: $('#tbTitle').value, description: $('#tbDesc').value, pageFeature: $('#tbArea').value,
            stepsToReproduce: $('#tbSteps').value, expectedVsActual: $('#tbExp').value,
            attachmentPath: att && att.path, attachmentType: att && att.type
          });
          store.set('tlp-bug-last', String(Date.now()));
          note.textContent = r && r.isCloud === false ? 'Saved on this device (offline mode). Thank you!' : 'Report sent. Thank you for helping us improve!';
          $('#tlpBugF').reset();
          setTimeout(function () { m.hidden = true; note.textContent = ''; }, 1800);
        } catch (err) {
          note.textContent = 'Could not send the report: ' + (err && err.message ? err.message : 'unknown error');
        } finally { btn.disabled = false; }
      });
    }
    if (area) { var sel = $('#tbArea'); for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === area || sel.options[i].getAttribute('data-tlp-ar-option') === area) sel.selectedIndex = i; }
    m.hidden = false;
    setTimeout(function () { var t = $('#tbTitle'); if (t) t.focus(); }, 30);
  }


  var IDLE_MS = 60000, idleT = null, isDown = false;
  try { var qi = parseInt(new URLSearchParams(location.search).get('idle'), 10); if (qi >= 3 && qi <= 600) IDLE_MS = qi * 1000; } catch (e) {}
  function idleOk() {
    if (document.hidden) return false;
    if (isDown) return false;
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && (a.value || '').length) return false;
    if (a && a.isContentEditable) return false;
    if (window.TLP_BUSY) return false;
    if ($('#cine') || $('.tlpm:not([hidden])')) return false;
    return true;
  }
  function hideIdle() { var p = $('#tlpIdle'); if (p) p.remove(); }

  function idleWait() { try { return (window.TLP_AFK && window.TLP_AFK.ms) || IDLE_MS; } catch (e) { return IDLE_MS; } }
  function jumpOn() {
    try { return !!(window.TLP_AFK && window.TLP_AFK.enabled && window.TLP_AFK.enabled() && !FX.get()); }
    catch (e) { return false; }
  }


  function jumpSting() {
    if (store.get('tlp-mute') === '1') return;
    var lv = Vol.factor('fx');
    if (lv <= 0) return;
    try {
      var AC = new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(52, t + .5);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.16 * lv, t + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + .72);
      o.connect(g); g.connect(AC.destination);
      o.start(t); o.stop(t + .78);

      var dur = .22, buf = AC.createBuffer(1, Math.floor(AC.sampleRate * dur), AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      var src = AC.createBufferSource(), bp = AC.createBiquadFilter(), ng = AC.createGain();
      src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = .9;
      ng.gain.setValueAtTime(.0001, t); ng.gain.exponentialRampToValueAtTime(.08 * lv, t + .01); ng.gain.exponentialRampToValueAtTime(.001, t + dur);
      src.connect(bp); bp.connect(ng); ng.connect(AC.destination); src.start(t);
      o.onended = function () { try { AC.close(); } catch (e) {} };
    } catch (e) {}
  }


  function kidSting() {
    if (store.get('tlp-mute') === '1') return;
    var lv = Vol.factor('fx');
    if (lv <= 0) return;
    try {
      var AC = new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime;
      var boing = AC.createOscillator(), bg = AC.createGain();
      boing.type = 'sine';
      boing.frequency.setValueAtTime(260, t);
      boing.frequency.exponentialRampToValueAtTime(760, t + .26);
      bg.gain.setValueAtTime(.0001, t); bg.gain.exponentialRampToValueAtTime(.07 * lv, t + .02); bg.gain.exponentialRampToValueAtTime(.001, t + .33);
      boing.connect(bg); bg.connect(AC.destination); boing.start(t); boing.stop(t + .35);
      [[880, .12], [1175, .26], [988, .4]].forEach(function (x) {
        var o = AC.createOscillator(), g = AC.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(x[0], t + x[1]);
        g.gain.setValueAtTime(.0001, t + x[1]); g.gain.exponentialRampToValueAtTime(.055 * lv, t + x[1] + .015); g.gain.exponentialRampToValueAtTime(.001, t + x[1] + .24);
        o.connect(g); g.connect(AC.destination); o.start(t + x[1]); o.stop(t + x[1] + .26);
      });
      setTimeout(function () { try { AC.close(); } catch (e) {} }, 1100);
    } catch (e) {}
  }



  function sayIdle(text, pitch, rate) {
    if (store.get('tlp-mute') === '1' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    var nv = Vol.factor('narr');
    if (nv <= 0) return;
    try {
      var s = window.speechSynthesis;
      s.cancel();
      var spoken = Voice.localize(text);
      var arabic = /[\u0600-\u06ff]/.test(spoken);
      var voice = Voice.pick(arabic);
      var u = new SpeechSynthesisUtterance(spoken);
      u.pitch = pitch; u.rate = rate; u.volume = .95 * nv;
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = arabic ? 'ar-SA' : 'en-US'; }
      s.speak(u);
    } catch (e) {}
  }
  function kidPlayer() {
    try { return document.body.classList.contains('path-g16') || document.body.classList.contains('kid-fx'); } catch (e) { return false; }
  }
  function showIdle() {
    if ($('#tlpIdle')) return;
    var n = idleName(), jump = jumpOn(), kid = !jump && kidPlayer();
    var p = document.createElement('div');
    p.id = 'tlpIdle'; p.setAttribute('role', 'alertdialog'); p.setAttribute('aria-live', 'polite'); p.setAttribute('aria-label', 'Are you still here?');
    if (jump) {
      p.className = 'idle-jump';
      p.innerHTML = '<div class="jd-face" aria-hidden="true"><span class="jd-eye"></span><span class="jd-eye"></span><span class="jd-mouth"></span></div>' +
        '<div class="bubble" id="tlpIdleTxt">Are you still here, <b>' + esc(n || 'Player') + '</b>? Hello?</div>' +
        '<button type="button" id="tlpIdleBtn">I am here</button>' +
        '<button type="button" class="jd-off" id="tlpAfkOff">Turn this surprise off</button>';
      jumpSting();
      sayIdle('Are you still here, ' + (n || 'Player') + '? Hello?', .35, .78);
    } else if (kid) {
      p.className = 'idle-kid';
      p.innerHTML = '<div class="bubble" id="tlpIdleTxt">Are you still here, <b>' + esc(n || 'Player') + '</b>? Hello?</div>' +
        '<svg class="rb" viewBox="0 0 200 220" aria-hidden="true"><g class="ant"><line x1="100" y1="14" x2="100" y2="48"/><circle class="fl" cx="100" cy="12" r="8"/></g>' +
        '<rect x="40" y="48" width="120" height="86" rx="26"/><g class="eye"><circle class="fl" cx="75" cy="88" r="13"/></g><g class="eye"><circle class="fl" cx="125" cy="88" r="13"/></g><path d="M78 116q22 18 44 0"/>' +
        '<rect x="56" y="142" width="88" height="62" rx="18"/><path d="M56 160l-22 22"/><g class="arm"><path d="M144 160l30-34"/><circle class="fl" cx="177" cy="122" r="7"/></g></svg>' +
        '<button type="button" id="tlpIdleBtn">Yes, I am here!</button>';
      kidSting();
      sayIdle('Are you still here, ' + (n || 'Player') + '? Hello?', 1.65, 1.05);
    } else {
      p.innerHTML = '<div class="bubble" id="tlpIdleTxt">' + (n ? 'Are you still here, <b>' + esc(n) + '</b>? Hello?' : 'Are you still here? Hello?') + '</div>' +
        '<svg class="rb" viewBox="0 0 200 220" aria-hidden="true"><g class="ant"><line x1="100" y1="14" x2="100" y2="48"/><circle class="fl" cx="100" cy="12" r="8"/></g>' +
        '<rect x="40" y="48" width="120" height="86" rx="26"/><g class="eye"><circle class="fl" cx="75" cy="88" r="11"/></g><g class="eye"><circle class="fl" cx="125" cy="88" r="11"/></g><path d="M80 114q20 14 40 0"/>' +
        '<rect x="56" y="142" width="88" height="62" rx="18"/><path d="M56 160l-22 22"/><g class="arm"><path d="M144 160l30-34"/><circle class="fl" cx="177" cy="122" r="7"/></g></svg>' +
        '<button type="button" id="tlpIdleBtn">I am here</button>';
    }
    document.body.appendChild(p);
    var btn = p.querySelector('#tlpIdleBtn');
    btn.onclick = function () {
      var t = p.querySelector('#tlpIdleTxt');
      try { speechSynthesis.cancel(); } catch (e) {}
      if (t) t.innerHTML = jump ? 'Signal restored. Welcome back, R-067.' : 'Okay, just checking in!';
      btn.disabled = true;
      var off = p.querySelector('#tlpAfkOff'); if (off) off.remove();
      setTimeout(function () { p.classList.add('out'); setTimeout(function () { hideIdle(); resetIdle(); }, 520); }, 1300);
    };
    var offBtn = p.querySelector('#tlpAfkOff');
    if (offBtn) offBtn.onclick = function () {
      try { if (window.TLP_AFK && window.TLP_AFK.disable) window.TLP_AFK.disable(); else store.set('tlp-afk-off', '1'); } catch (e) {}
      hideIdle(); resetIdle();
    };
    setTimeout(function () { btn.focus(); }, 50);
  }
  function resetIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(function () {
      if (idleOk()) showIdle(); else resetIdle();
    }, idleWait());
  }
  function onActivity(e) {
    if ($('#tlpIdle')) return;
    resetIdle();
  }


  function openVolume() {
    var m = $('#tlpVol');
    if (!m) {
      m = document.createElement('div');
      m.id = 'tlpVol';
      m.className = 'tlpm';
      m.hidden = true;
      m.innerHTML = '<div class="tlpm-pan" role="dialog" aria-modal="true" aria-labelledby="tlpVolT">' +
        '<button class="tlpm-x" type="button" id="tlpVolX" aria-label="Close"><i class="ic ic-close"></i></button>' +
        '<h2 id="tlpVolT">Volume</h2><p class="s">Sound levels are saved on this device.</p>' +
        Vol.ui() +
        '<div class="tlpm-row"><button class="tlpm-btn" id="tlpVolMute" type="button">Mute everything</button><button class="tlpm-btn pri" id="tlpVolOk" type="button">Done</button></div>' +
        '</div>';
      document.body.appendChild(m);
      var close = function () { m.hidden = true; };
      $('#tlpVolX').onclick = close;
      $('#tlpVolOk').onclick = close;
      m.addEventListener('click', function (e) { if (e.target === m) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) close(); });
      Vol.wire(m, function (kind) { try { if (window.TLP_MUSIC) TLP_MUSIC.blip(kind); } catch (e) {} });
      var muteBtn = $('#tlpVolMute');
      muteBtn.onclick = function () {
        if (Vol.get().master === 0) { Vol.set('master', Vol.defaults.master); muteBtn.textContent = 'Mute everything'; }
        else { Vol.set('master', 0); muteBtn.textContent = 'Sound back on'; }
      };
    }
    var mb = m.querySelector('#tlpVolMute');
    if (mb) mb.textContent = Vol.get().master === 0 ? 'Sound back on' : 'Mute everything';
    Vol.apply();
    m.hidden = false;
    setTimeout(function () { var s = m.querySelector('input[data-vol]'); if (s) s.focus(); }, 40);
  }






  function setupNav() {
    var wrap = $('header nav .wrap');
    if (!wrap || wrap.querySelector('.navmenu-btn')) return;
    var items = [].slice.call(wrap.children).filter(function (el) {
      return el.classList && (el.classList.contains('navlink') || el.classList.contains('tools'));
    });
    if (!items.length) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'navMenuBtn';
    btn.className = 'navmenu-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'navPanel');
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span class="mbars" aria-hidden="true"><i></i><i></i><i></i></span><span>Menu</span>';
    var panel = document.createElement('div');
    panel.className = 'navpanel';
    panel.id = 'navPanel';
    panel.hidden = true;
    var links = document.createElement('div');
    links.className = 'navlinks';
    var tools = null;
    items.forEach(function (el) {
      if (el.classList.contains('tools')) { tools = el; return; }
      links.appendChild(el);
    });
    panel.appendChild(links);
    if (tools) {
      var tw = document.createElement('div');
      tw.className = 'navpanel-tools';
      tw.appendChild(tools);
      panel.appendChild(tw);
    }
    wrap.classList.add('has-menu');
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    var close = function () { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.onclick = function (e) {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
    };


    panel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a,button')) close();
    });
    document.addEventListener('click', function (e) { if (!panel.hidden && !wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); }
    });
  }





  function setupOffline() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }


  async function addAdminLink() {
    try {
      var A = window.TLP_AUTH; if (!A || !A.init) return;
      await A.init();
      if (A.isCurrentUserAdmin && A.isCurrentUserAdmin() && !$('#navAdmin') && !/admin\.html$/.test(location.pathname)) {
        var host = $('.navpanel .navlinks') || $('header nav .wrap'); if (!host) return;
        var a = document.createElement('a');
        a.id = 'navAdmin'; a.className = 'navlink'; a.href = 'admin.html';
        a.innerHTML = '<span class="sp" aria-hidden="true">✦</span>Admin';


        var after = $('#navAccount'); if (after && after.parentNode) after.parentNode.insertBefore(a, after.nextSibling); else host.appendChild(a);
      }
    } catch (e) {}
  }










  var siteCv = null, siteParts = [], siteNeb = [], siteDrop = [], siteBok = [], siteComet = [], siteFly = [], siteRAF = 0;
  var SITE_PAL = ['#35c9e8', '#9b5cf0', '#ff6b7f', '#3ddc84', '#ffd36a'];
  function sitePref() {
    try {
      var id = 'guest';
      var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner();
      if (l && l.id) id = l.id;
      var p = JSON.parse(localStorage.getItem('tlp-settings:' + id) || '{}');
      var merged = {};
      if (id !== 'default') {
        try { merged = JSON.parse(localStorage.getItem('tlp-settings:default') || '{}'); } catch (e) {}
      }

      try {
        var lk = l && l.avatar && l.avatar.look;
        if (lk && typeof lk === 'object') merged = Object.assign(merged, lk);
      } catch (e) {}
      p = Object.assign(merged, p);
      var m = p.sitebg || 'auto';
      return ['auto','stars','aurora','waves','nebula','matrix','bokeh','orbit','comets','fireflies','prism','none'].indexOf(m) > -1 ? m : 'auto';
    } catch (e) { return 'auto'; }
  }
  function siteSeed() {
    siteParts = []; siteNeb = []; siteDrop = []; siteBok = [];
    var w = window.innerWidth || 1200, h = window.innerHeight || 800;
    for (var i = 0; i < 140; i++) siteParts.push({ x: Math.random()*w, y: Math.random()*h, r: .5+Math.random()*1.9, ph: Math.random()*6.28, v: .15+Math.random()*.5 });
    for (var j = 0; j < 9; j++) siteNeb.push({ x: Math.random()*w, y: Math.random()*h, r: 110+Math.random()*160, c: SITE_PAL[j % SITE_PAL.length], vx: (Math.random()-.5)*.34, vy: (Math.random()-.5)*.24, ph: j * 1.3 });
    var cols = Math.floor(w / 26);
    for (var k = 0; k < cols; k++) siteDrop.push({ x: k * 26 + 8, y: Math.random()*h, v: 1.1+Math.random()*2.8, ch: Math.random() });
    for (var m = 0; m < 36; m++) siteBok.push({ x: Math.random()*w, y: Math.random()*h, r: 14+Math.random()*48, c: SITE_PAL[m % SITE_PAL.length], v: .2+Math.random()*.55, ph: Math.random()*6.28 });
    for (var n = 0; n < 10; n++) siteComet.push({ x: Math.random()*w, y: Math.random()*h*.7, vx: 3.6+Math.random()*3.8, vy: 1.2+Math.random()*1.4, life: Math.random(), c: SITE_PAL[n % SITE_PAL.length] });
    for (var q = 0; q < 56; q++) siteFly.push({ x: Math.random()*w, y: Math.random()*h, r: 1.2+Math.random()*2.6, c: SITE_PAL[q % SITE_PAL.length], ph: Math.random()*6.28, sp: .5+Math.random()*1.1 });
  }
  function siteFrame(t) {
    var c = siteCv; if (!c) return;
    var x = c.getContext('2d'), w = c.width, h = c.height, mode = document.body.dataset.sitebg || 'auto';
    x.clearRect(0, 0, w, h);
    if (mode === 'stars') {
      siteParts.forEach(function (p) {
        p.y -= p.v; if (p.y < -4) { p.y = h + 4; p.x = Math.random()*w; }
        x.globalAlpha = .18 + .3 * Math.abs(Math.sin(t/1100 + p.ph));
        x.fillStyle = '#cfe8ff';
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
      });
      x.globalAlpha = 1;
    } else if (mode === 'waves') {
      for (var k = 0; k < 5; k++) {
        x.beginPath();
        for (var px = 0; px <= w; px += 10) {
          var y = h * (.5 + k * .07) + Math.sin(px * .011 + t/1600 + k * 1.9) * (10 + k * 5);
          if (px === 0) x.moveTo(px, y); else x.lineTo(px, y);
        }
        x.strokeStyle = 'rgba(110,200,255,' + (.04 + .028 * k) + ')';
        x.lineWidth = 1.2; x.stroke();
      }
    } else if (mode === 'nebula') {
      siteNeb.forEach(function (n) {
        n.x += n.vx; n.y += n.vy; n.ph += .006;
        if (n.x < -n.r) n.x = w + n.r; if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r; if (n.y > h + n.r) n.y = -n.r;
        var g = x.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.c + '30'); g.addColorStop(.6, n.c + '12'); g.addColorStop(1, n.c + '00');
        x.fillStyle = g; x.beginPath(); x.arc(n.x, n.y, n.r, 0, 6.283); x.fill();
      });
    } else if (mode === 'matrix') {
      x.font = '12px monospace'; x.textAlign = 'center';
      var GL = 'アイウエオカキクケコサシスセソ0123456789{}<>/=+*';
      siteDrop.forEach(function (d) {
        d.y += d.v; d.ch += .02;
        if (d.y > h + 20) { d.y = -20; d.x = Math.floor(Math.random() * (w / 26)) * 26 + 8; }
        var head = Math.floor(d.ch * GL.length) % GL.length;
        x.globalAlpha = .5; x.fillStyle = '#3ddc84';
        x.fillText(GL[head], d.x, d.y);
        x.globalAlpha = .14;
        for (var t = 1; t < 7; t++) x.fillText(GL[(head + t * 7) % GL.length], d.x, d.y - t * 13);
      });
      x.globalAlpha = 1; x.textAlign = 'left';
    } else if (mode === 'bokeh') {
      siteBok.forEach(function (b) {
        b.y -= b.v; b.x += Math.sin(t/2400 + b.ph) * .2;
        if (b.y < -b.r * 2) { b.y = h + b.r * 2; b.x = Math.random() * w; }
        var a = .05 + .07 * Math.abs(Math.sin(t/1600 + b.ph));
        var g = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c); g.addColorStop(1, b.c + '00');
        x.globalAlpha = a; x.fillStyle = g;
        x.beginPath(); x.arc(b.x, b.y, b.r, 0, 6.283); x.fill();
      });
      x.globalAlpha = 1;
    } else if (mode === 'orbit') {
      var LINK = 120;
      for (var i = 0; i < siteParts.length; i++) {
        var a = siteParts[i];
        a.ph += .012;
        for (var j = i + 1; j < siteParts.length; j++) {
          var b = siteParts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx*dx + dy*dy;
          if (d2 > LINK*LINK) continue;
          var kk = 1 - Math.sqrt(d2) / LINK;
          x.strokeStyle = 'rgba(140,180,255,' + (kk * .09).toFixed(3) + ')';
          x.lineWidth = 1; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
        }
        var gl = x.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r * 4);
        gl.addColorStop(0, SITE_PAL[i % SITE_PAL.length]); gl.addColorStop(.35, SITE_PAL[i % SITE_PAL.length] + 'aa'); gl.addColorStop(1, SITE_PAL[i % SITE_PAL.length] + '00');
        x.globalAlpha = .45 + Math.sin(a.ph) * .15; x.fillStyle = gl;
        x.beginPath(); x.arc(a.x, a.y, a.r * 4, 0, 6.283); x.fill();
      }
      x.globalAlpha = 1;
    } else if (mode === 'comets') {
      siteComet.forEach(function (cm) {
        cm.x += cm.vx; cm.y += cm.vy; cm.life += .004;
        if (cm.life > 1 || cm.x > w + 80 || cm.y > h + 60) { cm.x = -60 - Math.random()*160; cm.y = Math.random()*h*.6; cm.life = 0; }
        var tail = 26;
        var g = x.createLinearGradient(cm.x, cm.y, cm.x - cm.vx * tail, cm.y - cm.vy * tail);
        g.addColorStop(0, cm.c); g.addColorStop(1, cm.c + '00');
        x.globalAlpha = .8 * (1 - cm.life * .6); x.strokeStyle = g; x.lineWidth = 2;
        x.beginPath(); x.moveTo(cm.x, cm.y); x.lineTo(cm.x - cm.vx * tail, cm.y - cm.vy * tail); x.stroke();
        x.fillStyle = '#fff'; x.beginPath(); x.arc(cm.x, cm.y, 2, 0, 6.283); x.fill();
      });
      x.globalAlpha = 1;
    } else if (mode === 'fireflies') {
      siteFly.forEach(function (f) {
        f.ph += .015 * f.sp;
        var fx = f.x + Math.sin(f.ph * .7) * 46, fy = f.y + Math.cos(f.ph * .5) * 34;
        var a = .25 + .55 * Math.abs(Math.sin(f.ph));
        var g = x.createRadialGradient(fx, fy, 0, fx, fy, f.r * 5);
        g.addColorStop(0, f.c); g.addColorStop(.4, f.c + '88'); g.addColorStop(1, f.c + '00');
        x.globalAlpha = a; x.fillStyle = g;
        x.beginPath(); x.arc(fx, fy, f.r * 5, 0, 6.283); x.fill();
      });
      x.globalAlpha = 1;
    } else if (mode === 'prism') {
      x.globalCompositeOperation = 'lighter';
      for (var pi = 0; pi < 3; pi++) {
        var ang = t / 9000 + pi * 2.09;
        var px2 = w / 2 + Math.cos(ang) * w * .34, py2 = h / 2 + Math.sin(ang) * h * .34;
        var pg = x.createRadialGradient(px2, py2, 0, px2, py2, Math.max(w, h) * .55);
        pg.addColorStop(0, SITE_PAL[pi] + '2e'); pg.addColorStop(1, SITE_PAL[pi] + '00');
        x.fillStyle = pg; x.beginPath(); x.arc(px2, py2, Math.max(w, h) * .55, 0, 6.283); x.fill();
      }
      x.globalCompositeOperation = 'source-over';
    }


    if (window.TLP && TLP.FX && TLP.FX.get()) siteRAF = 0;
    else siteRAF = requestAnimationFrame(siteFrame);
  }
  function applySiteBg() {
    var mode = sitePref();
    document.body.dataset.sitebg = mode;
    document.body.classList.remove('sbg-stars','sbg-aurora','sbg-waves','sbg-none','sbg-auto');
    document.body.classList.add('sbg-' + mode);
    var orbs = $('#ambOrbs'), grid = $('#bgGrid');
    if (orbs) orbs.style.display = (mode === 'auto' || mode === 'aurora' || mode === 'waves') ? '' : 'none';
    if (grid) grid.style.display = mode === 'auto' ? '' : 'none';
    var canvasModes = ['stars','waves','nebula','matrix','bokeh','orbit','comets','fireflies','prism'];
    var needCanvas = canvasModes.indexOf(mode) > -1;
    if (needCanvas) {
      if (!siteCv) {
        siteCv = document.createElement('canvas');
        siteCv.id = 'siteBgCanvas'; siteCv.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(siteCv, document.body.firstChild);
        siteSeed();
      }
      siteCv.width = window.innerWidth; siteCv.height = window.innerHeight;
      siteCv.style.display = 'block';
      if (siteRAF) cancelAnimationFrame(siteRAF);
      siteRAF = requestAnimationFrame(siteFrame);
    } else {
      if (siteCv) siteCv.style.display = 'none';
      if (siteRAF) { cancelAnimationFrame(siteRAF); siteRAF = 0; }
    }
  }
  window.addEventListener('resize', function () {
    if (siteCv && siteCv.style.display !== 'none') { siteCv.width = window.innerWidth; siteCv.height = window.innerHeight; siteSeed(); }
  });
  window.addEventListener('tlp-prefs-change', applySiteBg);
  window.addEventListener('tlp-auth-ready', applySiteBg);
  window.addEventListener('tlp-fx-change', applySiteBg);



  var SITE_BG_LIST = [
    ['auto','Classic orbs + grid'],['stars','Starfield'],['aurora','Aurora sky'],
    ['waves','Wave lines'],['nebula','Nebula drift'],['matrix','Digital rain'],
    ['bokeh','Bokeh'],['orbit','Orbit nodes'],['comets','Comet shower'],['fireflies','Fireflies'],['prism','Prism'],['none','Clean flat']
  ];
  function siteSetBg(m) {
    try {
      var id = 'guest';
      var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner();
      if (l && l.id) id = l.id;
      var k = 'tlp-settings:' + id;
      var p = JSON.parse(localStorage.getItem(k) || '{}');
      p.sitebg = m;
      localStorage.setItem(k, JSON.stringify(p));
    } catch (e) {}
    applySiteBg();
    try { window.dispatchEvent(new Event('tlp-prefs-change')); } catch (e) {}
    try { if (window.TLP_AVATAR && TLP_AVATAR.setLook) TLP_AVATAR.setLook({ sitebg: m }); } catch (e) {}
  }


  function siteBgLocked(m) {
    var need = { matrix: function (s) { return s.stars >= 20; }, nebula: function (s) { return s.streak >= 5; }, orbit: function (s) { return s.ch >= 3; }, comets: function (s) { return s.stars >= 30; }, fireflies: function (s) { return s.streak >= 7; }, prism: function (s) { return s.ch >= 10; } };
    if (!need[m]) return false;
    try { if (window.TLP_AUTH && TLP_AUTH.isCurrentUserAdmin && TLP_AUTH.isCurrentUserAdmin()) return false; } catch (e) {}
    var st = { ch: 0, stars: 0, streak: 0 };
    try { if (window.TLP_AVATAR && TLP_AVATAR.stats) st = Object.assign(st, TLP_AVATAR.stats()); } catch (e) {}
    try {
      var born = +localStorage.getItem('tlp-firstseen') || 0;
      if (!born) { born = Date.now(); localStorage.setItem('tlp-firstseen', String(born)); }
      var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner();
      var c = l && (l.created_at || l.createdAt);
      if (c) { var t = +new Date(c); if (t > born) born = t; }
      st.age = born ? Math.floor((Date.now() - born) / 86400000) : 0;
    } catch (e) {}
    return !need[m](st);
  }
  function setupSiteBgBtn() {
    if ($('#siteBgBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'siteBgBtn'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Choose site background');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = 'Backdrop';
    var menu = document.createElement('div');
    menu.id = 'siteBgMenu'; menu.hidden = true;
    menu.innerHTML = SITE_BG_LIST.map(function (m) {
      return '<button type="button" class="sbgi" data-m="' + m[0] + '"><i></i>' + m[1] + '</button>';
    }).join('') +
      '<div class="sbg-sep"></div>' +
      '<button type="button" class="sbgi sbg-motion" id="sbgMotion"><i></i><span id="sbgMotionLbl">Motion</span></button>';
    document.body.appendChild(btn);
    document.body.appendChild(menu);
    function sync() {
      var cur = sitePref();
      menu.querySelectorAll('.sbgi[data-m]').forEach(function (b) {
        var locked = siteBgLocked(b.dataset.m);
        b.classList.toggle('on', b.dataset.m === cur);
        b.classList.toggle('locked', locked);
        b.title = locked ? 'Locked — earn it by playing' : '';
      });
      var mot = $('#sbgMotion'), lbl = $('#sbgMotionLbl');
      var calm = FX.get();
      if (mot) {
        mot.classList.toggle('on', !calm);
        mot.setAttribute('aria-pressed', calm ? 'false' : 'true');
        mot.title = calm ? 'Ambient motion is off. Turn it on for rain, orbs and glitch effects.' : 'Ambient motion is on.';
      }
      if (lbl) lbl.textContent = calm ? 'Motion: calm (tap for full)' : 'Motion: full (tap for calm)';
    }
    btn.onclick = function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      btn.setAttribute('aria-expanded', String(!menu.hidden));
      if (!menu.hidden) sync();
    };
    menu.onclick = function (e) {
      if (e.target.closest('#sbgMotion')) { FX.set(!FX.get()); sync(); return; }
      var b = e.target.closest('.sbgi[data-m]'); if (!b) return;
      if (siteBgLocked(b.dataset.m)) { b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 400); return; }
      siteSetBg(b.dataset.m);
      menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); sync();
    };
    document.addEventListener('pointerdown', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) {
        menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
      }
    }, true);
    sync();
  }

  function init() {
    FX.apply();
    if (!$('#ambOrbs')) {
      var ob = document.createElement('div');
      ob.id = 'ambOrbs'; ob.setAttribute('aria-hidden', 'true');
      ob.innerHTML = '<i></i><i></i><i></i>';
      document.body.insertBefore(ob, document.body.firstChild);
    }
    if (!$('#bgGrid')) {
      var bg = document.createElement('div');
      bg.id = 'bgGrid'; bg.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(bg, document.body.firstChild);
    }
    applySiteBg();
    setupSiteBgBtn();
    setupNav();

    try { window.dispatchEvent(new Event('tlp-nav-ready')); } catch (e) {}
    var fxb = $('#fx'); if (fxb) fxb.onclick = function () { FX.set(!FX.get()); };
    var vb = $('#volBtn'); if (vb) vb.onclick = openVolume;
    ['pointerdown', 'pointerup', 'keydown', 'wheel', 'touchstart', 'scroll', 'input'].forEach(function (ev) { document.addEventListener(ev, onActivity, { passive: true, capture: true }); });
    document.addEventListener('pointerdown', function () { isDown = true; }, true);
    ['pointerup', 'pointercancel', 'dragend'].forEach(function (ev) { document.addEventListener(ev, function () { isDown = false; }, true); });
    document.addEventListener('mousemove', function () { if (!$('#tlpIdle')) resetIdle(); }, { passive: true });
    resetIdle();
    addAdminLink();
    setupOffline();
  }
  window.TLP = { HIDDEN: { g16: [17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], g710: [17, 18, 20, 21, 22, 23, 24] }, BOSS_CH: [3, 9, 14, 19, 24, 29], FX: FX, VOL: Vol, Voice: Voice, openBugReport: openBugReport, openVolume: openVolume, profileName: profileName, idleName: idleName, esc: esc, ico: ico, IC: IC, testIdle: function () { showIdle(); } };
  window.TLP_VOL = Vol;

  document.documentElement.classList.toggle('reduce-fx', FX.get());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();