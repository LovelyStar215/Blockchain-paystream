const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const IlpPacket = require('ilp-packet')
const url = require('url');
const xrp = require('./interledger').xrp()
const uuid = require('uuid/v4')
const crypto = require('crypto')
const base64url = require('base64url')

// https://github.com/interledger/tutorials/blob/master/streaming-payments/streaming-client1.js

function sha256(preimage) {
  return crypto.createHash('sha256').update(preimage).digest()
}

function hmac(secret, input) {
  return crypto.createHmac('sha256', secret).update(input).digest()
}

console.log("Starting server..")
xrp.connect().then(function () {
	console.log("XRP connected")
	
	var app = express();
	
	app.get('/PayFrame', [
			check('destination', 'Must be a valid ripple test net address.').matches('test\\.crypto\\.xrp\\..*'),
			check('amount', 'Must be a number.').isFloat(),
			sanitize('amount').toFloat(),
			check('sharedSecret').exists()
		], function(req, res){
		console.log('\nIncoming request')
		
		//console.log(req.query.sharedSecret);

		// Validate request params
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log('Incorrect params')
			res.setHeader('Access-Control-Allow-Origin', '*')
		  	return res.status(422).json({success:false, errors: errors.mapped() })
		}
		const params = matchedData(req);
		console.log('Params verified')

		// Get verified params
		const destinationAddress = params.destination
		const destinationAmount = params.amount.toString()
		const sharedSecret = base64url.toBuffer(params.sharedSecret) 

		// Create payment condition
		const ilpPacket = IlpPacket.serializeIlpPayment({
			account: destinationAddress,
			amount: destinationAmount,
			data: ''
		})
		const fulfillmentGenerator = hmac(sharedSecret, 'ilp_psk_condition')
		const fulfillment = hmac(fulfillmentGenerator, ilpPacket)
		const condition = sha256(fulfillment)

		// Send payment
		console.log({
			destinationAddress: destinationAddress,
			destinationAmount: destinationAmount,
			sharedSecret: base64url(sharedSecret),
			condition: base64url(condition)
		})

		console.log('Sending payment')
		xrp.sendTransfer({
			id: uuid(),
			from: xrp.getAccount(),
			to: destinationAddress,
			ledger: xrp.getInfo().prefix,
			expiresAt: new Date(new Date().getTime() + 1000000).toISOString(),
			amount: destinationAmount,
			executionCondition: base64url(condition),
			ilp: base64url(ilpPacket)
		}).catch((error) => { console.log(error)})

		return res.status(200).json({success:true})
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

xrp.on('outgoing_cancel', function (transferId, fulfillmentBase64) {
	console.log("Payment 1")
})

xrp.on('outgoing_message', function (transferId, fulfillmentBase64) {
	console.log("Payment 2")
})

xrp.on('outgoing_prepare', function (transferId, fulfillmentBase64) {
	console.log("Payment 3")
})
