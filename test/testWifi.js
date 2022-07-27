const Onbordled = require('./OnbordLed.js');

var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();

// wifi.getStatus().then((status) => {
//     console.log(status);
// })
//     .catch((error) => {
//         console.log(error);
//     });
var currentWifiState = false;

setInterval(() => {
    // wifi.getState().then((connected) => {
    //     if (connected) {
    //         if (currentWifiState != true) {
    //             currentWifiState = true
    //             console.log('Connected to network.');
    //             Onbordled.blink(1000)
    //         }
    //     }

    //     else {
    //         if (currentWifiState != false) {
    //             currentWifiState = false
    //             Onbordled.blink(100)
    //         }
    //         console.log('Not connected to network.');
    //     }

    // })
    //     .catch((error) => {
    //         console.log(error);
    //     });

    wifi.scan().then((ssids) => {
        console.log(ssids[0].ssid, ssids[0].signalLevel);
    })
        .catch((error) => {
            console.log(error);
        });
}, 100);
