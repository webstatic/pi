_ = require("underscore");
async = require("async");

http = require('http');


nwHttpConn = require('./nwHttpConn.js');

NwWsServer = require('./NwWsServer.js');
NwServiceProcess = require('./NwServiceProcess.js');
NwServiceMethod = require('./NwServiceMethod.js');

//------------------------------------------------------------------------

NwWsClient = require('./web/NwWsClient.js');

// wsClient = new NwWsClient("http://newww.duckdns.org");
//wsClient = new NwWsClient("http://rutapon.totddns.com:37900");
wsClient = new NwWsClient("http://autovs.herokuapp.com");

deviceId = null
require('systeminformation').blockDevices(function (data) {
    deviceId = data[0].serial;

    deviceId = require('crypto').createHash('sha256').update(deviceId + "'").digest('base64url')
    console.log(deviceId);
})


wsClient.setOnConnectEventListener(function (socket) {
    var id = wsClient.getId();
    console.log('onConnect setOnConnectEventListener ' + id);

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
