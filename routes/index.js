var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/pay', function(req, res, next) {
    var response = {
        'payment': true
    }

    Token.create({
	    id: 1,
	    count: 10
    })

    res.send(response)
});

router.get('/video/:encoding/:segment', function(req, res, next) {
	var name = req.params.segment;
	var encoding = req.params.encoding;
	filename = path.join(__dirname, '../video', encoding, name);

	try {
		stats = fs.lstatSync(filename); // throws if path doesn't exist
	} catch (e) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('404 Not Found\n');
		res.end();
		return;
	}

	if (stats.isFile()) {
		res.writeHead(200, {'Content-Type': 'application/octet-stream'} );
		var fileStream = fs.createReadStream(filename);
		fileStream.pipe(res);
	} else {
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write('500 Internal server error\n');
		res.end();
	}
});

module.exports = router;
