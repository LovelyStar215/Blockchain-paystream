
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')

 exports.xrp = {
   Shop: function () {
     return new XrpEscrowPlugin({
       secret: 'shoqFAxJyXRS4QAYuJznmkpeoKchG',
       account: 'rnfpRMmRr4afr3NhPtKWxqqcmqLx9nD2FL',
       server: 'wss://s.altnet.rippletest.net:51233',
       prefix: 'test.crypto.xrp.'
     })
   }
 }
