var urlMod = require('url');
var url = "http://github.com/expressjs/body-parser#bodyparserjsonoptions";
var urlObj = urlMod.parse(url);


console.log(urlObj)