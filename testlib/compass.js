// var HMC5883L = require('compass-hmc5883l');

// // Connect with the HMC5883L compass on i2c bus number 2
// var compass = new HMC5883L(1);

// // Get the compass values between x and y.  Heading is returned in degrees.
// compass.getHeadingDegrees('x', 'y', function (err, heading) {
//     console.log(heading);
// });

// // The following reading will return {x, y, z} values in milli Tesla:
// compass.getRawValues(function (err, vals) {
//     console.log(vals);
// });

// var HMC5883L = require("./hmc5883l-pi.js");
// var data = HMC5883L.readMag();
// console.log("Got compass data!");
// console.dir(data);
// console.log("x=" + data.x + ", y=" + data.y + ", z=" + data.z);


var hmc5883l = require('./hmc2.js');
var math = require('mathjs');

var xval = -1;
var yval = -1;
var zval = -1;

var bearing = -1;

hmc5883l.Initialize(function (err, data) {

    hmc5883l.SetUp(function (err) {
        //console.log("Commencing")
    });
    for (var i = 1; i <= 6; i++) {
        hmc5883l.readX(function (err, data) {
            //console.log("X value =", data);
            xval = data;
        });
        // hmc5883l.readY(function(err, data){
        //   console.log("Y value =", data);
        //   yval = data;
        // });
        // bearing = math.atan2(yval, xval) + .48;
        hmc5883l.readZ(function (err, data) {
            //console.log("Z value =", data);
            zval = data;
        });
        bearing = math.atan2(zval, xval) + .48;
        if (bearing < 0) {
            bearing += 2 * math.pi;
        }
        bearing = bearing * (180 / math.pi);
        console.log("Bearing =", bearing);
    }

});