/* eslint-disable no-unused-vars */
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')
/* eslint-enable no-unused-vars */

exports.xrp = function () {
	return new XrpEscrowPlugin({
		secret: 'ssAGHWSYnD6ZbzDTZvzLcmcnU9CSb',
		account: 'rUbxSLbKh443DPPcCYJBdoCDCdnhMnhGbT',
		server: 'wss://s.altnet.rippletest.net:51233',
		prefix: 'test.crypto.xrp.'
	})
}