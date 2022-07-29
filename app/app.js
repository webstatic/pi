let _ = require("underscore");
async = require("async");

http = require('http');
nodeStatic = require('node-static');
file = new nodeStatic.Server(__dirname + '/web');

NwLib = require('./lib/NwLib.js');
Class = NwLib.Nwjsface.Class;

// nwHttpConn = require('./nwHttpConn.js');

NwWsServer = require('./NwWsServer.js');
NwServiceProcess = require('./NwServiceProcess.js');
NwServiceMethod = require('./NwServiceMethod.js');

//------------------------------------------------------------------------

NwWsClient = require('./web/NwWsClient.js');

// wsClient = new NwWsClient("http://newww.duckdns.org");
wsClient = new NwWsClient("http://rutapon.totddns.com:37900");
// wsClient = new NwWsClient("http://newwwnode.herokuapp.com");
//wsClient = new NwWsClient("http://autovs.herokuapp.com");
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

wsClient.setOnDisconnectEventListener(function () {
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

const SystemConfig = require("./driver/SystemConfig.js")
const SensorSystem = require('./driver/SensorSystem.js');
const StabilizerSystem = require("./control/StabilizerSystem.js");
const ActionControl = require("./control/ActionControl.js")
// StabilizerSystem.start()

let JoyControl = require("./control/JoyControl.js")

// SensorSystem.altitudeUpdateListener = function (alt) {
//     console.log('alt:', alt);
// }
// SensorSystem.gpsAltUpdateListener = function (alt) {
//     console.log('altgps:', alt);
// }

NwServiceProcess.cmdMethod['control'] = function (data, cb) {
    // console.log(data);
    // console.log('control', data);
    JoyControl.updateValue(data)
    cb(true)
}

const ServoControl = require("./driver/ServoControl.js");

// ServoControl.startServos()

let control_mode = 'off'
ServoControl.killServos()
// setTimeout(() => {

// }, 1000);

NwServiceProcess.cmdMethod['control_mode'] = function (data, cb) {
    if (data != null) {
        control_mode = data;
    }
    console.log('control_mode', control_mode);
    if (control_mode == 'off') {
        if (ServoControl.enable) {
            ServoControl.killServos()
        }
        cb(control_mode)
    } else {
        if (!ServoControl.enable) {
            ServoControl.startServos(function () {
                cb(control_mode)
            })
        } else {
            cb(control_mode)
        }
    }
}
// var stringify = require('zipson').stringify;

let gsmSignal = null;

function getGsmSignalQuery(sid, cb) {

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

function getGsmSignal(cb) {
    getGsmSignalLogin(function (body) {
        // console.log(JSON.parse(body).session);
        if (body)
            getGsmSignalQuery(JSON.parse(body).session, function (result) {
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

var getSignalRecur = function () {
    getGsmSignal(function (result) {
        // console.log(result);
        gsmSignal = result;
        setTimeout(getSignalRecur, 1500);
    })
}

getSignalRecur()

NwServiceProcess.cmdMethod['getInfo'] = function (data, cb) {
    // console.log('getInfo');
    cb({
        sensor: SensorSystem.sensor,
        gps: SensorSystem.gps,
        status: {
            signal: gsmSignal,
            control_mode: control_mode,
            logData: logData
        },
        testData: {
            StabilizerSystem: StabilizerSystem,
            ActionControl: ActionControl,

            currentDistance: ActionControl.PositionControl.get('currentDistance'),
            currentTarget: ActionControl.PositionControl.get('currentTarget'),
            //wpData: ActionControl.PositionControl.get('wpData'),
            turnWith: ActionControl.PositionControl.get('turnWith'),
            turnServo: ActionControl.PositionControl.get('turnServo'),
            turnTime: ActionControl.PositionControl.get('turnTime'),

            target: SensorSystem.get("target"),

            enginePower: ActionControl.SpeedControl.get('enginePower'),
            targetSpeed: ActionControl.SpeedControl.get('targetSpeed'),

            stayAltitude: ActionControl.AltitudeControl.get('stayAltitude'),
            elevatorMove: ActionControl.AltitudeControl.get('elevatorMove')
        }
    })
}

NwServiceProcess.cmdMethod['getMapPositionData'] = function (data, cb) {
    // console.log('getInfo');
    cb({
        gps: SensorSystem.gps,
        status: {
            signal: gsmSignal,
            logData: logData
        },
        testData: {
            currentDistance: ActionControl.PositionControl.get('currentDistance'),
            currentTarget: ActionControl.PositionControl.get('currentTarget'),
            target: SensorSystem.get("target"),

        }
    })
}



NwServiceProcess.cmdMethod['getWpData'] = function (data, cb) {
    // console.log('getInfo');
    cb(ActionControl.PositionControl.get('wpData'))
}


let stabilize_enable = false;
NwServiceProcess.cmdMethod['stabilize_enable'] = function (data, cb) {
    if (data != null) {
        stabilize_enable = data;
        if (stabilize_enable) {
            StabilizerSystem.start()
        } else {
            StabilizerSystem.stop()
        }
    }
    cb(stabilize_enable)
}

NwServiceProcess.cmdMethod['stabilize_lock'] = function (data, cb) {
    StabilizerSystem.offsetValueLock()
    cb(StabilizerSystem.get('offsetValue'))
}

var ActionControlEnable = false;
NwServiceProcess.cmdMethod['ActionControl'] = function (data, cb) {
    ActionControlEnable = data
    if (ActionControlEnable) {
        ActionControl.start()
    }
    else {
        ActionControl.stop()
    }

    cb(ActionControlEnable)
}

var keep_altitude = false;
NwServiceProcess.cmdMethod['keep_altitude'] = function (data, cb) {
    keep_altitude = data
    if (keep_altitude) {
        ActionControl.startAltitudeControl()
    }
    else {
        ActionControl.stopAltitudeControl()
    }

    cb(keep_altitude)
}

var speedControlEnable = false;
NwServiceProcess.cmdMethod['keep_speed'] = function (data, cb) {
    speedControlEnable = data
    if (speedControlEnable) {
        ActionControl.startSpeedControl()
    }
    else {
        ActionControl.stopSpeedControl()
    }

    cb(speedControlEnable)
}


let dbConn = require("./driver/sqliteConn.js");
//const PositionControl = require("./control/ActionControl/PositionControl.js");
dbConn.dbPath = "./data/infodata.db"

let logData = false;
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

setInterval(() => {
    if (logData) {
        let date = new Date();
        dbConn.insert('data', {
            tm: date,
            sensor: JSON.stringify(SensorSystem.sensor.attributes),
            gps: JSON.stringify(SensorSystem.gps.attributes),
            //servo: '',
            signal: gsmSignal,
            logTm: logDate,
            gyroMode: gyroMode
        }, function (id, insertObj) {
            // console.log('insertObj', insertObj);
        })
    }

}, 1000);


NwServiceProcess.cmdMethod['setServoOffset'] = function (data, cb) {
    // console.log('setServoOffset', data);

    if (_.has(data, 'ailerons')) {
        SystemConfig.set({ 'offset_ailerons': data.ailerons })
    }
    if (_.has(data, 'elevator')) {
        SystemConfig.set('offset_elevator', data.elevator)
    }
    if (_.has(data, 'rudder')) {
        SystemConfig.set('offset_rudder', data.rudder)
    }
    ///SystemConfig.save()
    ServoControl.loadOffsets()
    ServoControl.setDefault()

    cb(data)
}

NwServiceProcess.cmdMethod['getServoOffset'] = function (data, cb) {

    let result = ServoControl.getOffset()
    cb(result)
}

NwServiceProcess.cmdMethod['updateGroundAlt'] = function (data, cb) {
    cb(SensorSystem.updateGroundAlt())
}

NwServiceProcess.cmdMethod['getPositionControlParameter'] = function (data, cb) {
    let result = ActionControl.PositionControl.getPositionControlParameter()
    cb(result)
}

NwServiceProcess.cmdMethod['setPositionControlParameter'] = function (data, cb) {
    console.log('setPositionControlParameter', data);
    if (data) {
        ActionControl.PositionControl.setPositionControlParameter(data)
        if (cb) cb()
    }
    //  cb(StayAlt)
}


NwServiceProcess.cmdMethod['getStayAlt'] = function (data, cb) {
    let StayAlt = SystemConfig.get('stayAltitude')
    cb(StayAlt)
}

NwServiceProcess.cmdMethod['setStayAlt'] = function (data, cb) {
    console.log('setStayAlt', data);
    ActionControl.AltitudeControl.updateStayAltitude(data.alt)
}

NwServiceProcess.cmdMethod['setEnginePower'] = function (data, cb) {
    console.log('setEnginePower', data);
    ActionControl.SpeedControl.setEnginePower(data)
}

NwServiceProcess.cmdMethod['setTargetSpeed'] = function (data, cb) {
    console.log('setTargetSpeed', data);
    ActionControl.SpeedControl.updateTargetSpeed(data)
}

let gyroMode = "auto"
NwServiceProcess.cmdMethod['setGyroMode'] = function (data, cb) {
    let servoValue
    if (data == 'auto') {
        servoValue = 135
    } else if (data == "off") {
        servoValue = 90
    } else if (data == "normal") {
        servoValue = 45
    }
    gyroMode = data
    ServoControl.setDegree(ServoControl.planeToPin['mode'], servoValue)
}

NwServiceProcess.cmdMethod['restart'] = function (data, cb) {
    process.exit(1)
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