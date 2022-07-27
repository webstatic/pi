const SystemConfig = require("../driver/SystemConfig.js")
// var SensorSystem = require('../driver/SensorSystem.js');
var ServoControl = require("../driver/ServoControl.js");

var Backbone = require("backbone");

// let startPwm = 55
// let endPwm = 125

// let range = endPwm - startPwm;
// let deg = 1;

// let mid = startPwm + range / 2 + 15

let JoyControl = Backbone.Model.extend({
    //turn_left , trun_right
    state: {
        mode: 'manual',
        speed: 30
    },
    initialize: function () {

    },
    updateValue: function (data) {
        if (data.s != undefined) {
            // console.log('control data.s:', parseInt(data.s));
            // ServoControl.setRatioPart('engine', parseInt(data.s))
            ServoControl.setDegree(ServoControl.planeToPin['engine'], data.s)
        }

        if (data.j1 != undefined) {
            // console.log('control data.j1:', (data.j1));
            if (this.state.mode == "manual" || this.state.mode == "stabilize") {

                // var move = mid + (data.j1.x * (range / 2) * deg);
                // move = Math.floor(move)
                // controlData.move = move
                // servos.setDegree(0, move);

                let move = ServoControl.setRatioPart('rudder', data.j1.x)
                //console.log('move:', move);
            }
        }

        if (data.j2 != undefined) {
            // console.log('control data.j2:', (data.j2));
            if (this.state.mode == "manual") {

                // var moveP = mid - (data.j2.y * (range / 2) * deg);
                // moveP = Math.floor(moveP);
                // controlData.moveP = moveP
                // servos.setDegree(1, moveP);

                let moveP = ServoControl.setRatioPart('elevator', data.j2.y)
                //console.log('moveP:', moveP);
                // console.log('moveP:', moveP);

                // var moveR = mid - (data.j2.x * (range / 2) * deg);
                // moveR = Math.floor(moveR)
                // controlData.moveR = moveR
                // servos.setDegree(2, moveR);
                var moveR = ServoControl.setRatioPart('ailerons', data.j2.x * -1)
                //console.log('moveR:', moveR);
            }

        }
    },
    // start: function () {
    //     SensorSystem.sensor.on('change:rollpitch', this.updateRollpitch)
    // }, stop: function () {
    //     SensorSystem.sensor.off('change:rollpitch', this.updateRollpitch)
    // }
})

module.exports = new JoyControl()