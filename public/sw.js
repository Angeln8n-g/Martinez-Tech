// Basic Service Worker for Martínez Tech CRM PWA
const CACHE_NAME = 'martinez-tech-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.png',
  '/logo2.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET o que sean hacia Supabase / API
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co') || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return networkResponse;
        }).catch(() => {
          // Si no hay red y solicita HTML, devolver index.html de cache
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        })
      );
    })
  );
});
