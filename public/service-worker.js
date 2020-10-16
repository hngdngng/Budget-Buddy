console.log("service worker working");

const STATIC_CACHE = 'budget-buddy-static-v1';
const DATA_CACHE = "budget-buddy-data-v1";

var filesToCache = [
  "/",
  "/index.html",
  "/assets/css/styles.css",
  "/assets/js/index.js",
  "/assets/js/indexedDB.js",
  "/assets/icons/android-chrome-192x192.png",
  "/assets/icons/android-chrome-512x512.png",
  "/manifest.webmanifest"
];

// install service worker after cache
self.addEventListener('install', event => {
  // pre cache transaction data
  event.waitUntil(
    caches.open(DATA_CACHE).then((cache) => cache.add("/api/transaction"))
  );
  // pre cache static files
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.info('service-worker.js cached all files');
        return cache.addAll(filesToCache);
      })
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener("activate", event => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // return array of cache names that are old to delete
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// allow service worker to intercept requests
self.addEventListener('fetch', event => {
  event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  });
