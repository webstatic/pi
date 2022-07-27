// require("./gps_test.js")

// require("./servo_test.js")
// require("./hmc5883l_test.js")
// require("./mpu6050_test.js")

var gyro = require("mpu6050-gyro");

var address = 0x68; //MPU6050 address
var bus = 1; //i2c bus used

var gyro = new gyro(bus, address);


const bmp180 = require('bmp180-sensor')
//var sealevel = 99867; // current sea level pressure in Pa

sealevel = 101325;
var getAltitude = function (pressure, sealevel) {
    return 44330 * (1 - Math.pow(pressure / sealevel, 1 / 5.255));
};


var HMC5883L = require('../driver/Compass.js')

var compass = new HMC5883L(1);


rollpitch = null

altitude = null
temperature = null

Heading = null

sensorUpdate = null

async function initSensor() {
    var sensor = await bmp180({
        address: 0x77,
        mode: 1,
    })

    async function update_telemetry() {

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
                temperature = data.temperature
                altitude = getAltitude(data.pressure, sealevel)
                //console.log(altitude, temperature);
            }

        } catch (error) {
            console.log('bmp', error);
        }

        try {
            var gyro_xyz = await gyro.get_gyro_xyz();
            var accel_xyz = await gyro.get_accel_xyz();
            rollpitch = await gyro.get_roll_pitch(gyro_xyz, accel_xyz)
            //console.log(rollpitch);
        } catch (error) {
            console.log('gyro', error);
        }

        try {
            compass.getHeadingDegrees('z', 'x', target, async function (err, heading) {
                Heading = heading
              
                if (sensorUpdate) sensorUpdate(Heading, rollpitch, altitude)
                await setTimeout(() => {
                    update_telemetry()
                }, 100);
            })
        } catch (error) {
            console.log('Compass', error);

            if (sensorUpdate) sensorUpdate(Heading, rollpitch, altitude)
            await setTimeout(() => {
                update_telemetry()
            }, 100);
        }
    }

    if (gyro) {
        await update_telemetry();
    }

    // console.log(data)
    // console.log(getAltitude(data.pressure, sealevel), data);
    // 
}

initSensor();
