
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')

 exports.xrp = {
   Shop: function () {
     return new XrpEscrowPlugin({
       secret: 'sh65NzFPcwfSv4KLQFHp2ybkA1u2F',
       account: 'raY27dK23DmbifYythuW5Aka4TvFJxjifR',
       server: 'wss://s.altnet.rippletest.net:51233',
       prefix: 'test.crypto.xrp.'
     })
   }
 }
