(function () {
  'use strict';

  if (window.TLP_BACKGROUND && typeof window.TLP_BACKGROUND.set === 'function') return;

  function sitebg() {
    try { return document.body ? (document.body.dataset.sitebg || 'auto') : 'auto'; }
    catch (e) { return 'auto'; }
  }

  function setPref(mode) {
    var allowed = ['auto', 'stars', 'aurora', 'waves', 'nebula', 'matrix',
      'bokeh', 'orbit', 'comets', 'fireflies', 'prism', 'none'];
    if (allowed.indexOf(mode) < 0) return;
    try {
      var id = 'guest';
      var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner();
      if (l && l.id) id = l.id;
      var key = 'tlp-settings:' + id;
      var p = JSON.parse(localStorage.getItem(key) || '{}');
      p.sitebg = mode;
      localStorage.setItem(key, JSON.stringify(p));
    } catch (e) {}
    try { window.dispatchEvent(new Event('tlp-prefs-change')); } catch (e) {}
  }

  window.TLP_BACKGROUND = {

    set: function (value) {
      if (value === 'rain') value = 'matrix';
      if (value === 'reduce' || value === 'no-motion') {
        if (window.TLP && TLP.FX) TLP.FX.set(true);
        return;
      }
      if (typeof value === 'string') { setPref(value); return; }
      if (value && typeof value === 'object') {
        if (typeof value.bg === 'string') this.set(value.bg);
        if (value.motion === 'no-motion' || value.motion === 'reduced') {
          if (window.TLP && TLP.FX) TLP.FX.set(true);
        } else if (value.motion === 'auto' || value.motion === 'normal') {
          if (window.TLP && TLP.FX) TLP.FX.set(false);
        }
        if (value.locked === false) this.unlock();
        else if (value.locked === true) this.lock();
      }
    },
    get: function () {
      return { bg: sitebg(), motion: (window.TLP && TLP.FX && TLP.FX.get()) ? 'reduced' : 'auto' };
    },

    lock: function () { try { localStorage.setItem('tlp-bg-locked', '1'); } catch (e) {} },
    unlock: function () { try { localStorage.setItem('tlp-bg-locked', '0'); } catch (e) {} }
  };
})();
