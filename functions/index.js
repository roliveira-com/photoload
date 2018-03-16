var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin:true});
var webpush = require('web-push');

var post = require('./model/post.model');
var serviceAccount = require('./photoload_key.json');
var webPushPrivateKey = require('./webpushprivate_key');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://photoload-98c58.firebaseio.com/',
})

exports.storePostData = functions.https.onRequest(function(req, res) {
  cors(req, res, function () {
    var newPost = admin.database().ref('posts').push()
    var postData = new post.Novo(newPost.key, req.body.title, req.body.location, req.body.image);
    console.info('Objeto postData', postData)
    // var postData = {
    //   id: newPost.key,
    //   title: req.body.title,
    //   location: req.body.location,
    //   image: req.body.image      
    // }
    newPost.set(postData)
    .then(function(){
      webpush.setVapidDetails(
        'mailto:rodrigo.olive@gmail.com',
        'BApQasJCUpay-LJiLY0wze_7E2iVyXoQ9sNtGNwR1BpwDtmDfL0nL7THitENo-9msuq5vwZqcV2SpWmDQO5FiEk',
        webPushPrivateKey.webpush.key
      );
      return admin.database().ref('subscriptions').once('value')      
    })
    .then(function (subscriptions){
      subscriptions.forEach(function(sub){
        var pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        };

        webpush.sendNotification(pushConfig, JSON.stringify(
        {
          title: 'Novo post', 
          content: req.body.title,
          url: '/help',
          postkey: newPost.key
        }
        ))
        .catch(function(err){
          console.error(err);
        })
      });
      res.status(201).json(postData);
    })
    .catch(function (err) {
      res.status(500).json({error: err});
    })
  })
});
