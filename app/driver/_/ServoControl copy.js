var servoblaster = require('servoblaster');

console.log('Init servo control');
var stream = servoblaster.createWriteStream(); // Open pin 0 (optional)

var min = 0;
var max = 100;


// Examples
//stream.write(50); // Specify as a number of steps
// stream.write((min + max * (degree / 180)) + '%'); // Specify as a percentage
// stream.write('1500us'); // Specify as microseconds
// stream.write({ pin: 0, value: 150 }); // Specify ServoBlaster ID
// stream.write({ pin: 'P1-7', value: 150 }); // Specify pin number

// stream.end();

let ServoControl = {}
ServoControl.state = []
ServoControl.setDegree = function (pinId, degree) {
    this.state[pinId] = degree
    stream.write({ pin: pinId, value: (min + max * (degree / 180)) + '%' }); // Specify ServoBlaster ID
}

ServoControl.killServos = function () {
    require('node-cmd').run("sudo killall servod");
}

ServoControl.startServos = function () {
    require('node-cmd').run("sudo servod");
}
// var i = 0;

// setInterval(() => {

//     setDegree(0, i)
//     i = i+1
//     if(i>180){
//         i = 0
//     }

// }, 5);

module.exports.setDegree = ServoControl.setDegree;

module.exports.ServoControl = ServoControl;