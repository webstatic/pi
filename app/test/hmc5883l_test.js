var HMC5883L = require('../driver/_/Compass.js')
console.log("start hmc5883l");
// Connect with the HMC5883L compass on i2c bus number 2
console.log(HMC5883L);
var compass = new HMC5883L(1);



target = 0
function processs() {
    // The following reading will return {x, y, z} values in milli Tesla:
    // compass.getRawValues(function (err, result) {
    //     //console.log(result);
    //     var Heading = Math.atan2(result.x, result.z)
    //     if (Heading < 0) {// Check for sign
    //         Heading = Heading + 2 * Math.PI
    //     }

    //     Heading = Heading * 180 / Math.PI

    //     Heading = Heading - 180 - target
    //     if (Heading < -180) { Heading = Heading + 360 }

    //     console.log(Heading);

    //     // Get the compass values between x and y.  Heading is returned in degrees.

    //    ;
    // });
    compass.getHeadingDegrees('z', 'x', target, function (err, heading) {
        console.log(heading);
        setTimeout(() => {
            processs()
        }, 100)
    });
}
processs()

