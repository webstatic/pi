/// <reference path="./lib/NwLib.js" />
// /// <reference path="../NwConn/NwDbConnection.js" />
// /// <reference path="../NwServiceProcess.js" />


(function (context, undefined) {
    //#region requre
    'use strict';
    var NwLib = require('./lib/NwLib.js');
    var _ = require('underscore');
    var Class = NwLib.Nwjsface.Class;

    //sqlite3 = require('sqlite3').verbose();
    // var NwDbConnection = require('../NwConn/NwDbMgConnection.js');
    var NwServiceProcess = require('./NwServiceProcess.js');

    var mongoDbServerUrl = "192.168.1.199"

    var getObjId = function (id) {
        return new require('mongodb').ObjectID(id);
    };

    var removeTimezoneOffset = function (now) {
        var result = new Date(now);
        result.setHours(result.getHours() - now.getTimezoneOffset() / 60);
        return result;
    };

    function requireUncached(module) {
        delete require.cache[require.resolve(module)]
        return require(module)
    }


    var NwServiceMethod = {
        addNwWsServer: function (wsServer, httpConn, espColl) {
            this._wsServer = wsServer;
            this._httpConn = httpConn;
            this._espColl = espColl;
        },
        remoteFunc: function (data, cb) {

            this._httpConn.remoteFunc(data.ip, data.func,
                cb,
                data.para);
        },
        runPinOnInOrder: function (data, cb) {
            var self = this;
            var pinList = data.pins;
            console.log('runPinOnInOrder', pinList);

            async.eachSeries(pinList, function (pin, callback) {

                self._httpConn.remoteFunc(data.ip, 'set_pcf',
                    function () {
                        setTimeout(() => {
                            callback();
                        }, 1000);
                    },
                    { id: 0, pin: pin, val: 0, tm: 1000 });
            }, function () {
                if (cb) cb()
            });
        },
        exitProcess: function (data, cb) {
            cb('ok')
            setTimeout(() => {
                process.exit();
            }, 500);

        },
        getTime: function (data, cb) {
            cb(new Date())
        },
        // getInfo: function (data, cb) {
        //     cb('hello new')
        // },
        updateServerState: function (data, serviceMethod) {
            console.log('updateHosportState', serviceMethod);
            if (this._wsServer) {
                serviceMethod = serviceMethod ? '-' + serviceMethod : '';

                var stateData = _.omit(data, 'pass', 'dpm')
                this._wsServer.emitEvent('ServerStateChange' + serviceMethod, stateData);
            }
        },

        getServerDateTime: function (data, cb) {
            //console.log('getServerDateTime',new Date());
            if (cb) cb(new Date())
        },

        setServerDateTime: function (data, cb) {
            console.log('setServerDateTime', data);
            var date = data.date;
            var time = data.time;

            const exec = require('child_process').exec;
            exec('date --set=' + date, (error, stdout, stderr) => {
                exec('date --set=' + time, (error, stdout, stderr) => {
                    if (cb) cb(new Date())
                });
            });
        },

    };

    if (typeof module !== "undefined" && module.exports) {
        // NodeJS/CommonJS
        module.exports = NwServiceMethod;
    } else {

        context.NwServiceMethod = NwServiceMethod;
    }

})(this);