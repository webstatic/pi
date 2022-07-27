// listen for messages from the parent process
process.on("message", message => {
    // let isPrime = checkIfPrime(message);
    // // send the results back to the parent process
    // process.send(isPrime);
    // // kill the child process
    // process.exit();
    if (message.type == 'update_currentSeaLevel') {
        // console.log('update_currentSeaLevel', currentPressure);
        let newcurrentSeaLevle = getSeaLevel(message.currentPressure, message.altitude)
        if (Math.abs(newcurrentSeaLevle - sealevel) < 5000) {
            currentSeaLevle = newcurrentSeaLevle
            console.log('update currentSeaLevle:', currentSeaLevle);
        }
    }
    console.log('form child', message);
})
var cleanExit = function () {
    console.log('Sensor process.exit()');
    process.exit()
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill
process.on('exit', cleanExit); // catch exit

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

let sealevel = 101325;
let currentSeaLevle = null
// let currentPressure = null
let getAltitude = function (pressure, sealevel) {
    return 44330 * (1 - Math.pow(pressure / sealevel, 1 / 5.255));
};
let getSeaLevel = function (pressure, altitude) {
    return pressure / Math.pow(1 - (altitude / 44330), 5.255);
};

////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 				Kalman filter									   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////
KalmanFilter = require("../kalman.js")

//var KalmanFilter = require('kalmanjs');

// var kf = new KalmanFilter();
// var kf = new KalmanFilter({ R: 0.01, Q: 3 });
var kf = new KalmanFilter({ R: 0.01 });

// console.log(kf.filter(3));
// console.log(kf.filter(2));
// console.log(kf.filter(1));


var util = {}
util.Kalman_filter = function () {
    this.Q_angle = 0.001;
    this.Q_bias = 0.003;
    this.R_measure = 0.03;

    this.angle = 0;
    this.bias = 0;
    this.rate = 0;

    this.P = [[0, 0], [0, 0]];

    this.S = 0;
    this.K = [];
    this.Y = 0;

    this.getAngle = function (newAngle, newRate, dt) {

        this.rate = newRate - this.bias;
        this.angle += dt * this.rate;

        this.P[0][0] += dt * (dt * this.P[1][1] - this.P[0][1] - this.P[1][0] + this.Q_angle);
        this.P[0][1] -= dt * this.P[1][1];
        this.P[1][0] -= dt * this.P[1][1];
        this.P[1][1] += this.Q_bias * dt;

        this.S = this.P[0][0] + this.R_measure;

        this.K[0] = this.P[0][0] / this.S;
        this.K[1] = this.P[1][0] / this.S;

        this.Y = newAngle - this.angle;

        this.angle += this.K[0] * this.Y;
        this.bias += this.K[1] * this.Y;

        this.P[0][0] -= this.K[0] * this.P[0][0];
        this.P[0][1] -= this.K[0] * this.P[0][1];
        this.P[1][0] -= this.K[1] * this.P[0][0];
        this.P[1][1] -= this.K[1] * this.P[0][1];

        return this.angle;
    };

    this.getRate = function () { return this.rate; };
    this.getQangle = function () { return this.Q_angle; };
    this.getQbias = function () { return this.Q_bias; };
    this.getRmeasure = function () { return this.R_measure; };

    this.setAngle = function (value) { this.angle = value; };
    this.setQangle = function (value) { this.Q_angle = value; };
    this.setQbias = function (value) { this.Q_bias = value; };
    this.setRmeasure = function (value) { this.R_measure = value; };
};


function main() {
    try {
        console.log('------------------(START Sensors)------------------');
        const geomagnetism = require('geomagnetism');

        // // information for "right now"
        const geomagnetisminfo = geomagnetism.model().point([8.69720080, 98.24132320]);
        console.log('declination:', geomagnetisminfo.decl);

        var lsm303 = require('lsm303');
        var ls = new lsm303();
        var mag = ls.magnetometer();

        // mag.setOffset(-69.5, -104.5, 50.5)
        // mag.setOffset(8.5, 377, -160.5)
        // mag.setOffset(-3, 268.5, -44.5)
        // mag.setOffset(11.5, 203.5, 29)
        mag.setOffset(2.5, 366.5, -149)

        var lastcompassHeading = null

        let buffercal = new BufferCal(10)

        var compassCaltheta = function (axes) {
            let declination = geomagnetisminfo.decl / 180 * Math.PI
            var theta = Math.PI / 2 - (Math.atan2(axes.y, axes.x) + declination);
            if (theta < 0) {
                theta += 2 * Math.PI;
            }
            theta = 2 * Math.PI - theta;
            theta = (180 / Math.PI * theta);
            theta = ((theta != 360) ? theta : 0);

            return theta
        }

        var updateCommpass = function () {
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

                    let theta = compassCaltheta(axes)

                    //theta = parseInt(theta)
                    // let kfvalue = kf.filter(theta)
                    // theta = Math.round(theta)

                    buffercal.puch(theta)
                    let variance = buffercal.Circularvariance()

                    // console.log(variance);
                    //theta = theta

                    // if (theta < -180) { theta = theta + 360 }
                    theta = (theta - 180) * -1

                    let compassHeading = theta;

                    //let heading = theta - self.get('target')

                    if (lastcompassHeading != compassHeading) {
                        // self.update = true;

                        lastcompassHeading = compassHeading
                        //self.sensor.set({ heading: heading, compassHeading: compassHeading })

                        process.send({
                            type: 'cp',
                            compassHeading: compassHeading,
                            variance: variance
                            //kfvalue: kfvalue
                        });
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

        setInterval(function () {
            try {
                updateCommpass();
            } catch (error) {
                //console.log('mpu', error);
            }

        }, 10);

        /////////////////////////////////////////////////////////////////////

        var i2c = require('i2c-bus');
        var MPU6050 = require('../i2c-mpu6050.js');

        var address = 0x68;
        var i2c1 = i2c.openSync(1);

        var sensor = new MPU6050(i2c1, address);

        // setInterval(() => {
        //     try {
        //         // var data = sensor.readSync();
        //         // console.log(data.rotation);
        //         console.log(sensor.readGyroSync());
        //         console.log(sensor.readAccelSync());
        //     } catch (error) {

        //     }

        // }, 100);

        // var port = 3031;
        // var io = require('socket.io').listen(port);
        // var mpu9250 = require('mpu9250');

        // var mpu = new mpu9250({ UpMagneto: true, DEBUG: false, GYRO_FS: 0, ACCEL_FS: 1 });

        var timer = 0;

        var kalmanX = new util.Kalman_filter();
        var kalmanY = new util.Kalman_filter();

        // console.log('MPU VALUE : ', mpu.getMotion9());
        // console.log('listen to 0.0.0.0:' + port);
        // console.log('Temperature : ' + mpu.getTemperatureCelsius());

        function toDegrees(angle) {
            return angle * (180 / Math.PI);
        }

        function dist(a, b) {
            return Math.sqrt(a * a + b * b);
        }

        function getRotation(a, b, c) {
            var radians = Math.atan2(a, dist(b, c));
            return -toDegrees(radians);
        }

        var getPitch = function (value) {
            // console.log(((Math.atan2(value.y, value.z) + Math.PI) * (180 / Math.PI)) - 180);
            // return ((Math.atan2(value.y, value.z) + Math.PI) * (180 / Math.PI)) - 180;
            return getRotation(value.y, value.x, value.z);
        };

        var getRoll = function (value) {
            // console.log(((Math.atan2(value.x, value.z) + Math.PI) * (180 / Math.PI)) - 180);
            // return ((Math.atan2(value.x, value.z) + Math.PI) * (180 / Math.PI)) - 180;
            return getRotation(value.x, value.y, value.z);
        };

        var values = sensor.readAccelSyncRaw();
        var pitch = getPitch(values);
        var roll = getRoll(values);
        // var yaw = mpu.getYaw(values);

        console.log('pitch value : ', pitch);
        console.log('roll value : ', roll);
        // console.log('yaw value : ', yaw);

        kalmanX.setAngle(roll);
        kalmanY.setAngle(pitch);

        var micros = function () {
            return new Date().getTime();
        };
        // var dt = 0;

        timer = micros();


        var kalAngleX = 0,
            kalAngleY = 0,
            // kalAngleZ = 0,
            gyroXangle = roll,
            gyroYangle = pitch,
            // gyroZangle = yaw,
            // gyroXrate = 0,
            // gyroYrate = 0,
            // gyroZrate = 0,
            compAngleX = roll,
            compAngleY = pitch;
        // compAngleZ = yaw;

        var lastintcompAngleY, lastintcompAngleX

        function processmpu() {
            var values = sensor.readAccelSyncRaw();

            var dt = (micros() - timer) / 1000000;
            timer = micros();

            pitch = getPitch(values);
            roll = getRoll(values);
            // yaw = mpu.getYaw(values);

            // console.log('pitch value : ', pitch);
            // console.log('roll value : ', roll);

            //console.log(parseInt(pitch), parseInt(roll));

            var gyroData = sensor.readGyroSyncRaw()

            var gyroXrate = gyroData.x / 131.0;
            var gyroYrate = gyroData.y / 131.0;
            // var gyroZrate = values[5] / 131.0;

            if ((roll < -90 && kalAngleX > 90) || (roll > 90 && kalAngleX < -90)) {
                kalmanX.setAngle(roll);
                compAngleX = roll;
                kalAngleX = roll;
                gyroXangle = roll;
            } else {
                kalAngleX = kalmanX.getAngle(roll, gyroXrate, dt);
            }

            if (Math.abs(kalAngleX) > 90) {
                gyroYrate = -gyroYrate;
            }
            kalAngleY = kalmanY.getAngle(pitch, gyroYrate, dt);

            gyroXangle += gyroXrate * dt;
            gyroYangle += gyroYrate * dt;
            compAngleX = 0.93 * (compAngleX + gyroXrate * dt) + 0.07 * roll;
            compAngleY = 0.93 * (compAngleY + gyroYrate * dt) + 0.07 * pitch;

            if (gyroXangle < -180 || gyroXangle > 180) gyroXangle = kalAngleX;
            if (gyroYangle < -180 || gyroYangle > 180) gyroYangle = kalAngleY;

            let intcompAngleY = parseInt(compAngleY)
            let intcompAngleX = parseInt(compAngleX)

            if (lastintcompAngleY != intcompAngleY || lastintcompAngleX != intcompAngleX) {
                lastintcompAngleY = intcompAngleY
                lastintcompAngleX = intcompAngleX
                // var accel = {
                //     pitch: intcompAngleY,
                //     roll: intcompAngleX
                // };
                process.send({
                    type: 'rp',
                    pitch: intcompAngleY,
                    roll: intcompAngleX
                });
            }

            // console.log(parseInt(compAngleY), parseInt(compAngleX));


            // var magneto = mpu.getCompass(values[6], values[7], values[8]);
            // console.log(values[6] + ' ' + values[7] + ' ' + values[8]);
            // console.log(magneto);
            // socket.emit('accel_data', { accel: accel, magneto: magneto })
        }

        setInterval(function () {
            try {
                processmpu();
            } catch (error) {
                //console.log('mpu', error);
            }

        }, 10);


        ///////////////////////////////////////////////////////

        const bmp180 = require('bmp180-sensor')
        //var sealevel = 99867; // current sea level pressure in Pa

        // var AltConverter = require('altitude-pressure-converter');

        // var pressureToAltitude_config = {
        //     temp: 30,
        //     altitude: 1000, // required for altitudeToPressure()
        //     pressure: 97722,
        //     pressureAtAltitude: 101325, //97716.57, // required for pressureToAltitude()
        //     units: {
        //         temp: 'C',
        //         altitude: 'm',
        //         pressure: 'atm'
        //     }
        // };


        // var getAltitude = function (pressure, temp) {
        //     pressureToAltitude_config.temp = temp
        //     pressureToAltitude_config.pressure = pressure
        //     return AltConverter.pressureToAltitude(pressureToAltitude_config)
        // };

        var lastTemp, lastalt;

        async function readBmp180() {
            const sensor = await bmp180({
                address: 0x77,
                mode: 1,
            })

            const data = await sensor.read()

            if (data) {
                let temperature = data.temperature
                let pressure = data.pressure
                //console.log('pressure', pressure);
                let altitude = currentSeaLevle ? getAltitude(pressure, currentSeaLevle) : null
                //console.log(altitude, data.pressure);
                let def = Math.abs(lastalt - altitude)

                // console.log(def);
                if (lastalt && def < 0.5) {
                    altitude = lastalt
                }

                if (lastTemp != temperature || lastalt != altitude) {
                    //self.update = true;
                    lastTemp = temperature
                    lastalt = altitude
                    process.send({
                        type: 'bmp',
                        temperature: temperature,
                        altitude: altitude,
                        pressure: pressure
                    });
                }
            }
            // console.log(data)

            await sensor.close()
        }

        setInterval(() => {
            try {
                readBmp180()
            } catch (error) {
                //console.log('bmp', error);
            }
        }, 100);

    } catch (error) {
        console.log(error);
        setTimeout(() => {
            main()
        }, 1000);
    }

}
main()


///////////////////////////////////////////////////////
