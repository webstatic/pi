
// var modem = require('simcom').modem('/dev/serial0');
// // var modem = require('simcom').modem('/dev/ttyAMA0');

var modemArray = require("sim800-interface");


// modemArray.sendUSSD("*101#",3);
// modemArray.sendSMS("scscsc",2);


var modemArray = require("sim800-interface");

modemArray.open({
    baudRate: 9600,
});
// modemArray.events.on("ready", function () {

//     // setInterval(() => {
//     //     modemArray.scanSIM();
//     // }, 5000);

//     addModem('/dev/serial0')
//     // modemArray.sendUSSD("*124*1234*200*");
// });

modemArray.events.on("siminfo", function (siminfo) {
    console.log("siminfo");
    console.log(siminfo);
});
