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

workboxSW.router.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', workboxSW.strategies.staleWhileRevalidate({
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

// workboxSW.router.registerRoute(
//   function(routeData){
//     return (routeData.event.request.headers.get('accept').includes('text/html'));
//   }, 
//   function(args){
//     worker.redirectToOfflineAsset(args, {
//       cacheName: 'worker-dinamico',
//       assetPath: '/offline.html'
//     })
//   }
// );

workboxSW.router.registerRoute(
  function(routeData){
    return (routeData.event.request.headers.get('accept').includes('text/html'));
  }, 
  function(args){
    return caches.match(args.event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(args.event.request)
            .then(function (res) {
              return caches.open('dynamic')
                .then(function (cache) {
                  cache.put(args.event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function (err) {
              return caches.match('/offline.html')
                .then(function (cache) {
                  return cache;
                })
            })
          }
        })
  }
);

workboxSW.precache([]);

self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-new-posts'){
    event.waitUntil(
      readAllData('sync-posts').then(function(posts){
        var postDataToDelete = [];
        for (var post of posts){
          var postData = new FormData();
          postData.append('id', post.id);
          postData.append('title', post.title);
          postData.append('location', post.location);
          postData.append('file', post.picture, post.id+'.png');
          postData.append('rawLocationLat', post.rawLocation.lat);
          postData.append('rawLocationLon', post.rawLocation.lon);

          // salvando ids do sync-posts para deleção
          postDataToDelete.push(post.id);
          console.log('Array de items a serem deletados', postDataToDelete)
          fetch('https://us-central1-photoload-98c58.cloudfunctions.net/storePostData', {
            method: 'POST',
            body: postData
          }).then(function (res) {
            if(res.ok){
              res.json().then(function(res_data){
                writeData('posts', res_data).then(function(data_saved){
                  clearStorageItem('sync-posts', postDataToDelete[0]);
                  postDataToDelete.splice(0,1)
                })
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