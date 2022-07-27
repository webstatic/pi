var mpu9250 = require('./mpu9250/mpu9250.js');
// Instantiate and initialize.
var mpu = new mpu9250({
    // i2c path (default is '/dev/i2c-1')
    device: '/dev/i2c-1'
});
if (mpu.initialize()) {
    // console.log(mpu.getMotion9());
}