function Worker() {

  var methods = {

    redirectToOfflineAsset : function(args, options){
      return caches.match(args.event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(args.event.request)
              .then(function (res) {
                return caches.open(options.cacheName)
                  .then(function (cache) {
                    cache.put(args.event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                return caches.match(options.assetPath)
                  .then(function (cache) {
                    return cache;
                  })
              })
            }
          })
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