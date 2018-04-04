
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')

 exports.xrp = {
   Shop: function () {
     return new XrpEscrowPlugin({
       secret: 'shGgj8sz652r4u6zx115Yw6z2MRhH',
       account: 'rNvH4X96yJvLMVfremRrTgp1sNXnCM3yo',
       server: 'wss://s.altnet.rippletest.net:51233',
       prefix: 'test.crypto.xrp.'
     })
   }
 }
