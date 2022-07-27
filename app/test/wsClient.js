io = require('socket.io-client');


socket = io("http://newww.duckdns.org");//,{'forceNew':true });


socket.on('connect', function () {

    console.log('a user connected');

});

// var socket = require('socket.io-client')('http://192.168.1.30');
// socket.on('connect', function () {
//     console.log('connect');
// });
// socket.on('event', function (data) { });
// socket.on('disconnect', function () { });