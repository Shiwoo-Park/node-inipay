"use strict";

var Q = require('q');
var qsMod = require('querystring');
var inipayUtil = require('./inipay-util');

var _pay = function(shopData, authResult, shopLogicCallback, successCallback){
    var validationGuide = {
        P_STATUS:"any",
        P_RMESG1:"string",
        P_TID:"string",
        P_REQ_URL:"string"
    };
    inipayUtil.validateData(validationGuide);

    if (authResult.P_STATUS !== "00")
        throw new Error("[" + authResult.P_STATUS + "] " + authResult.P_RMESG1);

    // auth success

    // passed from WEB
    var pNoti = "";
    if (authResult.P_NOTI)
        pNoti = authResult.P_NOTI;

    var authPostData = {
        P_MID: shopData.mid,
        P_TID: authResult.P_TID
    };

    var exeShopLogic = function (paymentResult){
        var defer = Q.defer();

        try{
            var shopResult = shopLogicCallback(paymentResult, pNoti);

            if(shopResult.success)
                defer.resolve();
            else
                defer.reject(shopResult.message);
        }catch(e){
            defer.reject(e);
        }

        return defer.promise;
    };

    inipayUtil.sendPostRequest(authResult.P_REQ_URL, authPostData, function (paymentRes) {

        var paymentResult = "";

        paymentRes.on('data', function (chunk) {
            paymentResult += chunk;
        });

        paymentRes.on('end', function () {
            if (typeof paymentResult === "string")
                paymentResult = qsMod.parse(paymentResult);

            if (paymentResult.P_STATUS !== "00")
                throw new Error("[ " + paymentResult.P_STATUS + "] " + paymentResult.P_RMESG1);

            // Already paid.
            exeShopLogic(paymentResult).then(successCallback, function (err) {
                if(typeof err === "string") err = "[SHOP] "+ err;
                if(err.message) err.message = "[SHOP] "+ err.message;
                throw new Error(err);
            })
        });
    }, function (err) {
        throw new Error(err);
    });

};

var pay = function(shopData, authData, shopLogicCallback, failCallback, successCallback){
    inipayUtil.validateData(shopData, {mid:"string"});
    try{
        if(typeof successCallback !== "function")
            successCallback = function(){ return true; };
        return _pay(shopData, authData, shopLogicCallback, successCallback);
    }catch(e){
        failCallback(e);
    }
};

// bank transfer
var noticeBank = function(){

};

// virtual bank transfer
var noticeVBank = function(){

};

module.exports.pay = pay;
module.exports.noticeBank = noticeBank;
module.exports.noticeVBank = noticeVBank;