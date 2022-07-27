/// <reference path="lib/jquery-3.6.0.js" />
/// <reference path="nwLib/nwWebsocket.js" />
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

var host = "192.168.1.12"
var ws = new nwWebsocket(host);
function app(appCallback) {

    var gpioTest = {}
    ws.serviceMethod = {
        getTime: function (cb) {
            console.log('getTime');
            cb(new Date())
        },
        getInfo: function (cb) {
            var infoObj = {
                dev: "web",
                id: uuidv4()
            }
            cb(infoObj)
        },
        setGPIO: function (cb, paraObj) {
            var pin = paraObj.pin;
            var value = paraObj.value;
            console.log('setGPIO', pin, value);
            gpioTest[pin] = value;
            cb(true)
        },
        getGPIO: function (cb, paraObj) {
            var value = gpioTest[paraObj.pin]
            console.log('getGPIO', value);
            cb(value)
        }
    }

    ws.onopen = function (e) {
        console.log("Connected to server");
        if (appCallback) appCallback();
        // ws.hello()
    }
    ws.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log('[close] Connection died');
        }
    };

    ws.onerror = function (error) {
        alert(`[error] ${error.message}`);
    };

    ws.onMsg(function (msg, id, type) {
        console.log('onMsg', msg, id);
    })

}

function callDivFuncton(id, func, cb, para) {

    ws.remoteFunc('remoteFuncById', function (result) {
        if (cb) cb(result)
    }, { id: id, func: func, para: para })
}

$(function () {

    var dev = [];

    $('#callButt').on('click', function () {
        if (dev && dev.length > 0) {
            callDivFuncton(dev[0], 'getTime', function (result) {
                console.log(result);
            })
        } else {

        }
    })
    $('#setGPIO').on('click', function () {
        if (dev && dev.length > 0) {
            callDivFuncton(dev[0], 'setGPIO', function (result) {
                console.log(result);
            }, { pin: '1', value: false })
            // ws.remoteFunc('getTime', function (result) {
            //     console.log('getTime:', result);
            // })
        } else {

        }
    })
    $('#getGPIO').on('click', function () {
        if (dev && dev.length > 0) {
            callDivFuncton(dev[0], 'getGPIO', function (result) {
                console.log(result);
            }, { pin: '1' })
            // ws.remoteFunc('getTime', function (result) {
            //     console.log('getTime:', result);
            // })
        } else {

        }
    })
    $('#ShowIdList').on('click', function () {
        ws.remoteFunc('getIdListByDev', function (result) {
            console.log('getIdListByDev', result);
            dev = result;
        }, { dev: 'blc' })
    })

    app(function () {
        setTimeout(function () {
            ws.remoteFunc('getIdListByDev', function (result) {
                console.log('getIdListByDev', result);
                dev = result;
            }, { dev: 'blc' })
        }, 1000)

    })
})