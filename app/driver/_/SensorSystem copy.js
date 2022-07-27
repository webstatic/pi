let SensorSystem = {}

SensorSystem.target = 0;
SensorSystem.sensor = {}

SensorSystem.updateListener = null
SensorSystem.update = false;

SensorSystem.sensor.rollpitch = null
SensorSystem.rollpitchUpdateListener = null
SensorSystem.rollpitchUpdate = function (rollpitch) {
    this.sensor.rollpitch = rollpitch;
    if (this.rollpitchUpdateListener) {
        this.rollpitchUpdateListener(rollpitch)
    }
    SensorSystem.update = true

}
SensorSystem.sensor.altitude = null
SensorSystem.altitudeUpdateListener = null
SensorSystem.altitudeUpdate = function (altitude) {
    this.sensor.altitude = altitude;
    if (this.altitudeUpdateListener) {
        this.altitudeUpdateListener(altitude)
    }
    SensorSystem.update = true
}

SensorSystem.sensor.temperature = null
SensorSystem.temperatureUpdateListener = null
SensorSystem.temperatureUpdate = function (temperature) {
    this.sensor.temperature = temperature;
    if (this.temperatureUpdateListener) {
        this.temperatureUpdateListener(temperature)
    }
    SensorSystem.update = true
}

SensorSystem.sensor.heading = null
SensorSystem.sensor.compassHeading = null
SensorSystem.headingUpdateListener = null
SensorSystem.headingUpdate = function (heading, compassHeading) {
    this.sensor.heading = heading;
    this.sensor.compassHeading = compassHeading;

    if (this.headingUpdateListener) {
        this.headingUpdateListener(heading, compassHeading)
    }
    SensorSystem.update = true
}

SensorSystem.gps = {}
SensorSystem.gpsTimeUpdateListener = null
SensorSystem.gpsTimeUpdate = function (time) {
    this.gps.time = time
    if (SensorSystem.gpsTimeUpdateListener) {
        SensorSystem.gpsTimeUpdateListener(time)
    }
}
SensorSystem.gpsLatLonUpdateListener = null
SensorSystem.gpsLatLonUpdate = function (lat, lon) {
    this.gps.lat = lat;
    this.gps.lon = lon;

    if (SensorSystem.gpsLatLonUpdateListener) {
        SensorSystem.gpsLatLonUpdateListener(lat, lon)
    }
}
SensorSystem.gpsAltUpdateListener = null
SensorSystem.gpsAltUpdate = function (alt) {
    this.gps.alt = alt;

    if (SensorSystem.gpsAltUpdateListener) {
        SensorSystem.gpsAltUpdateListener(alt)
    }
}

SensorSystem.gpsSpeedUpdateListener = null
SensorSystem.gpsSpeedUpdate = function (speed) {
    this.gps.speed = speed;

    if (SensorSystem.gpsSpeedUpdateListener) {
        SensorSystem.gpsSpeedUpdateListener(speed)
    }
}




const SerialPort = require("serialport");
const SerialPortParser = require("@serialport/parser-readline");
const GPS = require("gps");

const port = new SerialPort("/dev/serial0", { baudRate: 9600 });
const gps = new GPS();

const parser = port.pipe(new SerialPortParser());

gps.on("data", data => {

    if (data.type == "GGA" || data.type == "RMC" || data.type == "GLL") {

        // delete gps.state.processed;
        // delete gps.state.satsVisible;
        // delete gps.state.satsActive;
        // delete gps.state.errors;
        // delete gps.state.track;
        // delete gps.state.fix;
        // delete gps.state.hdop;
        // delete gps.state.pdop;
        // delete gps.state.vdop;

        // console.log(gps.state)

        if (data.time && data.time != SensorSystem.gps.time) {
            SensorSystem.gpsTimeUpdate(data.time)
        }

        if (data.quality != null || data.status == "active") {
            if (SensorSystem.gps.lat != data.lat || SensorSystem.gps.lon != data.lon) {
                SensorSystem.gpsLatLonUpdate(data.lat, data.lon)
            }

            if (gps.state.alt && gps.state.alt != SensorSystem.gps.alt) {
                SensorSystem.gpsAltUpdate(gps.state.alt)
            }
            if (gps.state.speed && gps.state.speed != SensorSystem.gps.speed) {
                SensorSystem.gpsSpeedUpdate(gps.state.speed)
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
        // console.log(data);
        gps.update(data);
    } catch (e) {
        throw e;
    }
});


var gyro = require("mpu6050-gyro");

var address = 0x68; //MPU6050 address
var bus = 1; //i2c bus used

var gyro = new gyro(bus, address);


const bmp180 = require('bmp180-sensor')
//var sealevel = 99867; // current sea level pressure in Pa

let sealevel = 101325;
var getAltitude = function (pressure, sealevel) {
    return 44330 * (1 - Math.pow(pressure / sealevel, 1 / 5.255));
};


var HMC5883L = require('../driver/Compass.js')

var compass = new HMC5883L(1);


async function initSensor() {
    var sensor = await bmp180({
        address: 0x77,
        mode: 1,
    })

    async function update_telemetry() {
        SensorSystem.update = false
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
                if (SensorSystem.sensor.temperature != temperature) {

                    SensorSystem.temperatureUpdate(temperature)
                }
                if (SensorSystem.sensor.altitude != altitude) {

                    let def = Math.abs(SensorSystem.sensor.altitude - altitude)
                    if (def > 0.5) {
                        SensorSystem.altitudeUpdate(altitude)
                    }

                }
                //console.log(altitude, temperature);
            }

        } catch (error) {
            console.log('bmp', error);
        }

        try {
            var gyro_xyz = await gyro.get_gyro_xyz();
            var accel_xyz = await gyro.get_accel_xyz();

            let rollpitch = await gyro.get_roll_pitch(gyro_xyz, accel_xyz)

            if (SensorSystem.sensor.rollpitch == null || (rollpitch.roll != SensorSystem.sensor.rollpitch.roll || rollpitch.pitch != SensorSystem.sensor.rollpitch.pitch)) {
                SensorSystem.rollpitchUpdate(rollpitch)
            }

            //console.log(rollpitch);
        } catch (error) {
            // console.log('gyro', error);
        }

        try {
            compass.getHeadingDegrees('z', 'x', SensorSystem.target, async function (err, heading, compassHeading) {
                // Heading = heading
                // if (sensorUpdate) sensorUpdate(Heading, rollpitch, altitude)
                if (SensorSystem.sensor.heading != heading || SensorSystem.sensor.compassHeading != compassHeading) {
                    SensorSystem.headingUpdate(heading, compassHeading)
                }

            })
        } catch (error) {
            console.log('Compass', error);
        }

        finally {
            // if (sensorUpdate) sensorUpdate(Heading, rollpitch, altitude)

            if (SensorSystem.updateListener && SensorSystem.update) {
                SensorSystem.updateListener(SensorSystem.sensor)
            }
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
module.exports = SensorSystem