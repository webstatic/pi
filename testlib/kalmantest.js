KalmanFilter = require("./node_modules/kalmanjs/lib/kalman")

//var KalmanFilter = require('kalmanjs');

// var kf = new KalmanFilter();
var kf = new KalmanFilter({ R: 0.01, Q: 3 });

console.log(kf.filter(3));
console.log(kf.filter(2));
console.log(kf.filter(1));
