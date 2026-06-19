// ProTournament BD Service Worker for installable PWA support
const CACHE_NAME = 'protournament-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Allow caching to fail gracefully on some dynamic environment routes
      return cache.addAll(ASSETS).catch(err => console.log("Assets pre-caching handled:", err));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept simple GET requests
  if (event.request.method !== 'GET') return;

  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  // CRITICAL: Only intercept same-origin requests (our bundle assets, index.html, static local icons, etc.)
  // This ensures external profile pictures (Google Auth), dynamic database endpoints, and third-party image URLs load normally using default browser caching.
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If we get a valid resource from the network, update the cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network request fails (offline), look in the cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
        });
      })
  );
});
