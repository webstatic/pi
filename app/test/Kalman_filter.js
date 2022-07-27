////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 				Kalman filter									   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////

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


var i2c = require('i2c-bus');
var MPU6050 = require('../driver/i2c-mpu6050.js');

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

console.log('------------------(START SCRIPT)------------------');
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
var dt = 0;

timer = micros();

var interval;

var kalAngleX = 0,
    kalAngleY = 0,
    kalAngleZ = 0,
    gyroXangle = roll,
    gyroYangle = pitch,
    // gyroZangle = yaw,
    gyroXrate = 0,
    gyroYrate = 0,
    // gyroZrate = 0,
    compAngleX = roll,
    compAngleY = pitch;
// compAngleZ = yaw;

interval = setInterval(function () {
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

    // var accel = {
    //     pitch: compAngleY,
    //     roll: compAngleX
    // };
    console.log(parseInt(compAngleY), parseInt(compAngleX));


    // var magneto = mpu.getCompass(values[6], values[7], values[8]);
    // console.log(values[6] + ' ' + values[7] + ' ' + values[8]);
    // console.log(magneto);
    // socket.emit('accel_data', { accel: accel, magneto: magneto });
}, 10);