var servos = require('../driver/ServoControl.js');
var async = require('async')
// pass the GPIO number

// servosMap = [4, 17, 27, 22, 23, 24]

// servos = [
//     new PiServo(4),
//     new PiServo(17),
//     new PiServo(27),
//     new PiServo(22),
//     new PiServo(23),
//     new PiServo(24)
// ]

// function openAllServo(cb) {
//     async.eachSeries(servos, function (servo, callback) {
//         servo.open().then(function () {
//             callback()
//         })
//     }, function (err, results) {
//         console.log('finish openAllServo');
//         cb()
//     });
// }
// var sv1 = new PiServo(4);


startPwm = 55
endPwm = 125

range = endPwm - startPwm;
deg = 1;

mid = startPwm + range / 2 + 15


const SerialPort = require("serialport");
const SerialPortParser = require("@serialport/parser-readline");
const GPS = require("gps");

const port = new SerialPort("/dev/serial0", { baudRate: 9600 });
const gps = new GPS();

const parser = port.pipe(new SerialPortParser());

const Waypoints = require('../modules/Waypoints.js');

target = 0;

var lastHeading = 0;

distance = null;

targetPos = null
Waypoints.init(function () {
    targetPos = Waypoints.nextWp() // { lat: 7.88477600, lon: 98.38915320 };
})

currentPos = {};

function updatePosition(data) {
    currentPos.lat = data.lat;
    currentPos.lon = data.lon;

    if (targetPos) {
        distance = GPS.Distance(currentPos.lat, currentPos.lon, targetPos.lat, targetPos.lon) * 1000

        if (distance < 1 && (control_mode == 'semi-auto' || control_mode == 'auto')) {
            targetPos = Waypoints.nextWp(true);
            distance = GPS.Distance(currentPos.lat, currentPos.lon, targetPos.lat, targetPos.lon) * 1000
        }
        target = GPS.Heading(currentPos.lat, currentPos.lon, targetPos.lat, targetPos.lon)
        target = (target + 360) % 360
    }
}

gps.on("data", data => {

    if (data.type == "GGA" || data.type == "RMC" || data.type == "GLL") {

        if (data.quality != null || data.status == "active") {
            //console.log(data.lat + "," + data.lon);
            // console.log(data)
            updatePosition(data)
            //console.log('res: ', Distance, target);
        }
        else if (data.time) {
            // console.log(data.time)
        }
        else {
            // console.log("no gps fix available");
        }
    }
    // console.log(data)
});

parser.on("data", data => {
    try {
        // console.log(data);
        gps.update(data);
    } catch (e) {
        throw e;
    }
});

// function processs() {
//     // console.log('target:', target);
//     setTimeout(() => {
//         try {
//             processs()
//         } catch (error) {
//             console.log(error);
//         }

//     }, 100)
// }


sensorUpdate = function (Heading, rollpitch, altitude) {
    // console.log(Heading, rollpitch, altitude);

    if (Heading && (control_mode == 'semi-auto' || control_mode == 'auto')) {
        var move = mid - (Heading * deg);
        if (move > endPwm) {
            move = endPwm
        }
        else if (move < startPwm) {
            move = startPwm
        }
        move = Math.floor(move)
        controlData.move = move
        servos.setDegree(0, move);
        // servos[1].setDegree(move);
        // servos[2].setDegree(move);
        //console.log(heading);
    }

    if (rollpitch && (control_mode != 'manual')) {
        var moveP = mid + (rollpitch.pitch * deg);
        if (moveP > endPwm) {
            moveP = endPwm
        }
        else if (moveP < startPwm) {
            moveP = startPwm
        }

        moveP = Math.floor(moveP);
        controlData.moveP = moveP
        servos.setDegree(1, moveP);


        var moveR = mid + (rollpitch.roll * deg);

        if (moveR > endPwm) {
            moveR = endPwm
        }
        else if (moveR < startPwm) {
            moveR = startPwm
        }
        moveR = Math.floor(moveR)
        controlData.moveR = moveR
        servos.setDegree(2, moveR);
    }
}

