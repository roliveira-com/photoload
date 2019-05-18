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

// workboxSW.router.registerRoute('https://us-central1-photoload-98c58.cloudfunctions.net/storePostData',workbox.strategies.networkOnly({
//     plugins: [bgSyncPlugin]
//   }),
//   'POST'
// );

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "e7570ebfae2c0172e0d8ed8b4100fbe0"
  },
  {
    "url": "manifest.json",
    "revision": "a25dcc75cff2ea9e820587c1f15405d0"
  },
  {
    "url": "offline.html",
    "revision": "f2835b6604750664fdd81dbe83fb3c13"
  },
  {
    "url": "service-worker.js",
    "revision": "3f1f85aaf02ebf5935726b7b9584d6bb"
  },
  {
    "url": "src/css/app.css",
    "revision": "c9fa17c2ac1c4e6239e3d32d5f95d7a8"
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
    "revision": "36ec184ec76b2e7485f2ff11748c5953"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "955f21da66f89b2a91867a36a2c8b1c6"
  },
  {
    "url": "src/js/build/app.min.js",
    "revision": "eee6eff269d8707d4a6c0eecaa5b7e37"
  },
  {
    "url": "src/js/build/detail.min.js",
    "revision": "22282c6deb4a4c70f57b12a3ad344d69"
  },
  {
    "url": "src/js/build/feed.min.js",
    "revision": "39d2666a834657aacab0a789d26a916b"
  },
  {
    "url": "src/js/detail.js",
    "revision": "8d37280fb2d3ef89d18f22dea7fe1aec"
  },
  {
    "url": "src/js/detail.min.js",
    "revision": "5adaebd31ffc42b3266931da1f144345"
  },
  {
    "url": "src/js/feed.js",
    "revision": "3f2bd32f37e388cf8c7235a31eb939bd"
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
    "url": "src/js/model/Moments.js",
    "revision": "39571d62187af6268c5fa7b2d41c9049"
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
    "revision": "e0519fc0fb5f794c62cdff6cd2264bcc"
  },
  {
    "url": "sw-base.js",
    "revision": "774f4db8a05d828a1a6cc743b582cbbd"
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