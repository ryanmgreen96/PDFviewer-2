const CACHE_NAME = 'pwa-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/PDFviewer/index.html',
  '/PDFviewer/Centaur.woff2',
  '/PDFviewer/manifest.json',
  '/PDFviewer/jquery.min.js',
  '/PDFviewer/icon.png',
  // Add other static assets if needed
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // Allow new worker to activate immediately
});

// Activate: Delete old caches
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

// Fetch: Cache-first only for static files; always fetch latest others
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (!req.url.startsWith('http')) return;

  // Only apply cache strategy to known static files
  const url = new URL(req.url);
  const shouldCache = FILES_TO_CACHE.includes(url.pathname);

  if (shouldCache) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req);
      })
    );
  } else {
    event.respondWith(fetch(req));
  }
});
