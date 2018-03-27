const http = require('http')
const url = require('url')

// Handle incoming web requests
http.createServer(function (req, res) {
    console.log('    - Incoming request to: ${req.url}')
    const requestUrl = url.parse(req.url)

    if (requestUrl.path === '/GetBalance') {
        // TODO provide a payment address (shared secret from streaming-shop tutorial)
        res.end('Get balance');
    } else if (requestUrl.path === '/PayFrame') {
        // TODO provide a payment address (shared secret from streaming-shop tutorial)
        res.end('Pay frame');
        // returns identifier for payment
    } else if (requestUrl.path === '/PaymentStatus') {
        // provide payment identifier
        res.end('Payment status');
        // returns status for payment
        // failure/success/in_progress something like that 
    } else {
        res.statusCode = 404;
        res.end('Page not found')
    }
  }).listen(8000, function () {
})