_ = require("underscore");
async = require("async");

http = require('http');
nodestatic = require('node-static');
file = new nodestatic.Server(__dirname + '/web');

NwLib = require('./lib/NwLib.js');
Class = NwLib.Nwjsface.Class;

// nwHttpConn = require('./nwHttpConn.js');

NwWsServer = require('./NwWsServer.js');
NwServiceProcess = require('./NwServiceProcess.js');
NwServiceMethod = require('./NwServiceMethod.js');

//------------------------------------------------------------------------

NwWsClient = require('./web/NwWsClient.js');

// wsClient = new NwWsClient("http://newww.duckdns.org");

// wsClient = new NwWsClient("http://newwwnode.herokuapp.com");
//wsClient = new NwWsClient("http://autovs.herokuapp.com");
wsClient = new NwWsClient("http://rutapon.totddns.com:37900");
//wsClient = new NwWsClient("http://192.168.43.1");
deviceId = null
require('systeminformation').blockDevices(function (data) {
    deviceId = data[0].serial;

    deviceId = require('crypto').createHash('sha256').update(deviceId + "'").digest('base64url')
    console.log(deviceId);
})


wsClient.setOnConnectEventListener(function (socket) {
    var id = wsClient.getId();
    console.log('onConnect setOnConnectEventListener' + id);

    wsClient.callService('reg_node', { sid: id, did: deviceId }, function (resultData) {
        console.log('resultData', resultData);
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

    passiveConn(appServer, httpConn, espColl);

    appServer.listen(commandPort);
}

listenCommand(port);

console.log('Start App newww');

// setInterval(() => {
//     NwServiceMethod.runPinOnInOrder({ ip: clientIp, pins: [0, 1, 2, 3, 4, 5] })
// }, 20000);

// var SensorSystem = require('./driver/SensorSystem.js');
// SensorSystem.altitudeUpdateListener = function (alt) {
//     console.log('alt:', alt);
// }
// SensorSystem.gpsAltUpdateListener = function (alt) {
//     console.log('altgps:', alt);
// }
// let StabilizerSystem = require("./control/StabilizerSystem.js");
// StabilizerSystem.start()

// let JoyControl = require("./control/JoyControl.js")
NwServiceProcess.cmdMethod['control'] = function (data, cb) {
    // console.log(data);
    JoyControl.updateValue(data)
    cb(true)
}

// var ServoControl = require("./driver/ServoControl.js");

// ServoControl.killServos()

NwServiceProcess.cmdMethod['control_mode'] = function (data, cb) {
    console.log('control_mode', data);
    if (data == 'off') {
        if (ServoControl.enable) {
            ServoControl.killServos()
        }
    } else {
        if (!ServoControl.enable) {
            ServoControl.startServos()
        }
    }

    cb(true)
}
let infoData = {
    status: {
        // signal: gsmSignal,
        // control_mode: control_mode,
        logData: false
    },
}
NwServiceProcess.cmdMethod['getInfo'] = function (data, cb) {
    // console.log('getInfo');
    cb(infoData)

}

let dbconn = require("./driver/sqliteConn.js")
dbconn.dbPath = "./data/infodata.db"
let logDataArray = [];
dbconn.getAll('data', function (result) {
    logDataArray = result
    // console.log(result);
})

var maxhight = 0
var maxhightdiff = 0
var maxspeed = 0


let last_lat, last_lon
const GPS = require("gps");

const gps = new GPS();

let min = 1000000000
let max = 0;
let min2 = 1000000000
let max2 = 0;

function looplog(i) {
    //console.log('looplog', i);
    i++
    if (i == logDataArray.length) {
        i = 0
    }
    logdataObj = logDataArray[i]

    if (logdataObj) {
        // console.log(logdataObj);
        let sensorAlt = JSON.parse(logdataObj.sensor).altitude
        let gpsAlt = JSON.parse(logdataObj.gps).alt

        if (sensorAlt < 1000) {
            if (sensorAlt > max) {
                max = sensorAlt
            } else if (sensorAlt < min) {
                min = sensorAlt
            }

        }

        if (gpsAlt > max2) {
            max2 = gpsAlt
        } else if (gpsAlt < min2) {
            min2 = gpsAlt
        }

        console.log(min, max, min2, max2);
        // let diff = Math.abs(sensorAlt - gpsAlt)

        // if (maxhight < gpsAlt) {
        //     maxhight = gpsAlt
        // }
        // if (maxspeed < JSON.parse(logdataObj.gps).speed) {
        //     maxspeed = JSON.parse(logdataObj.gps).speed
        // }
        // if (maxhightdiff < diff) {
        //     maxhightdiff = diff
        // }
        // console.log(diff, sensorAlt, gpsAlt);
        // console.log(maxhight, maxhightdiff, maxspeed);

        if (logdataObj.sensor) {
            infoData.sensor = JSON.parse(logdataObj.sensor)
        }
        if (logdataObj.gps) {
            infoData.gps = JSON.parse(logdataObj.gps)

            if (last_lat) {

                let gpsHeading = GPS.Heading(last_lat, last_lon, infoData.gps.lat, infoData.gps.lon)
                gpsHeading = Math.round(gpsHeading)
                // gpsHeading = (gpsHeading)
                if (gpsHeading > 180) { gpsHeading = (gpsHeading - 360) }
                console.log('gpsHeading', gpsHeading);
                infoData.sensor.compassHeading = gpsHeading
            }

            last_lat = infoData.gps.lat
            last_lon = infoData.gps.lon
        }
    }

    setTimeout(() => {
        looplog(i)

    }, 10);
    // infoData = { sensor: SensorSystem.sensor, gps: SensorSystem.gps, status: { signal: gsmSignal, logData: logData } }
    // cb()
}
looplog(0)


let logDate = null
NwServiceProcess.cmdMethod['logDataState'] = function (data, cb) {
    //console.log('logDataState', data);
    if (data != null) {
        logData = data;
        if (logData) {
            logDate = new Date()
        }
    }
    cb(logData)
}
// function sendToVercel(msg) {
//     require('request').get({
//         url: 'https://autobrige.vercel.app/sv?' + encodeURIComponent(msg)
//     }, function (err, httpResponse, body) {
//         // console.log(body);
//         //var obj = JSON.parse(body)
//         //body = decodeURIComponent(obj.message)
//         // console.log('body:', body);
//         // console.log(JSON.parse(body));
//     });
// }

// setInterval(() => {
//     // pos.lat = pos.lat + 0.0001
//     sendToVercel(JSON.stringify({ pos: pos, sensor: SensorSystem.sensor, gps: SensorSystem.gps }))
// }, 1000);


// const Onbordled = require('./driver/OnbordLed.js');
// var Wifi = require('rpi-wifi-connection');
// var wifi = new Wifi();
// wifiSate = null;

// function checkWifi() {
//     wifi.getState().then((connected) => {
//         if (connected) {
//             if (wifiSate != true) {
//                 wifiSate = true
//                 console.log('Connected to network.');
//                 Onbordled.blink(2000, 50)
//             }
//         }

//         else {
//             if (wifiSate != false) {
//                 wifiSate = false
//                 console.log('Not connected to network.');
//                 Onbordled.stop()
//                 if (control_mode != "auto") {
//                     servos.setDegree(3, 30);
//                 }
//             }

//         }

//         setTimeout(() => {
//             checkWifi()
//         }, 1000);
//     })
//         .catch((error) => {
//             console.log(error);
//             setTimeout(() => {
//                 checkWifi()
//             }, 1000);
//         });
// }

// checkWifi()