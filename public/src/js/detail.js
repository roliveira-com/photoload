var postDetail = document.querySelector('#post-detail');
var postCards = undefined;
var clickedCardId = undefined;

if('serviceWorker' in navigator){
  // Handler for messages coming from the service worker
  navigator.serviceWorker.addEventListener('message', function(event){
      console.log("Post key vinda do SW: " + event.data);
      // event.ports[0].postMessage("Client 1 Says 'Hello back!'");
      readItem('posts', event.data).then(function(item){
        console.log('Objeto Retornado do IndexDB:', item)
        createPostDetailCard(item);
        openDetailModal();
      })
  });
}

function bindCardDetailsListener(){
  postCards = document.querySelectorAll('.shared-moment-card');
  if(postCards){
    for (var i = 0; i < postCards.length; i++) {
      postCards[i].addEventListener('click', function(){
        // console.log(this.getAttribute('id'));
        cardDetail(this);
      })
    }
  }
}

function cardDetail(card) {
  var cardId = card.getAttribute('id');
  readItem('posts', cardId).then(function(item){
    createPostDetailCard(item);
    openDetailModal();
  })
}

function createPostDetailCard(data) {
  var cardPostDetailWrapper = document.createElement('div');
  cardPostDetailWrapper.className = 'mdl-grid';

  var cardPostDetailColumn = document.createElement('div');
  cardPostDetailColumn.className = 'mdl-cell mdl-cell--12-col text-center';

  var cardPostDetailTitle = document.createElement('h4');
  cardPostDetailTitle.textContent = data.title;

  var cardPostDetaillocation = document.createElement('p');
  cardPostDetaillocation.textContent = data.location;

  var cardPostDetailImage = document.createElement('div');
  cardPostDetailImage.className = 'post-detail__image';
  cardPostDetailImage.style.backgroundImage = 'url("'+data.image+'")';

  var cardPostDetailClose = document.createElement('button')
  cardPostDetailClose.className = 'mdl-button mdl-js-button mdl-button--fab'
  cardPostDetailClose.setAttribute('id', 'close-detail-post-modal-btn');
  cardPostDetailClose.innerHTML = '<i class="material-icons">close</i>'

  cardPostDetailColumn.appendChild(cardPostDetailTitle);
  cardPostDetailColumn.appendChild(cardPostDetailImage);
  cardPostDetailColumn.appendChild(cardPostDetaillocation);
  cardPostDetailColumn.appendChild(cardPostDetailClose);
  cardPostDetailWrapper.appendChild(cardPostDetailColumn);

  postDetail.appendChild(cardPostDetailWrapper);

  bindPostDetailModalCloseButton();
}

function openDetailModal() {
  postDetail.style.transform = 'translateY(0)';
}

function bindPostDetailModalCloseButton(){
  var closePostDetailModalButton = document.querySelector('#close-detail-post-modal-btn'); 
  if (closePostDetailModalButton){
    closePostDetailModalButton.addEventListener('click', closeDetailModal);
  }
}

function closeDetailModal() {
  postDetail.style.transform = 'translateY(100vh)';
  postDetail.innerHTML = '';
}