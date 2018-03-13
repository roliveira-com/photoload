var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin:true});
var serviceAccount = require('./photoload_key.json');
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://photoload-98c58.firebaseio.com/',
})

exports.storePostData = functions.https.onRequest(function(req, res) {
  cors(req, res, function () {
    admin.database().ref('posts').push({
      id: req.body.id,
      title: req.body.title,
      location: req.body.location,
      image: req.body.image
    })
    .then(function(){
      webpush.setVapidDetails(
        'mailto:rodrigo.olive@gmail.com',
        'BApQasJCUpay-LJiLY0wze_7E2iVyXoQ9sNtGNwR1BpwDtmDfL0nL7THitENo-9msuq5vwZqcV2SpWmDQO5FiEk',
        'Yrjtt2VNFwMPoGKu34PkQPzb-Lv1og9Sp_E_2hAo2Ns'
    );
      return admin.database().ref('subscriptions').once('value')      
    })
    .then(function(subscriptions){
      subscriptions.forEach(function(sub){
        var pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        };

        webpush.sendNotification(push, JSON.stringify({title: 'Novo post', content: 'Novo post adicionado!'}))
          .catch(function(err){
            console.log(err)
          })
      });
      res.status(201).json({message: 'Data stored', id: req.body.id});
    })
    .catch(function (err) {
      res.status(500).json({error: err});
    })
  })
});
