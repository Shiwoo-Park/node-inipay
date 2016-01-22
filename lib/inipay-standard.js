"use strict";

var Q = require('q');
var inipayUtil = require('./inipay-util');

var _pay = function(shopData, authResult, shopLogicCallback, successCallback){

    var validationGuide = {
        resultCode:"any",
        resultMsg:"string",
        mid:"string",
        orderNumber:"any",
        authToken:"string",
        authUrl:"string",
        netCancelUrl:"string",
        charset:"string"
    };

    inipayUtil.validateData(validationGuide);

    if (authResult.resultCode !== "0000")
        throw new Error("[ " + authResult.resultCode + "] " + authResult.resultMsg);

    var merchantData = {}; // passed from WEB
    if (authResult.merchantData)
        merchantData = authResult.merchantData;

    // auth success

    // rollback payment
    var handleNetCancel = function (errReason) {
        inipayUtil.sendPostRequest(authResult.netCancelUrl, authPostData, function (netCancelRes) {
            var resResult = "";
            netCancelRes.on('data', function (chunk) {
                resResult += chunk;
            });
            netCancelRes.on('end', function () {
                if (typeof resResult === "string")
                    resResult = JSON.parse(resResult);
                throw new Error(errReason + " : NetCancel [" + resResult.resultCode + "] " + resResult.resultMsg);
            })
        }, function (err) {
            throw new Error(errReason + " : NetCancel Failed " + inipayUtil.getErrMsg(err));
        });
    };

    // finalize payment
    var handleCheckAck = function (checkAckData) {
        inipayUtil.sendPostRequest(authResult.checkAckUrl, checkAckData, function (checkAckRes) {
            var resResult = "";
            checkAckRes.on('data', function (chunk) {
                resResult += chunk;
            });
            checkAckRes.on('end', function () {
                if (typeof resResult === "string")
                    resResult = JSON.parse(resResult);

                if (resResult.resultCode !== "0000") {
                    handleNetCancel("Check Ack Failed : " + resResult.resultMsg);
                    return;
                }

                successCallback();
            })
        }, handleNetCancel);
    };

    var timestamp = Date.now();
    var signature = inipayUtil.getHashSHA256("authToken=" + authResult.authToken + "&timestamp=" + timestamp);
    var authPostData = {
        mid: shopData.mid,
        authToken: authResult.authToken,
        price: shopData.totalPrice,
        timestamp: timestamp,
        signature: signature,
        charset: "UTF-8",
        format: "JSON"
    };

    var exeShopLogic = function (paymentResult){
        var defer = Q.defer();

        try{
            var shopResult = shopLogicCallback(paymentResult, merchantData);
            if(shopResult.success)
                defer.resolve();
            else
                defer.reject(shopResult.message);
        }catch(e){
            defer.reject(e);
        }

        return defer.promise;
    };

    inipayUtil.sendPostRequest(authResult.authUrl, authPostData, function (paymentRes) {
        var paymentResult = "";

        paymentRes.on('data', function (chunk) {
            paymentResult += chunk;
        });

        paymentRes.on('end', function () {
            if (typeof paymentResult === "string")
                paymentResult = JSON.parse(paymentResult);

            if (paymentResult.resultCode !== "0000") // payment failed
                throw new Error("[ " + paymentResult.resultCode + "] :" + paymentResult.resultMsg);

            // Start business logic
            exeShopLogic(paymentResult).then(function () {

                var checkAckData = {
                    mid: shopData.mid,
                    tid: paymentResult.tid,
                    applDate: paymentResult.applDate,
                    applTime: paymentResult.applTime,
                    price: shopData.totalPrice,
                    goodName: shopData.goodName,
                    charset: "UTF-8",
                    format: "JSON"
                };

                // final action
                return handleCheckAck(checkAckData);

            }, handleNetCancel);
        });
    }, handleNetCancel);

};

var pay = function(shopData, authData, shopLogicCallback, failCallback, successCallback){
    inipayUtil.validateData(shopData, {mid:"string", totalPrice:"number", goodName:"string"});
    try{
        if(typeof successCallback !== "function")
            successCallback = function(){ return true; };
        return _pay(shopData, authData, shopLogicCallback, successCallback);
    }catch(e){
        failCallback(e);
    }
};

module.exports.pay = pay;