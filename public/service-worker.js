const CACHE_NAME = 'dinaledi-pwa-v1.4.0-prod';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];
const STATIC_RESOURCES = /\.(woff2|woff|ttf|css|js|png|jpg|jpeg|svg|webp)$/;
const STAR_CATALOG_DATA = /star_catalog|dso_catalog/;
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Purging legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // API Sync: Network-Only with graceful fallback for eventual consistency
  if (url.pathname === '/api/obs/sync') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ success: false, error: 'Offline - Sync Queued' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  // Heavy Celestial Data & API GET: Cache-First with Stale-While-Revalidate
  if (STAR_CATALOG_DATA.test(url.pathname) || url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.ok) cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  // Static Assets: Cache-First
  if (STATIC_RESOURCES.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  // Navigation: Network-First with Index Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }
});