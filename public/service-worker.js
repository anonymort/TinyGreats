// Tiny Gratitude Service Worker - Offline-first with strict security

const CACHE_NAME = 'tg-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy with offline enforcement
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Block ANY cross-origin requests (offline-only enforcement)
  if (url.origin !== location.origin) {
    console.log('[SW] Blocking cross-origin request:', url.href);
    event.respondWith(new Response('Forbidden', { status: 403 }));
    return;
  }

  // Cache-first strategy for same-origin GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) {
            return cached;
          }

          // For navigation requests, fall back to index.html (SPA routing)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
              .then((shell) => shell || new Response('Not found', { status: 404 }));
          }

          // For other requests, try network then cache the response
          return fetch(event.request)
            .then((response) => {
              // Only cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              return new Response('Offline - resource not cached', { status: 504 });
            });
        })
    );
  }
});
