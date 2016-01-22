# node-inipay

Node.js library for payment gateway INICIS.

Currently supporting two modules below
- INIpay Standard (PC)
- INIpay Mobile Web

not completed yet



----------------
### inipay-standard

1. Should be used only for PC user-agents.
2. Net cancel, Check ack are supported.
3. Supported pay methods : Card, HPP, DirectBank

- **Usage**

```javascript
// Receiving API from inipay (Express example)

var returnFromInipay = function(req, res){

    var authData = req.body; 
    var inipay = require('node-inipay').standard;
    
    var shopData = {
        mid:'INIpayTest',
        totalPrice:'5000,
        goodName:'5 Apples'
    };
    
    inipay.pay(shopData, authData, function(result){
        // implement shop logic
    
    }, function (err) {
        // handle error
    
    });
}
```
- **shopData**

Key | Value Type | Value Example | Description
------------ | ------------- | ------------- | -------------
**mid** | string | "INIpayTest" | Shop inicis MID
**totalPrice** | number | 450000 | Total pay amount of order(KRW should use INT)
**goodName** | string | "iPhone and 2 other products" | Summary of ordered products 


- **successCallback**

**Input Arguments**

Key | Value Type |  Description
------------ | ------------- | -------------
**merchantData** | string | The data which you submitted from web
**paymentResult** | object | The payment result details

**Required Return**

Key | Value Type |  Description
------------ | ------------- | -------------
**success** | boolean | 'true' if your shop logic is succeeded
**message** | string | success or error message


- **failCallback** : Input argument will be "Error Object". 

----------------
### inipay-mobile

This method should be used for PC user-agents.

- **shopData**
