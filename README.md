# node-inipay

Node.js library for payment gateway INICIS.

Currently supporting two modules below
- INIpay Standard (PC)
- INIpay Mobile Web

----------------
### Common Usage

```javascript
var express = require('express');
var router = express.Router();

// API for receiving data from inipay (Express example)
router.post('/pay/inipayStandard', function(req, res){

    var authData = req.body; 
    var inipay = require('node-inipay').standard;
    
    var shopData = {
        mid:'INIpayTest',
        totalPrice:'5000',
        goodName:'5 Apples'
    };
    
    var shopLogicCallback = function(paymentResult, dataFromWeb){
        // Will be called after receiving paymentResult

        // Implement your shop logic here
    
        // return should be like this
        return {success:true, message:"Successfully completed shop logic"};
    }
    
    var failCallback = function(e){
        // Handle error
    }
    
    var successCallback = function(){ 
        // Optional function
        // Will be called after all process finished
    }
    
    inipay.pay(shopData, authData, shopLogicCallback, failCallback, successCallback);
})
```

- **shopData** : Object type, Essential data are decided by pay module

- **shopLogicCallback** : Implement business logic of your own. 

**Input Arguments**

Key | Value Type |  Description
------------ | ------------- | -------------
**paymentResult** | object | The payment result details
**dataFromWeb** | string | The data which you submitted from web (value of "P_NOTI")

**Required Return**

Key | Value Type |  Description
------------ | ------------- | -------------
**success** | boolean | 'true' if your shop logic is succeeded
**message** | string | success or error message

- **failCallback** : Input argument will be "Error Object". 

- **successCallback** : It's optional. This will be called after all preceding operation is done successfully. 


----------------
### inipay-standard

1. Should be used only for PC user-agents
2. Net cancel, Check ack are supported
3. Supported pay methods : Card, HPP, DirectBank
4. "dataFromWeb" will be value of "merchantData"

- **shopData** : Object type 

Key | Value Type | Value Example | Description
------------ | ------------- | ------------- | -------------
**mid** | string | "INIpayTest" | Shop inicis MID
**totalPrice** | number | 450000 | Total pay amount of order(KRW should use INT)
**goodName** | string | "iPhone and 2 others" | Summary of ordered products 


----------------
### inipay-mobile

1. Should be used only for MOBILE user-agents
2. Supported pay methods : wcard, mobile
3. Developing pay method : bank
4. "dataFromWeb" will be value of "P_NOTI"

- **shopData** : Object type 

Key | Value Type | Value Example | Description
------------ | ------------- | ------------- | -------------
**mid** | string | "INIpayTest" | Shop inicis MID

