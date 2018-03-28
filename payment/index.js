var express = require('express');
var url = require('url');
const xrp = require('./interledger').xrp()

console.log("Starting server..")
xrp.connect().then(function () {
	console.log("XRP connected")
	
	var app = express();
	
	app.get('/PayFrame', function(req, res){
		//res.send('id: ' + req.query.id);
	  
		var parts = url.parse(req.url, true);
		var query = parts.query;
		console.log(query);
		
		// TODO provide a payment address (shared secret from streaming-shop tutorial)
		res.end('Pay frame')
		// returns identifier for payment
	})
	
	app.get('/PaymentStatus', function(req, res){
		//res.send('id: ' + req.query.id);
		
		// provide payment identifier
		res.end('Payment status');
		// returns status for payment
		// failure/success/in_progress something like that
	});
	
	app.listen(8000);
})

xrp.on('outgoing_fulfill', function (transferId, fulfillmentBase64) {
	console.log("Payment success")
})