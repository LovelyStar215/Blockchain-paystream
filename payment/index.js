var express = require('express');
const IlpPacket = require('ilp-packet')
var url = require('url');
const xrp = require('./interledger').xrp()
const uuid = require('uuid/v4')
const crypto = require('crypto')

// https://github.com/interledger/tutorials/blob/master/streaming-payments/streaming-client1.js

function base64url (buf) {
  return buf.toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sha256 (preimage) {
  return crypto.createHash('sha256').update(preimage).digest()
}

function hmac (secret, input) {
  return crypto.createHmac('sha256', secret).update(input).digest()
}

console.log("Starting server..")
xrp.connect().then(function () {
	console.log("XRP connected")
	
	var app = express();
	
	app.get('/PayFrame', function(req, res){
		var parts = url.parse(req.url, true);
		var query = parts.query;
		console.log(query);
		
		// TODO provide a payment address (shared secret from streaming-shop tutorial)
		res.end('Pay frame')
		// returns identifier for payment
		
		const destinationAddress = 'test.crypto.xrp.r4SChuqPedRaW1bxhLLvFGpbQYNXEYQY6Y' // todo
		const destinationAmount = '10' // todo
		
		const sharedSecret = Buffer.from('test', 'base64') // todo
		const ilpPacket = IlpPacket.serializeIlpPayment({
			account: destinationAddress,
			amount: destinationAmount,
			data: ''
		})
		const fulfillmentGenerator = hmac(sharedSecret, 'ilp_psk_condition')
		const fulfillment = hmac(fulfillmentGenerator, ilpPacket)
		const condition = sha256(fulfillment)
		
		xrp.sendTransfer({
			id: uuid(),
			from: xrp.getAccount(),
			to: destinationAddress,
			ledger: xrp.getInfo().prefix,
			expiresAt: new Date(new Date().getTime() + 1000000).toISOString(),
			amount: destinationAmount,
			executionCondition: base64url(condition),
			ilp: base64url(ilpPacket)
		})
	})
	
	app.get('/PaymentStatus', function(req, res){
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