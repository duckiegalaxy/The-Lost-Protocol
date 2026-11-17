/* =============================================================================
   THE LOST PROTOCOL — APPEARANCE (loaded in <head> on every page)
   One choice of three: Auto (follow this device), Light or Dark. The resolved
   value is written to <html data-theme> before the first paint so a page never
   flashes the wrong colours, and the CSS in style.css and webgame.css keys off
   that attribute. The choice is saved on this device only.
   A small sun/moon switch is placed in the header of every page. It sets an
   explicit Light or Dark choice, so one tap overrides Auto until the setting
   is changed again.
   ============================================================================= */
(function () {
  'use strict';
  var KEY = 'tlp-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  var KNOWN = { auto: 1, light: 1, dark: 1 };

  // Styles for the switch live here because every page loads this file, and
  // webgame.html does not load css/style.css.
  var css = '.themetog{display:inline-flex;align-items:center;gap:2px;height:34px;padding:3px;border:1px solid var(--line);border-radius:999px;background:color-mix(in srgb,var(--fg) 6%,transparent);color:var(--mut);cursor:pointer;flex:0 0 auto;transition:border-color .2s}' +
    '.themetog:hover{border-color:var(--a)}' +
    '.themetog:focus-visible{outline:2px solid var(--a);outline-offset:2px}' +
    '.themetog span{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;transition:background .2s,color .2s}' +
    '.themetog svg{width:15px;height:15px}' +
    '.themetog span.on{background:var(--a);color:var(--ink)}' +
    '.wrap.has-menu .themetog{margin-left:auto}' +
    // The game header keeps the mood row against the right edge, with the
    // switch beside it. On narrow screens the two no longer fit on one row, so
    // the switch takes the free margin and stays pinned right instead of
    // landing alone at the left edge.
    '@media(max-width:620px){.top>.themetog{margin-left:auto}}';
  var style = document.createElement('style');
  style.id = 'tlpThemeSwitchCss';
  style.textContent = css;
  (document.head || root).appendChild(style);

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>';

  function syncSwitch() {
    var b = document.querySelector('.themetog');
    if (!b) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    b.setAttribute('aria-checked', dark ? 'true' : 'false');
    b.setAttribute('aria-label', label);
    b.title = label;
    var sun = b.querySelector('.t-sun'), moon = b.querySelector('.t-moon');
    if (sun) sun.classList.toggle('on', !dark);
    if (moon) moon.classList.toggle('on', dark);
  }

  function buildSwitch(force) {
    if (document.querySelector('.themetog')) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'themetog';
    b.setAttribute('role', 'switch');
    b.innerHTML = '<span class="t-sun">' + SUN + '</span><span class="t-moon">' + MOON + '</span>';
    b.addEventListener('click', function () {
      TLP_THEME.set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    var wrap = document.querySelector('header nav .wrap');
    if (wrap) {
      var menu = document.getElementById('navMenuBtn');
      // On shared-menu pages wait for setupNav, so the switch lands next to
      // Menu instead of being spread to the middle of the bar.
      if (menu && menu.parentNode === wrap) {
        wrap.insertBefore(b, menu);
      } else if (!force) {
        return false;
      } else {
        wrap.appendChild(b);
      }
      syncSwitch();
      return true;
    }
    var top = document.querySelector('.top');
    if (top) {
      // Sit beside the mood swatches when they are in the bar (they carry the
      // auto margin that pins them right). On phones they move into the More
      // panel, leaving the switch next to the logo.
      var tools = top.querySelector('.tools');
      var logo = top.querySelector('.logo');
      if (tools && tools.parentNode === top) top.insertBefore(b, tools.nextSibling);
      else if (logo && logo.parentNode === top) top.insertBefore(b, logo.nextSibling);
      else top.appendChild(b);
      syncSwitch();
      return true;
    }
    return false;
  }

  function pref() {
    try { var v = localStorage.getItem(KEY); if (v && KNOWN[v]) return v; } catch (e) {}
    return 'auto';
  }
  function resolved() {
    var p = pref();
    if (p === 'light' || p === 'dark') return p;
    return mq && mq.matches ? 'light' : 'dark';
  }
  function apply() {
    var v = resolved();
    root.setAttribute('data-theme', v);
    // Native controls (selects, scrollbars) and the browser chrome follow too.
    root.style.colorScheme = v;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', v === 'light' ? '#f3f7fb' : '#080d16');
    syncSwitch();
    try { window.dispatchEvent(new CustomEvent('tlp-theme-change', { detail: { theme: v, pref: pref() } })); } catch (e) {}
  }
  // In Auto the page must follow the device without a reload.
  if (mq) {
    var onChange = function () { if (pref() === 'auto') apply(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  // A choice made in another tab applies here as well.
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(); });

  apply();
  window.TLP_THEME = {
    pref: pref,
    theme: function () { return root.getAttribute('data-theme'); },
    set: function (p) {
      if (!KNOWN[p]) return;
      try { localStorage.setItem(KEY, p); } catch (e) {}
      apply();
    },
    apply: apply
  };

  // Placement. Pages with the shared menu announce tlp-nav-ready once their
  // header is built; privacy.html has no shared script, so it is placed at once.
  window.addEventListener('tlp-nav-ready', function () { buildSwitch(false); });
  function place() {
    if (document.querySelector('.themetog')) return;
    if (!document.querySelector('header nav .wrap') && document.querySelector('.top')) { buildSwitch(true); return; }
    if (!window.TLP) { buildSwitch(true); return; }
    buildSwitch(false);
    // If the shared menu never arrives, still show the switch.
    setTimeout(function () { if (!document.querySelector('.themetog')) buildSwitch(true); }, 700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();
})();
