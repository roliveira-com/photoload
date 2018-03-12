
var deferredPrompt;
var enableNotificationBtn = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registrado!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt disparado');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification(){
  if ('serviceWorker' in navigator){
    var options = {
      body: '[Service Worker] Você se inscreveu para receber atualizações do nosso aplicativo web!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'pt-BR',
      vibrate: [100,50,200], // padrão da vibração em milisegundos
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification', // funciona como in ID e na prática faz que uma notificação substitua a anterior com a mesa tag
      renotify: true, // no case de uma nova notificaão de mesma TAG, o valor true especifica que ela vibrará denovo
      actions: [
        { action: 'confirm', title: 'OK', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    }
    navigator.serviceWorker.ready.then(function(worker){
      worker.showNotification('Notificações Habilitadas com sucesso!', options)
    })
  }
  // var options = {
  //   body : 'Você se inscreveu para receber atualizações do nosso aplicativo web!'
  // }
  // new Notification('Notificações Habilitadas com sucesso!', options);
}

// function configurePushSub(){
//   if(!('serviceWorker' in navigator)) {
//     return
//   }

//   var reg;
//   navigator.serviceWorker.ready
//     .then(function(worker){
//       reg = worker
//       return worker.pushManager.getSubscription();
//     })
//     .then(function(sub){
//       if(sub == null){
//         reg.pushManager.subscribe({
//           userVisibleOnly: true
//         })
//       } else {

//       }
//     })
// }

function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log('Escolha do usuário para notificaçoes: ', result)
    if(result !== 'granted'){
      console.log('Usuário não concedeu permissões para notificação', result);
    }else {
      // configurePushSub();
      displayConfirmNotification();
    }
  })
}

if ('Notification' in window){
  for (let i = 0; i < enableNotificationBtn.length; i++) {
    enableNotificationBtn[i].style.display = 'inline-block';
    enableNotificationBtn[i].addEventListener('click', askForNotificationPermission);
    
  }
}
