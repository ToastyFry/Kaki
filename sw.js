/* ===== Kaki! — Service Worker (App Shell Caching) ===== */

const CACHE_NAME = 'kaki-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './cards.js',
  './search.js',
  './favourites.js',
  './manifest.json',
  './data.json',
  './thumbnails/whatcha.jpg',
  './thumbnails/harina_bakery.jpg',
  './thumbnails/pebbles_coffee.jpg',
  './thumbnails/fuku.jpg',
  './thumbnails/kopi_khoo.jpg',
  './thumbnails/coffeenearme.jpg',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell, network-first for data
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for data.json (always fresh)
  if (url.pathname.endsWith('data.json')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for app shell assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
