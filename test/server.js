
var https = require('https'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs');

var expressUtil = require('./server-util'),
    inipay = require('../index');

// inipay constants
var MID = 'INIpayTest';
var INILITE_KEY = 'SU5JTElURV9UUklQTEVERVNfS0VZU1RS';

var app = express();
app.use(expressUtil.detectMobile);
app.use(bodyParser.urlencoded({extended: true})); // x-www-form-urlencoded

// sample order
var orderData = {
    mid:MID,
    mKey:inipay.getHashSHA256(INILITE_KEY),
    oid:'order_00001',
    price:'200',
    goodName:'5 Apples'
};

// VIEW
var URLMod = require('url');
var viewPath = __dirname + "/views";

app.set("views", viewPath + "/desktop");
app.use(function (req, res, next) {
    var urlObj = URLMod.parse(req.url);

    if (urlObj.pathname.match(/\.(html|jpg|png|bmp|gif)(\?.*)?$/i)) {
        var viewFile = viewPath + "/desktop" + urlObj.pathname;
        if (req.userDevice)
            viewFile = viewPath + (req.userDevice.isMobile ? "/mobile" : "/desktop") + urlObj.pathname;
        res.sendFile(viewFile);
    } else if (urlObj.pathname.match(/\.(js|css)(\?.*)?$/i)) {
        res.sendFile(viewPath + urlObj.pathname);

    } else {
        console.log("\n################# [",req.method,"] REQUEST URL : ", req.url," #################");
        next();
    }
});


// API - standard
app.get('/standard', function(req, res){
    orderData.timestamp = Date.now();
    var signatureNVP = "oid=" + orderData.oid + "&price=" + orderData.price + "&timestamp=" + orderData.timestamp;
    orderData.signature = inipay.getHashSHA256(signatureNVP);
    res.json(orderData);
});

app.post('/standard/return', function(req, res){
    var inipayStd = inipay.standard;
    var shopData = {mid:MID, totalPrice:orderData.price, goodName:orderData.goodName};
    var authData = req.body;

    console.log("authResult : ",req.body);

    var shopLogicCallback = function(paymentResult, dataFromWeb){
        // Will be called after receiving paymentResult
        console.log("\npaymentResult : ", paymentResult);
        console.log("\ndataFromWeb : ", dataFromWeb);

        // Implement your shop logic here

        // return should be like this
        return {success:true, message:"Successfully completed shop logic"};
    };

    var failCallback = function(e){
        // Handle error
        console.log(e);
        res.status(500).send('Internal Server Error');
    };

    var successCallback = function(){
        // Optional function
        // Will be called after all process finished
        res.send('Payment Success');
    };

    inipayStd.pay(shopData, authData, shopLogicCallback, failCallback, successCallback);
});

// API - mobile
app.get('/mobile', function(req, res){
    var ret = {
        payMethods:{
            "wcard": "https://mobile.inicis.com/smart/wcard/",
            "bank": "https://mobile.inicis.com/smart/bank/",
            "mobile": "https://mobile.inicis.com/smart/mobile/"
        },
        //orderData:{
        //    P_MID:MID,
        //    P_GOODS:orderData.goodName,
        //    P_AMT:orderData.price,
        //    P_OID:orderData.oid,
        //    P_EMAIL:"abc@abc.com",
        //    P_UNAME:"홍길동"
        //}
        orderData:{
            mid:MID,
            goodName:orderData.goodName,
            price:orderData.price,
            oid:orderData.oid
        }
    };
    res.json(ret);
});

app.post('/mobile/return', function(req, res){
    var inipayMobile = inipay.mobile;
    var shopData = {mid:MID};
    var authData = req.body;

    console.log("authResult : ",req.body);

    var shopLogicCallback = function(paymentResult, dataFromWeb){
        // Will be called after receiving paymentResult
        console.log("\npaymentResult : ", paymentResult);
        console.log("\ndataFromWeb : ", dataFromWeb);

        // Implement your shop logic here

        // return should be like this
        return {success:true, message:"Successfully completed shop logic"};
    };

    var failCallback = function(e){
        // Handle error
        console.log(e);
        res.status(500).send('Internal Server Error');
    };

    var successCallback = function(){
        // Optional function
        // Will be called after all process finished
        res.send('Payment Success');
    };

    inipayMobile.pay(shopData, authData, shopLogicCallback, failCallback, successCallback);
});

app.use(function (err, req, res, next) {
    if (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    } else {
        res.status(404).end('Page Not Found');
    }
});

var privateKey = fs.readFileSync(__dirname+"/ssl/server.key", 'utf8');
var certificate = fs.readFileSync(__dirname+"/ssl/server.crt", 'utf8');
var httpsOptions = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(3010);
app.listen(3000, function () {
    console.log('Test app listening on port http:3000, https:3010');
});

