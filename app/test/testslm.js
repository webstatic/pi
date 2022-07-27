const geomagnetism = require('geomagnetism');

// // information for "right now"
const geomagnetisminfo = geomagnetism.model().point([8.69720080, 98.24132320]);
console.log('declination:', geomagnetisminfo.decl);

var lsm303 = require('lsm303');
var ls = new lsm303();
var mag = ls.magnetometer();

// mag.setOffset(-69.5, -104.5, 50.5)
//mag.setOffset(8.5, 377, -160.5)
mag.setOffset(-3, 268.5, -44.5)

//
var lastheading = null
var lastcompassHeading = null

var compassCaltheta = function (axes) {
    let declination = geomagnetisminfo.decl / 180 * Math.PI
    var theta = Math.PI / 2 - (Math.atan2(axes.y, axes.x) + declination);
    if (theta < 0) {
        theta += 2 * Math.PI;
    }
    theta = 2 * Math.PI - theta;
    theta = (180 / Math.PI * theta);
    theta = ((theta != 360) ? theta : 0);

    theta = (theta - 180) * -1

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

            console.log(axes);
            // let theta = compassCaltheta(axes)
            // let compassHeading = theta;

            // //theta = theta - self.get('target')

            // if (theta < -180) { theta = theta + 360 }
            // let heading = theta

            // if (lastheading != heading || lastcompassHeading != compassHeading) {
            //     // self.update = true;
            //     lastheading = heading
            //     lastcompassHeading = compassHeading
            //     //self.sensor.set({ heading: heading, compassHeading: compassHeading })

            //     process.send({
            //         type: 'cp',
            //         heading: heading, compassHeading: compassHeading
            //     });
            // }

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
        console.log('mpu', error);
    }

}, 10);
