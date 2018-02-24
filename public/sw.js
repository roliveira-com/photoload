self.addEventListener('install', function (event) {
  console.log('[Service Worker] Instalando service worker...', event);
});

self.addEventListener('activate', function(event){
  console.log('[Service Worker] Ativando o service worker...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[Service Worker] fazendo uma requisição', event)
  event.respondWith(fetch(event.request));
})