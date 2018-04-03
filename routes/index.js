var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const url = require('url')
const crypto = require('crypto')
const plugin = require('./plugins.js').xrp.Shop()
const IlpPacket = require('ilp-packet')
const http = require('http')

const frame_costs = 10
let normalizedCost = 0;
let ledgerInfo;
let account;

let balances = {}
let sharedSecrets = {}

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/video/:encoding/:segment', function(req, res, next) {
	var name = req.params.segment;
	var encoding = req.params.encoding;
	filename = path.join(__dirname, '../video', encoding, name);
	if (req.headers['pay-token']) {
		sharedSecret = Buffer.from(req.headers['pay-token'], 'base64')
	    console.log('Accepted shared secret from client', req.headers['pay-token'], balances)
		if (balances[base64url(sharedSecret)]) {
			if (balances[base64url(sharedSecret)] >= frame_costs) {
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
            		balances[base64url(sharedSecret)] -= frame_costs
            		res.setHeader(`Pay-Balance`, balances[base64url(sharedSecret)].toString())
				} else {
					res.writeHead(500, {'Content-Type': 'text/plain'});
					res.write('500 Internal server error\n');
					res.end();
				}
            	return;
			}
        }
	}
});

router.get('/login', function(req, res, next) {
  	console.log(`Login Request`)
	if(normalizedCost == 0 && !account && !ledgerInfo) {
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write('500 Internal server error\n');
		res.end();
		return;
	}
	const clientId = base64url(crypto.randomBytes(8))
	let sharedSecret = crypto.randomBytes(32)

	sharedSecrets[clientId] = sharedSecret
	if (!balances[base64url(sharedSecret)]) {
		// The client is just establishing its prepaid account, but hasn't paid yet
        balances[base64url(sharedSecret)] = 0
	}
	res.setHeader(`Pay`, `interledger-psk ${normalizedCost} ${account}.${clientId} ${base64url(sharedSecret)}`)
	res.setHeader(`Pay-Balance`, balances[base64url(sharedSecret)].toString())
	//res.writeHead(402, {'Content-Type': 'text/plain'});

	res.send({
		cost: normalizedCost,
		currency: ledgerInfo.currencyCode,
		account: account,
		providerId: clientId,
		secret: base64url(sharedSecret),
		balance: balances[base64url(sharedSecret)],
		paymentProviderUri: 'localhost:8000'
	});
	res.end();
});

console.log(`\t== Starting the shop server == `)
console.log(`\tConnecting to an account to accept payments...`)

plugin.connect().then(function () {

	// Get ledger and account information from the plugin
	ledgerInfo = plugin.getInfo()
	account = plugin.getAccount()

	console.log(`    - Connected to ledger: ${ledgerInfo.prefix}`)
	console.log(`    -- Account: ${account}`)
	console.log(`    -- Currency: ${ledgerInfo.currencyCode}`)
	console.log(`    -- CurrencyScale: ${ledgerInfo.currencyScale}`)

	// Convert our cost (10) into the right format given the ledger scale
	normalizedCost = frame_costs / Math.pow(10, parseInt(ledgerInfo.currencyScale))

	console.log(` \tStarting web server to accept requests...`)
	console.log(` \t - Charging ${normalizedCost} ${ledgerInfo.currencyCode} per frame`)

    // Handle incoming payments
	plugin.on('incoming_prepare', function (transfer) {
    	// Generate fulfillment from packet and this client's shared secret
    	const ilpPacket = Buffer.from(transfer.ilp, 'base64')
    	const payment = IlpPacket.deserializeIlpPayment(ilpPacket)
    	const clientId = payment.account.substring(plugin.getAccount().length + 1).split('.')[0]
    	const secret = sharedSecrets[clientId]

	    if (!clientId || !secret) {
	      // We don't have a fulfillment for this condition
	      console.log(`    - Payment received with an unknown condition: ` +
	                                            `${transfer.executionCondition}`)

	      plugin.rejectIncomingTransfer(transfer.id, {
	        code: 'F05',
	        name: 'Wrong Condition',
	        message: `Unable to fulfill the condition:  ` +
	                                            `${transfer.executionCondition}`,
	        triggered_by: plugin.getAccount(),
	        triggered_at: new Date().toISOString(),
	        forwarded_by: [],
	        additional_info: {}
	      })
	      return
	    }
	    console.log(`    - Calculating hmac; for clientId ${clientId}, the shared secret is ${base64url(secret)}.`)
	    const fulfillmentGenerator = hmac(secret, 'ilp_psk_condition')
	    const fulfillment =  hmac(fulfillmentGenerator, ilpPacket)

	    // Increase this client's balance
	    balances[base64url(secret)] += parseInt(transfer.amount)

	    console.log(`    - Increase balance for shared secret ${base64url(secret)} with ${transfer.amount} to ${balances[base64url(secret)]}. `)

	    console.log(` \tAccepted payment with condition ` +
	                                            `${transfer.executionCondition}.`)
	    console.log(`    - Fulfilling transfer on the ledger ` +
	                               `using fulfillment: ${base64url(fulfillment)}`)

	    // The ledger will check if the fulfillment is correct and
	    // if it was submitted before the transfer's rollback timeout
	    plugin.fulfillCondition(transfer.id, base64url(fulfillment))
	      .catch(function () {
	        console.log(`    - Error fulfilling the transfer`)
	      })
	    console.log(`    - Payment complete`)
    
  })
})

module.exports = router;
