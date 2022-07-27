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
        console.log('OnDisconnectEventListener', socket.id);
    });

    wsServer.setOnMessageEventListener(function (socket, msgObj, fn) {
        NwServiceProcess.cammandProcess(msgObj, function (result) {
            //console.log(result);
            fn(result);
        });
    });
}

var listenCommand = function (commandPort) {
    this.commandPort = commandPort;

    //var httpServer = http.createServer(app);
    appServer = http.createServer(function (request, response) {
        request.addListener('end', function () {
            //
            // Serve files!
            //
            file.serve(request, response);
        }).resume();
    });

    // espConn(appServer);
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


// setInterval(() => {
//     NwServiceMethod.runPinOnInOrder({ ip: clientIp, pins: [0, 1, 2, 3, 4, 5] })
// }, 20000);
var i = 0
var stringify = require('zipson').stringify;
NwServiceProcess.cmdMethod['getInfo'] = function (data, cb) {

    console.log('getInfo', data);
    // cb(new Date())
    // cb(stringify({
    //     Heading: Heading, target: target,
    //     targetPos: targetPos, currentPos: currentPos, distance: distance,
    //     rollpitch: rollpitch, altitude: altitude, temperature: temperature, control: controlData
    // }, { detectUtcTimestamps: true, fullPrecisionFloats: true }))
    // stringify(new Date().getTime(), { detectUtcTimestamps: true, fullPrecisionFloats: true })
    cb(stringify(i++, { detectUtcTimestamps: true, fullPrecisionFloats: true }))
}

// NwServiceProcess.cmdMethod['getClinetInfo'] = function (data, cb) {
//     wsServer.callService('getInfo', {}, function (resultData) {
//         console.log(resultData);
//         cb(resultData)
//     });
// }

// setInterval(() => {
//     console.log('getInfo');
//     wsServer.callService('getInfo', {}, function (resultData) {
//         console.log(resultData);
//         // cb(resultData)
//     });
// }, 300);

NwServiceProcess.cmdMethod['update_state'] = function (data, cb) {
    console.log(data);
}

NwServiceProcess.cmdMethod['reg_node'] = function (data, cb) {
    console.log('reg_node');
    console.log(data);
    cb('ok')
}

NwServiceProcess.cmdMethod['call_node'] = function (data, cb) {
    var cmd = data.cmd
    var data = data.data
    var sid = data.sid

    wsServer.callService(cmd, data, function (resultData) {
        cb(resultData)
    }, sid);
}