(function () {
  'use strict';

  var esc = function (t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function loadState() {
    var chapters = new Set(), badges = new Set(), levels = 0, stars = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key) continue;
      if (key.includes('@prog')) {
        try {
          var progress = JSON.parse(localStorage.getItem(key) || '{}');
          Object.keys(progress).forEach(function (levelKey) {
            var value = Number(progress[levelKey]) || 0;
            if (value > 0) {
              stars += value;
              levels++;
              chapters.add(levelKey.split(/[:-]/)[0]);
            }
          });
        } catch (e) {}
      }
      if (key.includes('@badges')) {
        try {
          var earned = JSON.parse(localStorage.getItem(key) || '[]') || [];
          earned.forEach(function (badge) { badges.add(badge); });
        } catch (e) {}
      }
    }
    var streak = 0;
    try {
      streak = window.TLP_STREAK && TLP_STREAK.days ? TLP_STREAK.days() : Number(localStorage.getItem('tlp-streak') || 0) || 0;
    } catch (e) {}
    var sparks = 0;
    try {
      if (window.TLP_ECONOMY && TLP_ECONOMY.sparks) sparks = TLP_ECONOMY.sparks();
    } catch (e) {}
    var title = 'No title';
    if (window.TLP_ECONOMY && window.TLP_ECONOMY.titleHtml) title = window.TLP_ECONOMY.titleHtml() || title;
    return {
      chapters: chapters.size,
      levels: levels,
      stars: stars,
      badges: badges.size,
      streak: streak,
      sparks: sparks,
      title: title
    };
  }

  function render() {
    var state = loadState();
    var chapterPct = Math.min(100, Math.round(state.chapters / 30 * 100));
    var starPct = state.levels > 0 ? Math.min(100, Math.round(state.stars / (state.levels * 3) * 100)) : 0;
    var badgeRate = Math.min(100, state.chapters > 0 ? Math.round(state.badges / state.chapters * 25) : 0);
    var html = [
      '<div class="prog">',
      '<h2>Progress Overview</h2>',
      '<div class="progress-grid">',
      '<div class="pg-card" data-txt="chapters"><h3>Chapters</h3><div class="pg-bar"><div style="width:' + chapterPct + '%"></div></div><p>' + state.chapters + '/30 completed</p></div>',
      '<div class="pg-card" data-txt="stars"><h3>Stars</h3><div class="pg-bar"><div style="width:' + starPct + '%"></div></div><p>' + state.stars + ' total</p></div>',
      '<div class="pg-card" data-txt="badges"><h3>Badges</h3><div class="pg-bar"><div style="width:' + badgeRate + '%"></div></div><p>' + state.badges + ' earned</p></div>',
      '<div class="pg-card" data-txt="sparks"><h3>Sparks</h3><p>' + esc(String(state.sparks || 0)) + '</p></div>',
      '<div class="pg-card" data-txt="streak"><h3>Streak</h3><p>' + state.streak + '-day streak</p></div>',
      '<div class="pg-card" data-txt="title"><h3>Title</h3><p>' + state.title + '</p></div>',
      '</div>',
      '<h3 style="margin-top:28px">Avatar Collection</h3>',
      '<p>Use the Avatar & style button in the game header to browse all unlocked items, preview them, and equip your favourites.</p>',
      '<button class="btn ghost sm" id="avBtn" type="button" style="margin:10px 0 20px">Customize Your Avatar</button>',
      '<h3>Daily Quest Status</h3>',
      '<p>Complete daily quests to earn sparks and help the wheel refresh faster.</p>',
      '<p>Use the Quests tab in the Economy modal to see what\'s available and claim rewards.</p>',
      '<p style="margin-top:14px">Keep playing — every mission, every guardian defeated, every streak day adds to your progress!</p>',
      '</div>'
    ].join('');

    $('#menu').hidden = true;
    $('#mainContent').hidden = false;
    $('#mainContent').innerHTML = html;

    function wire() {
      var openAvatar = function () { window.TLP_AVATAR.open(); };
      var button = $('#avBtn'), headerButton = $('#avOpen');
      if (window.TLP_AVATAR && window.TLP_AVATAR.open) {
        if (button) button.onclick = openAvatar;
        if (headerButton) headerButton.onclick = openAvatar;
      } else {
        setTimeout(wire, 300);
      }
    }
    wire();
  }

  var $ = function (selector) { return document.querySelector(selector); };
  var mainContent = document.getElementById('mainContent');
  if (!mainContent) {
    mainContent = document.createElement('div');
    mainContent.id = 'mainContent';
    mainContent.hidden = true;
    document.body.appendChild(mainContent);
  }
  render();
})();
