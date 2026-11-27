(function () {
  'use strict';
  if (window.TLP_PRESENCE) return;

  var A = function () { return window.TLP_AUTH; };
  var CHANNEL = 'tlp-presence';
  var me = null, ch = null, dataCh = null, activity = '', beat = null, started = false;
  var online = {}, lastSeen = {}, listeners = [], booted = null;
  var serverMode = false, serverFriends = [], friendRequests = { incoming: [], outgoing: [] }, notifications = [];
  var seenNotifications = {}, presenceReady = false, reloadTimer = null, pollTimer = null;
  var blockedPlayers = {}, blockedOwner = '';
  var generation = 0, reloadQueue = Promise.resolve(), serverError = '', serverBlocked = false;
  var dataChannelReady = false, dataChannelError = '';

  function normPid(v) {
    return String(v == null ? '' : v).trim().toUpperCase().replace(/\s+/g, '');
  }
  function validPid(v) { return /^TLP-[A-Z0-9-]{4,24}$/.test(v); }
  function storeKey() { return 'tlp-friends:' + (me ? me.id : 'guest'); }
  function readList() {
    try {
      var v = JSON.parse(localStorage.getItem(storeKey()) || '[]');
      return Array.isArray(v) ? v.filter(function (x) { return x && validPid(normPid(x.pid)); })
        .map(function (x) { return { pid: normPid(x.pid), name: String(x.name || '').slice(0, 32), avatar: x.avatar && typeof x.avatar === 'object' ? x.avatar : null }; }) : [];
    } catch (e) { return []; }
  }
  function writeList(v) { try { localStorage.setItem(storeKey(), JSON.stringify(v.slice(0, 100))); } catch (e) {} }
  function requireMe() {
    if (!me) throw new Error('Sign in with a learner account first.');
  }
  function rpcUnavailable(error) {
    var code = error && error.code;
    var message = String(error && error.message || '');
    return code === 'PGRST202' || code === '42883' || /could not find.*function|schema cache/i.test(message);
  }
  function errorText(error) {
    return String(error && error.message || error || 'Something went wrong. Please try again.');
  }
  function avatarOf(learner) {
    if (learner && learner.avatar && typeof learner.avatar === 'object') return learner.avatar;
    try {
      if (window.TLP_AVATAR && TLP_AVATAR.get) return TLP_AVATAR.get();
    } catch (e) {}
    return null;
  }
  function currentIdentity(id, gen) {
    return generation === gen && !!me && me.id === id && !!A() && !!A().getActiveLearner && String(A().getActiveLearner().id) === id;
  }
  function requireCurrent(id, gen) {
    if (!currentIdentity(id, gen)) throw new Error('Your active learner changed. Refresh Friends before trying again.');
  }
  function requireServer() {
    requireMe();
    if (serverBlocked) throw new Error(serverError || 'Friends could not connect. Check your connection and try again.');
    if (!serverMode) throw new Error('Online friend requests are not available on this device yet.');
  }
  function payload() {
    return {
      learner_id: me.id,
      player_id: me.player_id,
      name: me.name,
      avatar: avatarOf(A().getActiveLearner && A().getActiveLearner()),
      activity: activity || 'Browsing the Nexus',
      page: location.pathname.split('/').pop() || 'index.html',
      at: Date.now()
    };
  }
  function track() {
    if (!ch || !me) return;
    try { ch.track(payload()); } catch (e) {}
  }
  function emit() {
    var merged = friends();
    listeners.forEach(function (fn) { try { fn(merged); } catch (e) {} });
  }
  function setBlockedPlayers(list) {
    blockedPlayers = {};
    (Array.isArray(list) ? list : []).forEach(function (item) {
      var pid = normPid(item && (item.pid || item.player_id || item));
      if (pid) blockedPlayers[pid] = 1;
    });
  }
  function loadBlockedPlayers() {
    if (!me) return;
    var key = 'tlp-blocked-players:' + me.id;
    if (blockedOwner === key) return;
    blockedOwner = key;
    try { setBlockedPlayers(JSON.parse(localStorage.getItem(key) || '[]')); } catch (e) { setBlockedPlayers([]); }
  }
  function playerBlocked(pid) { return !!blockedPlayers[normPid(pid)]; }
  function showPresenceToast(text) {
    var m = document.getElementById('presenceToast');
    if (!m) {
      m = document.createElement('div');
      m.id = 'presenceToast'; m.className = 'av-toast';
      m.setAttribute('role', 'status'); m.setAttribute('aria-live', 'polite');
      document.body.appendChild(m);
    }
    m.textContent = text;
    m.classList.add('on');
    clearTimeout(m._t);
    m._t = setTimeout(function () { m.classList.remove('on'); }, 4200);
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
      if (!pid || !p.learner_id || playerBlocked(pid)) return;
      next[pid] = {
        pid: pid, learner_id: p.learner_id,
        name: String(p.name || 'Player').slice(0, 32),
        avatar: p.avatar && typeof p.avatar === 'object' ? p.avatar : null,
        activity: String(p.activity || '').slice(0, 80),
        page: String(p.page || ''), at: Number(p.at) || 0
      };
    });
    Object.keys(online).forEach(function (pid) {
      if (!next[pid] && online[pid]) lastSeen[pid] = online[pid].at || Date.now();
    });
    if (presenceReady) {
      friends().forEach(function (f) {
        if (next[f.pid] && !online[f.pid]) showPresenceToast(f.name + ' is online now.');
      });
    }
    online = next;
    presenceReady = true;
    emit();
  }
  function join() {
    var sb = A().supabase;
    if (!sb || !me) return;
    try {
      ch = sb.channel(CHANNEL, { config: { presence: { key: me.id } } });
      ch.on('presence', { event: 'sync' }, collect);
      ch.on('presence', { event: 'join' }, collect);
      ch.on('presence', { event: 'leave' }, collect);
      ch.subscribe(function (status) { if (status === 'SUBSCRIBED') track(); });
      beat = setInterval(track, 25000);
    } catch (e) { ch = null; }
  }
  function scheduleReload() {
    if (!serverMode) return;
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(function () { reload(false).catch(function () {}); }, 120);
  }
  function unsubscribeTables() {
    if (!dataCh) return;
    try { A().supabase.removeChannel(dataCh); } catch (e) {}
    dataCh = null;
    dataChannelReady = false;
    dataChannelError = '';
  }
  function subscribeTables() {
    var sb = A().supabase;
    if (!sb || !me || dataCh) return;
    var id = me.id, gen = generation;
    try {
      dataCh = sb.channel('tlp-friend-data-' + id);
      ['friend_requests', 'friendships', 'friend_notifications'].forEach(function (table) {
        dataCh.on('postgres_changes', { event: '*', schema: 'public', table: table }, scheduleReload);
      });
      dataCh.subscribe(function (status) {
        if (!currentIdentity(id, gen)) return;
        dataChannelReady = status === 'SUBSCRIBED';
        dataChannelError = status === 'SUBSCRIBED' ? '' : status === 'CLOSED' ? 'Live updates paused. Friends will refresh automatically.' : 'Live updates are reconnecting. Friends will refresh automatically.';
        emit();
      });
    } catch (e) {
      dataCh = null;
      dataChannelReady = false;
      dataChannelError = 'Live updates are unavailable. Friends will refresh automatically.';
    }
  }
  function failReload(error, id, gen) {
    if (!currentIdentity(id, gen)) return;
    serverError = errorText(error);
    serverBlocked = true;
    emit();
  }
  function reload(silent) {
    if (!serverMode || !me || !A() || !A().supabase) return Promise.resolve();
    var id = me.id, gen = generation;
    var task = reloadQueue.then(async function () {
      if (!currentIdentity(id, gen)) return;
      var results;
      try {
        results = await Promise.all([
          A().supabase.rpc('list_friends', { p_learner_id: id }),
          A().supabase.rpc('list_friend_requests', { p_learner_id: id }),
          A().supabase.rpc('list_friend_notifications', { p_learner_id: id, p_limit: 20 })
        ]);
      } catch (error) {
        failReload(error, id, gen);
        throw new Error(errorText(error));
      }
      if (!currentIdentity(id, gen)) return;
      var failed = results.filter(function (r) { return r.error; })[0];
      if (failed) {
        failReload(failed.error, id, gen);
        throw new Error(errorText(failed.error));
      }
      serverError = '';
      serverBlocked = false;
      serverFriends = Array.isArray(results[0].data) ? results[0].data : [];
      friendRequests = results[1].data && typeof results[1].data === 'object' ? results[1].data : { incoming: [], outgoing: [] };
      friendRequests.incoming = Array.isArray(friendRequests.incoming) ? friendRequests.incoming : [];
      friendRequests.outgoing = Array.isArray(friendRequests.outgoing) ? friendRequests.outgoing : [];
      var nextNotifications = Array.isArray(results[2].data) ? results[2].data : [];
      nextNotifications.forEach(function (n) {
        if (!silent && n && n.id && !seenNotifications[n.id] && !n.read_at && !playerBlocked(n.actor_player_id || n.actor_pid || n.player_id)) showPresenceToast(n.title || 'New Friends notification.');
      });
      nextNotifications.forEach(function (n) { if (n && n.id) seenNotifications[n.id] = 1; });
      notifications = nextNotifications;
      emit();
    });
    reloadQueue = task.catch(function () {});
    return task;
  }
  async function initServer() {
    if (!me || !A() || !A().supabase) return false;
    var id = me.id, gen = generation;
    try {
      var result = await A().supabase.rpc('list_friends', { p_learner_id: id });
      if (!currentIdentity(id, gen)) return false;
      if (result.error) {
        if (rpcUnavailable(result.error) && !serverMode) {
          serverBlocked = false;
          serverError = '';
          emit();
          return false;
        }
        throw result.error;
      }
      serverMode = true;
      serverBlocked = false;
      serverError = '';
      if (dataCh && dataChannelError) unsubscribeTables();
      subscribeTables();
      await reload(true);
      return !serverBlocked;
    } catch (error) {
      if (!currentIdentity(id, gen)) return false;
      serverError = errorText(error);
      serverBlocked = true;
      emit();
      return false;
    }
  }
  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      if (document.hidden || !me) return;
      if (serverBlocked || !serverMode) initServer().catch(function () {});
      else reload(false).catch(function () {});
    }, 30000);
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
        loadBlockedPlayers();
        if (!activity) {
          var el = document.querySelector('[data-activity]');
          activity = (el && el.getAttribute('data-activity')) || 'Browsing the Nexus';
        }
        join();
        return initServer().then(function (ok) { if (currentIdentity(me && me.id, generation)) startPolling(); return ok; });
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
  function meInfo() {
    return me ? { id: me.id, name: me.name, player_id: me.player_id, avatar: avatarOf(A().getActiveLearner && A().getActiveLearner()) } : null;
  }
  function friends() {
    if (!me) return [];
    var source = serverMode ? serverFriends : readList();
    var seen = {};
    var list = source.map(function (f) {
      var pid = normPid(f.player_id || f.pid);
      if (!pid || seen[pid]) return null;
      seen[pid] = 1;
      var p = online[pid];
      return {
        pid: pid,
        learner_id: f.learner_id || '',
        name: (p && p.name) || f.name || 'Friend',
        avatar: (p && p.avatar) || f.avatar || null,
        online: !!p,
        activity: (p && p.activity) || '',
        page: (p && p.page) || '',
        at: (p && p.at) || lastSeen[pid] || 0,
        created_at: f.created_at || 0,
        legacy: !serverMode || !!f.legacy
      };
    }).filter(Boolean);
    if (serverMode) {
      readList().forEach(function (f) {
        if (seen[f.pid]) return;
        seen[f.pid] = 1;
        var p = online[f.pid];
        list.push({
          pid: f.pid, learner_id: '', name: (p && p.name) || f.name || 'Friend',
          avatar: (p && p.avatar) || f.avatar || null, online: !!p,
          activity: (p && p.activity) || '', page: (p && p.page) || '',
          at: (p && p.at) || lastSeen[f.pid] || 0, created_at: 0, legacy: true
        });
      });
    }
    return list.sort(function (a, b) { return (b.online - a.online) || a.name.localeCompare(b.name); });
  }
  function mergeServerFriend(friend) {
    if (!friend || !friend.player_id) return;
    serverFriends = serverFriends.filter(function (f) {
      return normPid(f.player_id) !== normPid(friend.player_id) && String(f.learner_id || '') !== String(friend.learner_id || '');
    });
    serverFriends.push(friend);
  }
  function dropRequest(requestId) {
    friendRequests.incoming = friendRequests.incoming.filter(function (r) { return r.request_id !== requestId; });
    friendRequests.outgoing = friendRequests.outgoing.filter(function (r) { return r.request_id !== requestId; });
  }
  async function sendFriendRequest(pid) {
    await booted;
    requireMe();
    pid = normPid(pid);
    if (!validPid(pid)) throw new Error('That does not look like a Player ID. It starts with TLP- followed by letters or numbers.');
    if (me.player_id && pid === me.player_id) throw new Error('That is your own Player ID.');
    if (!serverMode) {
      if (serverBlocked) throw new Error(serverError || 'Friends could not connect. Check your connection and try again.');
      var entry = addFriend(pid, '');
      return { status: 'local', entry: entry };
    }
    requireServer();
    var id = me.id, gen = generation;
    var res = await A().supabase.rpc('send_friend_request', { p_learner_id: id, p_player_id: pid });
    if (res.error) throw new Error(errorText(res.error));
    requireCurrent(id, gen);
    var result = res.data || { status: 'sent' };
    if (result.status === 'sent' && result.request_id) {
      dropRequest(result.request_id);
      friendRequests.outgoing.unshift({
        request_id: result.request_id, status: 'pending', created_at: result.created_at || new Date().toISOString(),
        learner_id: result.learner_id, player_id: result.player_id, name: result.name, avatar: result.avatar
      });
    }
    emit();
    scheduleReload();
    return result;
  }
  function addFriend(pid, name) {
    requireMe();
    pid = normPid(pid);
    if (!validPid(pid)) throw new Error('That does not look like a Player ID. It starts with TLP- followed by letters or numbers.');
    if (me.player_id && pid === me.player_id) throw new Error('That is your own Player ID.');
    if (serverBlocked) throw new Error(serverError || 'Friends could not connect. Check your connection and try again.');
    if (serverMode) return sendFriendRequest(pid);
    var list = readList();
    var hit = list.filter(function (x) { return x.pid === pid; })[0];
    if (hit) {
      if (name) hit.name = String(name).slice(0, 32);
      writeList(list); emit();
      return hit;
    }
    var entry = { pid: pid, name: String(name || '').slice(0, 32), avatar: null };
    list.push(entry); writeList(list); emit();
    return entry;
  }
  async function respondRequest(requestId, accept) {
    await booted;
    requireServer();
    var id = me.id, gen = generation;
    var res = await A().supabase.rpc('respond_friend_request', { p_learner_id: id, p_request_id: requestId, p_accept: !!accept });
    if (res.error) throw new Error(errorText(res.error));
    requireCurrent(id, gen);
    var result = res.data || { status: accept ? 'accepted' : 'declined' };
    dropRequest(requestId);
    if (result.status === 'accepted' && result.player_id && result.friend_exists !== false) mergeServerFriend({
      learner_id: result.learner_id, player_id: result.player_id, name: result.name, avatar: result.avatar, created_at: new Date().toISOString()
    });
    emit();
    scheduleReload();
    return result;
  }
  async function cancelRequest(requestId) {
    await booted;
    requireServer();
    var id = me.id, gen = generation;
    var res = await A().supabase.rpc('cancel_friend_request', { p_learner_id: id, p_request_id: requestId });
    if (res.error) throw new Error(errorText(res.error));
    requireCurrent(id, gen);
    dropRequest(requestId);
    emit();
    scheduleReload();
    return res.data || { status: 'cancelled' };
  }
  async function removeFriend(pid) {
    await booted;
    requireMe();
    pid = normPid(pid);
    var localOnly = friends().some(function (f) { return f.pid === pid && f.legacy; });
    if (serverMode && !localOnly) {
      requireServer();
      var id = me.id, gen = generation;
      var res = await A().supabase.rpc('remove_friend', { p_learner_id: id, p_player_id: pid });
      if (res.error) throw new Error(errorText(res.error));
      requireCurrent(id, gen);
      serverFriends = serverFriends.filter(function (f) { return normPid(f.player_id || f.pid) !== pid; });
      friendRequests.incoming = friendRequests.incoming.filter(function (r) { return normPid(r.player_id) !== pid; });
      friendRequests.outgoing = friendRequests.outgoing.filter(function (r) { return normPid(r.player_id) !== pid; });
      scheduleReload();
    } else if (serverBlocked && !localOnly) {
      throw new Error(serverError || 'Friends could not connect. Check your connection and try again.');
    }
    writeList(readList().filter(function (x) { return x.pid !== pid; }));
    emit();
    return { status: 'removed' };
  }
  function requests() {
    return { incoming: friendRequests.incoming.slice(), outgoing: friendRequests.outgoing.slice() };
  }
  function notificationList() { return notifications.slice(); }
  function unreadCount() { return notifications.filter(function (n) { return n && !n.read_at; }).length; }
  async function markNotificationsRead() {
    if (!serverMode) return 0;
    requireServer();
    var id = me.id, gen = generation;
    var res = await A().supabase.rpc('mark_friend_notifications_read', { p_learner_id: id });
    if (res.error) throw new Error(errorText(res.error));
    requireCurrent(id, gen);
    var now = new Date().toISOString();
    notifications.forEach(function (n) { if (!n.read_at) n.read_at = now; });
    emit();
    return Number(res.data) || 0;
  }
  function onlineMap() { return online; }
  function onChange(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    fn(friends());
    return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
  }
  async function lookupPlayer(pid) {
    pid = normPid(pid);
    if (!validPid(pid)) throw new Error('That does not look like a Player ID.');
    if (!A() || !A().getPublicPlayer) return null;
    return A().getPublicPlayer(pid);
  }
  async function refresh() {
    await booted;
    if (serverBlocked) await retryServer();
    else if (serverMode) await reload();
    emit();
  }
  async function retryServer() {
    await booted;
    requireMe();
    serverBlocked = false;
    serverError = '';
    emit();
    var ok = await initServer();
    startPolling();
    if (!ok && serverBlocked) throw new Error(serverError);
    emit();
    return ok;
  }
  function syncStatus() {
    return {
      live: dataChannelReady,
      error: serverError || dataChannelError,
      blocked: serverBlocked,
      local: !serverMode && !!me
    };
  }

  window.TLP_PRESENCE = {
    start: start, setActivity: setActivity, me: meInfo, friends: friends,
    addFriend: addFriend, sendFriendRequest: sendFriendRequest, removeFriend: removeFriend,
    respondRequest: respondRequest, cancelRequest: cancelRequest,
    requests: requests, notifications: notificationList, unreadCount: unreadCount,
    markNotificationsRead: markNotificationsRead, refresh: refresh, retryServer: retryServer,
    onlineMap: onlineMap, onChange: onChange, lookupPlayer: lookupPlayer, validPid: validPid,
    setBlockedPlayers: setBlockedPlayers, syncStatus: syncStatus,
    mode: function () { return serverBlocked ? 'error' : serverMode ? 'server' : me ? 'local' : 'connecting'; }
  };

  window.addEventListener('tlp-auth-ready', function () {
    if (me && A() && A().getActiveLearner) {
      var l = A().getActiveLearner();
      if (!l || String(l.id) !== me.id) {
        generation++;
        if (beat) clearInterval(beat);
        if (pollTimer) clearInterval(pollTimer);
        beat = null; pollTimer = null;
        try { if (ch) A().supabase.removeChannel(ch); } catch (e) {}
        unsubscribeTables();
        ch = null; me = null; started = false; booted = null;
        clearTimeout(reloadTimer); reloadTimer = null;
        reloadQueue = Promise.resolve();
        seenNotifications = {}; blockedPlayers = {}; blockedOwner = '';
        serverMode = false; serverBlocked = false; serverError = '';
        serverFriends = []; friendRequests = { incoming: [], outgoing: [] }; notifications = [];
        online = {}; lastSeen = {}; presenceReady = false;
        emit();
        start();
      }
    }
    track();
  });
  window.addEventListener('beforeunload', function () {
    if (beat) clearInterval(beat);
    if (pollTimer) clearInterval(pollTimer);
    clearTimeout(reloadTimer);
    try { if (ch) A().supabase.removeChannel(ch); } catch (e) {}
    try { if (dataCh) A().supabase.removeChannel(dataCh); } catch (e) {}
  });

  function auto() {
    if (document.body && document.body.hasAttribute('data-activity')) start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
