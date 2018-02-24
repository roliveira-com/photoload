import { normalize } from "path";

var deferredPrompt;

if ('serviceWorker' in navigator) {
  // ***
  // Como segundo parâmetro, é possivel definir o escopo em que o service worker atuará
  // sobreescrevendo o que foi definido no manifest.json. Abaixo, o escopo atuará apenas
  // na pasta /help
  // ***
  // navigator.serviceWorker.register('/sw.js', {scope: '/help/'})
  navigator.serviceWorker.register('/sw.js')
    .then(function(){
      console.log('o service worker foi registrado')
    });
}

// ***
// Evitando a mensagem de instalação no lifecycle normal
// A mensagem perguntando se o usuário deseja instalar o app é exibida automaticamente pelo 
// chrome sempre que o usuário visitar o aiste pelo menos duas vezes em um intervalo de 5
// minutos. Contudo podemos configurar para que este mesnagem apareça em outro momento. Para isto, 
// capturamos o evento 'beforeinstallprompt' e guardamos na variável 'deferredPrompt' conforme abaixo.
// No Final, retornamos fase para que nada aconteça para o usuário naquele momento. Neste caso, a
// mensagem de instalação deve aparecer quando o usuário for incluir uma nova foto. Para isto, configuramos 
// o evento no script do botão no arquivo feed.js
// ***
window.addEventListener('beforeinstallprompt', function(event){
  console.log('evento beforeinstallprompt disparado');
  event.preventDefault();
  deferredPrompt = event;
  console.log(deferredPrompt)
  return false;
})