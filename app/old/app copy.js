_ = require("underscore");
async = require("async");

http = require('http');
nodestatic = require('node-static');
file = new nodestatic.Server(__dirname + '/web');

NwLib = require('./lib/NwLib.js');
Class = NwLib.Nwjsface.Class;

nwEspCollection = require('./nwEspCollection.js');
nwHttpConn = require('./nwHttpConn.js');


NwWsServer = require('./NwWsServer.js');
NwServiceProcess = require('./NwServiceProcess.js');
NwServiceMethod = require('./NwServiceMethod.js');

//------------------------------------------------------------------------

NwWsClient = require('./web/NwWsClient.js');

// wsClient = new NwWsClient("http://newww.duckdns.org");
wsClient = new NwWsClient("http://rutapon.totddns.com:37900");

wsClient.setOnConnectEventListener(function (socket) {
    var id = wsClient.getId();
    console.log('onConnect ' + id);

    wsClient.callService('reg_node', { sid: id, did: id }, function (resultData) {
        console.log(resultData);
        // cb(resultData)
    });

    // wsClient.callService('getServerDateTime', null, function (result) {
    //     console.log(result);
    // })
});

wsClient.setOnMessageEventListener(function (socket, msgObj, fn) {
    // console.log('OnMessage', msgObj, wsClient.getId());
    NwServiceProcess.cammandProcess(msgObj, function (result) {
        //console.log(result);

        fn(result);
    });
})

wsClient.setOnDisconnectEventListener(function myfunction() {
    console.log('wsClient Disconnect');
});

//------------------------------------------------------------------------
var port = 80
var httpConn = null;
var espColl = null;

var wsServer = null;

var espConn = function (appServer) {
    httpConn = new nwHttpConn(appServer);
    espColl = new nwEspCollection();

    httpConn.serviceMethod.change_ev = function (cb, para) {
        wsServer.emitEvent('change_ev', para)
        cb('ok')
    }

    espColl.on("add", function (paraObj) {
        console.log('espColl add: ', paraObj.id);
        console.log('espColl.length', espColl.length);

        // paraObj.getTime(function (result) {
        //     console.log('getTime', result);
        // })

        paraObj.echo('hello', function (result) {
            console.log('echo', result);
        })
    });

    // espColl.on("all", function (paraObj) {
    //     console.log('espColl',paraObj);
    // });

    espColl.on("destroy", function (paraObj) {
        console.log('destroy: ', paraObj.id);
        console.log('espColl.length', espColl.length);

    });
    espColl.setConn(httpConn);

}

var passiveConn = function (appServer, httpConn, espColl) {
    var self = this;

    wsServer = new NwWsServer(appServer);

    NwServiceMethod.addNwWsServer(wsServer, httpConn, espColl);

    NwServiceProcess.addServiceMethod(NwServiceMethod);


    wsServer.setOnConnectEventListener(function (socket) {
        console.log('OnConnectEventListener ' + socket.id);

    });

    wsServer.setOnDisconnectEventListener(function (socket) {
        console.log('OnDisconnectEventListener');
    });


    wsServer.setOnMessageEventListener(function (socket, msgObj, fn) {
        NwServiceProcess.cammandProcess(msgObj, function (result) {
            //console.log(result);

            // console.log(result);
            fn(result);
        });
    });
}

var listenCommand = function (commandPort) {
    this.commandPort = commandPort;

    //var httpServer = http.createServer(app);
    var appServer = http.createServer(function (request, response) {
        request.addListener('end', function () {
            //
            // Serve files!
            //
            file.serve(request, response);
        }).resume();
    });

    espConn(appServer);
    passiveConn(appServer, httpConn, espColl);


    // setInterval(function () {
    //     var now = new Date();
    //     var h = now.getHours()

    //     if (h < 9 || h >= 12) {
    //         console.log('try set_pin');
    //         httpConn.remoteFunc(clientIp, 'set_pin',
    //             function (body) {
    //                 console.log('D13', 1, body);

    //                 setTimeout(function (params) {
    //                     httpConn.remoteFunc(clientIp, 'set_pin',
    //                         function (body) {
    //                             console.log('D13', 0, body);
    //                         },
    //                         { pin: "D13", val: 0 });

    //                 }, 200)
    //             },
    //             { pin: "D13", val: 1 });
    //     }

    // }, 15000);

    //appServer.listen(commandPort, '0.0.0.0');
    //appServer.listen(54262);

    appServer.listen(commandPort);

}

listenCommand(port);

console.log('Start App newww');

require("./test/allSensor.js")
require("./test/logpose.js")

// setInterval(() => {
//     NwServiceMethod.runPinOnInOrder({ ip: clientIp, pins: [0, 1, 2, 3, 4, 5] })
// }, 20000);

var stringify = require('zipson').stringify;
NwServiceProcess.cmdMethod['getInfo'] = function (data, cb) {

    cb(stringify({
        Heading: Heading, target: target,
        targetPos: targetPos, currentPos: currentPos, distance: distance,
        rollpitch: rollpitch, altitude: altitude, temperature: temperature, control: controlData
    }, { detectUtcTimestamps: true, fullPrecisionFloats: true }))
}

controlData = { s: 30 }
// servos[3].setDegree(parseInt(controlData.s));
var servos = require('./driver/ServoControl.js');

setTimeout(() => {
    servos.setDegree(3, parseInt(controlData.s));
}, 1000);

const Onbordled = require('./driver/OnbordLed.js');
var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();
wifiSate = null;

function checkWifi() {
    wifi.getState().then((connected) => {
        if (connected) {
            if (wifiSate != true) {
                wifiSate = true
                console.log('Connected to network.');
                Onbordled.blink(2000, 50)
            }
        }

        else {
            if (wifiSate != false) {
                wifiSate = false
                console.log('Not connected to network.');
                Onbordled.stop()
                if (control_mode != "auto") {
                    servos.setDegree(3, 30);
                }
            }

        }

        setTimeout(() => {
            checkWifi()
        }, 1000);
    })
        .catch((error) => {
            console.log(error);
            setTimeout(() => {
                checkWifi()
            }, 1000);
        });
}

checkWifi()
NwServiceProcess.cmdMethod['control'] = function (data, cb) {

    if (data.s) {
        console.log('control data.s:', parseInt(data.s));
        controlData.s = data.s
        servos.setDegree(3, parseInt(data.s));

    }

    if (data.j1) {
        // console.log('control data.j1:', (data.j1));
        if (control_mode == "manual" || control_mode == "stabilize") {

            var move = mid + (data.j1.x * (range / 2) * deg);
            move = Math.floor(move) 
            controlData.move = move
            servos.setDegree(0, move);

            console.log('move:', move);
        }
    }

    if (data.j2) {
        // console.log('control data.j2:', (data.j2));
        if (control_mode == "manual") {

            var moveP = mid - (data.j2.y * (range / 2) * deg);
            moveP = Math.floor(moveP);
            controlData.moveP = moveP
            servos.setDegree(1, moveP);

            console.log('moveP:', moveP);

            var moveR = mid - (data.j2.x * (range / 2) * deg);
            moveR = Math.floor(moveR)
            controlData.moveR = moveR
            servos.setDegree(2, moveR);

            console.log('moveR:', moveR);
        }

    }

    cb(controlData)
}

control_mode = "manual"
NwServiceProcess.cmdMethod['control_mode'] = function (data, cb) {
    if (data) {
        control_mode = data
    }
    console.log('control_mode', control_mode);

    cb(control_mode)
}

NwServiceProcess.cmdMethod['waypoints_reset'] = function (data, cb) {
    const Waypoints = require('./modules/Waypoints.js');
    Waypoints.init(function (wpData) {
        targetPos = Waypoints.nextWp()
        cb(wpData)
    })

}

require("./driver/wvdial.js")