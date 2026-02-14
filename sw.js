const CACHE_NAME = 'animeku-v1';
const API_CACHE_NAME = 'animeku-api-v1';
const STATIC_CACHE_NAME = 'animeku-static-v1';

// File yang akan di-cache saat install
const staticAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-brands-400.woff2'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(staticAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  // Hapus cache lama
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE_NAME && cache !== API_CACHE_NAME && cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - menangani request
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // API requests - cache dengan strategi Stale-While-Revalidate
  if (requestUrl.hostname === 'www.sankavollerei.com' && requestUrl.pathname.startsWith('/anime/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(networkResponse => {
            // Update cache dengan response terbaru
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            // Jika offline, ambil dari cache
            return caches.match(event.request);
          });
      })
    );
    return;
  }
  
  // Static assets - cache first
  if (event.request.url.match(/\.(css|js|png|jpg|jpeg|svg|gif|woff2?|ttf|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              const responseCopy = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => cache.put(event.request, responseCopy));
              return response;
            });
        })
    );
    return;
  }
  
  // HTML pages - network first, fallback to cache
  if (event.request.mode === 'navigate' || 
      (requestUrl.origin === location.origin && requestUrl.pathname === '/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseCopy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Default - network with cache fallback
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Background sync untuk request yang gagal
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/anime/')) {
        try {
          const response = await fetch(request);
          await cache.put(request, response.clone());
          console.log('Sync successful for:', request.url);
        } catch (error) {
          console.log('Sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: 'icons/icon-192.png',
    badge: 'icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    },
    actions: [
      {
        action: 'open',
        title: 'Buka'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
