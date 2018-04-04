/* eslint-disable no-unused-vars */
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')
/* eslint-enable no-unused-vars */

exports.xrp = function () {
	return new XrpEscrowPlugin({
		secret: 'ssHHk9WAokkHX7TBXKx9hpa8DeBFR',
		account: 'rwBVnDajkya4LGEy6tTWGqMW2jTmofv6EC',
		server: 'wss://s.altnet.rippletest.net:51233',
		prefix: 'test.crypto.xrp.'
	})
}