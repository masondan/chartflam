const CACHE = 'chartflam-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icon-mapping.js',
  '/pictogram-icons.js',
  '/pictogram-icons.json',
  '/flam-nav.js',
  '/public/chartflam-icon.svg',
  '/public/chartflam-icon.png',
  '/public/chartflam-icon-192.png',
  '/public/chartflam-icon-512.png',
  '/public/chartflam-icon-maskable.png',
  '/public/icons/logo-chartflam-apple.png',
  '/public/icons/logo-chartflam-og.png',
  '/public/fonts/saira.ttf',
  '/public/fonts/Inter-VariableFont_opsz,wght.ttf'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  
  // Don't cache external CDN resources or API calls
  if (url.origin !== self.location.origin ||
      url.pathname.startsWith('/api') ||
      /\.(mp4|mp3|wav|webm|blob)$/.test(url.pathname)) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r ?? fetch(e.request))
  );
});
