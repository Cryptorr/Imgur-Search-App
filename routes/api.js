var express = require('express');
var router = express.Router();

var querystring = require('querystring');
var https = require('https');

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
      console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

// Provide images
router.post('/getimages', function(req, res) {
    var data = {
      'sort': 'viral',
      'page': '0',
      'q': req.body.search
    };

    imgurRequest('/3/gallery/search', 'GET', data, function(results) {
      res.send(results);
    });
});

// Provide images for frontpage
router.get('/getfrontpage', function(req, res) {
    var data = {
      'sort': 'viral',
      'page': '0',
      'section': 'hot'
    };

    imgurRequest('/3/gallery', 'GET', data, function(results) {
      res.send(results);
    });
});

// Api home page
router.get('/', function(req, res) {
    res.render('api', { title: 'Imgur Search App API' });
});

module.exports = router;
