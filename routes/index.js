var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/pay', function(req, res, next) {
    var response = {
        'payment': true
    }
    res.send(response)
});

module.exports = router;
