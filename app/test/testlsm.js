
var lsm303 = require('lsm303');

var ls = new lsm303();

// var accel = ls.accelerometer();
var mag = ls.magnetometer();

// accel.readAxes(function(err,axes){
//     if(err){
//         console.log("Error reading Accelerometer Axes : " + err);
//     }
//     if (axes) {
//         console.log(axes);
//     }
// });

// mag.readAxes(function(err,axes){
//     if(err){
//         console.log("Error reading Magnetometer Axes : " + err);
//     }
//     if (axes) {
//         console.log(axes);
//     }
// });
//mag.setOffset(-19.5, 163, -92.5)
// mag.setOffset(83.5, -6, 135.5)

const twoPies = 2 * Math.PI;
setInterval(() => {
    // Non-tilt-compensated readHeading function
    mag.readAxes(function (err, axes) {
        if (err) {
            console.log("Error reading Magnetometer Heading : " + err);
        }
        if (axes) {

            var theta = Math.PI / 2 - Math.atan2(axes.y, axes.x);
            if (theta < 0) {
                theta += 2 * Math.PI;
            }
            theta = 2 * Math.PI - theta;
            theta = (180 / Math.PI * theta);
            theta = ((theta != 360) ? theta : 0);
           
            theta = theta - 180

            
            if (theta < -180) { theta = theta + 360 }
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
            console.log('heading', theta);

        }
    });
}, 100);


// mag.readTemp(function(err,temp){
//     if(err){
//         console.log("Error reading Temperature : " + err);
//     }
//     if (temp) {
//         console.log(temp);
//     }
// });