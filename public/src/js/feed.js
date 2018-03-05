var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.style.border = '3px solid rgb(63,81,181)'
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.color = 'white';
  cardTitle.style.backgroundImage = 'url("'+data.image+'")';
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

var networkDataReceived = false;

function updateUI(data) {
  for (let i = 0; i < data.length; i++) {
    clearCards()
    createCard(data[i])
  }
}

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
  });

if ('caches' in window){
  caches.match('https://photoload-98c58.firebaseio.com/posts.json')
    .then(function(response){
      if(response){
        return response.json();
      }
    })
    .then(function(data){
      console.log('Dados do cache', data);
      if(!networkDataReceived){
        var dataArray = []
        for (var key in data) {
          dataArray.push(data[key])
        }
        updateUI(dataArray);
      }
    })
}
