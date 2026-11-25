(function () {
  'use strict';
  var A = function () { return window.TLP_AUTH; };


  var CAP = { g16: 7, g710: 5, g1112: 4, adult: 3 };
  function capFor(path) { return CAP[path] || 4; }
  function today() {
    var d = new Date();
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }
  function msToMidnight() {
    var d = new Date();
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - d.getTime();
  }
  function fmtDur(ms) {
    var h = Math.floor(ms / 3600000), m = Math.ceil((ms % 3600000) / 60000);
    if (h <= 0) return m + 'm';
    return h + 'h ' + (m ? m + 'm' : '');
  }

  var state = null;
  var learnerId = null;
  var widgets = [];
  var mutationVersion = 0;

  function path() {
    try { return localStorage.getItem('tlp-path') || 'g710'; } catch (e) { return 'g710'; }
  }
  function learner() {
    try { return (A() && A().getActiveLearner) ? A().getActiveLearner() : null; } catch (e) { return null; }
  }
  function cloudOk() {
    try {
      var l = learner();
      return !!(A() && A().isCloudConfigured && A().isCloudConfigured() && l && l.id && l.id !== 'default');
    } catch (e) { return false; }
  }
  function ensureLearner() {
    if (learnerId) return learnerId;
    var l = learner();
    learnerId = (l && l.id && l.id !== 'default') ? l.id : null;
    return learnerId;
  }

  function localLoad() {
    try {
      var raw = JSON.parse(localStorage.getItem('tlp-lifeline') || 'null');
      var day = today(), max = capFor(path());
      if (!raw || raw.day !== day) {
        raw = { left: max, max: max, day: day };
        localStorage.setItem('tlp-lifeline', JSON.stringify(raw));
      }
      if (raw.max !== max) { raw.max = max; raw.left = Math.min(raw.left, max); }
      return raw;
    } catch (e) {
      return { left: capFor(path()), max: capFor(path()), day: today() };
    }
  }
  function localSave() {
    try { localStorage.setItem('tlp-lifeline', JSON.stringify(state)); } catch (e) {}
  }


  function adopt(res, expectedVersion) {
    if (!res) return false;
    if (expectedVersion != null && expectedVersion !== mutationVersion) return false;
    var day = today(), max = capFor(path());
    var left = Number(res.left);
    if (res.day !== day || left == null) {

      state = { left: max, max: max, day: day };
    } else {
      state = { left: Math.max(0, Math.min(max, left)), max: max, day: day };
    }
    localSave();
    renderAll();
    return true;
  }

  function load() {
    if (state) return state;
    state = localLoad();
    var id = ensureLearner();
    if (cloudOk() && id) {
      var version = mutationVersion;
      A().supabase.rpc('player_lifeline', { p_learner_id: id }).then(function (r) {
        if (!r.error && r.data) adopt(r.data, version);
      }).catch(function () {});
    }
    return state;
  }

  function state_() {
    var s = load();
    return { left: s.left, max: s.max, day: s.day, nextIn: msToMidnight() };
  }


  function drain(why) {
    var s = load();
    mutationVersion++;
    if (s.day !== today()) { s = localLoad(); state = s; }
    if (s.left > 0) s.left--;
    localSave();
    renderAll();
    if (cloudOk()) {
      var version = mutationVersion;
      A().supabase.rpc('player_drain_lifeline', { p_learner_id: ensureLearner() }).then(function (r) {
        if (!r.error && r.data) adopt(r.data, version);
      }).catch(function () {});
    }
    pulse();
    return s;
  }


  function refresh() {
    var s = load();
    mutationVersion++;
    s.left = s.max; s.day = today(); localSave(); renderAll();
    if (cloudOk()) {
      var version = mutationVersion;
      A().supabase.rpc('admin_refresh_lifeline', { p_learner_id: ensureLearner() }).then(function (r) {
        if (!r.error && r.data) adopt(r.data, version);
      }).catch(function () {


      });
    }
    return s;
  }




  function cellCls(i, s) { return i < s.left ? 'on' : (i === s.left - 1 ? 'edge' : ''); }
  function renderWidget(el) {
    var s = load();
    var cells = '';
    for (var i = 0; i < s.max; i++) cells += '<i class="lfc ' + cellCls(i, s) + '"></i>';
    el.innerHTML =
      '<div class="lf-head"><span class="lf-title">LIFELINE</span><span class="lf-count">' + s.left + '/' + s.max + '</span></div>' +
      '<div class="lf-bar" role="img" aria-label="Lifeline ' + s.left + ' of ' + s.max + '">' + cells + '</div>' +
      '<div class="lf-sub">energy reserve · refills daily</div>' +
      '<div class="lf-tip" role="tooltip">Refreshes in <b>' + fmtDur(msToMidnight()) + '</b></div>';
    if (widgets.indexOf(el) < 0) widgets.push(el);
    tick();
  }
  function renderAll() {
    widgets = widgets.filter(function (el) { return el.isConnected; });
    widgets.forEach(function (el) { if (el._lfRender) el._lfRender(); });
  }
  function pulse() {
    widgets.forEach(function (el) {
      var bar = el.querySelector('.lf-bar');
      if (bar) { bar.classList.remove('lf-hit'); void bar.offsetWidth; bar.classList.add('lf-hit'); }
    });
  }
  var tickT = null;
  function tick() {
    if (tickT) return;
    tickT = setInterval(function () {
      widgets = widgets.filter(function (el) { return el.isConnected; });
      if (!widgets.length) { clearInterval(tickT); tickT = null; return; }
      widgets.forEach(function (el) {
        var tip = el.querySelector('.lf-tip b');
        if (tip) tip.textContent = fmtDur(msToMidnight());
        var day = today();
        if (state && state.day !== day) { state = localLoad(); if (el._lfRender) el._lfRender(); }
      });
    }, 30000);
  }


  function mount(el) {
    if (!el) return null;
    el.classList.add('lifeline');
    var render = function () { renderWidget(el); };
    el._lfRender = render;
    render();
    return el;
  }




  function adminList() {
    if (!A() || !A().supabase) return Promise.resolve([]);
    return A().supabase.rpc('admin_lifelines').then(function (r) {
      if (r.error) throw new Error(r.error.message);
      return r.data || [];
    });
  }
  function adminRefresh(lid) {
    if (!A() || !A().supabase) return Promise.reject(new Error('No cloud'));
    return A().supabase.rpc('admin_refresh_lifeline', { p_learner_id: lid }).then(function (r) {
      if (r.error) throw new Error(r.error.message);
      return r.data;
    });
  }

  window.TLP_LIFE = {
    mount: mount,
    state: state_,
    drain: drain,
    refresh: refresh,
    capFor: capFor,
    adminList: adminList,
    adminRefresh: adminRefresh
  };
})();
