var VERSION = {
  current : '1.21',
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

function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(function (caches) {
      cache.keys();
    })
    .then(function (keys) {
      if(keys.length > maxItems){
        cache.remove(keys[0])
          .then(trimCache(cacheName, maxItems))
      }
    })
}

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

// function isInArray(string, array){
//   for(var i = 0; i < array.length; i++){
//     if (array[i] === string){
//       return true
//     }
//   }
//   return false
// }

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function(event) {
  var url = 'https://photoload-98c58.firebaseio.com/posts.json';

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
  } else if (isInArray(event.request.url, STATIC_FILES)){
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
            // trimCache('photoload-dynamic-'+VERSION.current, 3)
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
                      if (event.request.headers.get('accept').includes('text/html')){
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