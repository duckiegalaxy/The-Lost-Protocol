/* =============================================================================
   FRIEND LIST AND LIVE PRESENCE  (js/tlp-presence.js)
   -----------------------------------------------------------------------------
   Load after tlp-auth.js and tlp-common.js on pages where a signed-in learner
   can be seen by friends.
   
   How it works:
     - A friend list is stored in this browser, keyed by the learner's account,
       so no new database table is needed. Both players add each other's Player
       ID to see one another.
     - A single Supabase Realtime channel carries presence only: Player ID,
       display name and a short activity line. Nothing private is published.
     - Presence is best effort. If Realtime is unavailable the list still works
       and everyone simply appears offline.
   
   Public API (window.TLP_PRESENCE):
     start(opts)                 begin presence once the account is known
     setActivity(text)           change the activity friends see
     me()                        {id, name, player_id} or null
     friends()                   local list merged with live presence
     addFriend(pid, name)        add one Player ID, returns the saved entry
     removeFriend(pid)
     onlineMap()                 latest presence payloads, keyed by Player ID
     onChange(fn)                call fn(friends) whenever presence changes
     lookupPlayer(pid)           public display name for a Player ID
   ============================================================================= */
(function () {
  'use strict';
  if (window.TLP_PRESENCE) return;

  var A = function () { return window.TLP_AUTH; };
  var CHANNEL = 'tlp-presence';
  var me = null, ch = null, activity = '', beat = null, started = false;
  var online = {}, listeners = [], booted = null;

  function normPid(v) {
    return String(v == null ? '' : v).trim().toUpperCase().replace(/\s+/g, '');
  }
  function validPid(v) { return /^TLP-[A-Z0-9-]{4,24}$/.test(v); }
  function storeKey() { return 'tlp-friends:' + (me ? me.id : 'guest'); }
  function readList() {
    try {
      var v = JSON.parse(localStorage.getItem(storeKey()) || '[]');
      return Array.isArray(v) ? v.filter(function (x) { return x && validPid(normPid(x.pid)); })
        .map(function (x) { return { pid: normPid(x.pid), name: String(x.name || '').slice(0, 32) }; }) : [];
    } catch (e) { return []; }
  }
  function writeList(v) { try { localStorage.setItem(storeKey(), JSON.stringify(v.slice(0, 100))); } catch (e) {} }

  function payload() {
    return {
      learner_id: me.id,
      player_id: me.player_id,
      name: me.name,
      activity: activity || 'Browsing the Nexus',
      page: location.pathname.split('/').pop() || 'index.html',
      at: Date.now()
    };
  }
  function track() {
    if (!ch || !me) return;
    try { ch.track(payload()); } catch (e) {}
  }

  function collect() {
    var state = {};
    try { state = ch.presenceState() || {}; } catch (e) { return; }
    var next = {};
    Object.keys(state).forEach(function (k) {
      var arr = state[k];
      if (!arr || !arr.length) return;
      var p = arr[arr.length - 1];
      var pid = normPid(p && p.player_id);
      if (!pid || !p.learner_id) return;
      next[pid] = { pid: pid, learner_id: p.learner_id, name: String(p.name || 'Player').slice(0, 32), activity: String(p.activity || '').slice(0, 80), page: String(p.page || ''), at: Number(p.at) || 0 };
    });
    online = next;
    var merged = friends();
    listeners.forEach(function (fn) { try { fn(merged); } catch (e) {} });
  }

  function join() {
    var sb = A().supabase;
    if (!sb || !me) return;
    try {
      ch = sb.channel(CHANNEL, { config: { presence: { key: me.id } } });
      ch.on('presence', { event: 'sync' }, collect);
      ch.on('presence', { event: 'join' }, collect);
      ch.on('presence', { event: 'leave' }, collect);
      ch.subscribe(function (status) {
        if (status === 'SUBSCRIBED') track();
      });
      beat = setInterval(track, 25000);
    } catch (e) { ch = null; }
  }

  function start(opts) {
    if (started) return booted || Promise.resolve();
    started = true;
    opts = opts || {};
    if (opts.activity) activity = String(opts.activity).slice(0, 80);
    booted = Promise.resolve().then(function () {
      if (!A() || !A().init) return;
      return A().init().then(function () {
        if (!A().isCloudConfigured || !A().isCloudConfigured()) return;
        var l = A().getActiveLearner && A().getActiveLearner();
        if (!l || l.isGuest || !l.id) return;
        me = {
          id: String(l.id),
          name: String(l.name || 'Player').slice(0, 32),
          player_id: normPid(l.player_id || l.playerId || '')
        };
        if (!activity) {
          var el = document.querySelector('[data-activity]');
          activity = (el && el.getAttribute('data-activity')) || 'Browsing the Nexus';
        }
        join();
      });
    }).catch(function () {});
    return booted;
  }

  function setActivity(text) {
    var next = String(text || '').slice(0, 80);
    if (next === activity) return;
    activity = next;
    track();
  }

  function meInfo() { return me ? { id: me.id, name: me.name, player_id: me.player_id } : null; }

  function friends() {
    return readList().map(function (f) {
      var p = online[f.pid];
      return {
        pid: f.pid,
        name: (p && p.name) || f.name || 'Friend',
        online: !!p,
        activity: (p && p.activity) || '',
        at: (p && p.at) || 0
      };
    }).sort(function (a, b) { return (b.online - a.online) || a.name.localeCompare(b.name); });
  }

  function addFriend(pid, name) {
    pid = normPid(pid);
    if (!me) throw new Error('Sign in with a learner account first.');
    if (!validPid(pid)) throw new Error('That does not look like a Player ID. It starts with TLP- followed by letters or numbers.');
    if (me.player_id && pid === me.player_id) throw new Error('That is your own Player ID.');
    var list = readList();
    var hit = list.filter(function (x) { return x.pid === pid; })[0];
    if (hit) {
      if (name) hit.name = String(name).slice(0, 32);
      writeList(list);
      return hit;
    }
    var entry = { pid: pid, name: String(name || '').slice(0, 32) };
    list.push(entry);
    writeList(list);
    return entry;
  }

  function removeFriend(pid) {
    pid = normPid(pid);
    writeList(readList().filter(function (x) { return x.pid !== pid; }));
  }

  function onlineMap() { return online; }

  function onChange(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    fn(friends());
    return function () {
      listeners = listeners.filter(function (x) { return x !== fn; });
    };
  }

  async function lookupPlayer(pid) {
    pid = normPid(pid);
    if (!validPid(pid)) throw new Error('That does not look like a Player ID.');
    if (!A() || !A().supabase) return null;
    var res = await A().supabase.from('public_leaderboard').select('player_id,display_name').eq('player_id', pid).limit(1);
    if (res.error) throw res.error;
    return (res.data && res.data[0]) || null;
  }

  window.TLP_PRESENCE = {
    start: start,
    setActivity: setActivity,
    me: meInfo,
    friends: friends,
    addFriend: addFriend,
    removeFriend: removeFriend,
    onlineMap: onlineMap,
    onChange: onChange,
    lookupPlayer: lookupPlayer,
    validPid: validPid
  };

  window.addEventListener('beforeunload', function () {
    if (beat) clearInterval(beat);
    try { if (ch) A().supabase.removeChannel(ch); } catch (e) {}
  });

  // Pages opt in with a body data-activity attribute, so adding the script is
  // enough to appear online with a sensible activity line.
  function auto() {
    if (document.body && document.body.hasAttribute('data-activity')) start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
