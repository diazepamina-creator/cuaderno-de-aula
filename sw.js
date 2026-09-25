// Cuaderno de aula · service worker
// La app se guarda en el móvil para abrirse sin conexión. Con red, pide
// primero la versión nueva (así llegan las actualizaciones que subas a
// GitHub); sin red, abre la guardada. Los datos NO pasan por aquí: están
// en el almacenamiento del navegador.
const VERSION = 'cuaderno-v3';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const guarda = res => { const copia = res.clone(); caches.open(VERSION).then(c => c.put(r, copia)); return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(guarda).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
  } else if (u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(guarda)));
  }
});
