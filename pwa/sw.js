const CACHE_NAME = 'ubreath-v1';
const ASSETS = [
  './',
  './index.html',
  './training.html',
  './calendar.html',
  './certificate.html',
  './style.css',
  './main.js',
  './training.js',
  './calendar.js',
  './calendar.css',
  './manifest.json',
  './img/ultrabreath.jpg',
  './img/normal.png',
  './img/encourage.png',
  './img/happy.png',
  './img/icon-192.png',
  './img/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
