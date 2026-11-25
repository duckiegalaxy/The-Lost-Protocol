(function () {
  'use strict';
  if (window.TLP_MUSIC) return;

  var STORE = 'tlp-music';
  var ctx = null, master = null, comp = null, noise = null, fxBus = null;
  var timer = null, step = 0, nextT = 0, cur = 'home', playing = false, armed = false;
  var LOOK = 0.14, TICK = 25;


  function allowed() { try { return localStorage.getItem(STORE) !== '0'; } catch (e) { return true; } }
  function muted() { try { return localStorage.getItem('tlp-mute') === '1'; } catch (e) { return false; } }


  function volF(kind) {
    try { return window.TLP_VOL ? window.TLP_VOL.factor(kind) : 1; } catch (e) { return 1; }
  }
  function musicLevel() { return Math.max(.0001, .9 * volF('music')); }













  var THEMES = {
    home:  { bpm: 82,  root: 57, scale: [0, 2, 4, 7, 9],          prog: [0, 3, 1, 4], wave: 'triangle', pad: 1,    drums: 0, arp: .28, melo: .16, gain: .085 },
    g16:   { bpm: 98,  root: 60, scale: [0, 2, 4, 7, 9],          prog: [0, 3, 2, 4], wave: 'triangle', pad: .7,   drums: 1, arp: .5,  melo: .34, gain: .095 },
    g710:  { bpm: 116, root: 64, scale: [0, 3, 5, 7, 10],         prog: [0, 4, 2, 5], wave: 'square',   pad: .55,  drums: 1, arp: .7,  melo: .42, gain: .10  },
    g1112: { bpm: 124, root: 62, scale: [0, 2, 3, 5, 7, 8, 10],   prog: [0, 5, 3, 4], wave: 'sawtooth', pad: .75,  drums: 1, arp: .85, melo: .48, gain: .095 },
    adult: { bpm: 72,  root: 45, scale: [0, 2, 3, 5, 7, 8, 10],   prog: [0, 5, 3, 6], wave: 'sine',     pad: 1,    drums: 0, arp: .2,  melo: .11, gain: .09  },
    boss:  { bpm: 140, root: 48, scale: [0, 2, 3, 5, 7, 8, 11],   prog: [0, 5, 4, 6], wave: 'sawtooth', pad: .7,   drums: 1, arp: 1,   melo: .5,  gain: .10  },
    admin: { bpm: 88,  root: 55, scale: [0, 3, 5, 7, 10],         prog: [0, 3, 4, 2], wave: 'triangle', pad: .55,  drums: 0, arp: .4,  melo: .18, gain: .07  }
  };


  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function T() { return THEMES[cur] || THEMES.home; }
  function degree(d) {
    var sc = T().scale, n = sc.length;
    var oct = Math.floor(d / n), i = ((d % n) + n) % n;
    return T().root + sc[i] + 12 * oct;
  }
  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15);
    return (n >>> 0) / 4294967296;
  }


  function boot() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 24;
      comp.ratio.value = 4; comp.attack.value = .006; comp.release.value = .22;
      master = ctx.createGain(); master.gain.value = .0001;
      master.connect(comp); comp.connect(ctx.destination);


      fxBus = ctx.createGain(); fxBus.gain.value = 1; fxBus.connect(comp);
      var len = Math.floor(ctx.sampleRate * .6);
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noise.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { ctx = null; return false; }
  }

  function osc(f, t, dur, type, gain, filter, dest) {
    if (!ctx || !master) return;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || T().wave;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, gain), t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    if (filter) {
      var bq = ctx.createBiquadFilter();
      bq.type = 'lowpass'; bq.frequency.value = filter; bq.Q.value = .7;
      o.connect(bq); bq.connect(g);
    } else o.connect(g);
    g.connect(dest || master);
    o.start(t); o.stop(t + dur + .02);
  }

  function pad(f, t, dur, gain) {
    if (!ctx || !master) return;
    [0, 7, -6].forEach(function (cents, i) {
      var o = ctx.createOscillator(), g = ctx.createGain(), bq = ctx.createBiquadFilter();
      o.type = i === 2 ? 'triangle' : 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      o.detune.setValueAtTime(cents, t);
      bq.type = 'lowpass'; bq.frequency.setValueAtTime(900, t);
      bq.frequency.linearRampToValueAtTime(1500, t + dur * .6);
      g.gain.setValueAtTime(.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + .45);
      g.gain.setValueAtTime(gain, t + dur * .6);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(bq); bq.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + .05);
    });
  }

  function kick(t) {
    if (!ctx) return;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + .18);
    g.gain.setValueAtTime(.28, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + .24);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + .26);
  }

  function hit(t, freq, q, gain, dur) {
    if (!ctx || !noise) return;
    var s = ctx.createBufferSource(), bq = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise;
    bq.type = q > 2 ? 'bandpass' : 'highpass';
    bq.frequency.value = freq; bq.Q.value = q;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + (dur || .1));
    s.connect(bq); bq.connect(g); g.connect(master);
    s.start(t); s.stop(t + (dur || .1) + .02);
  }





  var MOTIF = [0, 2, 4, 2, 1, 3, 5, 3, 2, 4, 6, 4, 1, 2, 4, 0];

  function barStep(s, t) {
    var th = T(), bar = Math.floor(s / 16) % 4, q = s % 16;
    var chordDeg = th.prog[bar] || 0;
    var gain = th.gain * 4;
    var stepDur = 60 / th.bpm / 4;

    if (q === 0) {
      if (th.pad) pad(mtof(degree(chordDeg) - 12), t, stepDur * 15.5, .028 * th.pad);
      if (!th.drums) osc(mtof(degree(chordDeg) - 12), t, stepDur * 7, 'sine', .05 * gain, 700);
    }
    if (q === 0 || q === 8) {
      osc(mtof(degree(chordDeg) - 24), t, stepDur * 1.8, th.bass || 'triangle', .10 * gain, 420);
    }
    if (th.drums) {
      if (q === 0 || q === 8) kick(t);
      if (q === 4 || q === 12) { kick(t); hit(t, 1700, .9, .05 * gain, .11); }
      if (q % 2 === 0) hit(t, 7800, .8, .018 * gain, .035);
    }
    if (th.arp && q % 2 === 0 && hash(s * 31 + 7) < th.arp) {
      var seq = [0, 2, 4, 2, 4, 6];
      var d = chordDeg + seq[(s / 2) % seq.length] + (q >= 8 ? 7 : 0);
      osc(mtof(degree(d) + 12), t, stepDur * 1.1, th.wave, .035 * gain, 3000);
    }
    if (th.melo && q % 2 === 0 && hash(s * 97 + 3) < th.melo) {
      var md = chordDeg + MOTIF[(bar * 4 + (q / 2 | 0)) % MOTIF.length];
      osc(mtof(degree(md) + 12), t, stepDur * 1.6, th.wave, .05 * gain, 4200);
    }
  }

  function tick() {
    if (!ctx || !playing) return;
    if (muted()) {
      master.gain.setTargetAtTime(.0001, ctx.currentTime, .04);
      nextT = Math.max(nextT, ctx.currentTime + .05);
      return;
    }
    master.gain.setTargetAtTime(musicLevel(), ctx.currentTime, .2);
    var stepDur = 60 / T().bpm / 4;
    while (nextT < ctx.currentTime + LOOK) {
      barStep(step, nextT);
      nextT += stepDur;
      step = (step + 1) % 64;
    }
  }


  function start() {
    if (playing || !allowed() || !boot()) return;
    try { ctx.resume(); } catch (e) {}
    playing = true; step = 0; nextT = ctx.currentTime + .08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(musicLevel(), ctx.currentTime + 1.2);
    clearInterval(timer);
    timer = setInterval(tick, TICK);
  }

  function stop() {
    if (!ctx) { playing = false; return; }
    playing = false;
    clearInterval(timer); timer = null;
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.0001, ctx.currentTime, .12);
    } catch (e) {}
  }

  function setTheme(name) {
    if (!THEMES[name]) name = 'home';
    if (name === cur) return;
    cur = name; step = 0;
    if (playing && ctx) nextT = ctx.currentTime + .06;
  }

  function setEnabled(on) {
    try { localStorage.setItem(STORE, on ? '1' : '0'); } catch (e) {}
    if (on) start(); else stop();
  }

  function blip(kind) {
    if (!allowed() || muted() || !boot()) return;
    var fx = volF('fx');
    if (fx <= 0) return;
    try { ctx.resume(); } catch (e) {}
    var t = ctx.currentTime + .005;
    var map = {
      tap:   [[660, .06, .05], [990, .07, .035]],
      open:  [[420, .09, .05], [630, .12, .04], [840, .14, .03]],
      close: [[600, .08, .04], [380, .12, .035]],
      ok:    [[660, .1, .05], [880, .16, .045], [1320, .22, .035]],
      error: [[220, .12, .055], [150, .2, .05]],
      type:  [[520 + Math.random() * 240, .035, .018]]
    };
    (map[kind] || map.tap).forEach(function (n) { osc(n[0], t, n[1], 'triangle', n[2] * fx, 3000, fxBus); });
  }



  function setVolume() {
    if (!ctx || !master || !playing) return;
    try {
      if (muted()) master.gain.setTargetAtTime(.0001, ctx.currentTime, .05);
      else master.gain.setTargetAtTime(musicLevel(), ctx.currentTime, .08);
    } catch (e) {}
  }


  function firstGesture() {
    if (armed) return;
    armed = true;
    if (allowed()) start();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, firstGesture, { once: true, passive: true, capture: true });
  });

  document.addEventListener('visibilitychange', function () {
    if (!ctx || !playing) return;
    try { if (document.hidden) ctx.suspend(); else ctx.resume(); } catch (e) {}
  });



  window.addEventListener('storage', function (e) {
    if (e.key === STORE && !allowed()) stop();
  });

  if (document.body) {
    var want = document.body.getAttribute('data-music');
    if (want && THEMES[want]) cur = want;
  }

  window.TLP_MUSIC = {
    start: start, stop: stop,
    setTheme: setTheme, scene: setTheme,
    setEnabled: setEnabled,
    toggle: function () { setEnabled(!allowed()); return allowed(); },
    isEnabled: allowed,
    setVolume: setVolume,
    theme: function () { return cur; },
    ready: function () { return !!ctx; },
    blip: blip
  };
})();
