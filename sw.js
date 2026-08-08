// Health Infographic Studio - 2.4 Final Release - Service Worker
// CACHE VERSION BUMPED (v1 -> v2) specifically to force any previously
// cached/installed build (including a stale pre-Health-First-Calendar
// version) to be discarded and re-fetched fresh.
const CACHE_VERSION = 'his-2.4-final-release-v2';

const APP_SHELL = [
  './Health_Infographic_Studio_2_4_FINAL_RELEASE.html',
  './manifest.webmanifest',
  './Logo.png',
  './app-icon-192.png',
  './app-icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // The app HTML itself: network-first, so a redeploy is picked up
  // immediately instead of serving a stale cached build. Falls back
  // to cache only when offline.
  if (url.pathname.endsWith('Health_Infographic_Studio_2_4_FINAL_RELEASE.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Other app-shell assets: cache-first, network fallback.
  if (APP_SHELL.some((path) => url.pathname.endsWith(path.replace('./', '/')))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Artwork: stale-while-revalidate so offline posters keep rendering
  // while newer artwork is fetched in the background for next time.
  if (url.pathname.includes('/artwork/')) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request)
            .then((response) => {
              if (response && response.ok) cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Everything else (e.g. Make.com webhook calls): network-first,
  // cache fallback only if a cached copy happens to exist.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
