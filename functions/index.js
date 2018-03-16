var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin:true});
var webpush = require('web-push');
var formidable = require('formidable')
var fs = require('fs');
var uuid = require('uuid-v4')
var os = require("os");
var Busboy = require("busboy");
var path = require('path');

var post = require('./model/post.model');
var serviceAccount = require('./photoload_key.json');
var webPushPrivateKey = require('./webpushprivate_key');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var gcconfig = {
  projectId: 'photoload-98c58',
  keyFilename: 'photoload_key.json'
}

var gcs = require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://photoload-98c58.firebaseio.com/',
})

exports.storePostData = functions.https.onRequest(function(req, res) {
  cors(req, res, function () {
    
    var fileId = uuid();
    
    var busboy = new Busboy({ headers: req.headers });

    var upload;
    var fields = {};

    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
      console.log(
        `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      );
      var filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      fields[fieldname] = val;
    });

    busboy.on("finish", function(){
      var bucket = gcs.bucket("photoload-98c58.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: fileId
            }
          }
        },
        function(err, uploadedFile) {
          if (!err) {
            var newPost = admin.database().ref('posts').push();
            var imgUrl = 'https://firebasestorage.googleapis.com/v0/b/'+bucket.name+'/o/'+encodeURIComponent(uploadedFile.name)+'?alt=media&token='+fileId;
            var postData = new post.Novo(newPost.key, fields.title, fields.location, imgUrl);
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
                  content: postData.title,
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
          } else {
            console.log(err);
          }
        }
      );
    });

    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(req.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, "/tmp/" + files.file.name);
    //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
    // });

    

    // var newPost = admin.database().ref('posts').push()
    // var postData = new post.Novo(newPost.key, req.body.title, req.body.location, req.body.image);
    // console.info('Objeto postData', postData)
    // // var postData = {
    // //   id: newPost.key,
    // //   title: req.body.title,
    // //   location: req.body.location,
    // //   image: req.body.image      
    // // }
    // newPost.set(postData)
    // .then(function(){
    //   webpush.setVapidDetails(
    //     'mailto:rodrigo.olive@gmail.com',
    //     'BApQasJCUpay-LJiLY0wze_7E2iVyXoQ9sNtGNwR1BpwDtmDfL0nL7THitENo-9msuq5vwZqcV2SpWmDQO5FiEk',
    //     webPushPrivateKey.webpush.key
    //   );
    //   return admin.database().ref('subscriptions').once('value')      
    // })
    // .then(function (subscriptions){
    //   subscriptions.forEach(function(sub){
    //     var pushConfig = {
    //       endpoint: sub.val().endpoint,
    //       keys: {
    //         auth: sub.val().keys.auth,
    //         p256dh: sub.val().keys.p256dh
    //       }
    //     };

    //     webpush.sendNotification(pushConfig, JSON.stringify(
    //     {
    //       title: 'Novo post', 
    //       content: req.body.title,
    //       url: '/help',
    //       postkey: newPost.key
    //     }
    //     ))
    //     .catch(function(err){
    //       console.error(err);
    //     })
    //   });
    //   res.status(201).json(postData);
    // })
    // .catch(function (err) {
    //   res.status(500).json({error: err});
    // })
  })
});
