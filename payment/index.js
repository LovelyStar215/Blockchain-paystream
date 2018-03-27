const http = require('http')
const url = require('url')

// Handle incoming web requests
http.createServer(function (req, res) {
    console.log('    - Incoming request to: ${req.url}')
    const requestUrl = url.parse(req.url)

    if (requestUrl.path === '/GetBalance') {
        res.end('Get balance');
    } else if (requestUrl.path === '/PayFrame') {
        res.end('Pay frame');
    } else {
        res.statusCode = 404;
        res.end('Page not found')
    }
  }).listen(8000, function () {
})