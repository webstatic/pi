const SystemConfig = require("../driver/SystemConfig.js")
const SensorSystem = require('../driver/SensorSystem.js');
const ServoControl = require("../driver/ServoControl.js");
const GPS = require("gps");
var Backbone = require("backbone");
const Waypoints = require('../modules/Waypoints.js');

// let startPwm = 55
// let endPwm = 125

// let range = endPwm - startPwm;
// let deg = 1;

// let mid = startPwm + range / 2 + 15
// function setTimeoutPromise(delay) {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve();
//         }, delay);
//     });
// }


let ActionControl = Backbone.Model.extend({
    //turn_left , trun_right
    // state: {
    //     speed: 30
    // },
    defaults: {
        enable: false,

        positionControl_enable: false,
        altitudeControl_enable: false,
        speedControl_enable: false,

        mode: 'manual',//'fryInDistance'

    },
    initialize: function () {

        this.PositionControl = require("./ActionControl/PositionControl.js")
        this.AltitudeControl = require("./ActionControl/AltitudeControl.js")
        this.SpeedControl = require("./ActionControl/SpeedControl.js")

        this.PositionControl.on("change:currentTarget", function (currentTarget) {
            console.log('currentTarget change', currentTarget);
        })
    },
    updateStayAltitude: function (alt) {
        this.AltitudeControl.updateStayAltitude(alt)
    },
    
    start: function () {
        console.log('ActionControl start');
        this.set('enable', true)
        this.set('positionControl_enable', true)
        this.PositionControl.start()
    },
    stop: function () {
        console.log('ActionControl stop ');
        this.set('enable', false)
        this.set('positionControl_enable', false)
        this.PositionControl.stop()
    },

    startAltitudeControl: function () {
        //console.log('startAltControl');
        this.set('altitudeControl_enable', true)
        this.AltitudeControl.start()
    },
    stopAltitudeControl: function () {
        //console.log('stopAltControl');
        this.set('altitudeControl_enable', false)
        this.AltitudeControl.stop()
    },

    startSpeedControl: function () {
        //console.log('startSpeedControl');
        this.set('speedControl_enable', true)
        this.SpeedControl.start()
    },
    stopSpeedControl: function name(params) {
        //console.log('stopSpeedControl');
        this.set('speedControl_enable', false)
        this.SpeedControl.stop()
    },

})

module.exports = new ActionControl()