const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const IlpPacket = require('ilp-packet')
const url = require('url');
const xrp = require('./interledger').xrp()
const uuid = require('uuid/v4')
const crypto = require('crypto')
const base64url = require('base64url')
var cors = require('cors')
const request = require('request');

var xrpAccountBalance = 0;

// https://github.com/interledger/tutorials/blob/master/streaming-payments/streaming-client1.js

function sha256(preimage) {
  return crypto.createHash('sha256').update(preimage).digest()
}

function hmac(secret, input) {
  return crypto.createHmac('sha256', secret).update(input).digest()
}

function getXRPAccountBalance() {
	request('https://s.altnet.rippletest.net:51234', { json: {
		"method": "account_info",
		"params": [{"account": xrp._address}]
	} }, (err, res, body) => {
		if (err) { 
			console.log('Error when getting XRP account balance')
			console.log(err);
		}
		else {
			xrpAccountBalance = body.result.account_data.Balance;
		}
		setTimeout(getXRPAccountBalance, 1000);
	});
}

console.log("Starting server..")
xrp.connect().then(function () {
	console.log("XRP connected")
	
	getXRPAccountBalance();

	var app = express();
	app.use(cors());
	
	app.get('/PayFrame', [
			check('destination', 'Must be a valid ripple test net address.').matches('test\\.crypto\\.xrp\\..*'),
			check('amount', 'Must be a number.').isFloat(),
			sanitize('amount').toFloat(),
			check('sharedSecret').exists()
		], function(req, res){
		console.log('\nIncoming request')

		// Validate request params
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log('Incorrect params')
		  	return res.status(422).json({success:false, errors: errors.mapped() })
		}

		// Get verified params
		const params = matchedData(req);
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

		xrp.sendTransfer({
			id: uuid(),
			from: xrp.getAccount(),
			to: destinationAddress,
			ledger: xrp.getInfo().prefix,
			expiresAt: new Date(new Date().getTime() + 1000000).toISOString(),
			amount: destinationAmount,
			executionCondition: base64url(condition),
			ilp: base64url(ilpPacket)
		}).then(
			console.log('Payment has been send.')
		). catch((error) => { console.log(error)})

		return res.status(200).json({success:true})
	});

	app.get('/GetBalance', [], function(req, res) {
		return res.status(200).json({success:true, balance: xrpAccountBalance});
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
	//console.log("Payment 3")
})
