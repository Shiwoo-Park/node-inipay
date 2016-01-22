/*!
 * node-inipay
 * Copyright(c) 2015 Shiwoo Park
 * MIT Licensed
 */

'use strict';


module.exports.mobile = require('./lib/inipay-mobile');
module.exports.standard = require('./lib/inipay-standard');
module.exports.getHashSHA256 = require('./lib/inipay-util').getHashSHA256;

//exports = module.exports;