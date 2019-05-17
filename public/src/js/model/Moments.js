function Moments() {
  var methods = {

    newMoment : function(input_title, input_location, input_picture, input_lat, input_lon) {
      var the_moment = {
        id: new Date().toISOString(),
        title: input_title,
        location: input_location,
        file: input_picture,
        rawLocationLat: input_lat,
        rawLocationLon: input_lon
      }
      
      return fetch('https://us-central1-photoload-98c58.cloudfunctions.net/storePostData', {
        method: 'POST',
        body: the_moment
      })
      .then(function (posted_moment) {
        return posted_moment
      })
      .catch(function (err) {
        return the_moment
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