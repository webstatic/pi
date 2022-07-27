//var HMC5883L = require('compass-hmc5883l');
var HMC5883L = require('../driver/_/Compass.js');

// Connect with the HMC5883L compass on i2c bus number 2

Calibrated = {
  offset: { x: -16.5, y: 31.5, z: 218.5 },
  // scale: {
  //   x: 0.9863680623174295,
  //   y: 0.9768563162970106,
  //   z: 1.038974358974359
  // }
}


const geomagnetism = require('geomagnetism');

// information for "right now"
const geomagnetisminfo = geomagnetism.model().point([8.864361833333334, 98.35732866666666]);
console.log('declination:', geomagnetisminfo.decl);

var options = {
  /*
   * Pass the i2c library as an option.  This saves us from loading the
   * library twice.
   */
  //i2c: i2c,

  /*
   * The sample rate (Hz), must be one of '0.75', '1.5', '3', '7.5',
   * '15', '30', or '75'.  Default is '15' Hz (samples per second).
   */
  //sampleRate: '15', /* default */

  /*
   * The declination, in degrees.  If this is provided the result
   * will be true north, as opposed to magnetic north. See the
   * following link: https://www.npmjs.com/package/geomagnetism
   */
  //declination: geomagnetisminfo.decl,

  /*
   * The scale range to use.  See pp13 of the technical documentation.
   * Different expected magnetic intensities  require different scales.
   */
  //scal: '8.1', /* default */

  /*
   * The calibrated values.  Default offsets are 0.  Default scale values are 1.0.
   */
  calibration: Calibrated
};




var compass = new HMC5883L(1, options);


// var compass = new HMC5883L(1);

setInterval(() => {
  // Get the compass values between x and y.  Heading is returned in degrees.
  compass.getHeadingDegrees('z', 'x', 0, function (err, heading, compassHeading) {
    console.log(compassHeading);
  });

  // compass.getRawValues(function (err, value) {
  //   console.log(value);
  // })
  // The following reading will return { x, y, z } values in milli Tesla:
  // compass.getRawValues(function (err, vals) {
  //     console.log(vals.x);
  // });


}, 100);



// var Compass = require('compass-hmc5883l');
// var compass = new Compass(1);

// // Gets called every time we get the values.
// function printHeadingCB(err, heading) {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log(heading * 180 / Math.PI);
// }

// // Get the compass values every 100 milliseconds
// setInterval(function() {
//     compass.getHeading('z', 'x', printHeadingCB);
// }, 100);

