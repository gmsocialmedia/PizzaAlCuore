const CACHE_NAME = 'pizza-al-cuore-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/images/logo.jpeg',
  '/images/hero.png',
  '/images/margherita.jpg',
  '/images/mussarela.jpg',
  '/images/calabresa.jpg',
  '/images/napolitana.jpg',
  '/images/4queijos.jpg',
  '/images/bacon.jpg',
  '/images/frangocatupiry.jpg'
  // adicione outras imagens de bebidas se quiser cachear
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
