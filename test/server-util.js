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

module.exports.detectMobile =  function(req, res, next) {
    // Add req.userDevice = {os:"", phone:"", isMobile:true|false}
    // http://hgoebl.github.io/mobile-detect.js/doc/MobileDetect.html

    var MobileDetect = require('mobile-detect');
    req.userDevice = {os: "", phone: "", isMobile: false};

    try {
        var mobileOSDic = {AndroidOS: true, WindowsMobileOS: true, iOS: true};

        var md = new MobileDetect(req.headers['user-agent']);
        var phone = md.phone();
        var os = md.os();

        if (!isEmptyObj(phone)) {
            req.userDevice.phone = phone;
            req.userDevice.isMobile = true;
        }

        if (!isEmptyObj(os)) {
            req.userDevice.os = os;
            if (mobileOSDic[req.userDevice.os])
                req.userDevice.isMobile = true;
        }

        //console.log("detectMobile : req.userDevice : ", req.userDevice);

        next();

    } catch (e) {
        console.log("Mobile detect Error:" + e);
        next();
    }
};