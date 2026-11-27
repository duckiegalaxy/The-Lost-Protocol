(function () {
  'use strict';


  function learnerId() {
    try { var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner(); if (l && l.id) return l.id; } catch (e) {}
    return 'guest';
  }
  function key() { return 'tlp-econ:' + learnerId(); }
  var RECENT_LIMIT = 4;
  function blank() {
    return { sparks: 0, owned: {}, titles: {}, titlePref: '', recent: [], wheelDate: '', spins: 0, quests: {}, coadmin: 'none', lastDay: '', updatedAt: 0 };
  }
  var S = blank(), loaded = false, loadedLearner = '';
  function recentFrom(raw) {
    if (!Array.isArray(raw)) return [];
    var seen = {};
    return raw.filter(function (x) {
      if (!x || typeof x !== 'object' || !x.k || !x.l || !RARITY[x.r] || ['sparks', 'item'].indexOf(x.t) < 0) return false;
      var at = Math.max(0, Number(x.at) || 0), id = at + ':' + x.k + ':' + x.t;
      if (seen[id]) return false;
      seen[id] = 1;
      x.k = String(x.k).slice(0, 80);
      x.l = String(x.l).slice(0, 60);
      x.at = at;
      x.f = !!x.f;
      x.a = Math.max(0, Number(x.a) || 0);
      return true;
    }).sort(function (a, b) { return b.at - a.at; }).slice(0, RECENT_LIMIT);
  }
  function walletFrom(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return blank();
    var out = Object.assign(blank(), raw);
    out.sparks = Math.max(0, Number(out.sparks) || 0);
    out.spins = Math.max(0, Number(out.spins) || 0);
    out.updatedAt = Math.max(0, Number(out.updatedAt) || 0);
    out.titlePref = typeof out.titlePref === 'string' ? out.titlePref.slice(0, 24) : '';
    out.recent = recentFrom(out.recent);
    ['owned', 'titles', 'quests'].forEach(function (f) {
      if (!out[f] || typeof out[f] !== 'object' || Array.isArray(out[f])) out[f] = {};
    });
    if (['none', 'pending', 'approved'].indexOf(out.coadmin) < 0) out.coadmin = 'none';
    return out;
  }
  function mergeQuests(local, cloud) {
    var days = {}, out = {};
    [cloud, local].forEach(function (wallet) {
      var quests = wallet && wallet.quests;
      if (!quests || typeof quests !== 'object' || Array.isArray(quests)) return;
      Object.keys(quests).forEach(function (day) { days[day] = 1; });
    });
    Object.keys(days).sort().slice(-7).forEach(function (day) {
      var prog = {}, claimed = {};
      [cloud, local].forEach(function (wallet) {
        var quest = wallet && wallet.quests && wallet.quests[day];
        if (!quest || typeof quest !== 'object' || Array.isArray(quest)) return;
        if (quest.prog && typeof quest.prog === 'object' && !Array.isArray(quest.prog)) {
          Object.keys(quest.prog).forEach(function (id) {
            prog[id] = Math.max(Number(prog[id]) || 0, Number(quest.prog[id]) || 0);
          });
        }
        if (quest.claimed && typeof quest.claimed === 'object' && !Array.isArray(quest.claimed)) {
          Object.keys(quest.claimed).forEach(function (id) { if (quest.claimed[id]) claimed[id] = 1; });
        }
      });
      out[day] = { prog: prog, claimed: claimed };
    });
    return out;
  }
  function mergeWallet(local, cloud) {
    var newer = (Number(local && local.updatedAt) || 0) >= (Number(cloud && cloud.updatedAt) || 0) ? local : cloud;
    var out = walletFrom(newer);
    out.owned = Object.assign({}, (cloud && cloud.owned) || {}, (local && local.owned) || {});
    out.titles = Object.assign({}, (cloud && cloud.titles) || {}, (local && local.titles) || {});
    out.quests = mergeQuests(local, cloud);
    out.recent = recentFrom(((local && local.recent) || []).concat((cloud && cloud.recent) || []));
    return out;
  }
  function syncedWallet() {
    var owned = {}, titles = {};
    SHOP.forEach(function (it) {
      var key = it.kind === 'title' ? it.id : 'av:' + it.id;
      if (S.owned[key]) owned[key] = 1;
      if (it.kind === 'title' && titleOwned(it.id.slice(6))) titles[it.id.slice(6)] = 1;
    });
    return { sparks: S.sparks, owned: owned, titles: titles, titlePref: S.titlePref, recent: S.recent, wheelDate: S.wheelDate, spins: S.spins, quests: mergeQuests(S, null), coadmin: S.coadmin, lastDay: S.lastDay, updatedAt: S.updatedAt };
  }
  function load() {
    var id = learnerId();
    if (loaded && loadedLearner === id) return;
    loaded = true;
    loadedLearner = id;
    S = blank();
    var hadLocal = false, local = null;
    try { var raw = localStorage.getItem(key()); if (raw) { local = JSON.parse(raw); hadLocal = true; } } catch (e) {}


    try {
      var l = window.TLP_AUTH && TLP_AUTH.getActiveLearner ? TLP_AUTH.getActiveLearner() : null;
      var ec = l && l.avatar && l.avatar.look && l.avatar.look.econ;
      if (ec && typeof ec === 'object') S = hadLocal ? mergeWallet(local, ec) : walletFrom(ec);
      else if (hadLocal) S = walletFrom(local);
    } catch (e) {}

    var migrated = false;
    if (S.owned && S.owned['av:anim:victory']) {
      S.owned['av:anim:dance'] = 1;
      delete S.owned['av:anim:victory'];
      migrated = true;
    }
    if (migrated) persist();

    var today = dayKey();
    if (S.lastDay !== today) {
      var streak = 1;
      try {
        if (window.TLP_STREAK && TLP_STREAK.get) streak = TLP_STREAK.get().count || 1;
        else streak = Number(localStorage.getItem('tlp-streak') || 1) || 1;
      } catch (e) {}
      if (S.lastDay) earn(Math.min(25 + streak * 5, 80), 'daily login');
      S.lastDay = today; S.wheelDate = weekKey(); S.quests = {};
      persist();
    }
  }
  function persist() {
    S.updatedAt = Math.max(Date.now(), (Number(S.updatedAt) || 0) + 1);
    try { localStorage.setItem(key(), JSON.stringify(S)); } catch (e) {}
    try { if (window.TLP_AVATAR && TLP_AVATAR.setLook) TLP_AVATAR.setLook({ econ: syncedWallet(), title: titleKey() }); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('tlp-econ-change')); } catch (e) {}
  }
  function dayKey() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function msToMidnight() { var d = new Date(); d.setHours(24, 0, 0, 0); return d - Date.now(); }


  function isAdmin() { try { return !!(window.TLP_AUTH && TLP_AUTH.isCurrentUserAdmin && TLP_AUTH.isCurrentUserAdmin()); } catch (e) { return false; } }
  function coadmin() { return S.coadmin === 'approved'; }
  function earnMult() { return coadmin() ? 1.25 : 1; }
  function earnAmount(n) { load(); return Math.round(n * earnMult()); }
  function earn(n, src, silent) {
    load(); n = earnAmount(n);
    S.sparks += n; persist();
    if (!silent) toast('+' + n + ' sparks' + (src ? ' — ' + src : ''));
    return S.sparks;
  }
  function spend(n) { load(); if (S.sparks < n) return false; S.sparks -= n; persist(); return true; }
  function owns(k) { load(); return !!S.owned[k]; }


  var QUEST_POOL = [
    { id: 'missions', icon: '⚔', name: 'Mission runner', desc: 'Win 2 game missions', goal: 2, ev: 'level', rw: 50 },
    { id: 'stars',    icon: '★', name: 'Star collector', desc: 'Earn 6 stars in missions', goal: 6, ev: 'stars', rw: 45 },
    { id: 'scripts',  icon: '⌘', name: 'Script machine', desc: 'Run 5 scripts', goal: 5, ev: 'run', rw: 40 },
    { id: 'perfect',  icon: '◆', name: 'Flawless', desc: 'Score a 3-star run', goal: 1, ev: 'perfect', rw: 60 },
    { id: 'boss',     icon: '👑', name: 'Guardian slayer', desc: 'Defeat a guardian', goal: 1, ev: 'boss', rw: 70 }
  ];
  function todayQuests() {
    var seed = dayKey().split('-').join('');
    var h = 0; for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    var pool = QUEST_POOL.slice();
    var out = [];
    for (var j = 0; j < 3 && pool.length; j++) {
      var idx = h % pool.length; h = (h * 1103515245 + 12345) >>> 0;
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }
  function qstate() {
    var t = dayKey();
    if (!S.quests[t] || typeof S.quests[t] !== 'object' || !S.quests[t].prog || !S.quests[t].claimed) S.quests[t] = { prog: {}, claimed: {} };
    if (Object.keys(S.quests).length > 7) {
      var ks = Object.keys(S.quests).sort(), keep = {};
      ks.slice(-7).forEach(function (k) { keep[k] = S.quests[k]; });
      S.quests = keep;
    }
    return S.quests[t];
  }
  function track(ev, n) {
    load(); n = n || 1;
    todayQuests().forEach(function (q) {
      if (q.ev !== ev) return;
      var st = qstate();
      st.prog[q.id] = Math.min(q.goal, (st.prog[q.id] || 0) + n);
    });
    persist();
  }
  function claimQuest(id) {
    var q = QUEST_POOL.filter(function (x) { return x.id === id; })[0];
    var st = qstate();
    if (!q || st.claimed[id] || (st.prog[id] || 0) < q.goal) return;
    st.claimed[id] = 1; persist();
    earn(q.rw, 'quest: ' + q.name);
    renderQuests();
  }





  var SHOP = [
    { id: 'gear:scarf',    kind: 'av', name: 'Cosmic scarf',   rarity: 'common',    price: 60,  desc: 'A warm wrap for any mission.', new: false },
    { id: 'pet:kitten',    kind: 'av', name: 'Kitten',         rarity: 'common',    price: 70,  desc: 'A tiny hunter of bugs.', new: false },
    { id: 'hat:beanie',    kind: 'av', name: 'Beanie',         rarity: 'common',    price: 80,  desc: 'Cozy coding beanie.', new: true },
    { id: 'pet:slime',     kind: 'av', name: 'Slime pal',      rarity: 'common',    price: 90,  desc: 'Bouncy bonus buddy.', new: false },
    { id: 'gear:bandana',  kind: 'av', name: 'Bandana',        rarity: 'rare',      price: 160, desc: 'For maximum style points.', new: false },
    { id: 'pet:ghost',     kind: 'av', name: 'Pocket ghost',   rarity: 'rare',      price: 180, desc: 'Boo! (affectionately)', new: true },
    { id: 'gear:cape',     kind: 'av', name: 'Hero cape',      rarity: 'rare',      price: 220, desc: 'For saving the protocol.' },
    { id: 'hat:wizard',    kind: 'av', name: 'Wizard hat',     rarity: 'epic',      price: 380, desc: 'Arcane debugging powers.' },
    { id: 'pet:robot',     kind: 'av', name: 'Mini-bot',       rarity: 'epic',      price: 420, desc: 'A tiny helper drone.' },
    { id: 'gear:tux',      kind: 'av', name: 'Tuxedo',         rarity: 'epic',      price: 460, desc: 'Formal occasion: boss fights.' },
    { id: 'anim:fire', kind: 'av', name: 'Afterburner', rarity: 'legendary', price: 900, desc: 'Full-thrust celebration.' },
    { id: 'gear:jersey',   kind: 'av', name: 'Team jersey',    rarity: 'common',    price: 90,  desc: 'Match-day colours.' },
    { id: 'pet:puppy',     kind: 'av', name: 'Puppy',          rarity: 'common',    price: 80,  desc: 'Good boy energy.' },
    { id: 'pet:bunny',     kind: 'av', name: 'Bunny pal',      rarity: 'common',    price: 85,  desc: 'Floppy ears included.' },
    { id: 'gear:hoodie',   kind: 'av', name: 'Hoodie',         rarity: 'common',    price: 110, desc: 'Cozy compile hoodie.' },
    { id: 'pet:duck',      kind: 'av', name: 'Rubber duck',    rarity: 'rare',      price: 150, desc: 'Debugging companion.' },
    { id: 'face:heart',    kind: 'av', name: 'Heart eyes',     rarity: 'rare',      price: 150, desc: 'Love for coding.' },
    { id: 'gear:overalls', kind: 'av', name: 'Overalls',       rarity: 'rare',      price: 170, desc: 'Workshop-ready.' },
    { id: 'gear:backpack', kind: 'av', name: 'Explorer pack',  rarity: 'rare',      price: 190, desc: 'Carries extra ideas.' },
    { id: 'b:ocean',       kind: 'av', name: 'Deep ocean',     rarity: 'rare',      price: 200, desc: 'Blue, sky and ice in one three-colour set.' },
    { id: 'b:lagoon',      kind: 'av', name: 'Lagoon',         rarity: 'common',    price: 180, desc: 'Clear water, bright foam and tropical green.' },
    { id: 'b:coral',       kind: 'av', name: 'Coral sun',      rarity: 'rare',      price: 230, desc: 'Warm coral with peach and soft sunlight.' },
    { id: 'b:solar',       kind: 'av', name: 'Solar flare',    rarity: 'rare',      price: 240, desc: 'Orange fire, gold light and a warm glow.' },
    { id: 'b:matcha',      kind: 'av', name: 'Matcha',         rarity: 'rare',      price: 280, desc: 'Fresh green with lime and cream accents.' },
    { id: 'b:aurora',      kind: 'av', name: 'Aurora',         rarity: 'epic',      price: 480, desc: 'Cyan light, violet haze and pink shimmer.' },
    { id: 'b:berry',       kind: 'av', name: 'Berry voltage',  rarity: 'epic',      price: 520, desc: 'Electric purple, hot pink and soft blush.' },
    { id: 'pet:fox',       kind: 'av', name: 'Fox kit',        rarity: 'rare',      price: 240, desc: 'Clever little scavenger.' },
    { id: 'hat:halo',      kind: 'av', name: 'Halo',           rarity: 'rare',      price: 260, desc: 'Saintly syntax.' },
    { id: 'anim:zoom',     kind: 'av', name: 'Zoom pulse',     rarity: 'rare',      price: 300, desc: 'Speed-run energy.' },
    { id: 'anim:moon',     kind: 'av', name: 'Moon float',     rarity: 'rare',      price: 350, desc: 'Drift like a satellite.' },
    { id: 'face:star',     kind: 'av', name: 'Star eyes',      rarity: 'epic',      price: 400, desc: 'See the solution shine.' },
    { id: 'hat:band',      kind: 'av', name: 'Headband',       rarity: 'epic',      price: 420, desc: 'Focused mode: on.' },
    { id: 'animal:tiger',  kind: 'av', name: 'Tiger',          rarity: 'epic',      price: 520, desc: 'Striped and unstoppable.' },
    { id: 'anim:dance',    kind: 'av', name: 'Victory dance',  rarity: 'epic',      price: 550, desc: 'A legendary celebration.' },
    { id: 'anim:glitch',   kind: 'av', name: 'Signal glitch',  rarity: 'epic',      price: 600, desc: 'Reality is a suggestion.' },
    { id: 'b:gold',        kind: 'av', name: 'Champion gold',  rarity: 'epic',      price: 620, desc: 'Rich gold, bright lemon and creamy shine.' },
    { id: 'b:midnight',    kind: 'av', name: 'Midnight',       rarity: 'legendary', price: 780, desc: 'Night slate, electric indigo and starlight.' },
    { id: 'face:mono',     kind: 'av', name: 'Mono visor',     rarity: 'epic',      price: 700, desc: 'One eye. All seeing.' },
    { id: 'hat:crown',     kind: 'av', name: 'Crown',          rarity: 'legendary', price: 750, desc: 'Rule the leaderboard.' },
    { id: 'anim:rocket',   kind: 'av', name: 'Rocket zoom',    rarity: 'legendary', price: 880, desc: 'Three guardians earned.' },
    { id: 'hat:horns',     kind: 'av', name: 'Devil horns',    rarity: 'legendary', price: 900, desc: 'For debugging at midnight.' },
    { id: 'speech:010010', kind: 'av', name: 'Binary verse',   rarity: 'legendary', price: 950, desc: 'Speaks fluent machine.' },
    { id: 'animal:dragon', kind: 'av', name: 'Dragon',         rarity: 'legendary', price: 1400,desc: 'The rarest companion alive.' },
    { id: 'hat:visor',     kind: 'av', name: 'Data visor',     rarity: 'legendary', price: 1100,desc: 'All 30 chapters of sight.' },
    { id: 'b:chrome',      kind: 'av', name: 'Chrome signal',  rarity: 'legendary', price: 1000,desc: 'Brushed steel, pearl white and cyan light.' },
    { id: 'title:rookie',  kind: 'title', name: 'Rookie plate', rarity: 'common',   price: 50,  desc: '“Rookie” under your name.' },
    { id: 'title:coder',   kind: 'title', name: 'Coder plate',  rarity: 'rare',     price: 180, desc: '“Certified Coder” plate.' },
    { id: 'title:hero',    kind: 'title', name: 'Hero plate',   rarity: 'epic',     price: 420, desc: 'Animated hero plate.' },
    { id: 'title:legend',  kind: 'title', name: 'Legend plate', rarity: 'legendary',price: 950, desc: 'The shiniest plate in the game.' },
    { id: 'title:star',    kind: 'title', name: 'Star plate',   rarity: 'epic',     price: 430, desc: '“Star Coder” under your name.' },
    { id: 'title:champ',   kind: 'title', name: 'Champ plate',  rarity: 'legendary',price: 560, desc: '“Champion” — for the fearless.' },
    { id: 'title:overlord',kind: 'title', name: 'Overlord plate',rarity:'legendary',price: 680, desc: '“Overlord” of the Protocol.' },
    { id: 'title:mythic',  kind: 'title', name: 'Mythic plate', rarity: 'legendary',price: 820, desc: '“Mythic” — print it in gold.' },
    { id: 'face:cool',     kind: 'av', name: 'Cool shades',    rarity: 'common',   price: 95,  desc: 'Too cool for syntax errors.' },
    { id: 'pet:mini',      kind: 'av', name: 'Pocket bot',     rarity: 'common',   price: 100, desc: 'A tiny R-067 assistant.' },
    { id: 'gear:apron',    kind: 'av', name: 'Chef apron',     rarity: 'rare',     price: 175, desc: 'Five-star debugging chef.' },
    { id: 'anim:hop',      kind: 'av', name: 'Happy hop',      rarity: 'common',   price: 120, desc: 'Joy in four short hops.' },
    { id: 'hat:flower',    kind: 'av', name: 'Flower crown',   rarity: 'rare',     price: 165, desc: 'Blooms after every win.' },
    { id: 'b:candy',       kind: 'av', name: 'Candy cloud',    rarity: 'rare',     price: 210, desc: 'Soft pink, petal pink and lilac sweetness.' },
    { id: 'speech:GG',     kind: 'av', name: 'GG bubble',      rarity: 'common',   price: 60,  desc: 'Good game, always.' }
  ];
  var RARITY = { common: { c: '#7dd3fc', label: 'Common' }, rare: { c: '#a78bfa', label: 'Rare' }, epic: { c: '#f472b6', label: 'Epic' }, legendary: { c: '#ffd36a', label: 'Legendary' } };


  var CATS = [
    ['all',      'All',        '#ffd36a'],
    ['outfit',   'Outfits',    '#f472b6'],
    ['hat',      'Hats',       '#38bdf8'],
    ['pet',      'Pets',       '#4ade80'],
    ['face',     'Faces',      '#facc15'],
    ['species',  'Species',    '#a78bfa'],
    ['color',    'Colours',    '#fb923c'],
    ['anim',     'Animations', '#22d3ee'],
    ['speech',   'Speech',     '#e879f9'],
    ['plates',   'Name plates','#ffd36a']
  ];
  var CAT_OF = { gear: 'outfit', hat: 'hat', pet: 'pet', face: 'face', animal: 'species', b: 'color', anim: 'anim', speech: 'speech' };
  function catOf(it) { return it.kind === 'title' ? 'plates' : (CAT_OF[it.id.split(':')[0]] || 'all'); }
  function catLabel(it) {
    var key = catOf(it);
    var cat = CATS.filter(function (c) { return c[0] === key; })[0];
    return cat ? cat[1] : key;
  }
  function paletteFor(it) {
    if (!it || (it.kind !== 'av' && it.kind !== 'item') || it.id.indexOf('b:') !== 0 || !window.TLP_AVATAR || !TLP_AVATAR.palette) return null;
    try { return TLP_AVATAR.palette(it.id.slice(2)); } catch (e) { return null; }
  }
  function swatchesHtml(it) {
    var pal = paletteFor(it);
    if (!pal) return '';
    return '<span class="cosmetic-swatches" aria-label="' + esc(it.name || it.label) + ' three-colour set">' + pal.map(function (c) {
      return '<i style="--sw:' + c + '"></i>';
    }).join('') + '</span>';
  }
  function previewConfig(it, currentCfg) {
    var c = Object.assign({}, currentCfg);
    if (!it || it.kind !== 'av') return c;
    var parts = it.id.split(':');
    c[parts[0]] = parts[1];
    if (parts[0] === 'b') {
      var pal = paletteFor(it);
      if (pal) c.pal = pal.slice();
    }
    return c;
  }
  var shopCat = 'all', shopPreviewId = '', shopQuery = '';
  SHOP = SHOP.reduce(function (items, it) { var at = items.findIndex(function (x) { return x.id === it.id; }); if (at < 0) items.push(it); else if (it.price < items[at].price) items[at] = it; return items; }, []);
  function buy(id) {
    load();
    var it = SHOP.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    var k = it.kind === 'av' ? 'av:' + it.id : it.id;
    if (it.kind === 'title' ? titleOwned(it.id.slice(6)) : S.owned[k]) { toast('Already bought — check your avatar menu!'); return; }
    if (!spend(it.price)) { toast('Not enough sparks — win missions and quests to earn more.'); return; }
    S.owned[k] = 1; persist();
    toast('Purchased: ' + it.name);
    renderShop();
  }


  var WHEEL_COST = 100;


  var WHEEL_POOL = [
    { label: '20⚡',      kind: 'sparks', v: 20,   w: 16, r: 'common' },
    { label: 'Scarf',     kind: 'item', id: 'gear:scarf', v: 0, w: 9, r: 'common' },
    { label: '40⚡',      kind: 'sparks', v: 40,   w: 14, r: 'common' },
    { label: 'Beanie',    kind: 'item', id: 'hat:beanie', v: 0, w: 8, r: 'common' },
    { label: 'Puppy',     kind: 'item', id: 'pet:puppy', v: 0, w: 7, r: 'common' },
    { label: 'Pocket bot', kind: 'item', id: 'pet:mini', v: 0, w: 7, r: 'common' },
    { label: '60⚡',      kind: 'sparks', v: 60,   w: 12, r: 'common' },
    { label: 'Duck',      kind: 'item', id: 'pet:duck', v: 0, w: 7, r: 'rare' },
    { label: 'Happy hop', kind: 'item', id: 'anim:hop', v: 0, w: 6, r: 'common' },
    { label: 'Lagoon set', kind: 'item', id: 'b:lagoon', v: 0, w: 9, r: 'common' },
    { label: 'Coral set', kind: 'item', id: 'b:coral', v: 0, w: 8, r: 'rare' },
    { label: '80⚡',      kind: 'sparks', v: 80,   w: 10, r: 'rare' },
    { label: 'Coder plate', kind: 'item', id: 'title:coder', v: 0, w: 6, r: 'rare' },
    { label: 'Heart eyes', kind: 'item', id: 'face:heart', v: 0, w: 6, r: 'rare' },
    { label: 'Bandana',   kind: 'item', id: 'gear:bandana', v: 0, w: 7, r: 'rare' },
    { label: '120⚡',     kind: 'sparks', v: 120,  w: 8,  r: 'rare' },
    { label: 'Halo',      kind: 'item', id: 'hat:halo', v: 0, w: 5, r: 'rare' },
    { label: 'Backpack',  kind: 'item', id: 'gear:backpack', v: 0, w: 5, r: 'rare' },
    { label: 'GG bubble', kind: 'item', id: 'speech:GG', v: 0, w: 5, r: 'common' },
    { label: 'Solar set', kind: 'item', id: 'b:solar', v: 0, w: 7, r: 'rare' },
    { label: 'Matcha set', kind: 'item', id: 'b:matcha', v: 0, w: 6, r: 'rare' },
    { label: '200⚡',     kind: 'sparks', v: 200,  w: 6,  r: 'epic' },
    { label: 'Tiger',     kind: 'item', id: 'animal:tiger', v: 0, w: 4, r: 'epic' },
    { label: 'Hero plate', kind: 'item', id: 'title:hero', v: 0, w: 4, r: 'epic' },
    { label: 'Victory dance', kind: 'item', id: 'anim:dance', v: 0, w: 4, r: 'epic' },
    { label: 'Gold set',  kind: 'item', id: 'b:gold', v: 0, w: 3, r: 'epic' },
    { label: 'Aurora set', kind: 'item', id: 'b:aurora', v: 0, w: 5, r: 'epic' },
    { label: 'Berry set', kind: 'item', id: 'b:berry', v: 0, w: 4, r: 'epic' },
    { label: '300⚡',     kind: 'sparks', v: 300,  w: 3,  r: 'legendary' },
    { label: 'Crown',     kind: 'item', id: 'hat:crown', v: 0, w: 2, r: 'legendary' },
    { label: 'Rocket zoom', kind: 'item', id: 'anim:rocket', v: 0, w: 2, r: 'legendary' },
    { label: '500⚡ JACKPOT', kind: 'sparks', v: 500, w: 1, r: 'legendary' },
    { label: 'DRAGON',    kind: 'item', id: 'animal:dragon', v: 0, w: 1, r: 'legendary' },
    { label: 'Data visor', kind: 'item', id: 'hat:visor', v: 0, w: 1, r: 'legendary' },
    { label: 'Midnight set', kind: 'item', id: 'b:midnight', v: 0, w: 2, r: 'legendary' },
    { label: 'Chrome set', kind: 'item', id: 'b:chrome', v: 0, w: 2, r: 'legendary' }
  ];
  function weekKey() {
    var d = new Date(), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - day + 3);
    var first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
    var fd = (first.getUTCDay() + 6) % 7; first.setUTCDate(first.getUTCDate() - fd + 3);
    return t.getUTCFullYear() + '-' + Math.ceil((((t - first) / 86400000) + 1) / 7);
  }
  function msToWeekEnd(now) {
    var d = now ? new Date(now) : new Date(), left = (8 - d.getDay()) % 7 || 7;
    var end = new Date(d); end.setDate(d.getDate() + left); end.setHours(0, 0, 0, 0);
    return end - d;
  }
  function weekWheels() {
    var seed = weekKey(), h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    function pick(pool) {
      h = (h * 1103515245 + 12345) >>> 0;
      return pool.splice(h % pool.length, 1)[0];
    }
    var out = [];
    ['common', 'rare', 'epic', 'legendary'].forEach(function (rarity) {
      var palettes = WHEEL_POOL.filter(function (item) {
        return item.kind === 'item' && item.id.indexOf('b:') === 0 && item.r === rarity && out.indexOf(item) < 0;
      });
      out.push(pick(palettes));
    });
    out.push(WHEEL_POOL.filter(function (item) { return item.kind === 'sparks' && item.v === 500; })[0]);
    var pool = WHEEL_POOL.filter(function (item) { return out.indexOf(item) < 0; });
    while (out.length < 10) out.push(pick(pool));
    for (var j = out.length - 1; j > 0; j--) {
      h = (h * 1103515245 + 12345) >>> 0;
      var at = h % (j + 1), swap = out[j]; out[j] = out[at]; out[at] = swap;
    }
    return out;
  }
  function wheelSlices(wheels) {
    var total = wheels.reduce(function (sum, item) { return sum + item.w; }, 0), cursor = 0;
    return wheels.map(function (item) {
      var start = cursor / total * 360;
      cursor += item.w;
      return { start: start, end: cursor / total * 360, center: (start + cursor / total * 360) / 2 };
    });
  }

  var wheelRot = 0, spinning = false;
  var spinStageTimers = [], spinFrame = 0, spinContext = null;
  var SPIN_MS = 6200;


  function fxReduced() {
    try {
      if (document.documentElement.classList.contains('reduce-fx') || (window.TLP_COMMON && TLP_COMMON.FX.get())) return true;
    } catch (e) {}
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) {}
    return false;
  }
  function effectsOff() {
    try {
      if (document.documentElement.classList.contains('reduce-fx') || (window.TLP && TLP.FX.get())) return true;
    } catch (e) {}
    return false;
  }
  function clearSpinTimers() {
    spinStageTimers.forEach(function (t) { clearTimeout(t); });
    spinStageTimers = [];
    if (spinFrame) cancelAnimationFrame(spinFrame);
    spinFrame = 0;
  }
  function cancelSpin(message) {
    if (!spinContext) return;
    var ctx = spinContext;
    spinContext = null;
    clearSpinTimers();
    spinning = false;
    ctx.wallet.sparks += WHEEL_COST;
    ctx.wallet.spins = Math.max(0, ctx.wallet.spins - 1);
    var currentLearner = learnerId();
    if (currentLearner === ctx.learner) persist();
    else {
      ctx.wallet.updatedAt = Math.max(Date.now(), (Number(ctx.wallet.updatedAt) || 0) + 1);
      try { localStorage.setItem('tlp-econ:' + ctx.learner, JSON.stringify(ctx.wallet)); } catch (e) {}
    }
    ctx.wheel.classList.remove('spinning');
    ctx.wheel.style.transition = '';
    ctx.wheel.style.transform = 'rotate(' + ctx.fromRot + 'deg)';
    wheelRot = ctx.fromRot;
    if (ctx.stage) ctx.stage.classList.remove('is-spinning', 'wheel-hit', 'flash');
    if (!message) message = 'Spin cancelled. Your Sparks were refunded.';
    toast(message);
    if (learnerId() === ctx.learner) renderWheel();
  }


  var AC = null;
  function blip(freq, dur, type, vol) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.04, AC.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.05));
      o.connect(g); g.connect(AC.destination);
      o.start(); o.stop(AC.currentTime + (dur || 0.05));
    } catch (e) {}
  }
  function wheelWin() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { blip(f, 0.16, 'triangle', 0.06); }, i * 90); }); }
  function spinWheel() {
    load();
    if (spinning) return;
    var wheel = document.getElementById('econWheel');
    if (!wheel) { toast('Open the Wheel tab to spin.'); return; }
    if (S.wheelDate !== weekKey()) { S.wheelDate = weekKey(); S.spins = 0; persist(); }
    if (!spend(WHEEL_COST)) { toast('Not enough sparks for a spin (' + WHEEL_COST + '⚡). Keep playing!'); return; }
    S.spins++; persist();
    var spinLearner = loadedLearner, spinWallet = S;

    var wheels = weekWheels();
    var total = wheels.reduce(function (a, s) { return a + s.w; }, 0), r = Math.random() * total, seg = wheels[0];
    for (var i = 0; i < wheels.length; i++) { r -= wheels[i].w; if (r <= 0) { seg = wheels[i]; break; } }
    var idx = wheels.indexOf(seg);
    var slices = wheelSlices(wheels);


    var align = 360 - slices[idx].center;
    var current = ((wheelRot % 360) + 360) % 360;
    var fromRot = wheelRot;
    var delta = 360 * 5 + (((align - current) % 360) + 360) % 360;
    wheelRot = fromRot + delta;

    var stage = document.querySelector('.wheel-stage');
    var slow = fxReduced();

    spinning = true;
    clearSpinTimers();
    spinContext = { wheel: wheel, stage: stage, wallet: spinWallet, learner: spinLearner, fromRot: fromRot };
    if (stage) { stage.classList.remove('wheel-hit', 'flash'); stage.classList.add('is-spinning'); }
    var result = modal && modal.querySelector('#wheelResult');
    if (result) { result.className = 'wheel-result'; result.textContent = ''; }
    renderWheel();

    var done = false;
    function finish() {
      if (done) return;
      if (learnerId() !== spinLearner) {
        cancelSpin('Spin cancelled because the learner changed. Your Sparks were refunded.');
        return;
      }
      done = true;
      spinning = false;
      spinContext = null;
      clearSpinTimers();
      if (stage) stage.classList.remove('is-spinning');
      wheel.classList.remove('spinning');
      wheel.style.transition = '';
      wheel.style.transform = 'rotate(' + wheelRot + 'deg)';
      if (!slow && stage) {
        stage.classList.add('wheel-hit', 'flash');
        spinStageTimers.push(setTimeout(function () { stage.classList.remove('wheel-hit', 'flash'); }, 820));
      }
      var outcome = award(seg);
      if (result) renderWheelResult(result, outcome);
      renderWheel();
      wheelWin();
      launchConfetti(seg.r === 'legendary' ? 100 : seg.r === 'epic' ? 55 : seg.r === 'rare' ? 30 : 16);
    }

    wheel.classList.add('spinning');
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(' + fromRot + 'deg)';
    void wheel.offsetWidth;
    if (slow) { wheel.style.transform = 'rotate(' + wheelRot + 'deg)'; finish(); return; }
    var spinStarted = 0;
    function animateSpin(now) {
      if (done) return;
      if (!spinStarted) spinStarted = now;
      var p = Math.min(1, (now - spinStarted) / SPIN_MS);
      var eased = 1 - Math.pow(1 - p, 4);
      wheel.style.transform = 'rotate(' + (fromRot + delta * eased).toFixed(3) + 'deg)';
      if (p < 1) spinFrame = requestAnimationFrame(animateSpin);
    }
    spinFrame = requestAnimationFrame(animateSpin);
    spinStageTimers.push(setTimeout(finish, SPIN_MS + 150));
  }
  function recordRecent(seg, outcome) {
    var key2 = seg.kind === 'sparks' ? 'sparks:' + seg.v : (seg.id.indexOf('title:') === 0 ? seg.id : 'av:' + seg.id);
    S.recent.unshift({ k: key2, l: seg.label, r: seg.r, t: seg.kind, f: outcome.kind === 'fresh', a: outcome.amount || 0, at: Date.now() });
    S.recent = recentFrom(S.recent);
  }
  function award(seg) {
    load();
    var outcome = { kind: '', seg: seg, key: '', amount: 0 };
    if (seg.kind === 'sparks') {
      var before = S.sparks;
      earn(seg.v, 'lucky wheel');
      outcome.kind = 'sparks';
      outcome.key = 'sparks:' + seg.v;
      outcome.amount = S.sparks - before;
    } else {
      var key2 = seg.id.indexOf('title:') === 0 ? seg.id : 'av:' + seg.id;
      outcome.key = key2;
      outcome.kind = (seg.id.indexOf('title:') === 0 ? titleOwned(seg.id.slice(6)) : S.owned[key2]) ? 'duplicate' : 'fresh';
      if (outcome.kind === 'fresh') S.owned[key2] = 1;
      else { S.sparks += 100; outcome.amount = 100; }
      try { if (window.TLP_AVATAR && TLP_AVATAR.render) TLP_AVATAR.render(); } catch (e) {}
    }
    recordRecent(seg, outcome);
    persist();
    sndTick();
    return outcome;
  }
  function prizePreview(seg, duplicate) {
    if (seg.kind === 'sparks') return '<div class="wheel-prize-art sparks-art" aria-hidden="true"><span>⚡</span></div>';
    var item = { kind: 'av', id: seg.id, name: seg.label };
    var current = { animal: 'robot', b: 'blue', gear: 'none', hat: 'none', face: 'std', speech: '', pet: 'none', anim: 'idle' };
    var art = '';
    try { if (window.TLP_AVATAR) { current = TLP_AVATAR.get(); art = TLP_AVATAR.svg(previewConfig(item, current), 150); } } catch (e) {}
    var plate = seg.id.indexOf('title:') === 0 ? '<span class="wheel-title-preview lb-plate t-' + esc(seg.id.split(':')[1]) + '">' + esc(TITLES[seg.id.split(':')[1]] ? TITLES[seg.id.split(':')[1]].name : seg.label) + '</span>' : '';
    return '<div class="wheel-prize-art' + (duplicate ? ' duplicate-art' : '') + '">' + art + plate + swatchesHtml(item) + '</div>';
  }
  function renderWheelResult(result, outcome) {
    var seg = outcome.seg, rarity = RARITY[seg.r], duplicate = outcome.kind === 'duplicate';
    var head = '', copy = '', actions = '', art = prizePreview(seg, duplicate);
    if (outcome.kind === 'sparks') {
      head = 'CONGRATS! YOU WON';
      copy = '<b class="wheel-prize-name">+' + outcome.amount + ' Sparks</b><p>Your balance is ready for the shop or another spin.</p>';
    } else if (duplicate) {
      head = 'OOPS! You got something you already have.';
      copy = '<b class="wheel-prize-name">' + esc(seg.label) + '</b><div class="wheel-conversion">+100 Sparks</div><p>You get 100 Sparks.</p><strong>TRY AGAIN — MAYBE LUCK WILL BE ON YOUR SIDE.</strong>';
    } else {
      head = 'CONGRATS! YOU WON';
      copy = '<b class="wheel-prize-name">' + esc(seg.label) + '</b><p>Added to your collection. Equip it now, or choose it later in the avatar menu.</p>';
      actions = '<div class="wheel-reveal-actions"><button class="econ-btn pri" type="button" data-wheel-equip>Equip now</button><button class="econ-btn" type="button" data-wheel-pass>Pass</button></div>';
    }
    result.innerHTML = '<div class="wheel-reveal" style="--rc:' + rarity.c + '"><span class="wheel-reveal-kicker">' + rarity.label + (duplicate ? ' · DUPLICATE' : outcome.kind === 'fresh' ? ' · NEW REWARD' : ' · SPARKS') + '</span>' +
      '<h3>' + esc(head) + '</h3>' + art + '<div class="wheel-reveal-copy">' + copy + '</div>' + actions + '</div>';
    result.className = 'wheel-result on win-' + outcome.kind + ' rar-' + seg.r;
    var equip = result.querySelector('[data-wheel-equip]'), pass = result.querySelector('[data-wheel-pass]');
    if (equip) equip.onclick = function () { equipPrize(result, outcome); };
    if (pass) pass.onclick = function () {
      var box = result.querySelector('.wheel-reveal-copy');
      if (box) box.innerHTML = '<b class="wheel-prize-name">' + esc(seg.label) + '</b><p>Kept in your collection. You can equip it anytime in the avatar menu.</p>';
      var buttons = result.querySelector('.wheel-reveal-actions'); if (buttons) buttons.remove();
    };
  }
  function equipPrize(result, outcome) {
    var seg = outcome.seg;
    if (seg.id.indexOf('title:') === 0) { S.titlePref = seg.id.slice(6); persist(); }
    else {
      var parts = seg.id.split(':');
      if (window.TLP_AVATAR) TLP_AVATAR.set(parts[0], parts[1]);
    }
    var buttons = result.querySelector('.wheel-reveal-actions');
    if (buttons) buttons.innerHTML = '<span class="wheel-equipped">✓ Equipped</span>';
    toast('Equipped ' + seg.label + '.');
  }
  function recentHistoryHtml() {
    if (!S.recent.length) return '<p class="wheel-history-empty">Your next prize will appear here.</p>';
    return S.recent.map(function (x) {
      var amount = x.a ? ' · +' + x.a + '⚡' : '';
      return '<div class="wheel-history-item" style="--rc:' + RARITY[x.r].c + '"><span>' + esc(x.l) + amount + '</span><small>' + (x.f ? '<b>NEW</b>' : x.t === 'sparks' ? 'Sparks' : 'Duplicate → 100⚡') + '</small></div>';
    }).join('');
  }





  var confettiCanvas = null, confettiRAF = null, confettiParts = [];
  function launchConfetti(count) {
    if (fxReduced() || effectsOff()) return;
    try {
      var canvas = document.getElementById('confettiCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confettiCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0'; canvas.style.left = '0';
        canvas.style.width = '100%'; canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        confettiCanvas = canvas;
        resizeConfettiCanvas();
        window.addEventListener('resize', resizeConfettiCanvas);
      }
      var cx = window.innerWidth / 2, cy = window.innerHeight * 0.32;
      var stage = document.querySelector('.wheel-stage');
      if (stage && stage.getBoundingClientRect) {
        var box = stage.getBoundingClientRect();
        cx = box.left + box.width / 2; cy = box.top + box.height / 2;
      }
      var colors = ['#ffd36a', '#ffe9a8', '#f472b6', '#7dd3fc', '#a78bfa', '#38bdf8', '#facc15', '#3ddc84'];
      var n = count || 60;
      for (var i = 0; i < n; i++) {
        var ang = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
        confettiParts.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 7,
          w: 5 + Math.random() * 7, h: 8 + Math.random() * 9,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * 360, vr: (Math.random() - 0.5) * 18,
          life: 80 + Math.random() * 60
        });
      }
      if (!confettiRAF) confettiRAF = requestAnimationFrame(confettiFrame);
    } catch (e) {}
  }
  function confettiFrame() {
    confettiRAF = null;
    var canvas = document.getElementById('confettiCanvas');
    if (!canvas) { confettiParts = []; return; }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var alive = [];
    for (var i = 0; i < confettiParts.length; i++) {
      var p = confettiParts[i];
      p.vy += 0.24; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      if (p.life <= 0 || p.y > canvas.height + 40) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 32);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      alive.push(p);
    }
    confettiParts = alive;
    if (confettiParts.length) confettiRAF = requestAnimationFrame(confettiFrame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  function resizeConfettiCanvas() {
    var canvas = document.getElementById('confettiCanvas');
    if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  }


  var KO_ANIMS = ['ko-punch', 'ko-upper', 'ko-spin', 'ko-laser', 'ko-hop'];
  function guardianDown() {
    track('boss', 1);
    earn(80, 'guardian defeated');
    var pick = KO_ANIMS[Math.floor(Math.random() * KO_ANIMS.length)];
    var targets = document.querySelectorAll('.av-btn .av-dot, .av-mini, .bd.av-skin, #avSlot .av-dot');
    targets.forEach(function (el) {
      el.classList.remove.apply(el.classList, KO_ANIMS);
      void el.offsetWidth;
      el.classList.add(pick);
      setTimeout(function () { el.classList.remove(pick); }, 4200);
    });

    var bot = document.querySelector('#track .bot, .track .bot, #bot');
    var host = bot || document.querySelector('.av-btn') || document.body;
    var ko = document.createElement('div');
    ko.className = 'econ-ko ' + pick;
    ko.textContent = 'K.O.!';
    host.appendChild(ko);
    setTimeout(function () { ko.remove(); }, 1800);
    toast('Guardian defeated! Your avatar lands the final blow.');
  }




  var COADMIN_REQS = [
    { id: 'ch',   label: 'Clear 20 chapters',        test: function () { return stats().ch >= 20; } },
    { id: 'streak', label: 'Maintain a 7-day streak', test: function () { return stats().streak >= 7; } },
    { id: 'stars',label: 'Earn 200 stars',           test: function () { return stats().stars >= 200; } }
  ];
  function stats() {
    var st = { ch: 0, stars: 0, streak: 0, badges: 0 };
    try { if (window.TLP_AVATAR && TLP_AVATAR.stats) st = Object.assign(st, TLP_AVATAR.stats()); } catch (e) {}
    return st;
  }
  function apps() {
    try { return JSON.parse(localStorage.getItem('tlp-coadmin-apps') || '[]'); } catch (e) { return []; }
  }
  function saveApps(a) { try { localStorage.setItem('tlp-coadmin-apps', JSON.stringify(a)); } catch (e) {} }
  function applyCoAdmin() {
    load();
    var me = learnerId(), name = '';
    try { var l = TLP_AUTH.getActiveLearner && TLP_AUTH.getActiveLearner(); name = (l && l.name) || 'Player'; } catch (e) {}
    if (S.coadmin === 'approved') { toast('You are already co-admin.'); return; }
    if (S.coadmin === 'pending') { toast('Application already pending admin review.'); return; }
    var st = stats(), okAll = COADMIN_REQS.every(function (r) { return r.test(); });
    var list = apps().filter(function (a) { return a.id !== me; });
    list.push({ id: me, name: name, at: Date.now(), ch: st.ch, stars: st.stars, streak: st.streak,
      ok: COADMIN_REQS.map(function (r) { return r.test(); }) });
    saveApps(list);
    S.coadmin = 'pending'; persist();
    toast(okAll ? 'Application sent — you meet every requirement!' : 'Application sent. The admin will review your progress.');
    renderCrew();
  }
  function reviewApp(id, approve) {
    if (!isAdmin()) return;
    var list = apps(), app = null;
    list.forEach(function (a) { if (a.id === id) app = a; });
    if (!app) return;
    saveApps(list.filter(function (a) { return a.id !== id; }));

    try {
      var k = 'tlp-econ:' + id, s = JSON.parse(localStorage.getItem(k) || '{}');
      s = Object.assign(blank(), s); s.coadmin = approve ? 'approved' : 'none';
      localStorage.setItem(k, JSON.stringify(s));
    } catch (e) {}
    toast((approve ? 'Approved' : 'Denied') + ' co-admin application for ' + app.name + '.');
    renderCrew();
  }


  var TITLES = {
    rookie:  { name: 'Rookie',          cls: 't-rookie',  phrase: 'Fresh compile, fresh start.' },
    coder:   { name: 'Certified Coder', cls: 't-coder',   phrase: 'Syntax approved by the Protocol.' },
    hero:    { name: 'Hero',            cls: 't-hero',    phrase: 'Guardians fear this one.' },
    legend:  { name: 'Living Legend',   cls: 't-legend',  phrase: 'The leaderboard bows to you.' },
    star:    { name: 'Star Coder',      cls: 't-star',    phrase: 'Bright enough to navigate by.' },
    champ:   { name: 'Champion',        cls: 't-champ',   phrase: 'Undefeated. Mostly.' },
    overlord:{ name: 'Overlord',        cls: 't-overlord',phrase: 'The Protocol fears you.' },
    mythic:  { name: 'Mythic',          cls: 't-mythic',  phrase: 'Legends are printed with your name.' },
    coadmin: { name: 'Co-Admin',        cls: 't-coadmin', phrase: 'Second-in-command of the Protocol.' }
  };
  function titleOwned(id) { return !!((S.titles && (S.titles[id] || S.titles['title:' + id])) || S.owned['title:' + id]); }
  function titleKey() {
    load();
    if (S.titlePref === 'none') return '';
    if (S.titlePref === 'coadmin' && coadmin()) return 'coadmin';
    if (S.titlePref && titleOwned(S.titlePref) && TITLES[S.titlePref]) return S.titlePref;
    if (coadmin()) return 'coadmin';
    var pref = ['mythic', 'overlord', 'champ', 'legend', 'star', 'hero', 'coder', 'rookie'];
    for (var i = 0; i < pref.length; i++) if (titleOwned(pref[i])) return pref[i];
    return '';
  }
  function titleHtml() {
    var k = titleKey(); if (!k || !TITLES[k]) return '';
    var t = TITLES[k];
    return '<span class="econ-title ' + t.cls + '" title="' + esc(t.phrase) + '">' + t.name + '</span>';
  }
  function ownedTitleIds() {
    var ids = Object.keys(S.titles || {}).map(function (k) { return k.indexOf('title:') === 0 ? k.slice(6) : k; }).concat(Object.keys(S.owned || {}).filter(function (k) { return k.indexOf('title:') === 0; }).map(function (k) { return k.slice(6); }));
    if (coadmin()) ids.push('coadmin');
    return ids.filter(function (id, i, a) { return TITLES[id] && a.indexOf(id) === i; });
  }
  function setTitle(id) {
    load();
    if (id !== 'none' && !(id === 'coadmin' && coadmin()) && !titleOwned(id)) return;
    S.titlePref = id; persist(); renderAvatarExtras();
    toast(id === 'none' ? 'Name plate hidden.' : 'Equipped ' + TITLES[id].name + '.');
  }
  function renderAvatarExtras() {
    var menu = document.getElementById('avMenu'), meta = menu && menu.querySelector('#avMeta');
    if (!meta || menu.hidden) return;
    var old = meta.querySelector('#avTitlePicker'); if (old) old.remove();
    var oldTitle = meta.querySelector('.econ-title'); if (oldTitle) oldTitle.remove();
    var ids = ownedTitleIds(); if (!ids.length) return;
    var current = titleKey(), titleMarkup = titleHtml();
    if (titleMarkup) { var by = meta.querySelector('.av-player-by'); if (by) by.insertAdjacentHTML('afterend', titleMarkup); }
    var label = document.createElement('label');
    label.id = 'avTitlePicker'; label.className = 'av-title-picker';
    label.innerHTML = '<span>Name plate</span><select aria-label="Equip a name plate"><option value="none">No plate</option>' + ids.map(function (id) {
      return '<option value="' + esc(id) + '"' + (id === current ? ' selected' : '') + '>' + esc(TITLES[id].name) + '</option>';
    }).join('') + '</select>';
    meta.appendChild(label);
    label.querySelector('select').onchange = function () { setTitle(this.value); };
  }


  var modal = null, tab = 'quests';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(msg) {
    var m = document.getElementById('econToast');
    if (!m) { m = document.createElement('div'); m.id = 'econToast'; m.className = 'econ-toast'; document.body.appendChild(m); }
    m.textContent = msg; m.classList.add('on');
    clearTimeout(m._t); m._t = setTimeout(function () { m.classList.remove('on'); }, 2600);
  }
  function sndTick() { try { if (window.TLP_COMMON && TLP_COMMON.snd) TLP_COMMON.snd('chime'); } catch (e) {} }

  function renderQuests() {
    var el = modal && modal.querySelector('#econPane-quests'); if (!el) return;
    var st = qstate();
    el.innerHTML = todayQuests().map(function (q) {
      var p = Math.min(st.prog[q.id] || 0, q.goal), done = p >= q.goal, claimed = !!st.claimed[q.id];
      return '<div class="eq"><span class="eq-ic">' + q.icon + '</span><div class="eq-b"><b>' + esc(q.name) + '</b><small>' + esc(q.desc) + '</small>' +
        '<div class="eq-bar"><i style="width:' + Math.round(p / q.goal * 100) + '%"></i></div></div>' +
        '<button class="econ-btn" data-q="' + q.id + '" ' + (claimed ? 'disabled' : done ? '' : 'disabled') + '>' +
        (claimed ? 'Claimed' : '+' + q.rw + '⚡') + '</button></div>';
    }).join('');
    el.querySelectorAll('[data-q]').forEach(function (b) { b.onclick = function () { claimQuest(b.dataset.q); }; });
  }
  function renderShop() {
    var el = modal && modal.querySelector('#econPane-shop'); if (!el) return;
    load();
    var query = shopQuery.trim().toLowerCase();
    var items = SHOP.filter(function (it) {
      var matchesCat = shopCat === 'all' || catOf(it) === shopCat;
      var matchesText = !query || (it.name + ' ' + it.desc + ' ' + catOf(it) + ' ' + it.rarity).toLowerCase().indexOf(query) >= 0;
      return matchesCat && matchesText;
    });
    var selected = SHOP.filter(function (it) { return it.id === shopPreviewId; })[0] || items[0] || SHOP[0];
    var currentCfg = { animal: 'robot', b: 'blue', gear: 'none', hat: 'none', face: 'std', speech: '', pet: 'none', anim: 'idle' };
    try { if (window.TLP_AVATAR) currentCfg = TLP_AVATAR.get(); } catch (e) {}
    var displayCfg = previewConfig(selected, currentCfg);
    var hero = ''; try { if (window.TLP_AVATAR) hero = TLP_AVATAR.svg(displayCfg, 160); } catch (e) {}
    var selectedOwned = selected && (selected.kind === 'title' ? titleOwned(selected.id.slice(6)) : !!S.owned[selected.kind === 'av' ? 'av:' + selected.id : selected.id]);
    var rarity = selected ? RARITY[selected.rarity] : RARITY.common;
    var showcase = '<section class="shop-showcase" style="--rc:' + rarity.c + '" aria-label="Featured cosmetic"><div class="shop-show-art">' + hero +
      (selected && selected.kind === 'title' ? '<span class="lb-plate t-' + esc(selected.id.split(':')[1]) + '">' + esc(selected.name) + '</span>' : '') +
      '</div><div class="shop-show-copy"><span class="shop-show-kicker">' + (selectedOwned ? 'IN YOUR COLLECTION' : 'FEATURED ITEM') + '</span>' +
      '<h3>' + esc(selected ? selected.name : 'Your explorer') + '</h3><p>' + esc(selected ? selected.desc : 'Choose an item to preview it on your character.') + '</p>' +
      '<div class="shop-show-tags"><span style="--tag:' + rarity.c + '">' + rarity.label + '</span><span>' + esc(catLabel(selected)) + '</span>' + swatchesHtml(selected) + '</div>' +
      '<div class="shop-show-actions">' + (selected && selected.kind === 'av' && selectedOwned ? '<button type="button" class="econ-btn pri" data-wear="' + esc(selected.id) + '">Wear item</button>' :
      (selected && !selectedOwned ? '<button type="button" class="econ-btn pri" data-buy="' + esc(selected.id) + '">Get for ' + selected.price + ' sparks</button>' : '')) +
      '<span class="shop-balance">' + S.sparks + ' sparks available</span></div></div></section>';
    var tabs = CATS.map(function (c) {
      var n = c[0] === 'all' ? SHOP.length : SHOP.filter(function (it) { return catOf(it) === c[0]; }).length;
      return '<button type="button" class="shop-cat' + (shopCat === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '" style="--cc:' + c[2] + '">' + c[1] + ' <i>' + n + '</i></button>';
    }).join('');
    var grid = items.map(function (it) {
      var key = it.kind === 'av' ? 'av:' + it.id : it.id, owned = !!S.owned[key], afford = S.sparks >= it.price;
      var rc = RARITY[it.rarity], cc = (CATS.filter(function (c) { return c[0] === catOf(it); })[0] || CATS[0])[2];
      var cfg = previewConfig(it, currentCfg);
      var preview = ''; try { if (window.TLP_AVATAR) preview = TLP_AVATAR.svg(cfg, 76); } catch (e) {}
      return '<article class="es' + (owned ? ' owned' : '') + (selected && selected.id === it.id ? ' selected' : '') + '" style="--rc:' + rc.c + ';--cc:' + cc + '">' +
        '<button type="button" class="econ-prev" data-preview="' + esc(it.id) + '" aria-label="Preview ' + esc(it.name) + '">' + preview + '</button>' +
        '<span class="es-rar">' + rc.label + '</span><b>' + esc(it.name) + '</b><small>' + esc(it.desc) + '</small>' + swatchesHtml(it) +
        (owned ? '<button type="button" class="econ-btn econ-btn--owned" disabled>In collection</button>' : '<button type="button" class="econ-btn" data-buy="' + esc(it.id) + '" ' + (!afford ? 'disabled' : '') + '>' + (afford ? it.price + ' sparks' : 'Need ' + it.price + ' sparks') + '</button>') +
        '</article>';
    }).join('');
    el.innerHTML = showcase + '<div class="shop-toolbar"><div><span class="shop-show-kicker">THE COLLECTION</span><h3>Find your look</h3></div><label class="shop-search"><span class="sr-only">Search items</span><input id="shopSearch" type="search" value="' + esc(shopQuery) + '" placeholder="Search outfits, pets, effects?" autocomplete="off"></label></div>' +
      '<div class="shop-tabs">' + tabs + '</div><div class="shop-result-count">' + items.length + ' item' + (items.length === 1 ? '' : 's') + '</div><div class="es-grid">' + (grid || '<p class="crew-desc">No items match this search.</p>') + '</div>';
    var search = el.querySelector('#shopSearch'); if (search) search.oninput = function () { var at = search.selectionStart; shopQuery = search.value; renderShop(); var next = el.querySelector('#shopSearch'); if (next) { next.focus(); next.setSelectionRange(at, at); } };
    el.querySelectorAll('.shop-cat').forEach(function (button) { button.onclick = function () { shopCat = button.dataset.cat; renderShop(); }; });
    el.querySelectorAll('[data-preview]').forEach(function (button) { button.onclick = function () { shopPreviewId = button.dataset.preview; renderShop(); }; });
    el.querySelectorAll('[data-buy]').forEach(function (button) { button.onclick = function () { buy(button.dataset.buy); }; });
    el.querySelectorAll('[data-wear]').forEach(function (button) { button.onclick = function () { var parts = button.dataset.wear.split(':'); if (window.TLP_AVATAR) TLP_AVATAR.set(parts[0], parts[1]); toast('Equipped ' + selected.name); }; });
  }
  function renderWheel() {
    if (!modal || modal.hidden) return;
    load();
    var pane = modal.querySelector('#econPane-wheel');
    var layout = pane && pane.querySelector('.wheel-layout');
    if (!spinning && layout && layout.dataset.week !== weekKey()) {
      pane.innerHTML = wheelHTML();
      bindWheelSpin();
    }
    var left = msToWeekEnd();
    var dd = Math.floor(left / 86400000), hh = Math.floor(left % 86400000 / 3600000), mm = Math.floor(left % 3600000 / 60000), ss = Math.floor(left % 60000 / 1000);
    var timer = modal.querySelector('#wheelTimer');
    if (timer) timer.textContent = 'New wheel in ' + dd + 'd ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    var spins = modal.querySelector('#wheelSpins'); if (spins) spins.textContent = 'Spins this week: ' + S.spins;
    var balance = modal.querySelector('#econBal'); if (balance) balance.textContent = '⚡ ' + S.sparks;
    var afford = modal.querySelector('#spinBtn'); if (afford) afford.disabled = S.sparks < WHEEL_COST || spinning;
    var lbl = modal.querySelector('#spinLbl'); if (lbl) lbl.textContent = spinning ? 'Spinning…' : 'Spin — ' + WHEEL_COST + '⚡';
    var history = modal.querySelector('#wheelHistory'); if (history) history.innerHTML = recentHistoryHtml();
    var freshKeys = S.recent.filter(function (x) { return x.f; }).map(function (x) { return x.k; });
    modal.querySelectorAll('[data-prize-key]').forEach(function (chip) { chip.classList.toggle('is-new', freshKeys.indexOf(chip.dataset.prizeKey) >= 0); });
    var stage = modal.querySelector('.wheel-stage');
    if (stage) stage.classList.toggle('can-spin', S.sparks >= WHEEL_COST && !spinning);
  }
  function wheelHTML() {


    var wheels = weekWheels(), slices = wheelSlices(wheels);
    var segs = wheels.map(function (s, i) {
      return RARITY[s.r].c + ' ' + (slices[i].start - 0.03).toFixed(2) + 'deg ' + (slices[i].end + 0.03).toFixed(2) + 'deg';
    }).join(',');
    var labels = wheels.map(function (s, i) {
      var shortLabel = s.label.replace(/\s+(plate|eyes|bubble|dance|zoom)$/i, '').replace(' JACKPOT', '');
      var compact = slices[i].end - slices[i].start < 24;
      return '<span class="wheel-lbl rar-' + s.r + (compact ? ' compact' : '') + '" title="Prize ' + (i + 1) + ': ' + esc(s.label) + '" style="--a:' + slices[i].center.toFixed(2) + 'deg"><b>' + (i + 1) + '</b><span>' + esc(shortLabel) + '</span></span>';
    }).join('');
    var legend = wheels.map(function (s, i) {
      var key2 = s.kind === 'sparks' ? 'sparks:' + s.v : (s.id.indexOf('title:') === 0 ? s.id : 'av:' + s.id);
      return '<span class="wl-chip" data-prize-key="' + esc(key2) + '" style="--rc:' + RARITY[s.r].c + '"><b>' + (i + 1) + '</b><span title="' + esc(s.label) + '">' + esc(s.label) + '</span>' + swatchesHtml(s) + '</span>';
    }).join('');
    var wheelLabel = 'Weekly prize wheel. ' + wheels.map(function (s, i) { return (i + 1) + ': ' + s.label; }).join('. ');
    return '<div class="wheel-layout" data-week="' + weekKey() + '"><section class="wheel-art-panel"><div class="wheel-kicker">THE SPARK VAULT</div><h3 class="wheel-art-title">Your next big win.</h3><p class="wheel-art-subtitle">A fresh prize lineup every week</p><div class="wheel-stage">' +
      '<div class="wheel-aura" aria-hidden="true"></div>' +
      '<div class="wheel-rim" aria-hidden="true"><span class="wheel-ticks"></span></div>' +
      '<div class="wheel-pointer" aria-hidden="true"><i></i></div>' +
      '<div class="wheel" id="econWheel" role="img" aria-label="' + esc(wheelLabel) + '" style="background:conic-gradient(' + segs + ')">' + labels + '</div>' +
      '<div class="wheel-hub" aria-hidden="true"><span class="wheel-hub-core">★</span></div>' +
      '<div class="wheel-floor" aria-hidden="true"></div>' +
      '</div></section><aside class="wheel-side-panel">' +
      '<div class="wheel-meta">' +
      '<div class="wheel-status"><div id="wheelTimer" class="wheel-timer">Resets soon</div><div id="wheelSpins" class="wheel-spins">Spins this week: 0</div></div>' +
      '<div class="wheel-result" id="wheelResult" role="status" aria-live="polite"></div>' +
      '<button class="econ-btn pri" id="spinBtn"><span id="spinLbl">Spin</span></button>' +
      '<small class="wheel-note">Every prize is guaranteed. Legendary drops are rare.</small></div>' +
      '<div class="wheel-loot" aria-label="This week\'s prizes"><span class="wl-lab">✦ THIS WEEK\'S PRIZES</span><div class="wl-chips">' + legend + '</div></div>' +
      '<section class="wheel-history" aria-label="Recent wheel prizes"><span class="wl-lab">RECENT PRIZES</span><div id="wheelHistory">' + recentHistoryHtml() + '</div></section>' +
      '</aside></div>';
  }
  function renderCrew() {
    var el = modal && modal.querySelector('#econPane-crew'); if (!el) return;
    var me = learnerId();
    var st = stats();
    var mine = S.coadmin;
    var reqHtml = COADMIN_REQS.map(function (r) {
      var ok = r.test();
      return '<li class="' + (ok ? 'ok' : '') + '">' + (ok ? '✓' : '○') + ' ' + esc(r.label) +
        ' <small>(' + (r.id === 'ch' ? st.ch : r.id === 'stars' ? st.stars : st.streak) + ')</small></li>';
    }).join('');
    var statusTxt = mine === 'approved' ? '<b class="crew-ok">You are a Co-Admin — +25% sparks on everything!</b>' :
      mine === 'pending' ? '<b class="crew-wait">Application pending — the admin will review it.</b>' :
      '<p class="crew-desc">Become a Co-Admin: help run the game, earn bonus sparks and a special plate. Only the site admin can approve.</p>' +
      '<ul class="crew-req">' + reqHtml + '</ul>' +
      '<button class="econ-btn pri" id="crewApply">Apply for Co-Admin</button>';
    var admin = isAdmin();
    var list = apps();
    var adminHtml = admin ? '<h4 class="crew-h">Applications (' + list.length + ')</h4>' +
      (list.length ? list.map(function (a) {
        var allOk = COADMIN_REQS.every(function (r, i) { return a.ok[i]; });
        return '<div class="crew-app"><b>' + esc(a.name) + '</b><small>' + a.ch + ' ch · ' + a.stars + '★ · ' + a.streak + ' streak days</small>' +
          '<span class="crew-verdict ' + (allOk ? 'ok' : 'no') + '">' + (allOk ? 'Eligible ✓' : 'Not eligible yet') + '</span>' +
          '<span class="crew-acts"><button class="econ-btn sm ok" data-app-ok="' + a.id + '">Approve</button>' +
          '<button class="econ-btn sm" data-app-no="' + a.id + '">Deny</button></span></div>';
      }).join('') : '<p class="crew-desc">No pending applications.</p>') : '';
    var treasury = admin ? '<h4 class="crew-h">Treasury — admin only</h4>' +
      '<div class="crew-app"><span>Balance: <b>' + S.sparks + '⚡</b></span>' +
      '<input id="treasN" type="number" min="0" max="99999" value="500" aria-label="Spark amount">' +
      '<span class="crew-acts"><button class="econ-btn sm ok" id="treasAdd">Add</button>' +
      '<button class="econ-btn sm" id="treasSet">Set</button></span></div>' +
      '<p class="crew-desc">Adjusts your own spark balance. Co-admins and players cannot use this.</p>' : '';
    el.innerHTML = statusTxt + treasury + adminHtml;
    var tn = el.querySelector('#treasN');
    if (tn) {
      var amt = function () { var v = parseInt(tn.value, 10); return isNaN(v) || v < 0 ? 0 : v; };
      var add = el.querySelector('#treasAdd'); if (add) add.onclick = function () { load(); S.sparks += amt(); persist(); toast('+' + amt() + '⚡ added by admin.'); renderCrew(); };
      var set = el.querySelector('#treasSet'); if (set) set.onclick = function () { load(); S.sparks = amt(); persist(); toast('Balance set to ' + amt() + '⚡.'); renderCrew(); };
    }
    var ap = el.querySelector('#crewApply'); if (ap) ap.onclick = applyCoAdmin;
    el.querySelectorAll('[data-app-ok]').forEach(function (b) { b.onclick = function () { reviewApp(b.dataset.appOk, true); }; });
    el.querySelectorAll('[data-app-no]').forEach(function (b) { b.onclick = function () { reviewApp(b.dataset.appNo, false); }; });
  }

  function renderAll() {
    if (!modal || modal.hidden) return;
    modal.querySelectorAll('.econ-tab').forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); });
    modal.querySelectorAll('.econ-pane').forEach(function (p) { p.hidden = p.id !== 'econPane-' + tab; });
    if (tab === 'quests') renderQuests();
    if (tab === 'shop') renderShop();
    if (tab === 'wheel') { renderWheel(); }
    if (tab === 'crew') renderCrew();
    var bal = modal.querySelector('#econBal'); if (bal) bal.textContent = '⚡ ' + S.sparks;
  }
  function bindWheelSpin() {
    var button = modal && modal.querySelector('#spinBtn');
    if (button) button.onclick = spinWheel;
  }
  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'tlpm econ-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="tlpm-pan econ-pan">' +
      '<header class="econ-head"><div><span class="lab">SPARKS ECONOMY</span><h2>The Exchange</h2>' +
      '<p>Earn sparks from missions, quests and streaks. Spend them in the shop or spin the weekly wheel.</p></div>' +
      '<div class="econ-head-r"><select class="econ-music" id="econMusic" aria-label="Music theme">' +
      [['','Page theme'],['home','Home calm'],['g16','Arcade'],['g710','Upbeat'],['g1112','Dark drive'],['adult','Night ops'],['boss','Boss mode']].map(function (m) {
        return '<option value="' + m[0] + '">' + m[1] + '</option>';
      }).join('') + '</select>' +
      '<span class="econ-bal" id="econBal">⚡ 0</span><button class="tlpm-btn" id="econX" type="button" aria-label="Close">✕</button></div></header>' +
      '<nav class="econ-tabs">' +
      [['quests', 'Daily quests'], ['shop', 'Shop'], ['wheel', 'Lucky wheel'], ['crew', 'Co-Admin']].map(function (t) {
        return '<button class="econ-tab" data-t="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</nav>' +
      '<div class="econ-pane" id="econPane-quests"></div>' +
      '<div class="econ-pane" id="econPane-shop" hidden></div>' +
      '<div class="econ-pane" id="econPane-wheel" hidden>' + wheelHTML() + '</div>' +
      '<div class="econ-pane" id="econPane-crew" hidden></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('#econX').onclick = close;
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    var mus = modal.querySelector('#econMusic');
    if (mus) {
      try { mus.value = localStorage.getItem('tlp-econmusic') || ''; } catch (e) {}
      mus.onchange = function () {
        try { localStorage.setItem('tlp-econmusic', mus.value); } catch (e) {}
        try {
          if (window.TLP_MUSIC) {
            if (mus.value) TLP_MUSIC.setTheme(mus.value); else TLP_MUSIC.setTheme(document.body.getAttribute('data-music') || 'home');
            TLP_MUSIC.start();
          }
        } catch (e) {}
        toast(mus.value ? 'Music: ' + mus.options[mus.selectedIndex].text : 'Music: page theme');
      };
    }
    modal.querySelectorAll('.econ-tab').forEach(function (b) { b.onclick = function () { tab = b.dataset.t; renderAll(); if (tab === 'wheel') startWheelTimer(); } });
    bindWheelSpin();
  }
  var wheelTimerInt = null;
  function startWheelTimer() {
    clearInterval(wheelTimerInt);
    wheelTimerInt = setInterval(function () { if (modal && !modal.hidden && tab === 'wheel') renderWheel(); }, 1000);
    renderWheel();
  }
  function open(tabName) {
    load();
    if (!modal) buildModal();
    if (tabName) tab = tabName;
    modal.hidden = false;
    document.body.classList.add('tlpm-open');
    renderAll();
    if (tab === 'wheel') startWheelTimer();
  }
  function close() {
    if (spinning) cancelSpin();
    if (modal) modal.hidden = true;
    document.body.classList.remove('tlpm-open');
    clearInterval(wheelTimerInt);
  }



  function patchAvatarMeta() {
    if (!window.TLP_AVATAR || TLP_AVATAR.__econPatched) return;
    TLP_AVATAR.__econPatched = true;
  }


  function injectButton() {
    if (document.getElementById('econBtn')) return;
    var b = document.createElement('button');
    b.id = 'econBtn'; b.type = 'button'; b.className = 'econbtn';
    b.setAttribute('aria-label', 'Open sparks shop, quests and wheel');
    b.innerHTML = '⚡ <span class="econbtn-n" id="econBtnN">0</span>';
    b.onclick = function () { open(); };
    document.body.appendChild(b);
    updateBadge();
  }
  function updateBadge() {
    var n = document.getElementById('econBtnN');
    if (n) n.textContent = S.sparks;
    updateMenuBar();
  }



  function injectMenuBar() {
    if (document.getElementById('econBar')) return;
    var host = document.querySelector('#menu .dashrow') || document.querySelector('#menu .how') || document.getElementById('menu');
    if (!host) return;
    var bar = document.createElement('div');
    bar.className = 'econbar'; bar.id = 'econBar';
    bar.innerHTML =
      '<button type="button" class="econbar-b" data-t="quests"><span class="eb-ic">⚔</span><span class="eb-tx"><b>Quests</b><small id="ebQ">Daily missions</small></span><span class="eb-badge" id="ebQB" hidden></span></button>' +
      '<button type="button" class="econbar-b" data-t="shop"><span class="eb-ic">🛍</span><span class="eb-tx"><b>Shop</b><small id="ebS">Spend sparks</small></span><span class="eb-badge gold" id="ebSB">0</span></button>' +
      '<button type="button" class="econbar-b" data-t="wheel"><span class="eb-ic">🎡</span><span class="eb-tx"><b>Lucky wheel</b><small id="ebW">Weekly spin</small></span><span class="eb-badge" id="ebWB"></span></button>';
    host.insertAdjacentElement('afterend', bar);
    bar.querySelectorAll('.econbar-b').forEach(function (b) { b.onclick = function () { open(b.dataset.t); }; });
    updateMenuBar();
  }
  function updateMenuBar() {
    var bar = document.getElementById('econBar'); if (!bar) return;
    load();
    var claimable = 0;
    try {
      var st = qstate();
      todayQuests().forEach(function (q) { if (!st.claimed[q.id] && (st.prog[q.id] || 0) >= q.goal) claimable++; });
    } catch (e) {}
    var qb = document.getElementById('ebQB'); if (qb) { qb.hidden = !claimable; qb.textContent = claimable; }
    var qs = document.getElementById('ebQ'); if (qs) qs.textContent = claimable ? claimable + ' reward' + (claimable > 1 ? 's' : '') + ' ready!' : 'Daily missions';
    var sb = document.getElementById('ebSB'); if (sb) sb.textContent = S.sparks;
    var ss = document.getElementById('ebS'); if (ss) ss.textContent = S.sparks + ' sparks';
    var left = msToWeekEnd(), dd = Math.floor(left / 86400000), hh = Math.floor(left % 86400000 / 3600000), mm = Math.floor(left % 3600000 / 60000);
    var wb = document.getElementById('ebWB'), ws = document.getElementById('ebW');
    if (wb) wb.textContent = dd + 'd ' + String(hh).padStart(2, '0') + 'h';
    if (ws) ws.textContent = S.sparks >= WHEEL_COST ? 'Spin for ' + WHEEL_COST + '⚡' : 'Need ' + WHEEL_COST + '⚡';
  }
  function boot() {
    injectButton();
    injectMenuBar();
    load(); updateBadge();
    patchAvatarMeta();
    setInterval(updateMenuBar, 30000);

    try {
      var mm = localStorage.getItem('tlp-econmusic');
      if (mm && window.TLP_MUSIC) { TLP_MUSIC.setTheme(mm); }
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('tlp-auth-ready', function () {
    if (spinning && spinContext && learnerId() !== spinContext.learner) cancelSpin('Spin cancelled because the learner changed. Your Sparks were refunded.');
    load(); updateBadge(); updateMenuBar(); if (modal && !modal.hidden) renderAll();
  });
  document.addEventListener('tlp-econ-change', updateBadge);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && spinning) cancelSpin('Spin interrupted. Your Sparks were refunded.');
  });
  window.addEventListener('pagehide', function () {
    if (spinning) cancelSpin('Spin interrupted. Your Sparks were refunded.');
  });

  window.TLP_ECONOMY = {
    open: open, earn: earn, earnAmount: earnAmount, spend: spend, sparks: function () { load(); return S.sparks; },
    track: track, claimQuest: claimQuest, owns: owns, buy: buy,
    guardianDown: guardianDown,
    titleHtml: titleHtml, titleKey: titleKey, setTitle: setTitle, renderAvatarExtras: renderAvatarExtras, isCoAdmin: coadmin,
    recent: function () { load(); return S.recent.slice(); },
    quests: todayQuests, wheelCost: function () { return WHEEL_COST; },
    spin: spinWheel, stats: stats
  };
})();
