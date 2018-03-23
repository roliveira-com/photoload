function Worker() {

  var methods = {

    // redirectToOfflineAsset : function(args, options){
    //   return caches.match(args.event.request)
    //     .then(function (response) {
    //       if (response) {
    //         return response;
    //       } else {
    //         return fetch(args.event.request)
    //           .then(function (res) {
    //             return caches.open(options.cacheName)
    //               .then(function (cache) {
    //                 cache.put(args.event.request.url, res.clone());
    //                 return res;
    //               })
    //           })
    //           .catch(function (err) {
    //             return caches.match(options.assetPath)
    //               .then(function (cache) {
    //                 return cache;
    //               })
    //           })
    //         }
    //       })
    // },

    postSyncFormData: function(event, options){
      if (event.tag === options.syncTag){

        event.waitUntil(
          
          readAllData(options.syncCache).then(function(posts){
            
            var postDataToDelete = [];
            
            for (var post of posts){

              var postData = new FormData();
              
              for(var key in post){
                postData.append(key, post[key]);
              }

              // salvando ids do sync-posts para deleção
              postDataToDelete.push(post.id);
    
              // console.log('Array de items a serem deletados', postDataToDelete)
              fetch(options.postUrl, {
                method: 'POST',
                body: postData
              })
              .then(function (res) {
                if(res.ok){

                  res.json().then(function(res_data){
                    writeData(options.cacheName, res_data).then(function(data_saved){

                      clearStorageItem(options.syncCache, postDataToDelete[0]);
                      postDataToDelete.splice(0,1)

                    })
                  })
                }
              })
              .catch(function(err){
                console.log('[Service Workers] Erro ao enviar o post !', err);
              })
            } 
          }) 
        ) 
      } 
    },

    updateCacheFromNetwork : function(args, options){
      return fetch(args.event.request).then(function(res){
        var clonedRes = res.clone();
        clearStorage(options.cacheName).then(function(){
          return clonedRes.json();
        })
        .then(function(data){
          for(var key in data){
            writeData(options.cacheName,data[key])
          }
        })
        return res;
      })
    }

  }

  return methods;

};