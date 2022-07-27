_ = require("underscore");
Backbone = require('backbone');

module.exports = function (appServer) {
    var self = this;

    this.serviceMethod = {};
    var ev = _.clone(Backbone.Events)

    this.remoteFunc = function (ip, func, cb, para) {
        require('request').post({
            url: 'http://' + ip + ':8080',
            body: JSON.stringify({ type: 'func', msg: func, para: para })
        },
            function (err, httpResponse, body) {
                console.log('body:', body);
                if (cb) {
                    cb(body);
                }
            })
    }

    this.onClientConnect = function (cb) {
        ev.on("ClientConnect", cb);
    }
    //ev.trigger('ClientConnect', ws, err)
    appServer.on('request', function (request, response) {
        // response.end('Hello World \n ');
        // const url = require('url');
        // const baseURL = 'http://' + request.headers.host + '/';
        // var a = new URL(request.url, baseURL)// url.parse(request.url, true);

        // console.log(request.method, request.url);

        // console.log(a);


        if (request.method == 'GET') {
            if (request.url == '/data') { //check the URL of the current request
                response.writeHead(200, { 'Content-Type': 'application/json' });
                setTimeout(() => {
                    response.write(JSON.stringify({ message: "Hello World", date: new Date() }));
                    response.end();
                }, 10000);

            }
            else if (request.url.indexOf('/eq') == 0) { //check the URL of the current request
                response.writeHead(200, { 'Content-Type': 'application/json' });
                var msg = request.url.split('?')[1]
                response.write(JSON.stringify({ message: "Hello World", date: msg }));
                response.end();
            }
        }

        if (request.method == 'POST') {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            let buff = '' //buffer variable to save response
            request.on('data', function (chunk) {
                buff += chunk; //concat each newline to the buff variable
            })
            request.on('end', function () {
                // console.log('Body', buff); //print out variable content

                try {
                    let obj = JSON.parse(buff);
                    // console.log(obj);
                    if (obj.type == 'func') {
                        var func = self.serviceMethod[obj.msg];
                        if (func) {
                            func(function (result) {
                                response.end(JSON.stringify({ res: result }));
                            }, obj.para)
                        } else {
                            response.end(JSON.stringify({ err: "no func" }));
                        }
                    }

                } catch (error) {
                    response.end(JSON.stringify({ err: error }));
                }
            });
        }
    });

    return this;
}
