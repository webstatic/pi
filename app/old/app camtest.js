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


const raspberryPiCamera = require('raspberry-pi-camera-native');// or require('raspberry-pi-camera-native');

raspberryPiCamera.start({
    // width: 1280,
    // height: 720,
    width: 640,
    height: 480,
    fps: 30,
    quality: 80,
    encoding: 'JPEG'
});

var listenCommand = function (commandPort) {
    this.commandPort = commandPort;

    //var httpServer = http.createServer(app);
    var appServer = http.createServer(function (request, response) {
        request.addListener('end', function () {
            //
            // Serve files!
            //

            if (request.url.indexOf('/imgframe') == 0) {
                console.log('load', new Date());
                raspberryPiCamera.once('frame', (data) => {
                    response.end(data);
                });
            }
            else {
                file.serve(request, response);
            }


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
