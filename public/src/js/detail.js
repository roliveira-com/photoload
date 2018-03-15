var postDetail = document.querySelector('#post-detail');
var postCards = undefined;
var clickedCardId = undefined;

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

  var cardPostDetailTitle = document.createElement('h3');
  cardPostDetailTitle.textContent = data.title;

  var cardPostDetailImage = document.createElement('div');
  cardPostDetailImage.className = 'post-detail__image';
  cardPostDetailImage.style.width = '300px';
  cardPostDetailImage.style.height = '180px';
  cardPostDetailImage.style.backgroundImage = 'url("'+data.image+'")';

  cardPostDetailColumn.appendChild(cardPostDetailTitle);
  cardPostDetailColumn.appendChild(cardPostDetailImage);
  cardPostDetailWrapper.appendChild(cardPostDetailColumn);
  postDetail.appendChild(cardPostDetailWrapper);

}

function openDetailModal() {
  postDetail.style.display = 'block';

  setTimeout(function(){
    postDetail.style.transform = 'translateY(0)';
  },1)

}

function closeDetailModal() {
  cardDetail.style.transform = 'translateY(100vh)';
  cardDetail.style.display = 'none';
}