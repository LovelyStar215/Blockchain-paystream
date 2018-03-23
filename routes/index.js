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
    res.send(response)
});

router.get('/video/avc1/:segment', function(req, res, next) {
	var name = req.params.segment;
	filename = path.join(__dirname, '../video', 'avc1', name);

	try {
		stats = fs.lstatSync(filename); // throws if path doesn't exist
	} catch (e) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('404 Not Found\n');
		res.end();
		return;
	}


	if (stats.isFile()) {
		// path exists, is a file
		var mimeType = 'application/octet-stream';
		res.writeHead(200, {'Content-Type': mimeType} );

		var fileStream = fs.createReadStream(filename);
		fileStream.pipe(res);
	} else if (stats.isDirectory()) {
		// path exists, is a directory
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write('Index of '+uri+'\n');
		res.write('TODO, show index?\n');
		res.end();
	} else {
		// Symbolic link, other?
		// TODO: follow symlinks?  security?
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write('500 Internal server error\n');
		res.end();
	}
});

module.exports = router;
