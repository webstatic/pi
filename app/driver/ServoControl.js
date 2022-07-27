const SystemConfig = require("../driver/SystemConfig.js")
var servoblaster = require('servoblaster');
var Backbone = require("backbone");

var cmd = require('node-cmd');


// var gpio = require('rpi-gpio');
// gpio.setup(29, gpio.DIR_OUT, write);

var Gpio = require('onoff').Gpio
var ananlogControlPin = new Gpio(5, 'out');
ananlogControlPin.write(1);

function write(err) {
    if (err) throw err;
    gpio.write(29, false, function (err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}

console.log('Init servo control');
var stream = servoblaster.createWriteStream(); // Open pin 0 (optional)

let min = 0;
let max = 100;

let startDegree = 45;
let endDegree = 135;

let range = endDegree - startDegree;
let deg = 1;

let mid = startDegree + range / 2 //+ 15;

// console.log('mid', mid);

// Examples
//stream.write(50); // Specify as a number of steps
// stream.write((min + max * (degree / 180)) + '%'); // Specify as a percentage
// stream.write('1500us'); // Specify as microseconds
// stream.write({ pin: 0, value: 150 }); // Specify ServoBlaster ID
// stream.write({ pin: 'P1-7', value: 150 }); // Specify pin number

// stream.end();

// let ServoControl = {}

let ServoControl = Backbone.Model.extend({
    enable: true,
    // planeToPin: {
    //     'engine': '2',
    //     'rudder': '3',
    //     'elevator': '1',
    //     'ailerons': '0',//0
    //     'mode': '5'
    // },
    //    planeToPin: {
    //     'engine': '3',
    //     'rudder': '4',
    //     'elevator': '2',
    //     'ailerons': '1',//0
    //     'mode': '6'
    // },
    planeToPin: {
        'engine': '4',
        'rudder': '3',
        'elevator': '5',
        'ailerons': '6',//0
        'mode': '2'
    },
    defaults: {
        offsetsDefault: {
            min: 0,
            max: 100
        },
        offsets: {

        }
    },
    initialize: function () {
        console.log('initialize ServoControl');

        // this.startDegree = 55
        // this.endDegree = 125

        // this.range = endDegree - startDegree;
        // this.deg = 1;

        // this.mid = startDegree + range / 2 + 15
        this.state = {};
        // this.setDefault()
        this.loadOffsets()
    },
    loadOffsets: function () {
        let offset_ailerons = SystemConfig.get('offset_ailerons')
        let offset_elevator = SystemConfig.get('offset_elevator')
        let offset_rudder = SystemConfig.get('offset_rudder')

        offset_ailerons = offset_ailerons ? offset_ailerons : 0
        offset_elevator = offset_elevator ? offset_elevator : 0
        offset_rudder = offset_rudder ? offset_rudder : 0

        this.attributes.offsets[this.planeToPin['ailerons']] = offset_ailerons
        this.attributes.offsets[this.planeToPin['elevator']] = offset_elevator
        this.attributes.offsets[this.planeToPin['rudder']] = offset_rudder
    },

    getOffset: function () {
        return {
            ailerons: this.attributes.offsets[this.planeToPin['ailerons']],
            elevator: this.attributes.offsets[this.planeToPin['elevator']],
            rudder: this.attributes.offsets[this.planeToPin['rudder']]
        }
    },
    setDefault: function () {
        console.log('setDefault');
        this.setDegree(this.planeToPin['ailerons'], 90)
        this.setDegree(this.planeToPin['elevator'], 90)
        this.setDegree(this.planeToPin['rudder'], 90)

        this.setDegree(this.planeToPin['mode'], 135)

        this.setDegree(this.planeToPin['engine'], 40)
    },
    setDegree: function (pinId, degree) {
        console.log('setDegree', pinId, degree);
        if (this.enable) {
            // if (this.planeToPin['elevator'] == pinId) {
            //     let temp = 90 - degree
            //     degree == 90 + temp
            // }

            if (Object.hasOwnProperty.call(this.attributes.offsets, pinId)) {
                degree += this.attributes.offsets[pinId]
            }

            this.state[pinId] = degree
            let value = (min + max * (degree / 180));

            stream.write({ pin: pinId, value: value + '%' }); // Specify ServoBlaster ID
            return value;
        }
    },
    setRatio: function (pinId, value) {

        var move = mid + (value * (range / 2) * deg);
        //move = Math.floor(move)
        this.setDegree(pinId, move);

        return move;
    }, setRatioPart: function (part, value) {
        let pinId = this.planeToPin[part]
        if (pinId != undefined)
            this.setRatio(pinId, value);
    },
    killServos: function () {
        this.enable = false;
        console.log('killServos');
        cmd.run("killall servod");
        ananlogControlPin.write(1);
        //gpio.write(29, true);

    }, startServos: function (cb) {

        ananlogControlPin.write(0);
        stream.destroy()

        console.log('startServos');
        // cmd.run("servod"); 
        // cmd.run("/root/PiBits/ServoBlaster/user/servod --p1pins=7,11,12,13,15,16,0,22");
        cmd.run("/root/PiBits/ServoBlaster/user/servod");

        setTimeout(() => {
            stream = servoblaster.createWriteStream();

            // setTimeout(() => {

            this.enable = true;
            this.setDefault()
            // }, 100);

            if (cb) {
                cb()
            }

        }, 200);
    }

})

module.exports = new ServoControl();

// module.exports.setDegree = module.exports.ServoControl.setDegree;
