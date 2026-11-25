(function () {
  'use strict';
  var A = function () { return window.TLP_AUTH; };






  function uCh(n) { return function (s) { return s.ch >= n; }; }
  function uStars(n) { return function (s) { return s.stars >= n; }; }
  function uStreak(n) { return function (s) { return s.streak >= n; }; }
  function uBadges(n) { return function (s) { return s.badges >= n; }; }
  function uBoss() { return function (s) { return s.bosses >= 1; }; }
  function uBoss3() { return function (s) { return s.bosses >= 3; }; }
  function uAll() { return function (s) { return s.ch >= 30; }; }
  var NONE = function () { return true; };




  var REWARD = function () { return false; };
  var BODIES = [
    { id: 'blue',   name: 'Protocol blue', col: '#35c9e8', pal: ['#35c9e8', '#67e8f9', '#fde047'], req: NONE, hint: 'Starter colour set.' },
    { id: 'mint',   name: 'Mint',          col: '#5eead4', pal: ['#5eead4', '#99f6e4', '#fef08a'], req: uCh(2), hint: 'Clear 2 chapters.' },
    { id: 'amber',  name: 'Amber',         col: '#fbbf24', pal: ['#fbbf24', '#fcd34d', '#fff1a8'], req: uStars(10), hint: 'Earn 10 stars.' },
    { id: 'rose',   name: 'Rose',          col: '#fb7185', pal: ['#fb7185', '#fda4af', '#fecdd3'], req: uCh(6), hint: 'Clear 6 chapters.' },
    { id: 'violet', name: 'Violet',        col: '#a78bfa', pal: ['#a78bfa', '#c4b5fd', '#f0abfc'], req: uStreak(3), hint: 'Keep a 3-day streak.' },
    { id: 'moss',   name: 'Moss',          col: '#4ade80', pal: ['#4ade80', '#86efac', '#bef264'], req: uBadges(2), hint: 'Earn 2 guardian badges.' },
    { id: 'ember',  name: 'Ember',         col: '#fb923c', pal: ['#fb923c', '#fdba74', '#fef08a'], req: uBoss(), hint: 'Defeat a guardian.' },
    { id: 'gold',   name: 'Gold',          col: '#facc15', pal: ['#facc15', '#fde047', '#fff7ae'], req: uBoss3(), hint: 'Defeat 3 guardians.' },
    { id: 'void',   name: 'Void',          col: '#334155', pal: ['#334155', '#64748b', '#a78bfa'], req: uAll(), hint: 'Clear all 30 chapters.' },
    { id: 'candy',  name: 'Candy',         col: '#f9a8d4', pal: ['#f9a8d4', '#fbcfe8', '#c4b5fd'], req: uStreak(5), hint: 'Keep a 5-day streak.' },
    { id: 'ocean',  name: 'Deep ocean',    col: '#0ea5e9', pal: ['#0ea5e9', '#38bdf8', '#a5f3fc'], req: uStars(30), hint: 'Earn 30 stars.' },
    { id: 'tide',   name: 'Tidal teal',    col: '#06b6d4', pal: ['#06b6d4', '#22d3ee', '#a7f3d0'], req: uCh(12), hint: 'Clear 12 chapters.' },
    { id: 'pink',   name: 'Blush pink',    col: '#f472b6', pal: ['#f472b6', '#f9a8d4', '#fbcfe8'], req: uStars(18), hint: 'Earn 18 stars.' },
    { id: 'slate',  name: 'Slate grey',    col: '#64748b', pal: ['#64748b', '#94a3b8', '#67e8f9'], req: uBadges(5), hint: 'Earn 5 guardian badges.' },
    { id: 'lagoon', name: 'Lagoon',        col: '#0ea5e9', pal: ['#0ea5e9', '#2dd4bf', '#a7f3d0'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'solar',  name: 'Solar flare',   col: '#fb923c', pal: ['#fb923c', '#facc15', '#fff1a8'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'aurora', name: 'Aurora',        col: '#22d3ee', pal: ['#22d3ee', '#a78bfa', '#f0abfc'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'berry',  name: 'Berry voltage', col: '#c084fc', pal: ['#c084fc', '#f472b6', '#fda4af'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'midnight', name: 'Midnight',    col: '#334155', pal: ['#334155', '#818cf8', '#fde047'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'matcha', name: 'Matcha',        col: '#4ade80', pal: ['#4ade80', '#bef264', '#fef08a'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'coral',  name: 'Coral sun',     col: '#fb7185', pal: ['#fb7185', '#fdba74', '#fde68a'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' },
    { id: 'chrome', name: 'Chrome signal', col: '#94a3b8', pal: ['#94a3b8', '#e2e8f0', '#67e8f9'], req: REWARD, hint: 'Win from the Lucky Wheel or buy in the Shop.' }
  ];
  var HATS = [
    { id: 'none',     name: 'Bare antenna', req: NONE, hint: 'Classic R-067 look.' },
    { id: 'cap',      name: 'Cadet cap',    req: uCh(1), hint: 'Clear your first chapter.' },
    { id: 'phones',   name: 'Headphones',   req: uCh(8), hint: 'Clear 8 chapters.' },
    { id: 'prop',     name: 'Propeller',    req: uStars(15), hint: 'Earn 15 stars.' },
    { id: 'wizard',   name: 'Wizard hat',   req: uCh(15), hint: 'Clear 15 chapters.' },
    { id: 'crown',    name: 'Crown',        req: uBoss(), hint: 'Defeat a guardian. Rare.', rare: true },
    { id: 'halo',     name: 'Halo',         req: uStreak(7), hint: 'Keep a 7-day streak. Rare.', rare: true },
    { id: 'visor',    name: 'Data visor',   req: uAll(), hint: 'Clear all 30 chapters. Rare.', rare: true },
    { id: 'band',     name: 'Headband',     req: uCh(12), hint: 'Clear 12 chapters.' },
    { id: 'bow',      name: 'Bow tie',      req: uBadges(2), hint: 'Earn 2 guardian badges.' },
    { id: 'horns',    name: 'Devil horns',  req: uBoss3(), hint: 'Defeat 3 guardians. Rare.', rare: true },
    { id: 'tophat',   name: 'Top hat',      req: uCh(6), hint: 'Clear 6 chapters.' },
    { id: 'beanie',   name: 'Beanie',       req: uStreak(3), hint: 'Keep a 3-day streak.' },
    { id: 'bucket',   name: 'Bucket hat',   req: uStars(10), hint: 'Earn 10 stars.' },
    { id: 'flower',   name: 'Flower',       req: uStreak(2), hint: 'Keep a 2-day streak.' },
    { id: 'antenna',  name: 'Antenna band', req: uCh(20), hint: 'Clear 20 chapters.' },
    { id: 'laurel',   name: 'Laurel',       req: uAll(), hint: 'Clear all 30 chapters. Rare.', rare: true }
  ];

  var GEAR = [
    { id: 'none',    name: 'No outfit',   req: NONE, hint: 'Au naturel.' },
    { id: 'scarf',   name: 'Scarf',       req: uCh(2), hint: 'Clear 2 chapters.' },
    { id: 'bandana', name: 'Bandana',     req: uCh(4), hint: 'Clear 4 chapters.' },
    { id: 'hoodie',  name: 'Hoodie',      req: uStars(8), hint: 'Earn 8 stars.' },
    { id: 'vest',    name: 'Vest',        req: uCh(8), hint: 'Clear 8 chapters.' },
    { id: 'cape',    name: 'Cape',        req: uBoss(), hint: 'Defeat a guardian. Rare.', rare: true },
    { id: 'backpack',name: 'Backpack',    req: uCh(12), hint: 'Clear 12 chapters.' },
    { id: 'overalls',name: 'Overalls',    req: uStreak(4), hint: 'Keep a 4-day streak.' },
    { id: 'jersey',  name: 'Jersey',      req: uBadges(2), hint: 'Earn 2 guardian badges.' },
    { id: 'apron',   name: 'Apron',       req: uCh(16), hint: 'Clear 16 chapters.' },
    { id: 'tux',     name: 'Tuxedo',      req: uAll(), hint: 'Clear all 30 chapters. Rare.', rare: true }
  ];

  var PETS = [
    { id: 'none',   name: 'No pet',    req: NONE, hint: 'Solo mode.' },
    { id: 'kitten', name: 'Kitten',    req: uCh(1), hint: 'Clear your first chapter.' },
    { id: 'puppy',  name: 'Puppy',     req: uCh(3), hint: 'Clear 3 chapters.' },
    { id: 'bunny',  name: 'Bunny pal', req: uStreak(2), hint: 'Keep a 2-day streak.' },
    { id: 'fox',    name: 'Fox kit',   req: uStars(12), hint: 'Earn 12 stars.' },
    { id: 'duck',   name: 'Duck',      req: uCh(7), hint: 'Clear 7 chapters.' },
    { id: 'slime',  name: 'Slime',     req: uBadges(1), hint: 'Earn a guardian badge.' },
    { id: 'ghost',  name: 'Ghost',     req: uBoss(), hint: 'Defeat a guardian. Rare.', rare: true },
    { id: 'mini',   name: 'Pocket bot', req: REWARD, hint: 'Buy in the Shop or win from the Lucky Wheel.' },
    { id: 'robot',  name: 'Mini-bot',  req: uBoss3(), hint: 'Defeat 3 guardians. Rare.', rare: true }
  ];
  var FACES = [
    { id: 'std',   name: 'Standard',   req: NONE, hint: 'The classic R-067 eyes.' },
    { id: 'happy', name: 'Happy',      req: uCh(1), hint: 'Clear your first chapter.' },
    { id: 'wink',  name: 'Wink',       req: uCh(4), hint: 'Clear 4 chapters.' },
    { id: 'cool',  name: 'Cool shades',req: uCh(7), hint: 'Clear 7 chapters.' },
    { id: 'star',  name: 'Star eyes',  req: uStars(20), hint: 'Earn 20 stars.' },
    { id: 'mono',  name: 'Mono visor', req: uBoss(), hint: 'Defeat a guardian.' },
    { id: 'sleepy',name: 'Sleepy',     req: uStreak(2), hint: 'Keep a 2-day streak.' },
    { id: 'angry', name: 'Focused',    req: uCh(10), hint: 'Clear 10 chapters.' },
    { id: 'heart', name: 'Heart eyes', req: uStreak(4), hint: 'Keep a 4-day streak.' }
  ];
  var SPEECH = [
    { id: '',       name: 'Silent',    req: NONE, hint: 'No bubble.' },
    { id: 'BEEP',   name: 'BEEP',      req: NONE, hint: 'Classic robot greeting.' },
    { id: '0101',   name: '0101',      req: uCh(3), hint: 'Clear 3 chapters.' },
    { id: 'Hi!',    name: 'Hi!',       req: uCh(5), hint: 'Clear 5 chapters.' },
    { id: 'LOL',    name: 'LOL',       req: uStreak(3), hint: 'Keep a 3-day streak.' },
    { id: 'GG',     name: 'GG',        req: uBadges(3), hint: 'Earn 3 guardian badges.' },
    { id: 'R-067',  name: 'R-067',     req: uBoss3(), hint: 'Defeat 3 guardians.' },
    { id: '010010', name: '010010',    req: uAll(), hint: 'Clear all 30 chapters. Rare.', rare: true },
    { id: 'Wow!',   name: 'Wow!',      req: uStars(25), hint: 'Earn 25 stars.' },
    { id: '42',     name: '42',        req: uCh(20), hint: 'Clear 20 chapters.' },
    { id: 'ZZZ',    name: 'ZZZ',       req: uStreak(6), hint: 'Keep a 6-day streak.' }
  ];
  var ANIMS = [
    { id: 'idle',   name: 'Idle sway',     req: NONE, hint: 'A gentle hover.' },
    { id: 'wiggle', name: 'Happy bounce',  req: NONE, hint: 'New starter feel.' },
    { id: 'spin',   name: 'Spin',          req: uCh(5), hint: 'Clear 5 chapters.' },
    { id: 'pulse',  name: 'Power pulse',   req: uCh(10), hint: 'Clear 10 chapters.' },
    { id: 'float',  name: 'Float up',      req: uBoss(), hint: 'Defeat a guardian.' },
    { id: 'blink',  name: 'Blink fast',    req: uStreak(5), hint: 'Keep a 5-day streak.' },
    { id: 'dance',  name: 'Victory dance', req: uBadges(4), hint: 'Earn 4 guardian badges. Rare.', rare: true },
    { id: 'sway',   name: 'Slow sway',     req: uCh(3), hint: 'Clear 3 chapters.' },
    { id: 'zoom',   name: 'Zoom pulse',    req: uCh(18), hint: 'Clear 18 chapters.' },
    { id: 'rocket', name: 'Rocket zoom',   req: uBoss3(), hint: 'Defeat 3 guardians. Rare.', rare: true },
    { id: 'hop',    name: 'Happy hop',     req: uCh(4), hint: 'Clear 4 chapters.' },
    { id: 'wave',   name: 'Tail wave',     req: uStars(15), hint: 'Earn 15 stars.' },
    { id: 'bubble', name: 'Bubble pop',    req: uStreak(3), hint: 'Keep a 3-day streak.' },
    { id: 'laser',  name: 'Laser eyes',    req: uCh(12), hint: 'Clear 12 chapters.' },
    { id: 'glitch', name: 'Signal glitch', req: uBoss(), hint: 'Defeat a guardian. Rare.', rare: true },
    { id: 'moon',   name: 'Moon float',    req: uStreak(7), hint: 'Keep a 7-day streak. Rare.', rare: true },
    { id: 'fire',   name: 'Afterburner',   req: uAll(), hint: 'Clear all 30 chapters. Rare.', rare: true },
    { id: 'bop',    name: 'Boppin',        req: uCh(2), hint: 'Clear 2 chapters.' }
  ];
  var ANIMALS = [
    { id: 'robot',   name: 'R-067 bot',  req: NONE, hint: 'The classic robot.' },
    { id: 'axolotl', name: 'Axolotl',    req: NONE, hint: 'A smiling salamander. Starter friend.' },
    { id: 'cat',     name: 'Cat',        req: uCh(1), hint: 'Clear your first chapter.' },
    { id: 'dog',     name: 'Dog',        req: uCh(3), hint: 'Clear 3 chapters.' },
    { id: 'fox',     name: 'Fox',        req: uStars(10), hint: 'Earn 10 stars.' },
    { id: 'panda',   name: 'Panda',      req: uCh(6), hint: 'Clear 6 chapters.' },
    { id: 'bunny',   name: 'Bunny',      req: uStreak(3), hint: 'Keep a 3-day streak.' },
    { id: 'horse',   name: 'Horse',      req: uCh(10), hint: 'Clear 10 chapters.' },
    { id: 'tiger',   name: 'Tiger',      req: uBoss(), hint: 'Defeat a guardian. Rare.', rare: true },
    { id: 'giraffe', name: 'Alien',       req: uStreak(5), hint: 'Keep a 5-day streak.' },
    { id: 'dragon',  name: 'Dragon',     req: uBoss3(), hint: 'Defeat 3 guardians. Rare.', rare: true }
  ];
  var GROUPS = [
    { key: 'animal', title: 'Species',   items: ANIMALS },
    { key: 'b',      title: 'Colour sets', items: BODIES },
    { key: 'gear',   title: 'Outfit',    items: GEAR },
    { key: 'hat',    title: 'Hat',       items: HATS },
    { key: 'face',   title: 'Face',      items: FACES },
    { key: 'speech', title: 'Speech',    items: SPEECH },
    { key: 'pet',    title: 'Pet',       items: PETS },
    { key: 'anim',   title: 'Animation', items: ANIMS }
  ];
  function find(group, id) {
    var g = GROUPS.filter(function (x) { return x.key === group; })[0];
    if (!g) return null;
    return g.items.filter(function (i) { return i.id === id; })[0] || null;
  }





  function todayProg() {
    var ch = 0, stars = 0, bosses = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || !/@prog$/.test(k)) continue;
        var prog = JSON.parse(localStorage.getItem(k) || '{}');
        Object.keys(prog).forEach(function (key) {
          var n = Number(prog[key]) || 0;
          if (n >= 1) { ch++; stars += Math.min(3, n); }
        });
      }
      for (var j = 0; j < localStorage.length; j++) {
        var bk = localStorage.key(j);
        if (!bk || !/@badges$/.test(bk)) continue;
        try { bosses += (JSON.parse(localStorage.getItem(bk) || '[]') || []).length; } catch (e) {}
      }
    } catch (e) {}
    var streak = 0;
    try {
      if (window.TLP_STREAK && TLP_STREAK.days) streak = TLP_STREAK.days();
      else streak = Number(localStorage.getItem('tlp-streak') || 0) || 0;
    } catch (e) {}
    return { ch: ch, stars: stars, streak: streak, badges: bosses, bosses: bosses };
  }




  var adminMode = false, viewAsPlayer = false;
  function isAdmin() {
    try { return !!(A() && A().isCurrentUserAdmin && A().isCurrentUserAdmin()); } catch (e) { return false; }
  }
  function unlocked(item, stats, group) {
    if (adminMode && !viewAsPlayer) return true;

    try {
      if (group && window.TLP_ECONOMY && TLP_ECONOMY.owns && TLP_ECONOMY.owns('av:' + group + ':' + item.id)) return true;
    } catch (e) {}
    return item.req(stats);
  }
  function hintFor(item, stats, group) {
    if (adminMode && !viewAsPlayer) return 'Unlocked for administrators.';
    if (unlocked(item, stats, group)) return 'Unlocked — equip it below.';
    return 'Locked — ' + item.hint;
  }

  var cfg = { animal: 'robot', b: 'blue', gear: 'none', hat: 'none', face: 'std', speech: '', pet: 'none', anim: 'idle', pal: null, look: {} };
  var loaded = false, loadedLearner = '', lookT = null;
  function learnerId() {
    try { var l = A() && A().getActiveLearner ? A().getActiveLearner() : null; return l && l.id || 'default'; } catch (e) { return 'default'; }
  }
  function avatarKey(id) { return 'tlp-avatar:' + id; }
  function localAvatar(id) {
    var raw = null;
    try { raw = localStorage.getItem(avatarKey(id)); } catch (e) {}
    if (raw) return JSON.parse(raw);
    try {
      raw = localStorage.getItem('tlp-avatar');
      var owner = localStorage.getItem('tlp-avatar-owner');
      if (raw && (!owner || owner === id || (owner === 'default' && id !== 'default'))) {
        localStorage.setItem(avatarKey(id), raw);
        localStorage.setItem('tlp-avatar-owner', id);
        return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  }
  function mergeAvatar(local, cloud) {
    var out = Object.assign({}, cloud || {}, local || {});
    out.look = Object.assign({}, (cloud && cloud.look) || {}, (local && local.look) || {});
    if (!validPalette(out.pal) && cloud && validPalette(cloud.pal)) out.pal = cloud.pal.slice();
    return out;
  }

  function normalize(c) {
    c = c || {};
    var out = {};
    GROUPS.forEach(function (g) {
      var it = find(g.key, c[g.key]);
      out[g.key] = it ? it.id : g.items[0].id;
    });


    out.pal = validPalette(c.pal) ? c.pal.slice() : null;
    out.look = (c.look && typeof c.look === 'object' && !Array.isArray(c.look)) ? c.look : {};
    return out;
  }
  function load() {
    var id = learnerId();
    if (loaded && loadedLearner === id) return;
    loaded = true;
    loadedLearner = id;
    clearTimeout(lookT);
    cfg = { animal: 'robot', b: 'blue', gear: 'none', hat: 'none', face: 'std', speech: '', pet: 'none', anim: 'idle', pal: null, look: {} };
    var local = null;
    try { local = localAvatar(id); } catch (e) {}
    var l = null;
    try { l = A() && A().getActiveLearner ? A().getActiveLearner() : null; } catch (e) {}
    var av = l && (l.avatar || l.avatar_config);
    cfg = normalize(mergeAvatar(local, av && typeof av === 'object' ? av : null));
    try { localStorage.setItem(avatarKey(id), JSON.stringify(cfg)); } catch (e) {}
  }
  function save() {
    load();
    var id = loadedLearner;
    try {
      localStorage.setItem(avatarKey(id), JSON.stringify(cfg));
      var owner = localStorage.getItem('tlp-avatar-owner');
      if (!owner || owner === 'default' || owner === id) localStorage.setItem('tlp-avatar-owner', id);
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('tlp-avatar-change')); } catch (e) {}
    var l = null;
    try { l = A() && A().getActiveLearner ? A().getActiveLearner() : null; } catch (e) {}
    if (!l || l.id !== id || id === 'default' || !A() || !A().supabase || !A().isCloudConfigured || !A().isCloudConfigured()) return;
    var payload = JSON.parse(JSON.stringify(cfg));
    A().supabase.rpc('save_avatar', { p_learner_id: id, p_avatar: payload }).then(function () {
      try { if (learnerId() === id) l.avatar = payload; } catch (e) {}
    }).catch(function () {});
  }
  function equip(group, id) {
    var it = find(group, id);
    if (!it) return;
    var st = todayProg();
    if (!unlocked(it, st, group)) { toastLock(it, st, group); return; }
    cfg[group] = id;


    if (group === 'b' && it.pal) cfg.pal = it.pal.slice();
    save(); renderOpen();
    if (window.TLP_COMMON && TLP_COMMON.snd) TLP_COMMON.snd('tick');
  }
  function toastLock(item, st, group) {
    var m = document.getElementById('avToast');
    if (!m) {
      m = document.createElement('div'); m.id = 'avToast'; m.className = 'av-toast';
      document.body.appendChild(m);
    }
    m.textContent = item.name + ' is locked. ' + hintFor(item, st, group);
    m.classList.add('on');
    clearTimeout(m._t);
    m._t = setTimeout(function () { m.classList.remove('on'); }, 3200);
  }





  function bodyOf(cfg) { return find('b', cfg.b) || BODIES[0]; }
  function validPalette(p) {
    return Array.isArray(p) && p.length === 3 && p.every(function (x) { return /^#[0-9a-fA-F]{6}$/.test(x); });
  }
  function paletteOf(c) {
    if (validPalette(c.pal)) return c.pal;
    var b = bodyOf(c);
    if (validPalette(b.pal)) return b.pal;
    var col = b.col || '#fbbf24';
    return [col, shade(col, 30), shade(col, -30)];
  }
  function hatOf(cfg) { return find('hat', cfg.hat) || HATS[0]; }
  function faceOf(cfg) { return find('face', cfg.face) || FACES[0]; }
  function speechOf(cfg) { return find('speech', cfg.speech == null ? '' : cfg.speech) || SPEECH[0]; }
  function animOf(cfg) { return find('anim', cfg.anim) || ANIMS[0]; }
  function animalOf(cfg) { return find('animal', cfg.animal) || ANIMALS[0]; }
  function gearOf(cfg) { return find('gear', cfg.gear) || GEAR[0]; }
  function petOf(cfg) { return find('pet', cfg.pet) || PETS[0]; }









  var TORSO = {
    robot:   { cx: 32, cy: 50, sx: 0.65, sy: 0.82 },
    axolotl: { cx: 32, cy: 50, sx: 1.12, sy: 0.92 },
    cat:     { cx: 32, cy: 51, sx: 0.90, sy: 0.90 },
    dog:     { cx: 32, cy: 51, sx: 0.90, sy: 0.90 },
    fox:     { cx: 32, cy: 51, sx: 0.90, sy: 0.90 },
    panda:   { cx: 32, cy: 51, sx: 0.94, sy: 0.90 },
    bunny:   { cx: 32, cy: 52, sx: 0.86, sy: 0.88 },
    horse:   { cx: 32, cy: 52, sx: 0.94, sy: 0.90 },
    tiger:   { cx: 32, cy: 51, sx: 0.92, sy: 0.90 },
    giraffe: { cx: 32, cy: 54, sx: 0.90, sy: 0.68 },
    dragon:  { cx: 32, cy: 52, sx: 0.94, sy: 0.90 }
  };
  var HAT_FIT = {
    robot:   { ty: 20, s: 1.00 },
    axolotl: { ty: 18, s: 0.95 },
    cat:     { ty: 18, s: 0.95 },
    dog:     { ty: 20, s: 0.95 },
    fox:     { ty: 19, s: 0.95 },
    panda:   { ty: 20, s: 0.95 },
    bunny:   { ty: 20, s: 0.90 },
    horse:   { ty: 20, s: 0.90 },
    tiger:   { ty: 18, s: 0.95 },
    giraffe: { ty: 10, s: 0.60 },
    dragon:  { ty: 19, s: 0.95 }
  };
  function gearTransform(fit) {
    fit = fit || TORSO.robot;
    return 'translate(' + fit.cx + ' ' + fit.cy + ') scale(' + fit.sx + ' ' + fit.sy + ') translate(-32 -48)';
  }
  function hatTransform(fit) {
    fit = fit || HAT_FIT.robot;
    return 'translate(32 ' + fit.ty + ') scale(' + fit.s + ') translate(-32 -20)';
  }


  function lum(hex) {
    var n = parseInt((hex || '#000000').slice(1), 16);
    if (isNaN(n)) return 0.5;
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }
  function clothColor(hex) {
    return lum(hex) > 0.55 ? shade(hex, -68) : shade(hex, 88);
  }



  function animalEyes(fid) {
    var ink = '#0b1220';
    if (fid === 'happy') return '<path d="M22 30 q3 -4 6 0 M36 30 q3 -4 6 0" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (fid === 'wink') return '<circle cx="25" cy="30" r="3" fill="' + ink + '"/><path d="M37 30 q3 -4 6 0" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (fid === 'cool') return '<rect x="17" y="24" width="30" height="10" rx="5" fill="' + ink + '"/><rect x="20" y="26" width="10" height="3" rx="1.5" fill="#67e8f9" opacity=".8"/>';
    if (fid === 'star') return '<path d="M23.5 24 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6-1.9 -3.6 1.9 .7-4 -2.9-2.8 4-.6z" fill="#fde047"/><path d="M40.5 24 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6-1.9 -3.6 1.9 .7-4 -2.9-2.8 4-.6z" fill="#fde047"/>';
    if (fid === 'mono') return '<rect x="18" y="25" width="28" height="9" rx="4" fill="' + ink + '"/><rect x="21" y="27" width="9" height="2.5" rx="1" fill="#67e8f9" opacity=".8"/>';
    if (fid === 'sleepy') return '<path d="M22 31 q3 3 6 0 M36 31 q3 3 6 0" stroke="' + ink + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (fid === 'angry') return '<path d="M20 25 l8 3 M44 25 l-8 3" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"/><circle cx="25" cy="31" r="2.6" fill="' + ink + '"/><circle cx="39" cy="31" r="2.6" fill="' + ink + '"/>';
    if (fid === 'heart') return '<path d="M25 33 c-3-4-8-1-8 2 c0 4 5 7 8 9 c3-2 8-5 8-9 c0-3-5-6-8-2z" fill="#fb7185"/><path d="M39 33 c-3-4-8-1-8 2 c0 4 5 7 8 9 c3-2 8-5 8-9 c0-3-5-6-8-2z" fill="#fb7185"/>';
    return '<circle cx="25" cy="30" r="3.2" fill="' + ink + '"/><circle cx="39" cy="30" r="3.2" fill="' + ink + '"/>' +
      '<circle cx="26.1" cy="28.9" r="1" fill="#fff" opacity=".85"/><circle cx="40.1" cy="28.9" r="1" fill="#fff" opacity=".85"/>';
  }
  function animalNose() { return '<ellipse cx="32" cy="38" rx="4.3" ry="2.8" fill="#0b1220" opacity=".55"/>'; }





  function animalHead(id, col, col2, col3) {
    col2 = col2 || shade(col, 30); col3 = col3 || shade(col, -30);


    var gloss = '<ellipse cx="25" cy="23" rx="8" ry="3.6" fill="#fff" opacity=".25"/>';
    var outline = 'stroke="' + shade(col, -35) + '" stroke-opacity=".42" stroke-width="1.55"';
    switch (id) {
      case 'axolotl': return '<ellipse cx="32" cy="36" rx="21" ry="15.5" fill="' + col + '" ' + outline + '/><ellipse cx="32" cy="41" rx="13" ry="8" fill="' + col2 + '" opacity=".45"/><path d="M11 30 q-8 -2 -10 -9 M10 36 q-10 0 -12 6 M10 42 q-8 2 -9 9 M53 30 q8 -2 10 -9 M54 36 q10 0 12 6 M54 42 q8 2 9 9" stroke="' + col3 + '" stroke-width="3.6" fill="none" stroke-linecap="round"/>' + gloss;
      case 'cat': return '<path d="M16 25 Q11 6 27 17 Q32 21 32 25 Z M48 25 Q53 6 37 17 Q32 21 32 25 Z" fill="' + col + '" ' + outline + '/><path d="M18 21 Q15 11 24 18 M46 21 Q49 11 40 18" fill="none" stroke="' + col2 + '" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="34" r="18" fill="' + col + '" ' + outline + '/><ellipse cx="32" cy="40" rx="11" ry="7" fill="' + col2 + '" opacity=".38"/>' + gloss;
      case 'dog': return '<path d="M13 25 Q5 12 14 9 Q24 11 21 27 Z M51 25 Q59 12 50 9 Q40 11 43 27 Z" fill="' + col3 + '" ' + outline + '/><ellipse cx="32" cy="34" rx="18" ry="17.5" fill="' + col + '" ' + outline + '/><ellipse cx="32" cy="40" rx="11.5" ry="7.5" fill="' + col2 + '" opacity=".42"/>' + gloss;
      case 'fox': return '<path d="M16 24 L11 7 L28 17 Z M48 24 L53 7 L36 17 Z" fill="' + col + '" ' + outline + '/><path d="M18 21 L14.5 11 L25.5 18 Z M46 21 L49.5 11 L38.5 18 Z" fill="' + col3 + '"/><circle cx="32" cy="34" r="16" fill="' + col + '" ' + outline + '/><path d="M21 41 q11 10 22 0 q-5 11 -11 11 q-6 0 -11 -11z" fill="' + col2 + '"/>' + gloss;
      case 'panda': return '<circle cx="16" cy="18" r="8.5" fill="' + col3 + '" ' + outline + '/><circle cx="48" cy="18" r="8.5" fill="' + col3 + '" ' + outline + '/><ellipse cx="32" cy="34" rx="18.5" ry="17.5" fill="' + col + '" ' + outline + '/><ellipse cx="24" cy="31" rx="5.8" ry="7" fill="' + col3 + '" transform="rotate(-16 24 31)"/><ellipse cx="40" cy="31" rx="5.8" ry="7" fill="' + col3 + '" transform="rotate(16 40 31)"/><ellipse cx="32" cy="41" rx="10" ry="6" fill="' + col2 + '" opacity=".38"/>' + gloss;
      case 'bunny': return '<ellipse cx="22" cy="9" rx="6.2" ry="13.5" fill="' + col + '" ' + outline + '/><ellipse cx="42" cy="9" rx="6.2" ry="13.5" fill="' + col + '" ' + outline + '/><ellipse cx="22" cy="9" rx="3.3" ry="9.5" fill="' + col2 + '"/><ellipse cx="42" cy="9" rx="3.3" ry="9.5" fill="' + col2 + '"/><ellipse cx="32" cy="35" rx="17" ry="16" fill="' + col + '" ' + outline + '/><ellipse cx="32" cy="40" rx="9.5" ry="6" fill="' + col2 + '" opacity=".42"/>' + gloss;
      case 'horse': return '<path d="M18 21 q-4 -13 7 -15 q6 5 4 14 Z M46 21 q4 -13 -7 -15 q-6 5 -4 14 Z" fill="' + col3 + '"/><ellipse cx="32" cy="34" rx="16.8" ry="15.5" fill="' + col + '" ' + outline + '/><path d="M24 21 q8 -6 16 0 l-2 7 q-6 -4 -12 0z" fill="' + col3 + '"/><ellipse cx="32" cy="41" rx="9.5" ry="6.2" fill="' + col2 + '" opacity=".28"/>' + gloss;
      case 'tiger': return '<path d="M16 24 L12 9 L27 17 Z M48 24 L52 9 L37 17 Z" fill="' + col + '" ' + outline + '/><path d="M18 21 L14.5 12 L25 18 Z M46 21 L49.5 12 L39 18 Z" fill="' + col2 + '"/><circle cx="32" cy="34" r="16.2" fill="' + col + '" ' + outline + '/><path d="M23 21 l4 4 M30 18 l3 5 M41 18 l-3 5 M45 22 l-4 3 M20 27 l5 1 M44 27 l-5 1" stroke="' + col3 + '" stroke-width="2" stroke-linecap="round" fill="none"/>' + gloss;
      case 'giraffe': return '<rect x="27.5" y="28" width="9" height="26" rx="4.5" fill="' + col + '" ' + outline + '/><path d="M20 9 q-5 -5 -10 -3 M30 6 q0 -6 5 -6 M40 7 q5 -4 10 -2" stroke="' + col3 + '" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="16" rx="13.5" ry="10.5" fill="' + col + '" ' + outline + '/><ellipse cx="32" cy="20" rx="8" ry="4.5" fill="' + col2 + '" opacity=".62"/><circle cx="26" cy="10" r="3" fill="' + col3 + '"/><circle cx="38" cy="8" r="3" fill="' + col3 + '"/><circle cx="44" cy="13" r="2.4" fill="' + col3 + '"/><circle cx="20" cy="15" r="2.4" fill="' + col3 + '"/><ellipse cx="28" cy="13" rx="4.5" ry="2" fill="#fff" opacity=".12"/>';
      case 'dragon': return '<path d="M15 21 L7 5 L23 14 Z M49 21 L57 5 L41 14 Z" fill="' + col + '" ' + outline + '/><path d="M17 17 L12 8 L23 14 Z M47 17 L52 8 L41 14 Z" fill="' + col2 + '"/><ellipse cx="32" cy="34" rx="17" ry="15" fill="' + col + '" ' + outline + '/><path d="M22 23 q5 4 10 0 M32 21 q5 4 10 0" stroke="' + col3 + '" stroke-width="2.1" fill="none"/><path d="M19 38 q13 8 26 0" stroke="' + col2 + '" stroke-opacity=".35" stroke-width="2" fill="none"/>' + gloss;
      default: return '';
    }
  }


  function animalFace(id, fid, col2, col3) {
    var ink = '#0b1220', f = animalEyes(fid);


    f = '<ellipse cx="19.5" cy="37" rx="3.2" ry="2.1" fill="#fb8da7" opacity=".58"/><ellipse cx="44.5" cy="37" rx="3.2" ry="2.1" fill="#fb8da7" opacity=".58"/>' + f;
    if (id === 'dog') f += '<ellipse cx="32" cy="41" rx="8" ry="6" fill="' + col2 + '"/>';
    if (id === 'panda') f += '<ellipse cx="32" cy="40" rx="5.5" ry="4" fill="' + col3 + '"/>';
    if (id === 'bunny') f += '<path d="M29 43 h6 l-3 4.5z" fill="' + col3 + '"/>';
    if (id === 'horse') f += '<ellipse cx="32" cy="42" rx="10" ry="6" fill="' + col2 + '"/>';
    if (id === 'cat') f += '<path d="M32 42 q0 4 -5 4 M32 42 q0 4 5 4" stroke="' + ink + '" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M8 32 h10 M9 37 l9 -2 M56 32 h-10 M55 37 l-9 -2" stroke="' + col3 + '" stroke-width="1.4" stroke-linecap="round"/>';
    if (id === 'tiger') f += '<path d="M24 46 q8 5 16 0" stroke="' + col3 + '" stroke-width="2" stroke-linecap="round" fill="none"/>';
    if (id === 'dragon') f += '<path d="M26 41 q6 5 12 0" stroke="' + ink + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (id !== 'cat' && id !== 'dragon') f += '<path d="M28 42 q4 3 8 0" stroke="' + ink + '" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".75"/>';
    if (id !== 'dragon') f += animalNose();
    return id === 'giraffe' ? '<g transform="translate(0 -17)">' + f + '</g>' : f;
  }

  function animalArt(id, fid, col, col2, col3) {
    return animalHead(id, col, col2, col3) + animalFace(id, fid, col2, col3);
  }




  function animalBody(id, col, col2, col3) {
    col2 = col2 || shade(col, 30); col3 = col3 || shade(col, -30);
    var leg = function (x, y, w, h, f) { return '<rect x="' + x + '" y="' + (y || 55) + '" width="' + (w || 5) + '" height="' + (h || 8) + '" rx="2.4" fill="' + (f || col3) + '"/>'; };
    switch (id) {
      case 'axolotl': return '<ellipse cx="32" cy="50" rx="19" ry="11" fill="' + col + '"/><ellipse cx="32" cy="53" rx="11" ry="6" fill="' + col2 + '"/>' + leg(19, 54, 6, 8) + leg(26, 55, 6, 7) + leg(37, 55, 6, 7) + leg(44, 54, 6, 8) + '<path d="M13 47 q-9 2 -10 9" stroke="' + col3 + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
      case 'cat': return '<path d="M45 46 q11 -2 9 -15" stroke="' + col3 + '" stroke-width="3.6" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="51" rx="14" ry="10" fill="' + col + '"/><ellipse cx="32" cy="54" rx="8" ry="5" fill="' + col2 + '"/>' + leg(22, 56, 4.6, 7) + leg(28.5, 56, 4.6, 7) + leg(36.5, 56, 4.6, 7) + leg(42.5, 56, 4.6, 7);
      case 'dog': return '<path d="M46 47 q7 1 7 -7" stroke="' + col3 + '" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="51" rx="14" ry="10" fill="' + col + '"/><ellipse cx="32" cy="54" rx="8" ry="5" fill="' + col2 + '"/>' + leg(22, 56, 4.6, 7) + leg(28.5, 56, 4.6, 7) + leg(36.5, 56, 4.6, 7) + leg(42.5, 56, 4.6, 7);
      case 'fox': return '<path d="M44 53 q15 5 12 -9 q-2 -7 -10 -6 q7 3 6 8 q-1 5 -8 7z" fill="' + col3 + '"/><ellipse cx="32" cy="51" rx="14" ry="10" fill="' + col + '"/><ellipse cx="32" cy="54" rx="8" ry="5" fill="' + col2 + '"/>' + leg(22, 56, 4.6, 7) + leg(28.5, 56, 4.6, 7) + leg(36.5, 56, 4.6, 7) + leg(42.5, 56, 4.6, 7);
      case 'panda': return '<path d="M15 51 q-6 1 -6 -6" stroke="' + col3 + '" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="51" rx="15" ry="10" fill="' + col + '"/><ellipse cx="24" cy="49" rx="5" ry="7" fill="' + col3 + '" transform="rotate(-14 24 49)"/><ellipse cx="40" cy="49" rx="5" ry="7" fill="' + col3 + '" transform="rotate(14 40 49)"/>' + leg(23, 56, 5, 7, col) + leg(29, 56, 5, 7, col) + leg(37, 56, 5, 7, col) + leg(43, 56, 5, 7, col);
      case 'bunny': return '<ellipse cx="18" cy="50" rx="4" ry="4" fill="' + col2 + '"/><ellipse cx="32" cy="52" rx="13" ry="10" fill="' + col + '"/><ellipse cx="25" cy="60" rx="5.5" ry="3" fill="' + col2 + '"/><ellipse cx="39" cy="60" rx="5.5" ry="3" fill="' + col2 + '"/>' + leg(24, 57, 4, 6, col) + leg(37, 57, 4, 6, col);
      case 'horse': return '<path d="M18 52 q-7 5 -5 12" stroke="' + col3 + '" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="52" rx="15" ry="10" fill="' + col + '"/><path d="M24 44 q8 -5 16 0 l-1.5 6 q-6.5 -4 -13 0z" fill="' + col3 + '"/>' + leg(22, 57, 3.6, 6, col) + leg(28.5, 57, 3.6, 6, col) + leg(36.5, 57, 3.6, 6, col) + leg(43, 57, 3.6, 6, col);
      case 'tiger': return '<path d="M45 49 q10 -3 9 -14" stroke="' + col3 + '" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="51" rx="15" ry="10" fill="' + col + '"/><path d="M22 46 l7 3 M30 44 l6 3 M40 44 l-6 3 M45 47 l-6 2" stroke="' + col3 + '" stroke-width="2" stroke-linecap="round"/>' + leg(23, 56, 4.6, 7) + leg(29.5, 56, 4.6, 7) + leg(37.5, 56, 4.6, 7) + leg(43.5, 56, 4.6, 7);
      case 'giraffe': return '<path d="M17 55 q-5 3 -4 10" stroke="' + col3 + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="18" cy="53" r="2" fill="' + col3 + '"/><ellipse cx="32" cy="56" rx="14" ry="8" fill="' + col + '"/><ellipse cx="26" cy="54" rx="3.4" ry="2.2" fill="' + col3 + '"/><ellipse cx="36" cy="57" rx="3" ry="2" fill="' + col3 + '"/><ellipse cx="31" cy="60" rx="2.6" ry="1.8" fill="' + col3 + '"/>' + leg(23, 59, 3.4, 4, col) + leg(29, 59, 3.4, 4, col) + leg(37, 59, 3.4, 4, col) + leg(43, 59, 3.4, 4, col);
      case 'dragon': return '<path d="M14 44 q-8 -2 -9 -10 q7 -2 11 3z" fill="' + col2 + '"/><path d="M50 44 q8 -2 9 -10 q-7 -2 -11 3z" fill="' + col2 + '"/><path d="M45 55 q13 3 11 -7 q-3 -6 -9 -4 q6 2 5 6 q-1 4 -7 5z" fill="' + col3 + '"/><ellipse cx="32" cy="52" rx="15" ry="10" fill="' + col + '"/><ellipse cx="32" cy="55" rx="9" ry="5" fill="' + col2 + '"/><path d="M27 55 v4 M32 56 v4 M37 55 v4" stroke="' + col3 + '" stroke-width="1.6"/>' + leg(23, 57, 4.6, 6) + leg(37, 57, 4.6, 6);
      default: return '';
    }
  }




  function gearSvg(gid, col, fit) {
    if (!gid || gid === 'none') return '';
    col = col || '#35c9e8';
    var cloth = clothColor(col), dk = shade(cloth, -44), lt = shade(cloth, 44);
    var s = '';
    switch (gid) {
      case 'scarf':
        s = '<path d="M18 39 q14 -7 28 0 l1 7 q-15 6 -30 0z" fill="#dc2626" stroke="#991b1b" stroke-width="1.3"/>' +
            '<path d="M18 39 q14 -7 28 0 l.8 2.4 q-14.8 -6 -29.6 0z" fill="#fca5a5" opacity=".75"/>' +
            '<path d="M27 46 l-3 10 5.5 -2 2 6 4 -6 5.5 2 -3 -10z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1"/>' +
            '<path d="M27 46 q5 3 10 0" stroke="' + lt + '" stroke-width="1.4" fill="none" opacity=".8"/>';
        break;
      case 'bandana':
        s = '<path d="M17 38 q15 -8 30 0 l-2 10 q-13 5 -26 0z" fill="#ea580c" stroke="#9a3412" stroke-width="1.3"/>' +
            '<path d="M17 38 q15 -8 30 0 l1 2.6 q-16 -7.5 -32 0z" fill="#fdba74" opacity=".75"/>' +
            '<circle cx="47" cy="43" r="3.2" fill="' + cloth + '" stroke="' + dk + '" stroke-width="1"/>' +
            '<circle cx="47" cy="43" r="1.4" fill="' + lt + '"/>';
        break;
      case 'hoodie':
        s = '<path d="M18 39 q14 -8 28 0 l2 17 q-16 6 -32 0z" fill="' + cloth + '" stroke="' + dk + '" stroke-width="1.4"/>' +
            '<path d="M18 39 q14 -8 28 0 l.9 3 q-14.9 -7 -29.8 0z" fill="' + lt + '" opacity=".6"/>' +
            '<path d="M25 42 l-3 3 4.5 3.5 3 -3.5z M39 42 l3 3 -4.5 3.5 -3 -3.5z" fill="' + dk + '" opacity=".85"/>' +
            '<path d="M27 48 h10 v3.5 q-5 3 -10 0z" fill="' + dk + '" opacity=".35"/>' +
            '<path d="M22 56 q10 3.5 20 0" stroke="' + dk + '" stroke-width="1.5" fill="none" opacity=".7"/>';
        break;
      case 'vest':
        s = '<path d="M21 40 h22 l2 16 h-26z" fill="' + cloth + '" stroke="' + dk + '" stroke-width="1.4"/>' +
            '<path d="M21 40 h22 l1 3.5 h-24z" fill="' + lt + '" opacity=".6"/>' +
            '<path d="M26 40 l3.5 5 3 -5 M38 40 l-3.5 5 -3 -5" fill="none" stroke="' + dk + '" stroke-width="1.7"/>' +
            '<path d="M27.5 40 v16 M36.5 40 v16" stroke="' + dk + '" stroke-width="1.6" opacity=".65"/>' +
            '<circle cx="30" cy="47" r="1.4" fill="' + lt + '"/><circle cx="30" cy="52" r="1.4" fill="' + lt + '"/>';
        break;
      case 'cape':
        s = '<path d="M14 39 q18 -9 36 0 l4 20 q-22 6 -44 0z" fill="#6d28d9" stroke="#4c1d95" stroke-width="1.4"/>' +
            '<path d="M14 39 q18 -9 36 0 l1.2 3 q-19.2 -8.5 -38.4 0z" fill="#a78bfa" opacity=".6"/>' +
            '<path d="M25 43 q7 4 14 0" stroke="' + cloth + '" stroke-width="1.6" fill="none" opacity=".85"/>' +
            '<circle cx="25" cy="42" r="2.4" fill="' + lt + '" stroke="' + dk + '" stroke-width="1"/>' +
            '<circle cx="39" cy="42" r="2.4" fill="' + lt + '" stroke="' + dk + '" stroke-width="1"/>';
        break;
      case 'backpack':
        s = '<rect x="43" y="40" width="14" height="16" rx="4" fill="#92400e" stroke="#78350f" stroke-width="1.4"/>' +
            '<path d="M46 40 q0 -7 4 -7 q4 0 4 7" stroke="#78350f" stroke-width="2" fill="none"/>' +
            '<rect x="46" y="45" width="8" height="6" rx="2" fill="' + cloth + '" stroke="' + dk + '" stroke-width="1"/>' +
            '<circle cx="50" cy="48" r="1.3" fill="' + lt + '"/>' +
            '<path d="M44.5 53 h11" stroke="#b45309" stroke-width="1.2" opacity=".8"/>';
        break;
      case 'overalls':
        s = '<path d="M22 44 h20 l2 14 h-24z" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.4"/>' +
            '<path d="M26 44 l-2 -7 h7 l1.5 7 M38 44 l2 -7 h-7 l-1.5 7" stroke="#1d4ed8" stroke-width="2.6" fill="none"/>' +
            '<rect x="26" y="48" width="12" height="8" rx="2" fill="#1e3a8a"/>' +
            '<circle cx="29" cy="52" r="1.3" fill="#93c5fd"/><circle cx="35" cy="52" r="1.3" fill="#93c5fd"/>' +
            '<path d="M23 57 h18" stroke="' + lt + '" stroke-width="1.2" opacity=".6"/>';
        break;
      case 'jersey':
        s = '<path d="M19 39 q13 -7 26 0 l3 16 q-16 6 -32 0z" fill="#dc2626" stroke="#991b1b" stroke-width="1.4"/>' +
            '<path d="M19 39 q13 -7 26 0 l1 3 q-14 -6.5 -28 0z" fill="#fca5a5" opacity=".65"/>' +
            '<path d="M22 55 q10 3 20 0" stroke="' + lt + '" stroke-width="1.5" fill="none" opacity=".7"/>' +
            '<text x="32" y="50" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" font-family="sans-serif" stroke="#7f1d1d" stroke-width=".6" paint-order="stroke">7</text>';
        break;
      case 'apron':
        s = '<path d="M24 41 h16 l2 16 h-20z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/>' +
            '<path d="M24 41 h16 l.8 2.8 h-17.6z" fill="#e2e8f0" opacity=".85"/>' +
            '<path d="M27.5 40 v5 M36.5 40 v5" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round"/>' +
            '<path d="M27 50 h10 v4 h-10z" fill="' + lt + '" opacity=".8" stroke="' + dk + '" stroke-width="1"/>' +
            '<path d="M27 51.5 h10" stroke="' + dk + '" stroke-width="1" opacity=".5"/>';
        break;
      case 'tux':
        s = '<path d="M19 39 q13 -7 26 0 l2 17 q-15 6 -30 0z" fill="#1f2937" stroke="#111827" stroke-width="1.4"/>' +
            '<path d="M19 39 q13 -7 26 0 l1 3 q-14 -6.5 -28 0z" fill="#4b5563" opacity=".7"/>' +
            '<path d="M32 41 l-4.5 6.5 4.5 8 4.5 -8z" fill="#fff"/>' +
            '<path d="M27.5 41 l-3.5 4.5 M36.5 41 l3.5 4.5" stroke="#fff" stroke-width="2.2"/>' +
            '<path d="M32 43 l-3 -2 v4z M32 43 l3 -2 v4z" fill="' + cloth + '"/><circle cx="32" cy="43" r="1.3" fill="' + lt + '"/>';
        break;
      default: return '';
    }
    return '<g transform="' + gearTransform(fit) + '">' + s + '</g>';
  }


  function petSvg(pid) {
    var ink = '#0b1220', pet = '';
    switch (pid) {
      case 'kitten':
        pet = '<path d="M4 7 L2 0 L8 4 Z M16 7 L18 0 L12 4 Z" fill="#f59e0b"/><circle cx="10" cy="12" r="9" fill="#fbbf24"/><ellipse cx="10" cy="14" rx="4.5" ry="3" fill="#fde68a"/><circle cx="7" cy="11" r="1.4" fill="' + ink + '"/><circle cx="13" cy="11" r="1.4" fill="' + ink + '"/><path d="M9 14 q1 1.5 2 0" stroke="' + ink + '" stroke-width="1" fill="none" stroke-linecap="round"/>';
        break;
      case 'puppy':
        pet = '<path d="M3 8 q-4 -6 1 -8 q3 3 2 8 Z M17 8 q4 -6 -1 -8 q-3 3 -2 8 Z" fill="#92400e"/><circle cx="10" cy="13" r="9" fill="#d97706"/><ellipse cx="10" cy="16" rx="3.2" ry="2.5" fill="#fef3c7"/><circle cx="7" cy="12" r="1.4" fill="' + ink + '"/><circle cx="13" cy="12" r="1.4" fill="' + ink + '"/>';
        break;
      case 'bunny':
        pet = '<ellipse cx="7" cy="4" rx="2" ry="6" fill="#f9a8d4"/><ellipse cx="13" cy="4" rx="2" ry="6" fill="#f9a8d4"/><ellipse cx="7" cy="4" rx=".9" ry="4" fill="#fbcfe8"/><ellipse cx="13" cy="4" rx=".9" ry="4" fill="#fbcfe8"/><circle cx="10" cy="13" r="8" fill="#fdf2f8"/><circle cx="7" cy="12" r="1.3" fill="' + ink + '"/><circle cx="13" cy="12" r="1.3" fill="' + ink + '"/><path d="M9.4 15 h1.2 l-.6 1z" fill="#fb7185"/>';
        break;
      case 'fox':
        pet = '<path d="M4 6 L2 0 L8 4 Z M16 6 L18 0 L12 4 Z" fill="#ea580c"/><circle cx="10" cy="13" r="8" fill="#f97316"/><path d="M6 16 q4 4 8 0 q-2 4 -4 4 q-2 0 -4 -4z" fill="#fed7aa"/><circle cx="7" cy="12" r="1.3" fill="' + ink + '"/><circle cx="13" cy="12" r="1.3" fill="' + ink + '"/>';
        break;
      case 'duck':
        pet = '<ellipse cx="10" cy="14" rx="8" ry="7" fill="#facc15"/><circle cx="14" cy="8" r="5" fill="#fde047"/><path d="M18 8 l4 1 -4 2z" fill="#f97316" stroke="#ea580c" stroke-width=".8"/><circle cx="15" cy="7" r="1.2" fill="' + ink + '"/>';
        break;
      case 'slime':
        pet = '<path d="M4 18 q0 -12 8 -12 q8 0 8 12 q-4 4 -8 4 q-4 0 -8 -4z" fill="#34d399"/><circle cx="8" cy="11" r="1.6" fill="' + ink + '"/><circle cx="14" cy="11" r="1.6" fill="' + ink + '"/><circle cx="5" cy="8" r="1.4" fill="#a7f3d0" opacity=".85"/>';
        break;
      case 'ghost':
        pet = '<path d="M4 4 h14 v10 q0 6 -7 6 q-7 0 -7 -6z" fill="#e2e8f0"/><circle cx="8" cy="9" r="1.8" fill="' + ink + '"/><circle cx="14" cy="9" r="1.8" fill="' + ink + '"/><path d="M7 14 q3 3 6 0" stroke="' + ink + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
        break;
      case 'mini':
        pet = '<rect x="4" y="7" width="13" height="11" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/><rect x="6" y="9" width="4" height="3" rx="1" fill="#22d3ee"/><rect x="12" y="9" width="3" height="3" rx="1" fill="#a78bfa"/><path d="M7 18 v2 M14 18 v2" stroke="#64748b" stroke-width="1.4"/><line x1="10.5" y1="7" x2="10.5" y2="3" stroke="#64748b" stroke-width="1.2"/><circle cx="10.5" cy="2.5" r="1.3" fill="#facc15"/>';
        break;
      case 'robot':
        pet = '<rect x="4" y="6" width="14" height="12" rx="3" fill="#94a3b8" stroke="#64748b" stroke-width="1"/><rect x="7" y="9" width="4" height="4" rx="1" fill="#67e8f9"/><rect x="13" y="9" width="4" height="4" rx="1" fill="#67e8f9"/><line x1="11" y1="6" x2="11" y2="2" stroke="#64748b" stroke-width="1.6"/><circle cx="11" cy="2" r="1.6" fill="#f472b6"/>';
        break;
      default: return '';
    }
    return '<g transform="translate(43 49) scale(.5)"><ellipse cx="10" cy="20" rx="7" ry="1.6" fill="' + ink + '" opacity=".14"/>' + pet + '</g>';
  }

  function animalAvatar(c, an, h, f, s, bubble, px) {
    var b = bodyOf(c) || BODIES[0];
    var pal = paletteOf(c);
    var col = pal[0], col2 = pal[1], col3 = pal[2];
    return '<svg class="av-svg av-animal-svg" viewBox="0 0 64 64" width="' + (px || 40) + '" height="' + (px || 40) + '" aria-hidden="true" focusable="false">' +
      animalBody(an.id, col, col2, col3) +
      animalHead(an.id, col, col2, col3) +
      gearSvg(gearOf(c).id, col, TORSO[an.id]) +
      animalFace(an.id, f.id, col2, col3) +
      hatSvg(h.id, HAT_FIT[an.id]) +
      petSvg(petOf(c).id) + bubble + '</svg>';
  }

  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function eyes(fid) {
    if (fid === 'happy') return '<path d="M22 30 q3 -4 6 0 M36 30 q3 -4 6 0" stroke="#0b1220" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (fid === 'wink') return '<rect x="20" y="27" width="7" height="7" rx="2" fill="#0b1220"/><path d="M37 31 q3 -4 6 0" stroke="#0b1220" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (fid === 'cool') return '<rect x="17" y="24" width="30" height="10" rx="5" fill="#0b1220"/><rect x="20" y="26" width="10" height="3" rx="1.5" fill="#67e8f9" opacity=".8"/>';
    if (fid === 'star') return '<path d="M23.5 24 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6-1.9 -3.6 1.9 .7-4 -2.9-2.8 4-.6z" fill="#fde047"/><path d="M40.5 24 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6-1.9 -3.6 1.9 .7-4 -2.9-2.8 4-.6z" fill="#fde047"/>';
    if (fid === 'mono') return '<rect x="18" y="25" width="28" height="8" rx="4" fill="#0b1220"/><rect x="21" y="27" width="10" height="4" rx="2" fill="#67e8f9"/>';
    if (fid === 'sleepy') return '<rect x="20" y="29" width="7" height="3" rx="1.5" fill="#0b1220"/><rect x="37" y="29" width="7" height="3" rx="1.5" fill="#0b1220"/><path d="M27 36 h10" stroke="#0b1220" stroke-width="2" stroke-linecap="round"/>';
    if (fid === 'angry') return '<path d="M19 24 l8 3 M45 24 l-8 3" stroke="#0b1220" stroke-width="2.4" stroke-linecap="round"/><rect x="21" y="28" width="6" height="7" rx="2" fill="#0b1220"/><rect x="37" y="28" width="6" height="7" rx="2" fill="#0b1220"/><path d="M27 37 q5 -3 10 0" stroke="#0b1220" stroke-width="2" fill="none" stroke-linecap="round"/>';
    if (fid === 'heart') return '<path d="M23.5 33 c-4 -5 -8 -8 -8 -12 a4.4 4.4 0 0 1 8 -2.4 a4.4 4.4 0 0 1 8 2.4 c0 4 -4 7 -8 12z" fill="#fb7185" transform="translate(0,-6) scale(.9)"/><path d="M40.5 33 c-4 -5 -8 -8 -8 -12 a4.4 4.4 0 0 1 8 -2.4 a4.4 4.4 0 0 1 8 2.4 c0 4 -4 7 -8 12z" fill="#fb7185" transform="translate(0,-6) scale(.9)"/>';
    return '<rect x="20" y="26" width="7" height="9" rx="2" fill="#0b1220"/><rect x="37" y="26" width="7" height="9" rx="2" fill="#0b1220"/><rect x="22" y="28" width="2" height="3" rx="1" fill="#bff3ff"/><rect x="39" y="28" width="2" height="3" rx="1" fill="#bff3ff"/>';
  }



  function hatSvg(hid, fit) {
    var hat = '';
    switch (hid) {
      case 'cap':
        hat = '<path d="M16 20 q16 -12 32 0 l0 4 -32 0z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.3"/>' +
              '<rect x="44" y="20" width="10" height="4" rx="2" fill="#b91c1c"/><circle cx="32" cy="9" r="1.8" fill="#fca5a5"/>';
        break;
      case 'phones':
        hat = '<path d="M14 22 q0 -9 18 -9 q18 0 18 9" stroke="#a78bfa" stroke-width="4" fill="none" stroke-linecap="round"/>' +
              '<rect x="11" y="18" width="7" height="12" rx="3" fill="#7c3aed"/><rect x="46" y="18" width="7" height="12" rx="3" fill="#7c3aed"/>' +
              '<rect x="12.5" y="20" width="1.6" height="7" rx=".8" fill="#ddd6fe" opacity=".8"/>';
        break;
      case 'prop':
        hat = '<rect x="29" y="4" width="6" height="15" rx="2" fill="#94a3b8"/><ellipse cx="32" cy="5" rx="11" ry="3" fill="#f472b6"/>' +
              '<circle cx="32" cy="5" r="2.2" fill="#be185d"/>';
        break;
      case 'wizard':
        hat = '<path d="M14 22 L32 2 L50 22 Z" fill="#312e81"/><path d="M32 2 L38 22 h-6z" fill="#4338ca" opacity=".65"/>' +
              '<rect x="12" y="20" width="40" height="5" rx="2.5" fill="#4338ca"/><circle cx="32" cy="3" r="2.4" fill="#fde047"/>';
        break;
      case 'crown':
        hat = '<path d="M18 18 L18 8 L24 13 L32 5 L40 13 L46 8 L46 18 Z" fill="#facc15" stroke="#b45309" stroke-width="1.4" stroke-linejoin="round"/>' +
              '<circle cx="32" cy="14" r="2" fill="#ef4444"/><circle cx="21" cy="15" r="1.5" fill="#67e8f9"/><circle cx="43" cy="15" r="1.5" fill="#67e8f9"/>';
        break;
      case 'halo':
        hat = '<ellipse cx="32" cy="8" rx="12" ry="4" fill="none" stroke="#fde047" stroke-width="4" opacity=".35"/>' +
              '<ellipse cx="32" cy="8" rx="12" ry="4" fill="none" stroke="#fde047" stroke-width="2.4"/>';
        break;
      case 'visor':
        hat = '<rect x="15" y="16" width="34" height="9" rx="4" fill="#0ea5e9" stroke="#0369a1" stroke-width="1.2"/>' +
              '<rect x="18" y="18" width="12" height="3" rx="1.5" fill="#e0f2fe" opacity=".9"/>';
        break;
      case 'band':
        hat = '<path d="M15 18 q17 -10 34 0 l0 6 -34 0z" fill="#f97316" stroke="#ea580c" stroke-width="1.2"/>' +
              '<path d="M47 19 l9 2 -7 3 2 -3z" fill="#ea580c"/>';
        break;
      case 'bow':
        hat = '<path d="M32 12 l-9 -5 v10z M32 12 l9 -5 v10z" fill="#f472b6" stroke="#db2777" stroke-width="1.2"/>' +
              '<circle cx="32" cy="12" r="3.4" fill="#db2777"/>';
        break;
      case 'horns':
        hat = '<path d="M18 14 q-4 -8 4 -10 q2 6 2 10z M46 14 q4 -8 -4 -10 q-2 6 -2 10z" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>';
        break;
      case 'tophat':
        hat = '<path d="M20 21 V8 q0 -2 2 -2 h20 q2 0 2 2 v13z" fill="#1f2937" stroke="#111827" stroke-width="1.2"/>' +
              '<rect x="20" y="16" width="24" height="4" fill="#dc2626"/><rect x="15" y="20" width="34" height="5" rx="2.5" fill="#111827"/>';
        break;
      case 'beanie':
        hat = '<path d="M16 22 q0 -15 16 -15 q16 0 16 15z" fill="#0ea5e9" stroke="#0369a1" stroke-width="1.2"/>' +
              '<rect x="14" y="19" width="36" height="6" rx="3" fill="#0284c7"/><circle cx="32" cy="5" r="3" fill="#f8fafc"/>';
        break;
      case 'bucket':
        hat = '<path d="M19 21 q0 -13 13 -13 q13 0 13 13z" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>' +
              '<ellipse cx="32" cy="21" rx="22" ry="4.5" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>';
        break;
      case 'flower':
        hat = '<g transform="translate(43 12)"><ellipse cx="0" cy="-6" rx="3.4" ry="5" fill="#fb7185"/><ellipse cx="0" cy="6" rx="3.4" ry="5" fill="#fb7185"/>' +
              '<ellipse cx="-6" cy="0" rx="5" ry="3.4" fill="#fb7185"/><ellipse cx="6" cy="0" rx="5" ry="3.4" fill="#fb7185"/><circle cx="0" cy="0" r="3" fill="#fde047"/></g>';
        break;
      case 'antenna':
        hat = '<path d="M15 19 q17 -8 34 0 l0 4 -34 0z" fill="#22d3ee" stroke="#0891b2" stroke-width="1.2"/>' +
              '<line x1="23" y1="19" x2="19" y2="8" stroke="#64748b" stroke-width="1.6"/><circle cx="19" cy="7" r="2.4" fill="#f472b6"/>' +
              '<line x1="41" y1="19" x2="45" y2="8" stroke="#64748b" stroke-width="1.6"/><circle cx="45" cy="7" r="2.4" fill="#fde047"/>';
        break;
      case 'laurel':
        hat = '<path d="M20 24 q-8 -9 -3 -17 M44 24 q8 -9 3 -17" stroke="#16a34a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
              '<ellipse cx="16" cy="9" rx="2.4" ry="4" fill="#4ade80" transform="rotate(-35 16 9)"/><ellipse cx="14" cy="15" rx="2.4" ry="4" fill="#4ade80" transform="rotate(-55 14 15)"/>' +
              '<ellipse cx="48" cy="9" rx="2.4" ry="4" fill="#4ade80" transform="rotate(35 48 9)"/><ellipse cx="50" cy="15" rx="2.4" ry="4" fill="#4ade80" transform="rotate(55 50 15)"/>';
        break;
      default: return '';
    }
    return '<g transform="' + hatTransform(fit) + '">' + hat + '</g>';
  }
  var svgSeq = 0;
  function svg(cfgIn, px) {
    var c = normalize(cfgIn || cfg);
    var b = bodyOf(c), h = hatOf(c), f = faceOf(c), s = speechOf(c), an = animalOf(c);


    var pc = paletteOf(c);
    var bc = pc[0];
    var bubble = s.id ? '<g class="av-bubble"><rect x="40" y="2" width="22" height="12" rx="6" fill="#0b1220" stroke="' + bc + '" stroke-width="1.4"/><text x="51" y="11" text-anchor="middle" font-size="7.5" font-family="monospace" fill="#e2f3ff">' + esc(s.id) + '</text></g>' : '';
    if (an.id !== 'robot') return animalAvatar(c, an, h, f, s, bubble, px);
    var rc2 = pc[1], rc3 = pc[2];


    var gid = 'avg' + (++svgSeq);
    var chassis = '<ellipse cx="32" cy="61" rx="17" ry="2.3" fill="#020617" opacity=".32"/>' +
      '<path d="M20 43 L12 48 L14 53 L23 50 M44 43 L52 48 L50 53 L41 50" fill="none" stroke="' + shade(bc, -34) + '" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="13" cy="49" r="3.2" fill="' + rc2 + '" stroke="' + shade(bc, -42) + '" stroke-width="1.4"/><circle cx="51" cy="49" r="3.2" fill="' + rc2 + '" stroke="' + shade(bc, -42) + '" stroke-width="1.4"/>' +
      '<path d="M24 53 v5 q0 2 2 2 h3 q2 0 2 -2 v-5 M33 53 v5 q0 2 2 2 h3 q2 0 2 -2 v-5" fill="' + shade(bc, -18) + '" stroke="' + shade(bc, -42) + '" stroke-width="1.2"/>' +
      '<path d="M22 42 Q32 37 42 42 L45 56 Q32 61 19 56 Z" fill="url(#' + gid + 'shell)" stroke="' + shade(bc, -32) + '" stroke-width="1.5"/>' +
      '<path d="M24 46 Q32 43 40 46 L40 53 Q32 56 24 53 Z" fill="' + shade(bc, -20) + '" opacity=".72"/>' +
      '<rect x="27" y="2" width="10" height="9" rx="4" fill="' + shade(bc, -28) + '" stroke="' + shade(bc, -42) + '" stroke-width="1"/>' +
      '<path d="M32 10 V5" stroke="' + rc2 + '" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="4" r="3.5" fill="' + rc3 + '" stroke="#fff" stroke-opacity=".55" stroke-width="1" class="av-tip"/>' +
      '<rect x="10" y="18" width="6" height="13" rx="3" fill="' + shade(bc, -32) + '" stroke="' + shade(bc, -44) + '" stroke-width="1"/><rect x="48" y="18" width="6" height="13" rx="3" fill="' + shade(bc, -32) + '" stroke="' + shade(bc, -44) + '" stroke-width="1"/>' +
      '<rect x="13" y="9" width="38" height="34" rx="13" fill="url(#' + gid + 'shell)" stroke="' + shade(bc, -34) + '" stroke-width="1.8"/>' +
      '<path d="M19 13 Q32 7 45 13" fill="none" stroke="#fff" stroke-opacity=".52" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M16 34 Q18 41 25 42 M48 34 Q46 41 39 42" fill="none" stroke="' + rc2 + '" stroke-opacity=".48" stroke-width="1.2"/>' +
      '<circle cx="17.5" cy="14" r="1" fill="#fff" opacity=".72"/><circle cx="46.5" cy="14" r="1" fill="#fff" opacity=".72"/>';


    var front = '<rect x="16" y="19" width="32" height="21" rx="8" fill="#07111f" stroke="' + rc2 + '" stroke-opacity=".68" stroke-width="1.3"/>' +
      '<path d="M20 21 H44" stroke="#fff" stroke-opacity=".16" stroke-width="1.2" stroke-linecap="round"/>' +
      '<g class="av-eye-lights">' + eyes(f.id) + '</g>' +
      '<path d="M25 42 H39" stroke="' + shade(bc, -42) + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="32" cy="50" r="5.4" fill="' + shade(bc, -38) + '" stroke="' + shade(bc, -48) + '" stroke-width="1"/><circle cx="32" cy="50" r="3.3" fill="url(#' + gid + 'core)" class="av-core"/><circle cx="31" cy="49" r=".9" fill="#fff" opacity=".9"/>' +
      '<path d="M25 56 Q32 58 39 56" fill="none" stroke="' + rc2 + '" stroke-opacity=".7" stroke-width="1"/>';
    return '<svg class="av-svg" viewBox="0 0 64 64" width="' + (px || 40) + '" height="' + (px || 40) + '" aria-hidden="true" focusable="false">' +
      chassis + gearSvg(gearOf(c).id, bc, TORSO.robot) + front +
      hatSvg(h.id, HAT_FIT.robot) + petSvg(petOf(c).id) + bubble +
      '<defs><linearGradient id="' + gid + 'shell" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="' + shade(bc, 36) + '"/><stop offset=".48" stop-color="' + bc + '"/><stop offset="1" stop-color="' + shade(bc, -42) + '"/></linearGradient>' +
      '<radialGradient id="' + gid + 'core" cx="32%" cy="25%"><stop offset="0" stop-color="#fff"/><stop offset=".36" stop-color="' + rc2 + '"/><stop offset="1" stop-color="' + shade(rc2, -40) + '"/></radialGradient></defs>' +
      '</svg>';
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function animClass(cfgIn, fxEnabled) {
  var c = normalize(cfgIn || cfg);
  if (fxEnabled === false && c.anim !== 'idle') return 'av-idle';
  return 'av-' + animOf(c).id;
}



  function mini(cfgIn, px) {
    var c = normalize(cfgIn || {});
    return '<span class="av-mini ' + animClass(c) + '" aria-hidden="true">' + svg(c, px || 26) + '</span>';
  }




  var modal = null, activeGroup = 'animal';
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'avMenu'; modal.className = 'tlpm'; modal.hidden = true;
    modal.innerHTML = '<div class="tlpm-pan av-pan" role="dialog" aria-modal="true" aria-labelledby="avT">' +
      '<button class="tlpm-x" type="button" id="avX" aria-label="Close"><i class="ic ic-close"></i></button>' +
      '<div class="av-studio-head"><div><span class="av-studio-kicker">CHARACTER STUDIO</span><h2 id="avT">Customize your character</h2><p class="s">Make the explorer yours. Preview a style, then choose an unlocked item to wear.</p></div><span class="av-save-state"><i></i> AUTO-SAVED</span></div>' +
      '<div class="av-stage"><div class="av-big" id="avBig"></div><div class="av-meta" id="avMeta"></div></div>' +
      '<div id="avGroups"></div>' +
      '<div class="tlpm-row" id="avAdminRow" hidden>' +
      '<button class="tlpm-btn" id="avPlayerView" type="button" aria-pressed="false">View as player</button>' +
      '<span class="av-admnote">Admin: everything is unlocked. Toggle to check the player experience.</span></div>' +
      '<div class="tlpm-row"><button class="tlpm-btn pri" id="avDone" type="button">Done</button></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') modal.hidden = true; });
    modal.querySelector('#avX').onclick = function () { modal.hidden = true; };
    modal.querySelector('#avDone').onclick = function () { modal.hidden = true; };
    modal.querySelector('#avPlayerView').onclick = function () {
      viewAsPlayer = !viewAsPlayer;
      this.setAttribute('aria-pressed', String(viewAsPlayer));
      this.textContent = viewAsPlayer ? 'Back to admin view' : 'View as player';
      renderOpen();
    };
    return modal;
  }
  function renderOpen() {
    if (!modal || modal.hidden) return;
    var st = todayProg();
    var big = modal.querySelector('#avBig');
    big.innerHTML = '<span class="av-anim ' + animClass() + '">' + svg(cfg, 154) + '</span>';
    var meta = modal.querySelector('#avMeta');
    var learner = A() && A().getActiveLearner && A().getActiveLearner(), name = learner && learner.name || 'Player';
    var loadout = GROUPS.slice(0, 4).map(function (g) { var item = find(g.key, cfg[g.key]); return '<span><i>' + esc(g.title) + '</i><b>' + esc(item ? item.name : 'Default') + '</b></span>'; }).join('');
    meta.innerHTML = '<span class="av-studio-kicker">YOUR EXPLORER</span><b class="av-player-name">' + esc(animalOf(cfg).name) + '</b><span class="av-player-by">Designed by ' + esc(name) + '</span>' +
      (window.TLP_ECONOMY && TLP_ECONOMY.titleHtml ? TLP_ECONOMY.titleHtml() : '') +
      '<div class="av-loadout">' + loadout + '</div><small class="av-progression">' + st.ch + ' chapters cleared <span>·</span> ' + st.stars + ' stars <span>·</span> ' + st.streak + '-day streak</small>';
    modal.querySelector('#avT').textContent = animalOf(cfg).name + ' studio';
    var wrap = modal.querySelector('#avGroups');
    var currentGroup = GROUPS.filter(function (g) { return g.key === activeGroup; })[0] || GROUPS[0];
    activeGroup = currentGroup.key;
    var tabs = '<nav class="av-nav" role="tablist" aria-label="Character customization">' + GROUPS.map(function (g) {
      var equipped = find(g.key, cfg[g.key]);
      return '<button type="button" role="tab" class="av-tab' + (g.key === activeGroup ? ' on' : '') + '" data-av-tab="' + g.key + '" aria-selected="' + (g.key === activeGroup) + '"><span>' + esc(g.title) + '</span><small>' + esc(equipped ? equipped.name : '') + '</small></button>';
    }).join('') + '</nav>';
    var panel = '<section class="av-group" role="tabpanel"><div class="av-group-head"><div><span class="av-studio-kicker">CUSTOMIZE</span><h3>' + esc(currentGroup.title) + '</h3></div><span class="av-item-count">' + currentGroup.items.length + (currentGroup.key === 'b' ? ' sets' : ' styles') + '</span></div>' +
      (currentGroup.key === 'b' ? '<p class="av-palette-note">Each set has three matching colours for the body, markings and glowing details. Unlock more in the Shop or Lucky Wheel.</p>' : '') +
      '<div class="av-grid">' + currentGroup.items.map(function (it) {
      var on = cfg[currentGroup.key] === it.id, ok = unlocked(it, st, currentGroup.key);
      var swatches = currentGroup.key === 'b' && it.pal ? '<span class="av-swatches" aria-label="Three-colour set">' + it.pal.map(function (c) { return '<i style="--sw:' + c + '"></i>'; }).join('') + '</span>' : '';
      return '<button type="button" class="av-item' + (on ? ' on' : '') + (ok ? '' : ' locked') + '" data-g="' + currentGroup.key + '" data-id="' + it.id + '"' +
        (ok ? '' : ' aria-disabled="true"') + ' title="' + esc(hintFor(it, st, currentGroup.key)) + '">' +
        '<span class="av-prev">' + svg(pickCfg(currentGroup.key, it.id), 42) + '</span>' +
        '<b>' + esc(it.name) + '</b>' + swatches +
        (on ? '<span class="av-equipped">EQUIPPED</span>' : '') +
        (ok ? '' : '<i class="av-lock" aria-hidden="true">&#128274;</i><small class="av-need">' + esc(it.hint) + '</small>') +
        '</button>';
    }).join('') + '</div></section>';
    wrap.innerHTML = tabs + panel;
    wrap.querySelectorAll('[data-av-tab]').forEach(function (button) {
      button.onclick = function () { activeGroup = button.dataset.avTab; renderOpen(); };
    });
    wrap.querySelectorAll('.av-item').forEach(function (b) {
      b.onclick = function () { equip(b.dataset.g, b.dataset.id); };
    });
    var admRow = modal.querySelector('#avAdminRow');
    admRow.hidden = !isAdmin();
    try { if (window.TLP_ECONOMY && TLP_ECONOMY.renderAvatarExtras) TLP_ECONOMY.renderAvatarExtras(); } catch (e) {}
  }
  function pickCfg(group, id) {
    var c = {};
    GROUPS.forEach(function (g) { c[g.key] = cfg[g.key]; });
    c.pal = validPalette(cfg.pal) ? cfg.pal.slice() : null;
    c.look = cfg.look || {};
    c[group] = id;
    if (group === 'b') {
      var body = bodyOf(c);
      if (validPalette(body.pal)) c.pal = body.pal.slice();
    }
    return c;
  }


  var tutKey = 'tlp-avatar-tut';
  function maybeTutorial() {
    try {
      if (localStorage.getItem(tutKey)) return;
      localStorage.setItem(tutKey, '1');
    } catch (e) { return; }
    setTimeout(function () {
      if (modal && !modal.hidden) return;
      open();
      var t = document.createElement('div');
      t.className = 'av-tut';
      t.innerHTML = '<b>Your explorer, your style</b><p>Choose a three-colour set, hat, face, speech bubble and idle animation. Anything with a ' +
        '<span class="av-lock">&#128274;</span> unlocks as you play — hover or tap it to see what it needs. ' +
        (isAdmin() ? 'As admin you can preview the locked look with “View as player”.' : '') + '</p>' +
        '<button class="btn sm" type="button">Got it</button>';
      modal.querySelector('.tlpm-pan').appendChild(t);
      t.querySelector('button').onclick = function () { t.remove(); };
    }, 600);
  }

  function open() {
    ensureModal();
    load();
    adminMode = isAdmin();
    modal.hidden = false;
    renderOpen();
    maybeTutorial();
  }




  function mount(el) {
    if (!el || el.querySelector('.av-btn')) return el && el.querySelector('.av-btn');
    load();
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'av-btn'; btn.title = 'Customize R-067';
    btn.setAttribute('aria-label', 'Customize your robot avatar');
    btn.innerHTML = '<span class="av-dot ' + animClass() + '">' + svg(cfg, 30) + '</span>';
    btn.onclick = open;
    el.appendChild(btn);
    return btn;
  }

  function refreshMounted() {
    document.querySelectorAll('.av-btn .av-dot').forEach(function (d) {
      d.className = 'av-dot ' + animClass();
      d.innerHTML = svg(cfg, 30);
    });
  }
  var _origEquip = equip;
  equip = function (g, id) { _origEquip(g, id); refreshMounted(); };



  function autoMount() {
    var slots = document.querySelectorAll('#avSlot:not(.av-done)');
    slots.forEach(function (el) { el.classList.add('av-done'); mount(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();

  window.addEventListener('tlp-auth-ready', function () {
    load();
    refreshMounted();
    renderOpen();
    try { document.dispatchEvent(new CustomEvent('tlp-avatar-change')); } catch (e) {}
  });
  window.TLP_AVATAR = {
    mount: mount, open: open, mini: mini, svg: svg,


    setLook: function (o) {
      load();
      cfg.look = Object.assign({}, cfg.look || {}, o || {});
      try { localStorage.setItem(avatarKey(loadedLearner), JSON.stringify(cfg)); } catch (e) {}
      clearTimeout(lookT);
      lookT = setTimeout(save, 700);
    },
    stats: todayProg,
    catalog: { animals: ANIMALS, bodies: BODIES, hats: HATS, faces: FACES, speech: SPEECH, anims: ANIMS, pets: PETS },
    palette: function (id) { var b = find('b', id); return b && validPalette(b.pal) ? b.pal.slice() : null; },
    has: function (group, id) { return !!find(group, id); },
    get: function () { load(); return normalize(cfg); },

    set: function (group, id) { load(); equip(group, id); },
    render: function () { refreshMounted(); renderOpen(); },
    animClass: function (cfgIn, fxEnabled) { load(); return animClass(cfgIn, fxEnabled); },
    fxEnabled: function(){return !(document.documentElement.classList.contains('reduce-fx') || (window.TLP && TLP.FX.get()))},
    setAdminMode: function (on) { adminMode = !!on; },
    isAdminView: function () { return adminMode && !viewAsPlayer; },
    viewAsPlayer: function () { return viewAsPlayer; },
    refresh: refreshMounted
  };
})();
