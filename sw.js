const CACHE_NAME = 'lionme-v2';
const API_CACHE = 'lionme-api-v2';
const STATIC_CACHE = 'lionme-static-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.css',
  '/dashboard.js',
  '/manifest.json',
  '/anime/',
  '/donghua/',
  '/drama-china/',
  '/comic/',
  '/novel/',
  '/news/',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== API_CACHE && cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.hostname === 'www.sankavollerei.com') {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }
  
  if (event.request.url.match(/\.(css|js|png|jpg|jpeg|svg|gif|woff2?|ttf|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request))
    );
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
