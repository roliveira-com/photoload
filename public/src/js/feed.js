var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var picture = undefined;

function initMedia() {
  if (!('mediaDevices' in navigator)){
    navigator.mediaDevices = {};
  }

  if(!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia = function (contraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mpzGetUserMedia;

      if(!getUserMedia){
        return Promise.reject(new Error('getUserMedia não implementado'))
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constrants, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({video:true,audio:true})
    .then(function(stream){
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(function (err) {
      imagePickerArea.style.display = 'block';
    });
}

captureButton.addEventListener('click',function (evt) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  var context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
    console.log('track: ', track)
    track.stop();
  });
  videoPlayer.srcObject.getAudioTracks().forEach(function (track) {
    console.log('track: ', track)
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(function(){
    createPostArea.style.transform = 'translateY(0)';
    initMedia();
  },1)
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('Instalação cancelada pelo usuário');
      } else {
        console.log('Instalação aceita pelo usuário');
      }
    });
    deferredPrompt = null;
  }
  // ***
  // Deletando o service worker
  // ***
  // if ('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations()
  //   .then(function (registrations) {
  //     console.log('Service Workers resgistrados: ',registrations)
  //     for (var i = 0; i < registrations.length; i++) {
  //       registrations[i].unregister()
  //     }
  //   })
  // }

}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  videoPlayer.style.display = 'none';
  imagePickerArea.style.display = 'none';
  canvasElement.style.display = 'none'
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function onSaveButtonClicked(evt){
  console.log('Botão save clicado');
  if('caches' in window){
    caches.open('photoload-user')
      .then(function(cache){
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      })
  }
}

// Removendo todos os cards da tela
function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

// Criando os cards
function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  cardWrapper.setAttribute('id', data.id);
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.color = 'white';
  cardTitle.style.backgroundImage = 'url("'+data.picture+'")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}


// Quando os dados são recebidos, esta funcção trata de popular os cards e inderi-los na UI, atualizando a view
function updateUI(data) {
  clearCards();
  for (let i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

// ***
// SALVANDO DADOS NO CacheStorage COM NETWORK fallback
// ***
// Variável que indica se o request dos dados para API foi feito
var networkDataReceived = false;
// Aqui, fazemos uma requisição para obter os dados da API e inserimos na tela... 
fetch('https://photoload-98c58.firebaseio.com/posts.json')
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true
    console.log('Dados da web', data);
    var dataArray = []
    for (var key in data) {
      dataArray.push(data[key])
    }
    updateUI(dataArray);
    bindCardDetailsListener();
  });

// *** 
// USANDO O CACHE STORAGE
// ***
// ...Enquanto a requisição ocorre ,consultamos para ver se o browser da suporte 
// ao cacheStorage e tambem consultamos para ver se esta requisição já está armazenada...

// if ('caches' in window){
//   caches.match('https://photoload-98c58.firebaseio.com/posts.json')
//     .then(function(response){
//       if(response){
//         return response.json();
//       }
//     })
//     .then(function(data){
//       console.log('Dados do cache (Cache Storage)', data);

// ...caso esta requisição esteja armazenada no cache e nenhum dado da rede foi recebido
// indicado pela variável 'networkDataReceived'. Atualizamos a UI com os dados do cache...

  //     if(!networkDataReceived){
  //       var dataArray = []
  //       for (var key in data) {
  //         dataArray.push(data[key])
  //       }
  //       updateUI(dataArray);
  //     }
  //   })
  // }
// ...embora esta ação do cache seja concluida antes da resposta da rede, quando a resposta da rede for concluida
// ela sobre escreverá esta ação do cache, mantendo sempre a UI atualizada com os dados mais atualizados


// ***
// USANDO o INDEXDB
// ***
if ('indexedDB' in window){
  readAllData('posts').then(function(data){
    if(!networkDataReceived){
      console.log('Dados do cache (IndexDB)', data);
      updateUI(data);
    }
  })
}

function sendData() {
  var postDataId = new Date().toISOString()
  var postData = new FormData();
  postData.append('id', postDataId);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('file', picture, postDataId+'.png');

  fetch('https://us-central1-photoload-98c58.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
    // headers: {
    //   'Content-Type': 'application/json',
    //   'Accept': 'application/json'
    // },
    // body: JSON.stringify({
    //   id: new Date().toISOString(),
    //   title: titleInput.value,
    //   location: locationInput.value,
    //   image: 'https://picsum.photos/400/300?image=898'
    // })
  }).then(function (data) {
    console.log('Dados enviados', data);
    updateUI();
  })
}

form.addEventListener('submit', function (evt) {
  evt.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    alert('digite algum coisa!')
    return
  }

  closeCreatePostModal();

  if('serviceWorker' in navigator && 'SyncManager' in window){
    navigator.serviceWorker.ready.then(function (sw) {
      var post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        picture: picture
      };
      writeData('sync-posts', post).then(function() {
        sw.sync.register('sync-new-posts');
      }).then(function () {
        var snackbarContainer = document.querySelector('#confirmation-toast');
        var data = {message: 'Seu post foi salvo para ser sincronizado mais tarde'};
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
      }).catch(function (err) {
        console.log(err)
      })
    });
  }else{
    sendData()
  }

});
