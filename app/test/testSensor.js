// const { sensor } = require('../driver/SensorSystem.js');
var SensorSystem = require('../driver/SensorSystem.js');


// SensorSystem.updateListener = function (sensor) {
//     console.log(sensor);
// }


// SensorSystem.gpsLatLonUpdateListener = function (lat, lon) {
//     console.log("positon:", lat, lon);
// }


// SensorSystem.altitudeUpdateListener = function (alt) {
//     console.log('alt:', alt);
// }
// SensorSystem.gpsAltUpdateListener = function (alt) {
//     console.log('altgps:', alt);
// }

// SensorSystem.gpsSpeedUpdateListener = function (speed) {
//     console.log("speed:", speed);
// }


// SensorSystem.sensor.on("change:temperature", function (model, v) {
//     console.log(v);
// })

SensorSystem.gps.on("change", function (model, v) {
    console.log(model.attributes);
})