"use strict";

var inipayUtil = require('./inipay-util');

var _pay = function(options, authResult, successCallback){

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

    if(!inipayUtil.validateData(validationGuide))
        throw new Error("Invalid arguments");

    if (authResult.resultCode !== "0000")
        throw new Error("[ " + authResult.resultCode + "] " + authResult.resultMsg)

    // auth success

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

    var handleCheckAck = function (chkAckData) {

        inipayUtil.sendPostRequest(authResult.checkAckUrl, paymentResult.checkAckData, function (checkAckRes) {
            var resResult = "";
            checkAckRes.on('data', function (chunk) {
                resResult += chunk;
            });
            checkAckRes.on('end', function () {
                if (typeof resResult === "string")
                    resResult = JSON.parse(resResult);

                if (resResult.resultCode !== "0000") {
                    handleNetCancel("Check Ack Failed : " + resResult.resultMsg);
                }

                return true;
            })

        }, handleNetCancel);
    };

    var timestamp = Date.now();
    var signature = inipayUtil.getHashSHA256("authToken=" + authResult.authToken + "&timestamp=" + timestamp);
    var authPostData = {
        mid: options.mid,
        authToken: authResult.authToken,
        price: options.totalPrice,
        timestamp: timestamp,
        signature: signature,
        charset: "UTF-8",
        format: "JSON"
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

            // business logic
            var shopResult = successCallback(paymentResult);

            if(!shopResult.success)
                throw new Error("Shop Logic Error : "+shopResult.msg);

            // payment success
            var checkAckData = {
                mid: options.mid,
                tid: paymentResult.tid,
                applDate: paymentResult.applDate,
                applTime: paymentResult.applTime,
                price: options.totalPrice,
                goodName: options.goodName,
                charset: "UTF-8",
                format: "JSON"
            };

            return handleCheckAck(checkAckData);
        });

    }, function (err) { handleNetCancel(err); });

};

var pay = function(options, authData, successCallback, failCallback){
    try{
        return _pay(options, authData, successCallback);
    }catch(e){
        failCallback(e);
    }
};

module.exports.pay = pay;