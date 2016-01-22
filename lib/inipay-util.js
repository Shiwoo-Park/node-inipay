var httpMod = require('http');
var httpsMod = require('https');
var urlMod = require('url');
var qsMod = require('querystring');
var cryptoMod = require('crypto');

function getHashSHA256(inputValue) {
    if (typeof inputValue !== "string")
        inputValue = inputValue.toString();
    return cryptoMod.createHash('sha256').update(inputValue).digest('hex');
}

function isEmptyObj(obj, isWeakCheck) {
    if (obj === undefined) return true;
    if (obj === null) return true;
    if (typeof obj === "string") obj = obj.trim();
    if (obj === "") return true;

    if (isWeakCheck)
        return false;

    if (typeof obj === "string") {
        if (obj === "[]") return true;
        if (obj === "{}") return true;
    }

    if (typeof obj === "object") {
        if (obj === []) return true;
        if (obj === {}) return true;
        if (Object.keys(obj).length === 0) return true;
    }

    return false;
}

function sendPostRequest (url, sendData, handleResponse, handleError) {
    if (!handleResponse) throw new Error('sendPostHttpsRequest() Failed : No callback');
    if (!sendData) sendData = {};

    var urlObj = urlMod.parse(url);
    var postQueryString = qsMod.stringify(sendData);
    var reqOptions = {
        hostname: urlObj.hostname,
        path: urlObj.path,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postQueryString.length
        }
    };

    var request = undefined;
    if(urlObj.protocol === "https:")
        request = httpsMod.request(reqOptions, handleResponse);
    else
        request = httpMod.request(reqOptions, handleResponse);

    if (handleError) {
        request.on('error', handleError);
    } else {
        request.on('error', function (e) {
            throw new Error('sendPostRequest Error : ' + e.toString())
        });
    }

    request.write(postQueryString);
    request.end();
}
function isInt(s){return (s % 1) === 0; }

function validateData (data, guideDic){
    /*
     - check type of each essential input arguments
     - cast the value into target type
     - if check succeed : return true
     - if check failed : throw new Error()

     guideDic = { key:typeString, ... }

     typeString : number,object,string,boolean + int,float,dic,array,any(exist check only)
     */
    var throwErr = function(msg){ throw new Error("Invalid request argument : "+msg); };

    var check = function(requestData, guideData){

        for(var key in guideData){
            if(commonUtil.isEmptyObj(requestData[key], true)) throwErr(key);

            if(guideData[key] === "any"){
                continue;

            }else if(guideData[key] === "number"){
                if(requestData[key].indexOf(".") >= 0){
                    requestData[key] = parseFloat(requestData[key]);
                }else{
                    requestData[key] = parseInt(requestData[key]);
                }

            }else if(guideData[key] === "int"){
                requestData[key] = parseInt(requestData[key]);
                guideData[key] = "number";

            }else if(guideData[key] === "float"){
                requestData[key] = parseFloat(requestData[key]);
                guideData[key] = "number";

            }else if(guideData[key] === "boolean"){
                if(requestData[key] === "true")
                    requestData[key] = true;
                else if(requestData[key] === "false")
                    requestData[key] = false;
                else throwErr(key)

            }else if(guideData[key] === "dic"){
                if(typeof requestData === "string"){
                    if(requestData[key].charAt(0) !== "{")
                        throwErr(key)
                    requestData[key] = JSON.parse(requestData[key]);
                }
                guideData[key] = "object";

            }else if(guideData[key] === "array"){
                if(typeof requestData === "string") {
                    if (requestData[key].charAt(0) !== "[")
                        throwErr(key)
                    requestData[key] = JSON.parse(requestData[key]);
                }
                guideData[key] = "object";

            }else{
                if(isInt(requestData[key])){
                    if(requestData[key].indexOf(".") >= 0){
                        requestData[key] = parseFloat(requestData[key]);
                    }else{
                        requestData[key] = parseInt(requestData[key]);
                    }
                }
            }

            if(typeof requestData[key] !== guideData[key]) throwErr(key);
        }
    };

    if(guideDic){
        if(isEmptyObj(data)) throwErr("No data");
        check(data, guideDic);
    }

    return true;
}

function getErrMsg(error){
    if(typeof error === "string") return error;
    if(error.stack) return error.stack;
    if(error.message) return error.message;
    return error.toString();
}

module.exports.isInt = isInt;
module.exports.getHashSHA256 = getHashSHA256;
module.exports.isEmptyObj = isEmptyObj;
module.exports.sendPostRequest = sendPostRequest;
module.exports.validateData = validateData;
module.exports.getErrMsg = getErrMsg;