/* =============================================================================
   THE LOST PROTOCOL — SHARED SITE SCRIPT (load AFTER tlp-auth.js on every page)
   - Reduce visual effects toggle (persistent, respects the OS setting)
   - Idle prompt ("Are you still there?")
   - Calm, slightly robotic narration helper (browser speech only, no paid voices)
   - Bug-report window (saved through TLP_AUTH to Supabase)
   ============================================================================= */
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

  /* ------------------------------ Reduce effects ------------------------------ */
  var FX = {
    get: function () {
      var v = store.get('tlp-reduce-fx');
      if (v === '1') return true;
      if (v === '0') return false;
      if (store.get('tlp-fx') === 'off') return true; // older home-page setting
      return osReduce();
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

  /* ------------------------------ Narration voice ------------------------------ */
  var Voice = {
    pick: function () {
      var vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
      var en = vs.filter(function (v) { return /^en/i.test(v.lang); });
      var pref = en.filter(function (v) { return /(google uk english male|daniel|alex|microsoft (guy|david|mark)|male)/i.test(v.name); })[0];
      return pref || en[0] || null;
    },
    speak: function (text, onend) {
      if (!window.speechSynthesis) { if (onend) onend(); return; }
      Voice.stop();
      var clean = String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      var parts = clean.match(/[^.!?]+[.!?]*/g) || [clean];
      var voice = Voice.pick(), i = 0;
      var next = function () {
        if (i >= parts.length) { if (onend) onend(); return; }
        var t = parts[i++].trim();
        if (!t) return next();
        var u = new SpeechSynthesisUtterance(t);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = 'en-US'; }
        u.rate = 0.92;   // calm and clear
        u.pitch = 0.75;  // slightly low = subtly robotic
        u.volume = 1;
        u.onend = function () { setTimeout(next, 160); }; // short pause between sentences
        u.onerror = function () { setTimeout(next, 0); };
        speechSynthesis.speak(u);
      };
      next();
    },
    stop: function () { try { speechSynthesis.cancel(); } catch (e) {} }
  };
  if (window.speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = function () {};

  /* ------------------------------ Who is signed in ------------------------------ */
  function profileName() {
    try {
      var A = window.TLP_AUTH;
      if (!A || !A.getCurrentUser) return '';
      var u = A.getCurrentUser();
      if (!u) return '';
      var l = A.getActiveLearner && A.getActiveLearner();
      var n = (l && l.name && l.name !== 'default' && !l.isGuest ? l.name : '') || u.displayName || '';
      return String(n).trim().slice(0, 30);
    } catch (e) { return ''; }
  }


  /* ------------------------------ Icons (drawn shapes, no emoji) ------------------------------ */
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

  /* ------------------------------ Styles ------------------------------ */
  var css = '' +
    'html.reduce-fx *,html.reduce-fx *::before,html.reduce-fx *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;scroll-behavior:auto!important}' +
    'html.reduce-fx #rain,html.reduce-fx #scan,html.reduce-fx .aurora,html.reduce-fx .spark{display:none!important}' +
    '#tlpFxBtn{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:40;min-height:36px;padding:6px 14px;border-radius:999px;border:1px solid var(--line,rgba(255,255,255,.2));background:color-mix(in srgb,var(--bg,#0b0f14) 80%,transparent);color:var(--fg,#f3efe8);font:600 13px var(--sans,system-ui,sans-serif);cursor:pointer}' +
    '#tlpFxBtn:focus-visible{outline:2px solid var(--a,#35c9e8);outline-offset:2px}' +
    /* idle prompt: full screen, a robot with a speech bubble */
    '#tlpIdle{position:fixed;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:20px;background:rgba(5,8,12,.82);color:#f3efe8;font-family:var(--sans,system-ui,sans-serif);animation:tlpFade .4s ease both}' +
    '#tlpIdle.out{animation:tlpFadeOut .5s ease both}' +
    '@keyframes tlpFade{from{opacity:0}to{opacity:1}}@keyframes tlpFadeOut{to{opacity:0}}' +
    '#tlpIdle .bubble{position:relative;max-width:min(88vw,460px);padding:16px 20px;border-radius:20px;background:#f3efe8;color:#0b0f14;font:700 clamp(18px,3.6vw,24px)/1.3 var(--sans,system-ui,sans-serif);text-align:center}' +
    '#tlpIdle .bubble:after{content:"";position:absolute;left:50%;bottom:-12px;margin-left:-12px;border:12px solid transparent;border-top-color:#f3efe8;border-bottom:0}' +
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
    /* modal */
    '.tlpm{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px;background:rgba(5,8,12,.72)}' +
    '.tlpm[hidden]{display:none!important}' +
    '.tlpm-pan{position:relative;width:min(520px,100%);max-height:92vh;overflow:auto;padding:24px 22px;border-radius:20px;border:1px solid var(--a,#35c9e8);background:var(--bg,#0b0f14);color:var(--fg,#f3efe8);font-family:var(--sans,system-ui,sans-serif)}' +
    '.tlpm-pan h2{margin:0 36px 6px 0;font:800 24px var(--serif,Georgia,serif)}' +
    '.tlpm-pan p.s{margin:0 0 14px;color:var(--mut,#aab);font-size:14px}' +
    '.tlpm-x{position:absolute;top:12px;right:12px;width:44px;height:44px;border-radius:50%;border:1px solid var(--line,rgba(255,255,255,.2));background:transparent;color:inherit;font-size:18px;cursor:pointer}' +
    '.tlpm-pan label{display:block;margin:12px 0 4px;font:700 12px var(--sans,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase;color:var(--mut,#aab)}' +
    '.tlpm-pan input,.tlpm-pan select,.tlpm-pan textarea{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:12px;border:1px solid var(--line,rgba(255,255,255,.2));background:transparent;color:inherit;font:15px var(--sans,system-ui,sans-serif)}' +
    '.tlpm-pan select option{color:#111}' +
    '.tlpm-row{display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}' +
    '.tlpm-btn{min-height:44px;padding:0 22px;border-radius:999px;border:1px solid var(--line,rgba(255,255,255,.25));background:transparent;color:inherit;font:700 15px var(--sans,system-ui,sans-serif);cursor:pointer}' +
    '.tlpm-btn.pri{background:var(--a,#35c9e8);border-color:transparent;color:var(--ink,#0b0f14)}' +
    '.tlpm-btn:disabled{opacity:.6;cursor:default}' +
    '.tlpm-note{min-height:1.2em;margin-top:10px;font-size:14px}' +
    /* story lines */
    '.story{margin:12px 0;padding:10px 12px;border-left:3px solid var(--a,#35c9e8);border-radius:8px;background:color-mix(in srgb,var(--a,#35c9e8) 8%,transparent)}' +
    '.sline{display:flex;flex-direction:column;gap:2px;margin:6px 0;font-size:14px;line-height:1.45}' +
    '.sline b{font:800 11px var(--sans,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase;opacity:.8}' +
    '.sp-l b{color:#f2c94c}.sp-u b{color:#3ddc84}.sp-r b{color:#35c9e8}.sp-s b{color:#ef7a8c}';
  var st = document.createElement('style');
  st.id = 'tlp-common-css';
  st.textContent = css + iconCss;
  document.head.appendChild(st);

  /* ------------------------------ Bug report window ------------------------------ */
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
    if (area) { var sel = $('#tbArea'); for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === area) sel.selectedIndex = i; }
    m.hidden = false;
    setTimeout(function () { var t = $('#tbTitle'); if (t) t.focus(); }, 30);
  }

  /* ------------------------------ Idle prompt ------------------------------ */
  var IDLE_MS = 60000, idleT = null, isDown = false;
  try { var qi = parseInt(new URLSearchParams(location.search).get('idle'), 10); if (qi >= 3 && qi <= 600) IDLE_MS = qi * 1000; } catch (e) {} // ?idle=8 shows it after 8 seconds (for testing)
  function idleOk() {
    if (document.hidden) return false;
    if (isDown) return false;                                   // dragging or pressing
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && (a.value || '').length) return false; // typing
    if (a && a.isContentEditable) return false;
    if (window.TLP_BUSY) return false;                          // set by the game while it is animating
    if ($('#cine') || $('.tlpm:not([hidden])')) return false;   // cutscene or dialog open
    return true;
  }
  function hideIdle() { var p = $('#tlpIdle'); if (p) p.remove(); }
  function showIdle() {
    if ($('#tlpIdle')) return;
    var n = profileName();
    var p = document.createElement('div');
    p.id = 'tlpIdle'; p.setAttribute('role', 'alertdialog'); p.setAttribute('aria-live', 'polite'); p.setAttribute('aria-label', 'Are you still there?');
    p.innerHTML = '<div class="bubble" id="tlpIdleTxt">' + (n ? 'Are you still there, ' + esc(n) + '? Hello?' : 'Are you still there? Hello?') + '</div>' +
      '<svg class="rb" viewBox="0 0 200 220" aria-hidden="true"><g class="ant"><line x1="100" y1="14" x2="100" y2="48"/><circle class="fl" cx="100" cy="12" r="8"/></g>' +
      '<rect x="40" y="48" width="120" height="86" rx="26"/><g class="eye"><circle class="fl" cx="75" cy="88" r="11"/></g><g class="eye"><circle class="fl" cx="125" cy="88" r="11"/></g><path d="M80 114q20 14 40 0"/>' +
      '<rect x="56" y="142" width="88" height="62" rx="18"/><path d="M56 160l-22 22"/><g class="arm"><path d="M144 160l30-34"/><circle class="fl" cx="177" cy="122" r="7"/></g></svg>' +
      '<button type="button" id="tlpIdleBtn">I am here</button>';
    document.body.appendChild(p);
    var btn = p.querySelector('#tlpIdleBtn');
    btn.onclick = function () {
      var t = p.querySelector('#tlpIdleTxt'); if (t) t.textContent = 'Okay, just checking in!';
      btn.disabled = true;
      setTimeout(function () { p.classList.add('out'); setTimeout(function () { hideIdle(); resetIdle(); }, 520); }, 1300);
    };
    setTimeout(function () { btn.focus(); }, 50);
  }
  function resetIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(function () {
      if (idleOk()) showIdle(); else resetIdle(); // never interrupt: try again later
    }, IDLE_MS);
  }
  function onActivity(e) {
    if ($('#tlpIdle')) return; // while the robot is showing, only its button closes it
    resetIdle();
  }

  /* ------------------------------ Init ------------------------------ */
  async function addAdminLink() {
    try {
      var A = window.TLP_AUTH; if (!A || !A.init) return;
      await A.init();
      if (A.isCurrentUserAdmin && A.isCurrentUserAdmin() && !$('#navAdmin') && !/admin\.html$/.test(location.pathname)) {
        var wrap = $('header nav .wrap'); if (!wrap) return;
        var a = document.createElement('a');
        a.id = 'navAdmin'; a.className = 'navlink'; a.href = 'admin.html';
        a.innerHTML = '<span class="sp" aria-hidden="true">✦</span>Admin';
        var after = $('#navParent'); if (after && after.parentNode) after.parentNode.insertBefore(a, after.nextSibling); else wrap.appendChild(a);
      }
    } catch (e) {}
  }
  function init() {
    FX.apply();
    var fxb = $('#fx'); if (fxb) fxb.onclick = function () { FX.set(!FX.get()); };
    ['pointerdown', 'pointerup', 'keydown', 'wheel', 'touchstart', 'scroll', 'input'].forEach(function (ev) { document.addEventListener(ev, onActivity, { passive: true, capture: true }); });
    document.addEventListener('pointerdown', function () { isDown = true; }, true);
    ['pointerup', 'pointercancel', 'dragend'].forEach(function (ev) { document.addEventListener(ev, function () { isDown = false; }, true); });
    document.addEventListener('mousemove', function () { if (!$('#tlpIdle')) resetIdle(); }, { passive: true });
    resetIdle();
    addAdminLink();
  }
  window.TLP = { HIDDEN: { g16: [17, 18, 20, 21, 22, 23, 24], g710: [17, 18, 20, 21, 22, 23, 24] }, BOSS_CH: [3, 9, 14, 19, 24, 29], FX: FX, Voice: Voice, openBugReport: openBugReport, profileName: profileName, esc: esc, ico: ico, IC: IC, testIdle: function () { showIdle(); } };
  // apply the saved effects setting as early as possible (avoids a flash of motion)
  document.documentElement.classList.toggle('reduce-fx', FX.get());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();