var urlMod = require('url');
var url = "http://github.com/expressjs/body-parser#bodyparserjsonoptions";
var urlObj = urlMod.parse(url);


console.log(urlObj)

var a = function(){};
console.log(typeof a);

//
//<script>
//function formSubmit(){
//    document.getElementById("form1").submit();
//}
//</script>
//<form id="form1" name="form1" method="post" action="지불수단URL">
//<input type="hidden" name="P_GOODS" value="테스트상품" />
//<input type="hidden" name="P_MID" value="상점아이디" />
//<input type="hidden" name="P_AMT" value="상품가격" />
//<input type="hidden" name="P_OID" value="5124213" />
//<input type="hidden" name="P_EMAIL" value="abc@abc.com" />
//<input type="hidden" name="P_UNAME" value="구매자명" />
//<input type="hidden" name="P_NOTI_URL" value="https://가맹점 Noti_Url" />
//    <input type="hidden" name="P_RETURN_URL" value="https://가맹점 Return_Url" />
//    <input type="button" onclick="formSubmit();" />
//</form>

var serialize = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push(typeof v == "object" ?
                serialize(v, k) :
            encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

var a = serialize({foo: "hi there", bar: { blah: 123, quux: [1, 2, 3] }});
console.log(a);
var b = decodeURIComponent(a);
console.log(b);
