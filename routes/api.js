var express = require('express');
var router = express.Router();

var querystring = require('querystring');
var https = require('https');

var mongoose = require('mongoose');
//Setup db
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://admin:11567364Bb@ds063870.mongolab.com:63870/imgursearch';
//Connect to db
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});
//Get models
var Image = require('../models/image');

var host = 'api.imgur.com';
var apiKey = 'f89d4ded7144f40';

function imgurRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);

  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
  }

  var headers = {
    'Authorization': 'Client-ID ' + apiKey,
    'Accept': 'application/json'
  };

  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      //console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

// Provide upvoted images from db
router.route('/upvotes')
  //Post new upvote
  .post(function(req, res) {
    //console.log(req.body);
    Image.find({id : req.body.id}, function(err, image) {
      if (image.length){
        image.upvotes += 1;
        console.log('Image upvoted');
        res.json({ message: 'Image upvoted'});
      }else{
        var image = new Image();
        image.id = req.body.id;
        image.name = req.body.title;
        image.upvotes = 1;

        image.save(function(err) {
          if (err)
            res.send(err);
          console.log('Image created');
          res.json({ message: 'Image created'});
        });
      }
    });
  })
  //Get all upvoted images from db
  .get(function(req, res) {
    Image.find(function(err, images) {
      if (err)
        res.send(err);

      res.json(images);
    });
  });

// Provide images
router.route('/getimages')
  //Get POSTed search query and access imgur api
  .post(function(req, res) {
    var data = {
      'sort': 'viral',
      'page': '0',
      'q': req.body.search
    };

    imgurRequest('/3/gallery/search', 'GET', data, function(results) {
      res.json(results);
    });
  });

// Provide images for frontpage
router.route('/getfrontpage')
  //
  .get(function(req, res) {
    var data = {
      'sort': 'viral',
      'page': '0',
      'section': 'hot'
    };

    imgurRequest('/3/gallery', 'GET', data, function(results) {
      res.json(results);
    });
  });

// Api home page
router.get('/', function(req, res) {
    res.render('api', { title: 'Imgur Search App API' });
});

module.exports = router;
