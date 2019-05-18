function Moments() {
  var methods = {

    new : function(input_title, input_location, input_picture, input_lat, input_lon) {
      const momentData = {
        id: new Date().toISOString(),
        title: input_title,
        location: input_location,
        file: input_picture,
        rawLocationLat: input_lat,
        rawLocationLon: input_lon
      }

      const momentPost = new FormData()

      for (var key in momentData) {
        momentPost.append(key, momentData[key]);
      }
      
      fetch('https://us-central1-photoload-98c58.cloudfunctions.net/storePostData', {
        method: 'POST',
        body: momentPost
      })
      .then(function (posted_moment) {
        console.log('Post Salvo', posted_moment);
        var snackbarContainer = document.querySelector('#confirmation-toast');
        snackbarContainer.MaterialSnackbar.showSnackbar({
          message: 'Post salvo com sucesso!'
        });
      })
      .catch(function (err) {
        if('serviceWorker' in navigator && 'SyncManager' in window){
          navigator.serviceWorker.ready.then(function (sw) {
            console.log('Registro do Background sync');
            writeData('sync-posts', momentData).then(function () {
              return sw.sync.register('sync-new-posts');
            }).then(function () {
              var snackbarContainer = document.querySelector('#confirmation-toast');
              var data = {message: 'Seu post foi salvo para ser sincronizado mais tarde'};
              snackbarContainer.MaterialSnackbar.showSnackbar(data);
            }).catch(function (err) {
              console.log(err)
            })
          });
        }
      })
    },

    saveToSync : function(options){
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(function (sw) {
          writeData(options.syncCache, options.syncData).then(function () {
            sw.sync.register(options.syncTag);
          })
          .then(function () {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = { message: 'Seu post foi salvo para ser sincronizado mais tarde' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function (err) {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = { message: 'Seu post não pode ser salvo agora, tente novamente mais tarde' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
        });
      }
    }

  }

  return methods;

}