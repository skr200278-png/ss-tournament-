// ProTournament BD Service Worker for installable PWA support
const CACHE_NAME = 'protournament-v6';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'favicon.ico',
  'icon-72.png',
  'icon-96.png',
  'icon-128.png',
  'icon-144.png',
  'icon-152.png',
  'icon-192.png',
  'icon-384.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache vital local assets, caching them gracefully
      return cache.addAll(ASSETS).catch(err => {
        console.warn("PWA pre-caching handled and skipping missing assets:", err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLocalAsset = url.origin === self.location.origin;

  if (isLocalAsset) {
    // For local assets, perform safe cache-first with background network-refresh
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('Local background fetch failed:', err);
        });

        // Always prioritize instantaneous cached response, falling back immediately to live fetch
        return cachedResponse || fetchPromise;
      })
    );
  } else {
    // Non-local dynamic assets are network-first to avoid cross-domain issues
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
