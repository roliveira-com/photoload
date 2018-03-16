var dbPromise = idb.open('post-store', 1, function (db) {
  if(!db.objectStoreNames.contains('posts')){
    db.createObjectStore('posts', { keyPath: 'id' });
  };
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', { keyPath: 'id' });
  };
});

function writeData(st, data){
  return dbPromise.then(function(index_db){
    var transaction = index_db.transaction(st, 'readwrite');
    var store = transaction.objectStore(st);
    store.put(data);
    return transaction.complete;
  })
}

function readItem(st, id){
  return dbPromise.then(function(index_db){
    var transaction = index_db.transaction(st, 'readonly');
    var store = transaction.objectStore(st);
    return store.get(id);
  })
}

function readAllData(st){
  return dbPromise.then(function(db){
    var transaction = db.transaction(st, 'readonly');
    var store = transaction.objectStore(st);
    return store.getAll();
  })
}

function clearStorage(st) {
  return dbPromise.then(function (db) {
    var transaction = db.transaction(st, 'readwrite');
    var store = transaction.objectStore(st);
    store.clear();
    return transaction.complete;
  })
}

function clearStorageItem(st,id) {
  dbPromise.then(function (db) {
    var transaction = db.transaction(st, 'readwrite');
    var store = transaction.objectStore(st);
    store.delete(id);
    return transaction.complete;
  })
  .then(function(){
    console.log('item deletado')
  })
}

function postDetailModalFromPush(id) {
  readItem('posts', id).then(function(item){
    utilCreatePostDetailCard(item);
    utilOpenDetailModal();
  })
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function utilCreatePostDetailCard(data) {
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
  cardPostDetailImage.style.backgroundImage = 'url("' + data.image + '")';

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

  utilBindPostDetailModalCloseButton();
}

function utilOpenDetailModal() {
  postDetail.style.transform = 'translateY(0)';
}

function utilBindPostDetailModalCloseButton() {
  var closePostDetailModalButton = document.querySelector('#close-detail-post-modal-btn');
  if (closePostDetailModalButton) {
    closePostDetailModalButton.addEventListener('click', closeDetailModal);
  }
}

function utilCloseDetailModal() {
  postDetail.style.transform = 'translateY(100vh)';
  postDetail.innerHTML = '';
}