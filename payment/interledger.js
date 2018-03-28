/* eslint-disable no-unused-vars */
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')
/* eslint-enable no-unused-vars */

exports.xrp = function () {
	return new XrpEscrowPlugin({
		secret: 'snQHU4yCFBj5w7v34XGY3E7ennY7p',
		account: 'rnLPbqtXVAk5CHLw26JYhM7hCKgmZ8WRqp',
		server: 'wss://s.altnet.rippletest.net:51233',
		prefix: 'test.crypto.xrp.'
	})
}