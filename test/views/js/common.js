// Common variable
var ip = "127.0.0.1";
ip = "10.70.12.179";
var httpPort = "3000";
var httpsPort = "3010";

var httpDomain = "http://"+ip+":"+httpPort;
var httpsDomain = "https://"+ip+":"+httpsPort;

function getQueryDic(locationSearch) {

    var ret = {};
    var query = locationSearch.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        ret[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }

    return ret;
}

var alertCallback = function(response){
    var msg = response;
    if(response.statusText)
        msg = response.statusText;
    if(response.data)
        if(response.data.message)
            msg = response.data.message;
    if(typeof msg === "object")
        msg = JSON.stringify(msg)
    alert(msg);
};
