importScripts('workbox-sw.prod.v2.1.3.js');
importScripts('/src/js/idb.js');
importScripts('/src/js/utils.js');
importScripts('/src/js/worker.js');

const workboxSW = new self.WorkboxSW();
const worker = new Worker();

workboxSW.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, workboxSW.strategies.staleWhileRevalidate({
  cacheName: 'google-fonts',
  cacheExpiration: {
    maxEntries: 5,
    maxAgeSeconds:60 * 60 * 24 * 30
  }
}));

workboxSW.router.registerRoute(/.*(?:material|\.css).*$/, workboxSW.strategies.staleWhileRevalidate({
  cacheName: 'material-css'
}));

// workboxSW.router.registerRoute('https://code.getmdl.io/1.3.0/material.cyan-orange.min.css', workboxSW.strategies.staleWhileRevalidate({
//   cacheName: 'material-css'
// }));

workboxSW.router.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, workboxSW.strategies.staleWhileRevalidate({
  cacheName: 'post-images'
}));


workboxSW.router.registerRoute('https://photoload-98c58.firebaseio.com/posts.json', function(args){
  worker.updateCacheFromNetwork(args, {
    cacheName: 'posts'
  })
});

workboxSW.router.registerRoute(
  function(routeData){
    return (routeData.event.request.headers.get('accept').includes('text/html'));
  }, 
  function(args){
    return worker.redirectToOfflineAsset(args, {
      cacheName: 'worker-dinamico',
      assetPath: '/offline.html'
    })
  }
);

// workboxSW.router.registerRoute(
//   function(routeData){
//     return (routeData.event.request.headers.get('accept').includes('text/html'));
//   }, 
//   function(args){
//     return caches.match(args.event.request)
//       .then(function (response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(args.event.request)
//             .then(function (res) {
//               return caches.open('dynamic')
//                 .then(function (cache) {
//                   cache.put(args.event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function (err) {
//               return caches.match('/offline.html')
//                 .then(function (cache) {
//                   return cache;
//                 })
//             })
//           }
//         })
//   }
// );

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "cc3aadcf33fdee4116fd6ad2695c3617"
  },
  {
    "url": "manifest.json",
    "revision": "d11c7965f5cfba711c8e74afa6c703d7"
  },
  {
    "url": "offline.html",
    "revision": "f2835b6604750664fdd81dbe83fb3c13"
  },
  {
    "url": "service-worker.js",
    "revision": "b8b6adacc69ecd846551a76598a58b1c"
  },
  {
    "url": "src/css/app.css",
    "revision": "6d09f74487baae2843eb6b8983064f6f"
  },
  {
    "url": "src/css/feed.css",
    "revision": "2b0c988ac462face1f3eb4defa70bd9a"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "b0af1b894c76d55f0acb8a9bb3aef374"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "955f21da66f89b2a91867a36a2c8b1c6"
  },
  {
    "url": "src/js/build/app.min.js",
    "revision": "955f21da66f89b2a91867a36a2c8b1c6"
  },
  {
    "url": "src/js/build/detail.min.js",
    "revision": "5adaebd31ffc42b3266931da1f144345"
  },
  {
    "url": "src/js/build/feed.min.js",
    "revision": "9f56dbcbd709b10eb642b0885439ba38"
  },
  {
    "url": "src/js/detail.js",
    "revision": "88d1031b1c9978ee25e2751611f96b24"
  },
  {
    "url": "src/js/detail.min.js",
    "revision": "5adaebd31ffc42b3266931da1f144345"
  },
  {
    "url": "src/js/feed.js",
    "revision": "3700eb5d68cf3e04904f4325e48da18f"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "9f56dbcbd709b10eb642b0885439ba38"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utils.js",
    "revision": "1c2731451e6a5d10d48e491c3bd31e02"
  },
  {
    "url": "src/js/worker.js",
    "revision": "3a5028d2b7b1cdf2e7c520006a23d3af"
  },
  {
    "url": "sw-base.js",
    "revision": "2fafbf5d03f3ea850951130aa92a1302"
  },
  {
    "url": "sw.js",
    "revision": "d9bf6054130671325eea3a17627635b4"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);

self.addEventListener('sync', function (event) {
  worker.postSyncFormData(event,{
    syncTag: 'sync-new-posts',
    syncCache: 'sync-posts',
    cacheName: 'posts',
    dataKeys: ['id', 'title', 'location', 'file', 'rawLocationLat', 'rawLocationLon'],
    postUrl: 'https://us-central1-photoload-98c58.cloudfunctions.net/storePostData'
  })
});


self.addEventListener('notificationclick', function(evt){
  var notification = evt.notification;
  var action = evt.action;

  if(action == 'confirm'){
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

  var data = { title: 'Novo!', content: 'Você tem atualizações!', url: 'help' };

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