/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE = `tg-cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  // Block any cross-origin outright
  if (url.origin !== location.origin) {
    event.respondWith(new Response('Forbidden', { status: 403 }));
    return;
  }

  // Cache-first for same-origin GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        // If not in cache, try falling back to the root (SPA shell) or 404 from cache if present
        if (event.request.mode === 'navigate') {
          return caches.match('/').then(shell => shell || new Response('Not found', { status: 404 }));
        }
        return new Response('Not cached', { status: 504 });
      })
    );
  }
});

