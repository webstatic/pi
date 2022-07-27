
var app = app || { models: {}, collections: {}, views: {} };

if (typeof module !== "undefined") {
    Backbone = require('backbone');
    nwEsp = require('./nwEsp.js');

} else {

}

function noop() { }

function heartbeat() {
    this.isAlive = true;
}

// (function ($) {
//     'use strict';

// Person Model

app.collections.nwEspCollection = Backbone.Collection.extend({
    model: nwEsp,
    ws_name: 'nwEsp',
    httpConn: null,

    modelId: function (attrs) {
        return attrs.type + attrs.id;
    },
    initialize: function () {
        // console.log("initialize");
        this.localData = null;
    },
    setConn: function (httpConn) {
        this.httpConn = httpConn;
        this.regServerEvent();
    },
    regServerEvent: function () {
        var self = this;
        // self.wss.onClientConnect(function (ws) {

        //     if (ws.info) {
        //         console.log('connection:', ws.info.id);
        //         self.add({
        //             id: ws.info.id,
        //             BOARD: ws.info.BOARD,
        //             dev: ws.info.dev,
        //             ipInfo: ws.info.ipInfo,
        //             ws: ws,
        //             wss: self.wss
        //         })

        //         ws.isAlive = true;
        //         ws.on('pong', heartbeat);
        //         // ws.on('close', function (code, reason) {
        //         //     console.log('close in collecting: %s %s', code, reason);
        //         // });

        //     } else {
        //         console.log('connect from not esp');
        //     }
        // });

        // const interval = setInterval(function ping() {
        //     self.wss.clients.forEach(function(ws) {
        //         if (ws.isAlive === false) return ws.terminate();

        //         ws.isAlive = false;
        //         ws.ping();
        //     });
        // }, 5000);
    },
});

if (typeof module !== "undefined") {
    module.exports = app.collections.nwEspCollection;

} else {

}
// })();
