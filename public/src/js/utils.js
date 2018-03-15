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