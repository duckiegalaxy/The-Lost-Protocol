const CACHE = 'tlp-2026-11-27-09';
const CDN = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)\//;
const SHELL = [
  'index.html', 'webgame.html', 'bonus.html', 'auth.html', 'parent.html',
  'leaderboard.html', 'friends.html', 'admin.html', 'privacy.html', 'progress.html',
  'manifest.webmanifest',
  'css/style.css',
  'css/premium.css',
  'css/pages/admin.css', 'css/pages/auth.css', 'css/pages/bonus.css',
  'css/pages/friends.css', 'css/pages/home.css',
  'css/pages/leaderboard.css', 'css/pages/parent.css', 'css/pages/webgame.css',
  'css/pages/explainers.css', 'css/pages/privacy.css', 'css/pages/progress.css', 'css/pages/wheel.css',
  'js/config.js', 'js/explainers.js', 'js/music.js', 'js/password.js',
  'js/script.js', 'js/story.js', 'js/streak.js', 'js/theme.js', 'js/tlp-auth.js',
  'js/tlp-common.js', 'js/tlp-presence.js', 'js/tlp-arabic.js', 'js/tlp-avatar.js', 'js/tlp-economy.js',
  'js/tlp-lifeline.js', 'js/tlp-look.js', 'js/tlp-background.js', 'js/tlp-wotd.js', 'js/tlp-extras.js',
  'js/vendor/qrcode.js',
  'js/pages/admin.js', 'js/pages/auth.js', 'js/pages/bonus.js',
  'js/pages/friends.js', 'js/pages/leaderboard.js',
  'js/pages/parent.js', 'js/pages/progress.js', 'js/pages/webgame.js',
  'assets/brand/icon.svg', 'assets/brand/icon-192.png',
  'assets/brand/icon-512.png', 'assets/brand/maskable-512.png',
  'assets/brand/apple-touch-icon.png', 'assets/brand/favicon-32.png',
  'assets/brand/favicon-16.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function put(req, res) {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (CDN.test(req.url)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => put(req, res)).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => put(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => put(req, res)).catch(() => hit);
      return hit || net;
    })
  );
});
