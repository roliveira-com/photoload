importScripts('/src/js/idb.js');
importScripts('/src/js/utils.js');

var VERSION = {
  current : '1.91',
  earlier : '1.68'
}
var CACHE_STATIC = 'photoload-files-v15';
var CACHE_DYNAMIC = 'photoload-dynamic-v15';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/idb.js',
  '/src/js/utils.js',
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

var dbPromise = idb.open('post-store', 1, function (db) {
  if(!db.objectStoreNames.contains('posts')){
    db.createObjectStore('posts', { keyPath: 'id' });
  };
});

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

// ***
// (BUG: Não está removendo os arquivos)
// Função que limita a quantidade de requisições armazenadas no cache
// Se tiver mais que o maxItems ela deleta os arquivos mais antigos
// ***
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

// ***
// Função que verifica se a url do request está no array de arquivos
// estáticos para guardar no cache
// ***
// V1 da função
// function isInArray(string, array){
//   for(var i = 0; i < array.length; i++){
//     if (array[i] === string){
//       return true
//     }
//   }
//   return false
// }
// V2 da função que trata tb os requests por CDN
function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

// ***
// Estratégia de Cache First com Network Fallback
// ***
// Usando o indexDB para armazenar dados de post
self.addEventListener('fetch', function (event) {
  var url = 'https://photoload-98c58.firebaseio.com/posts.json';

  // verifica se este request interceptado é a url acima, 
  // que busca os dados da API e se positivo...
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      // ...é feita a rquisição ao servidor e...
      fetch(event.request).then(function(res){
        var clonedRes = res.clone(); // é necessário clonar a resposta já que ela não pode ser usada mais que 1 vez
        // ...limpamos o indexDB para ter certeza que todas os dados serão atualizados...
        clearStorage('posts').then(function(){
          return clonedRes.json();
        })
        // ...guardamos a resposta em cache (indexDB)...
        .then(function(data){
          for(var key in data){
            // ...usando a função writeData() em ultils.js
            writeData('posts',data[key])
              // Deletando um item específico do indexDB
              // .then(function () {
              //   clearStorageItem('posts', key);
              // })
          }
        })
        // ...e por fim devolvemos a resposa da requisição. Mas ...
        return res;
      })
    );
  // ...caso a requisição esteja no array que lista os arquivos e esta 
  // requisição esteja armazenada no cache, devolvemos este arquivos. Mas...
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    self.addEventListener('fetch', function (event) {
      event.respondWith(
        caches.match(event.request)
      );
    });
    console.log('[Service Worker] arquivos estáticos vindos do cache')

  // ... caso a requisição não seja feita para API e nem esteja listada
  // dentre os arquivos estáticos...
  } else {
    event.respondWith(
      // ...buscamos no cache para ver se esta requisição já foi armazenada anteriormente...
      caches.match(event.request)
        .then(function (response) {
          // ..caso positivo retornamos a resposta. Mas caso negativo...
          if (response) {
            return response;
          } else {
            // ...fazemos a requisição para a url do request...
            return fetch(event.request)
              .then(function (res) {
                // ...e guardamos e resposta no Cache Storage e...
                return caches.open('photoload-dynamic-' + VERSION.current)
                  .then(function (cache) {
                    cache.put(event.request, res.clone());
                    return res;
                  })
              })
              // ...caso o request dê erro..
              .catch(function (err) {
                return caches.open('photoload-files-' + VERSION.current)
                  .then(function (cache) {
                    // ...verificamos se este request contem uma requisição para um documento html...
                    if (event.request.headers.get('accept').includes('text/html')) { // neste ponto podemos checar qualuer outro tipo de arquivo: css, js, etc
                      // ..e retornamos a página customizada de erro
                      return cache.match('/offline.html')
                    }
                  })
              })
          }
        })
    )
  }
});

// Usando o Cache Storage para armazenar dados de post
// self.addEventListener('fetch', function(event) {
//   var url = 'https://photoload-98c58.firebaseio.com/posts.json';

//   if (event.request.url.indexOf(url) > -1){
//     event.respondWith(
//       caches.open('photoload-dynamic-'+VERSION.current)
//         .then(function(cache){
//           return fetch(event.request)
//             .then(function(res){
//               cache.put(event.request, res.clone());
//               return res;
//             })
//         })
//     );
//   } else if (isInArray(event.request.url, STATIC_FILES)){
//     self.addEventListener('fetch', function(event) {
//       event.respondWith(
//         caches.match(event.request)
//       );
//       console.log('arquivos estáticos vindos do cache')
//     });
//   } else {
//     event.respondWith(
//       caches.match(event.request)
//         .then(function(response){
//           if (response) {
//             return response;
//           } else {
//             return fetch(event.request)
//             // trimCache('photoload-dynamic-'+VERSION.current, 3)
//               .then(function(res) {
//                 return caches.open('photoload-dynamic-'+VERSION.current)
//                   .then(function(cache){
//                     cache.put(event.request, res.clone());
//                     return res;
//                   })
//               })
//               .catch(function(err){
//                   return caches.open('photoload-files-'+VERSION.current)
//                     .then(function(cache){
//                       if (event.request.headers.get('accept').includes('text/html')){
//                         return cache.match('/offline.html')
//                       }
//                     })
//               })
//             }
//           })
//     )
//   }
// });

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

self.addEventListener('sync', function (event) {
  console.log('[Service Worker] Sincronizando dados]', event);
  if (event.tag === 'sync-new-posts'){
    console.log('[Service Worker] SIncronizando novos posts]');
    event.waitUntil(
      readAllData('sync-posts').then(function(posts){
        for (var post of posts){
          fetch('https://us-central1-photoload-98c58.cloudfunctions.net/storePostData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              id: post.id,
              title: post.title,
              location: post.location,
              image: 'https://picsum.photos/400/300?image=898'
            })
          }).then(function (res) {
            console.log('[Service Workers] Um Novo Post foi enviado para o servidor', res);
            if(res.ok){
              console.log('[Service Workers] Post ' + res.id + ' foi salvo!');
              res.json().then(function(res_data){
                writeData('posts', res_data).then(function(data_saved){
                  console.log('post salvo no indexDB: ', res_data);
                })
                clearStorageItem('sync-posts', post.id);
              })
            }
          }).catch(function(err){
            console.log('[Service Workers] Erro ao enviar o post !', err);
          })// ENF OF fetch() promise
        } // ENF OF for loop
      }) // ENF OF readAllData() promise
    ) // ENF OF waitUntil()
  } // ENF OF if()
});

self.addEventListener('notificationclick', function(evt){
  var notification = evt.notification;
  var action = evt.action;

  console.log(notification);

  // var novoPostEvent = new CustomEvent("createPostModal", {
  //   detail: {
  //     postKey: notification.data.postkey
  //   }
  // });
  if(action == 'confirm'){
    console.log('Usuário confirmou ação')
    notification.close();
  }else{
    evt.waitUntil(
      clients.matchAll().then(function(clis){

        clis.forEach(function(theClient){
          sendMessageToClient(theClient, notification.data.postkey);
        })

        var client = clis.find(function(c){
          return c.visibilityState === 'visible';
        })

        if(client !== undefined){      
          console.log('Post Key vindo do push', notification.data.postkey);
          client.focus();
        }else{
          console.log('Post Key vindo do push', notification.data.postkey);
        }
        notification.close();
      })
    )

  }
});

self.addEventListener('notificationclose', function(evt){
  console.log('[Service Worker] Usuário fechou a notificação', evt)
})

self.addEventListener('push', function (event) {
  console.log('Nova Notificação Push recebida!', event);

  var data = { title: 'Novo!', content: 'Você tem atualizações!', url: '/' };

  if (event.data) {
    data = JSON.parse(event.data.text())
  };

  var options = {
    body: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.url,
      postkey: data.postkey
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})
