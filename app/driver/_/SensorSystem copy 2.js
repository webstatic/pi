let Backbone = require("backbone");

const SerialPort = require("serialport");
const SerialPortParser = require("@serialport/parser-readline");
const GPS = require("gps");

const port = new SerialPort("/dev/serial0", { baudRate: 9600 });
const gps = new GPS();

const parser = port.pipe(new SerialPortParser());

///////////////////////////////////////////////////////////


// var gyro = require("mpu6050-gyro");

// var address = 0x68; //MPU6050 address
// var bus = 1; //i2c bus used

// var gyro = new gyro(bus, address);

/////////////////////////////////////////////////////////
var i2c = require('i2c-bus');
var MPU6050 = require('i2c-mpu6050');

var address = 0x68;
var i2c1 = i2c.openSync(1);

var gyro = new MPU6050(i2c1, address);

///////////////////////////////////////////////////////

const bmp180 = require('bmp180-sensor')
//var sealevel = 99867; // current sea level pressure in Pa

let sealevel = 101325;
var getAltitude = function (pressure, sealevel) {
    return 44330 * (1 - Math.pow(pressure / sealevel, 1 / 5.255));
};

// ///////////////////////////////////////////////////////////////////////////
// var HMC5883L = require('../driver/Compass.js')

const geomagnetism = require('geomagnetism');

// // information for "right now"
const geomagnetisminfo = geomagnetism.model().point([8.69720080, 98.24132320]);
console.log('declination:', geomagnetisminfo.decl);

// // let calibration = {
// //     offset: { x: 29.200000000000003, y: -85.41, z: 131.76500000000001 },
// //     scale: {
// //         x: 1.0140018066847336,
// //         y: 1.0451582867783986,
// //         z: 0.9460598398651496
// //     }
// // }

// // let calibration = {
// //     offset: { x: 23.359999999999985, y: -108.405, z: 141.62 },
// //     scale: {
// //         x: 0.8717605004468276,
// //         y: 1.2980705256154357,
// //         z: 0.9237689393939392
// //     }
// // }

// // let calibration = {
// //     offset: { x: 16.060000000000002, y: -109.49999999999999, z: 157.315 },
// //     scale: {
// //         x: 0.9606598984771574,
// //         y: 1.0876436781609198,
// //         z: 0.9618805590851335
// //     }
// // }

// let calibration = {
//     offset: {
//         x: 21.169999999999987,
//         y: -62.05000000000001,
//         z: 201.48000000000002
//     },
//     scale: { x: 1.018421052631579, y: 1.213166144200627, z: 0.8376623376623377 }
// }

// // let calibration = {
// //     offset: {
// //         x: 59.495000000000005,
// //         y: 39.05499999999999,
// //         z: 4.3799999999999955
// //     },
// //     scale: {
// //         x: 0.9888143176733778,
// //         y: 1.0189027201475334,
// //         z: 0.9928122192273134
// //     }
// // }
// var options = {
//     /*
//      * Pass the i2c library as an option.  This saves us from loading the
//      * library twice.
//      */
//     //i2c: i2c,

//     /*
//      * The sample rate (Hz), must be one of '0.75', '1.5', '3', '7.5',
//      * '15', '30', or '75'.  Default is '15' Hz (samples per second).
//      */
//     //sampleRate: '15', /* default */

//     /*
//      * The declination, in degrees.  If this is provided the result
//      * will be true north, as opposed to magnetic north. See the
//      * following link: https://www.npmjs.com/package/geomagnetism
//      */
//     declination: geomagnetisminfo.decl,

//     /*
//      * The scale range to use.  See pp13 of the technical documentation.
//      * Different expected magnetic intensities  require different scales.
//      */
//     //scale: '0.88', /* default */

//     /*
//      * The calibrated values.  Default offsets are 0.  Default scale values are 1.0.
//      */
//     //calibration: calibration
// };

// var compass = new HMC5883L(1, options);


var lsm303 = require('lsm303');
var ls = new lsm303();
var mag = ls.magnetometer();
// mag.setOffset(78.5, 13, 137)
mag.setOffset(62.5, -3.5, 118.5)
//mag.setOffset(43.5, 170.5, 1.5)
let SensorSystem = Backbone.Model.extend({

    sensor: new Backbone.Model(),
    gps: new Backbone.Model(),
    defaults: {
        target: 0
    },
    initialize: function () {
        let self = this;

        // gps.on("data", data => {

        //     // delete gps.state.processed;
        //     // delete gps.state.satsVisible;
        //     // delete gps.state.satsActive;
        //     // delete gps.state.errors;
        //     // delete gps.state.track;
        //     // delete gps.state.fix;
        //     // delete gps.state.hdop;
        //     // delete gps.state.pdop;
        //     // delete gps.state.vdop;

        //     // console.log(gps.state.errors, gps.state.satsActive)

        //     if (data.type == "GGA" || data.type == "RMC" || data.type == "GLL") {


        //         if (data.time && data.time != self.gps.time) {
        //             self.gps.set({ time: data.time })
        //         }
        //         if (data.quality != null || data.status == "active") {
        //             if (self.gps.get('lat') != data.lat || self.gps.get('lon') != data.lon) {
        //                 self.gps.set({ lat: data.lat, lon: data.lon })
        //                 self.gps.trigger("change:pos", self.gps)
        //             }

        //             if (gps.state.alt && gps.state.alt != self.gps.alt) {
        //                 self.gps.set({ alt: gps.state.alt })
        //             }
        //             if (gps.state.speed && gps.state.speed != self.gps.speed) {
        //                 self.gps.set({ speed: gps.state.speed })
        //             }
        //             //console.log(data.lat + "," + data.lon);
        //             // console.log(data)
        //             // updatePosition(data)
        //             //console.log('res: ', Distance, target);
        //         }
        //         else {
        //             // console.log("no gps fix available");
        //         }
        //     }
        //     // console.log(data)
        // });

        // parser.on("data", data => {
        //     try {
        //         // console.log(data);
        //         gps.update(data);
        //     } catch (e) {
        //         throw e;
        //     }
        // });

        async function initSensor() {
            var sensor = await bmp180({
                address: 0x77,
                mode: 1,
            })

            async function update_telemetry() {
                self.update = false
                // var gyro_data = {
                //     gyro_xyz: gyro_xyz,
                //     accel_xyz: accel_xyz,
                //     rollpitch: gyro.get_roll_pitch(gyro_xyz, accel_xyz)
                // }

                // console.log(gyro_data);

                try {
                    const data = await sensor.read()
                    //await sensor.close()
                    // console.log('data', data);
                    if (data) {
                        let temperature = data.temperature
                        let altitude = getAltitude(data.pressure, sealevel)

                        if (self.sensor.get('temperature') != temperature) {
                            self.update = true;
                            self.sensor.set({ temperature: temperature })
                        }
                        if (self.sensor.get('altitude') != altitude) {
                            self.update = true;
                            let def = Math.abs(self.sensor.get('altitude') - altitude)
                            if (!self.sensor.get('altitude') || def > 0.5) {
                                self.sensor.set({ altitude: altitude })
                            }

                        }
                    }

                } catch (error) {
                    console.log('bmp', error);
                }

                try {
                    // var gyro_xyz = await gyro.get_gyro_xyz();
                    // var accel_xyz = await gyro.get_accel_xyz();
                    // let rollpitch = await gyro.get_roll_pitch(gyro_xyz, accel_xyz)

                    // let gyrodata = await gyro.readSync();
                    // console.log(gyrodata);
                    let rotation = await gyro.readRotationSync();
                    let rollpitch = { roll: rotation.y, pitch: rotation.x }

                    if (self.sensor.get('rollpitch') == null || (rollpitch.roll != self.sensor.get('rollpitch').roll || rollpitch.pitch != self.sensor.get('rollpitch').pitch)) {
                        self.update = true;
                        self.sensor.set({ rollpitch: rollpitch })
                    }

                    // console.log(rollpitch);
                } catch (error) {
                    // console.log('gyro', error);
                }

                // try {
                //     self.updateCommpass()
                // } catch (error) {
                //     console.log('Compass', error);
                // }

                finally {
                    // if (sensorUpdate) sensorUpdate(Heading, rollpitch, altitude)

                    if (self.update) {
                        // console.log(self.sensor);
                        self.sensor.trigger("change:some", self.sensor)
                    }
                    await setTimeout(() => {
                        update_telemetry()
                    }, 100);
                }
            }

            if (true) {
                await update_telemetry();
            }
        }

        initSensor();

        self.on('change:target', self.updateCommpass, this)
    },
    updateCommpass: function () {
        let self = this;
        // compass.getHeadingDegrees('z', 'x', self.get('target'), async function (err, heading, compassHeading) {
        //     // Heading = heading

        //     console.log(compassHeading);
        //     // if (sensorUpdate) sensorUpdate(Heading, rollpitch, altitude)
        //     if (self.sensor.get('heading') != heading || self.sensor.get('compassHeading') != compassHeading) {
        //         self.update = true;
        //         self.sensor.set({ heading: heading, compassHeading: compassHeading })
        //     }

        // })
        mag.readAxes(function (err, axes) {
            if (err) {
                console.log("Error reading Magnetometer Heading : " + err);
            }
            if (axes) {
                let declination = geomagnetisminfo.decl / 180 * Math.PI
                var theta = Math.PI / 2 - (Math.atan2(axes.y, axes.x) + declination);
                if (theta < 0) {
                    theta += 2 * Math.PI;
                }
                theta = 2 * Math.PI - theta;
                theta = (180 / Math.PI * theta);
                theta = ((theta != 360) ? theta : 0);

                theta = (theta - 180) * -1

                let compassHeading = theta;

                theta = theta - self.get('target')

                if (theta < -180) { theta = theta + 360 }
                let heading = theta

                if (self.sensor.get('heading') != heading || self.sensor.get('compassHeading') != compassHeading) {
                    self.update = true;
                    self.sensor.set({ heading: heading, compassHeading: compassHeading })
                }

                //console.log(compassHeading);
                // var heading =  Math.atan2(axes.y, axes.x);
                // //heading += this.declination;

                // while (heading < 0) {
                //     heading += twoPies;
                // }
                // while (heading > twoPies) {
                //     heading -= twoPies;
                // }
                // heading = heading * 180 / Math.PI
                // heading = heading - 180

                // // let compassHeading = heading;
                // // heading = heading - target
                // if (heading < -180) { heading = heading + 360 }
                // console.log('heading', theta);

            }
        });
    }
})

module.exports = new SensorSystem()