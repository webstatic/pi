/// <reference path="./lib/NwLib.js" />

(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {
        NwLib = require('./lib/NwLib.js');
        _ = require('underscore');
        Class = NwLib.Nwjsface.Class;

    } else {

    }
    //#endregion
    var NwServiceProcess = Class(function () {

        return {
            $singleton: true,
            state: '',

            //constructor: function () {
            //    console.log('NwServiceProcess constructor');
            //    NwServiceProcess.state = 'constructor';
            //},
            init: function () {

                NwServiceProcess.state = 'init';

            },
            cammandProcess: function (msgObj, cb) {
                var cmd = msgObj.msg;
                var data = msgObj.data;

                //console.log('cammandProcess : ' + JSON.stringify(msgObj));

                if (this.cmdMethod.hasOwnProperty(cmd)) {

                    this.cmdMethod[cmd](data, function (resultObj) {
                        msgObj.data = resultObj;
                        if (cb) { cb(msgObj) }
                    });

                } else {
                    console.log('invalid cmd ' + cmd);

                    msgObj.data = 'invalid cmd ' + cmd;
                    if (cb) { cb(msgObj) }
                }

            },

            addServiceMethod: function (serviceMethodObj) {
                for (var attrname in serviceMethodObj) { this.cmdMethod[attrname] = serviceMethodObj[attrname]; }

            },
            cmdMethod: {}
        };
    });


    NwServiceProcess.init();

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwServiceProcess;
    } else {

        context.NwServiceProcess = NwServiceProcess;
    }

})(this);