// var WebSocket = require("ws");

/** Create a nwWebSocket client */


(function (context, undefined) {
    context.nwWebsocket = function (host) {
        // var ws = new WebSocket(host, {
        //     path: '/',
        //     port: 8080, // default is 80
        //     protocol: "echo-protocol", // nwWebSocket protocol name (default is none)
        //     protocolVersion: 13, // nwWebSocket protocol version, default is 13
        //     origin: 'Espruino',
        //     keepAlive: 60,
        //     headers: { some: 'header', 'ultimate-question': 42 } // nwWebSocket headers to be used e.g. for auth (default is none)
        // });
        var ws = new WebSocket("ws://" + host + ":8080");

        ws.serviceMethod = {}
        ws.callbackfunctionObj = {}

        ws.hello = function () {
            this.sendBack('hello')
            console.log("hello");
        }
        var remoteFuncTimeOut = 10000;
        ws.remoteFunc = function (func, cb, para) {
            var id = new Date().toISOString();
            ws.send(JSON.stringify({ id: id, type: 'func', msg: func, para: para }))
            if (cb) {
                //console.log(ws.callbackfunctionObj);
                ws.callbackfunctionObj[id] = cb

                setTimeout(function () {
                    if (ws.callbackfunctionObj[id]) {
                        delete ws.callbackfunctionObj[id];
                        cb(null, 'remoteFuncTimeOut')
                        console.log('remoteFuncTimeOut', id, func, para);
                    }
                }, remoteFuncTimeOut)
            }
        }

        ws.sendBack = function (msg, id, type) {
            if (!id) {
                id = new Date().toISOString()
            }
            this.send(JSON.stringify({ id: id, msg: msg, type: type }))
        }

        ws.onMsg = function (func) {
            this.onMsgFunc = func
        }

        // ws.on('open', function() {
        //     console.log("Connected to server");
        //   });
        ws.onmessage = function (event) {
            var msg = event.data;
            console.log("MSG: " + msg);
            try {
                var obj = JSON.parse(msg);

                if (obj.id) {

                    if (obj.type == 'func') {
                        var cb = ws.serviceMethod[obj.msg];
                        if (cb) {
                            cb(function (result) {
                                ws.sendBack(result, obj.id, 'rtn')
                            }, obj.para)
                        } else {
                            ws.sendBack(result, "no func", obj.id, 'err')
                        }
                    } else if (obj.type == 'rtn') {
                        var cb = ws.callbackfunctionObj[obj.id];
                        if (cb) {
                            delete ws.callbackfunctionObj[obj.id];
                            cb(obj.msg)
                        } else {
                            console.log('rtn no recive function', obj);
                        }
                    }
                }
                else {
                    if (this.onMsgFunc) {
                        this.onMsgFunc(msg)
                    }
                }
            } catch (error) {
                if (this.onMsgFunc) {
                    this.onMsgFunc(msg)
                }
            }
        }

        return ws;
    };

})(this);
