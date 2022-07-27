// var mpu6050 = require('mpu6050');

// // Instantiate and initialize.
// var mpu = new mpu6050();
// mpu.initialize();

// // Test the connection before using.
// mpu.testConnection(function(err, testPassed) {
//   if (testPassed) {
//       setInterval(() => {
//         mpu.getRotation(function(err, data){
//             console.log(data);
//           });
//           // Put the MPU6050 back to sleep.
//          // mpu.setSleepEnabled(1);
//       }, 100);

//   }
// });

var i2c = require('i2c-bus');
var MPU6050 = require('../driver/i2c-mpu6050');

var address = 0x68;
var i2c1 = i2c.openSync(1);

var sensor = new MPU6050(i2c1, address);

setInterval(() => {
    try {
        // var data = sensor.readSync();
        // console.log(data.rotation);
        // console.log(sensor.readGyroSync());
        console.log(sensor.readAccelSyncRaw());

    } catch (error) {

    }

}, 50);
