const CACHE_NAME = 'safari-hotel-manager-cache-v1';

// On install, pre-cache some resources. A real app would have a build step to generate this list.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Skip waiting forces the waiting service worker to become the
  // active service worker.
  self.skipWaiting();
});

// On activate, clean up old caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Get all the cache keys (cacheName)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cached item is saved under a previous cacheName
          if (cacheName !== CACHE_NAME) {
            // Delete that cached file
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});

// On fetch, use a cache-then-network strategy.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request).then((networkResponse) => {
        // If we got a valid response, let's update the cache.
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // If the network is unavailable, try to serve from cache.
        return cache.match(event.request);
      });
    })
  );
});
