var express = require('express');
var router = express.Router();

//Store navbar items
app.locals.navitems = [
  {link: '/', content: 'Home'},
  {link: '/api', content: 'Api'},
  {link: '/report', content: 'Report'}
];

//Get homepage
router.get('/', function(req, res) {
  res.render('index', { title: 'Imgur Search App' });
});

router.get('/report', function(req, res) {
  res.render('report', { title: 'Imgur Search App - Report' });
});

module.exports = router;
