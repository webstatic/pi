// listen for messages from the parent process
process.on("message", message => {
    // let isPrime = checkIfPrime(message);
    // // send the results back to the parent process
    // process.send(isPrime);
    // // kill the child process
    // process.exit();
    console.log('form child', message);
})
var cleanExit = function () {
    console.log('Gps process.exit()');
    process.exit(1)
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill
//process.on('exit', cleanExit); // catch exit

const calculateMean = (values) => {
    const mean = (values.reduce((sum, current) => sum + current)) / values.length;
    return mean;
};

const Circularmean = (values) => {
    let meanSin = 0;
    values.map(function (value) {
        meanSin += Math.sin(value * Math.PI / 180)
    })
    meanSin = meanSin / values.length;


    let meanCos = values.map(function (value) {
        let result = Math.cos(value * Math.PI / 180)
        return result
    }).reduce((sum, current) => sum + current)

    meanCos = meanCos / values.length;

    // console.log(meanSin, meanCos);
    return (Math.atan2(meanSin, meanCos)) * 180 / Math.PI;
};


const calculateCircularVariance = (values) => {
    const average = Circularmean(values);
    const squareDiffs = values.map((value) => {
        const result = average - value;
        let resultAbs = Math.abs(result)
        if (resultAbs > 180) {
            resultAbs = 360 - resultAbs
            //result = result < 0 ? resultAbs : resultAbs * -1
        }
        return resultAbs * resultAbs;
    });
    // console.log(squareDiffs);
    let variance = calculateMean(squareDiffs);
    variance = Math.round(variance)
    return variance;
};


class BufferCal {
    constructor(size) {
        this.data = []
        this.size = size
    }
    puch(value) {
        var shiftData = null;

        if (this.data.push(value) > this.size) {
            shiftData = this.data.shift()
        }

        return shiftData
    }
    Circularvariance() {
        return calculateCircularVariance(this.data)
    }

}

/////////////////////////////////////////////////////////////////////////////////////
TileSet = require('node-hgt').TileSet;
// const geolib = require('geolib');
var tileset = new TileSet(__dirname + '/../../../hgt/');
console.log('TileSet loaded');

// tileset.getElevation([8.697044333333332, 98.24069116666666], function (err, elevation) {
//     if (err) {
//         console.log('getElevation failed: ' + err.message);
//     } else {
//         console.log('elevation', elevation);
//         console.log(elevation);
//     }

// });

console.log('------------------(START GPS)------------------');

const SerialPort = require("serialport");
const SerialPortParser = require("@serialport/parser-readline");
const GPS = require("gps");

const port = new SerialPort("/dev/serial0", { baudRate: 9600 });
const gps = new GPS();

const parser = port.pipe(new SerialPortParser());

var lat = null
var lon = null
var alt = null
var speed = null
var time = null

let bufferCal = new BufferCal(3)

function getSpeedAcceleration(currentSpeed) {

}

gps.on("data", data => {

    if (data.type == "GGA" || data.type == "RMC" || data.type == "GLL") {


        if (data.time && data.time != time) {

            process.send({ type: 'time', time: data.time })
        }

        if (data.quality != null || data.status == "active") {
            // console.log('GPS State', gps.state.satsActive.length, gps.state.satsVisible.length);

            // process.send({ type: 'pos' });
            if (lat != data.lat || lon != data.lon) {

                if (lat != undefined && lon != undefined) {
                    let gpsHeading = GPS.Heading(lat, lon, data.lat, data.lon)
                    //let moveDistance = GPS.Distance(lat, lon, data.lat, data.lon) * 1000
                    // console.log('gpsHeading', gpsHeading, moveDistance);
                    bufferCal.puch(gpsHeading)
                    let variance = bufferCal.Circularvariance()

                    if (gpsHeading > 180) {
                        gpsHeading = (360 - gpsHeading) * -1
                    }

                    process.send({
                        type: 'gpsHeading',
                        gpsHeading: gpsHeading,
                        variance: variance,
                        //moveDistance: moveDistance
                    });
                }

                // self.gps.set({ lat: data.lat, lon: data.lon })
                lat = data.lat
                lon = data.lon
                process.send({ type: 'pos', lat: lat, lon: lon });

                //console.log('lat, lon', lat, lon);
                tileset.getElevation([lat, lon], function (err, elevation) {
                    if (err) {
                        console.log('getElevation failed: ' + err.message);
                    } else {
                        // console.log('elevation', elevation);
                        process.send({ type: 'elevation', elevation: elevation });
                    }
                });
                // self.gps.trigger("change:pos", self.gps)
            }
            //   process.send({ type: 'pos', lat: lat, lon: lon });
            if (gps.state.alt != undefined && gps.state.alt != alt) {
                alt = gps.state.alt
                process.send({ type: 'alt', alt: alt });
                // self.gps.set({ alt: gps.state.alt })
            }

            if (gps.state.speed != undefined && gps.state.speed != speed) {
                speed = gps.state.speed
                process.send({ type: 'speed', speed: speed });
                // self.gps.set({ speed: gps.state.speed })
            }
            //console.log(data.lat + "," + data.lon);
            // console.log(data)
            // updatePosition(data)
            //console.log('res: ', Distance, target);
        }
        else {
            // console.log("no gps fix available");
        }
    }
    // console.log(data)
});

parser.on("data", data => {
    try {
        //console.log(data);
        gps.update(data);
    } catch (e) {
        throw e;
    }
});