function cardIdGetter(card){
  return card.getAttribute(id);
}

var cardMoment = document.querySelector('.shared-moment-card');
var clickedCardId = undefined;

for (let i = 0; i < cardMoment.length; index++) {
  cardMoment[i].addEventListener('click', cardDetail)
}

function cardDetail(event) {
  clickedCardId = cardIdGetter(event.target)
  // Procurar registro no indexDB e se não tiver lá procurar na web
}