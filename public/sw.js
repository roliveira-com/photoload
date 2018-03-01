var VERSION = {
  current : '1.18',
  earlier : '1.2'
}
var CACHE_STATIC = 'photoload-files-v15';
var CACHE_DYNAMIC = 'photoload-dynamic-v15';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

self.addEventListener('install', function(event) {
  // ***
  // a chamada para Caches é encapsulada em waitUntil() porque a chamada fetch pode acontecer antes
  // do cacheamento de completar, isto daria erro já que erá feita uma chamada para o cache sem os 
  // assets estarem nele ainda
  // ***
  event.waitUntil(
    caches.open('photoload-files-'+VERSION.current)
      .then(function(cache){
        console.log('[Service Worker] Instalando arquivos estáticos (App shell)')
        cache.addAll(STATIC_FILES);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Ativando o Service Worker', event)
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
          return Promise.all(keyList.map(function(key){
            if (key !== 'photoload-files-'+VERSION.current && key !== 'photoload-dynamic-'+VERSION.current){
              console.log('[Service Worker] Removendo cache antigo: ', key)
              caches.delete(key);
            }
          }))
      })
  )
  return self.clients.claim();
});


self.addEventListener('fetch', function(event) {
  var url = 'https://httpbin.org/get';

  if (event.request.url.indexOf(url) > -1){
    event.respondWith(
      caches.open('photoload-dynamic-'+VERSION.current)
        .then(function(cache){
          return fetch(event.request)
            .then(function(res){
              cache.put(event.request, res.clone());
              return res;
            })
        })
    );
  } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)){
    self.addEventListener('fetch', function(event) {
      event.respondWith(
        caches.match(event.request)
      );
      console.log('arquivos estáticos vindos do cache')
    });
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response){
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open('photoload-dynamic-'+VERSION.current)
                  .then(function(cache){
                    cache.put(event.request, res.clone());
                    return res;
                  })
              })
              .catch(function(err){
                  return caches.open('photoload-files-'+VERSION.current)
                    .then(function(cache){
                      if (event.request.url.indexOf('/help')){
                        return cache.match('/offline.html')
                      }
                    })
              })
            }
          })
    )
  }
});

// Estratégia Cache First com Network Fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response){
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open('photoload-dynamic-'+VERSION.current)
//                 .then(function(cache){
//                   // cache.put(event.request, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err){
//                 return caches.open('photoload-files-'+VERSION.current)
//                   .then(function(cache){
//                       return cache.match('/offline.html');
//                   })
//             })
//         }
//       })
//   );
// });

// Estratégia Cache Only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Estratégia Network Only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// Estratégia Network First com Cache Fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res){
//         return caches.open('photoload-dynamic-'+VERSION.current)
//           .then(function(cache){
//             cache.put(event.request, res.clone());
//             return res;
//           })
//       })
//       .catch(function(err){
//         return caches.match(event.request)
//       })
//   );
// });