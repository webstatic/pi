function getGsmSignal(cb) {

    let postStrUrl = "http://192.168.100.1/api/wifi/getWifiInfo?locale=en"

    require('request').post({
        url: postStrUrl,
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en,en-US;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6",
            "access-control-allow-credentials": "true",
            "authorization": "",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "name": "",
            "uid": "",
            "cookie": "size=default; sidebarStatus=0",
            "Referer": "http://192.168.100.1/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "lang=1",

    }, function (err, httpResponse, body) {
        //console.log(JSON.parse(body).data.signal);
        cb(JSON.parse(body).data.signal)
    });

}

function getGsmSignalquery(sid, cb) {

    let postStrUrl = "http://192.168.100.1/api/json"

    require('request').post({
        url: postStrUrl,
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en,en-US;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6",
            "authorization": "54ad2aa0-7238-42c6-90fc-6a4fd8b4eb00",
            "content-type": "application/json;charset=UTF-8",
            "cookie": "size=default; sidebarStatus=0",
            "Referer": "http://192.168.100.1/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"fid\":\"queryFields\",\"fields\":{\"signalStrength\":-200},\"sessionId\":\"" + sid + "\"}",

    }, function (err, httpResponse, body) {
        //console.log(JSON.parse(body).data.signal);
        // cb(JSON.parse(body).data.signal)
        // console.log(err);
        cb(body)
    });

}

function getGsmSignalLogin(cb) {

    let postStrUrl = "http://192.168.100.1/api/json"

    require('request').post({
        url: postStrUrl,
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en,en-US;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6",
            "authorization": "",
            "content-type": "application/json;charset=UTF-8",
            "cookie": "size=default; sidebarStatus=0",
            "Referer": "http://192.168.100.1/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"fid\":\"login\",\"username\":\"\",\"password\":\"123456789#a\",\"sessionId\":\"\"}",

    }, function (err, httpResponse, body) {
        //console.log(JSON.parse(body).data.signal);
        // cb(JSON.parse(body).data.signal)
        // console.log(httpResponse);
        cb(body)
    });

}


function getGsmSignal2(cb) {
    getGsmSignalLogin(function (body) {
        // console.log(JSON.parse(body).session);
        if (body)
            getGsmSignalquery(JSON.parse(body).session, function (result) {
                if (result)
                    cb(JSON.parse(result).fields.signalStrength)
                else
                    cb(null)
            })
        else {
            cb(null)
        }
    })
}

gsmSignal = null;
var getSignalRecur = function () {
    getGsmSignal2(function (result) {
        console.log(result);
        gsmSignal = result;
        setTimeout(getSignalRecur, 1000);
    })

}

getSignalRecur()


//=========================================================

function getGsmSignal() {

    let postStrUrl = "http://192.168.100.1/api/wifi/getWifiInfo?locale=en"
    try {
        require('request').post({
            url: postStrUrl,
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en,en-US;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6",
                "access-control-allow-credentials": "true",
                "authorization": "",
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                "name": "",
                "uid": "",
                "cookie": "size=default; sidebarStatus=0",
                "Referer": "http://192.168.100.1/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "lang=1",

        }, function (err, httpResponse, body) {
            if (body) {
                // console.log(JSON.parse(body).data.signal);
                gsmSignal = JSON.parse(body).data.signal
                setTimeout(() => {
                    getGsmSignal()
                }, 1000);
            } else {
                setTimeout(() => {
                    getGsmSignal()
                }, 5000);
            }

        });
    } catch (error) {
        setTimeout(() => {
            getGsmSignal()
        }, 5000);
    }


}
// getGsmSignal()

