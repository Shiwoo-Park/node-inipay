"use strict";

var inipayUtil = require('./inipay-util');

var _pay = function(options, authResult, successCallback){

};

var pay = function(options, authData, successCallback, failCallback){
    try{
        return _pay(options, authData, successCallback);
    }catch(e){
        failCallback(e);
    }
};

module.exports.pay = pay;