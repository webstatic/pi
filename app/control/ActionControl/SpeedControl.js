const SystemConfig = require("../../driver/SystemConfig.js")
const SensorSystem = require('../../driver/SensorSystem.js');
const ServoControl = require("../../driver/ServoControl.js");

//const ActionControl = require("../ActionControl.js")

var Backbone = require("backbone");

let SpeedControl = Backbone.Model.extend({

    defaults: {
        enable: false,
        enginePower: 30,
        targetSpeed: 0
    },

    initialize: function () {
        this.updateTargetSpeed()
    },

    start: function () {
        console.log('startSpeedControl');
        this.set('enable', true)
        this.updateTargetSpeed()
        SensorSystem.gps.on('change:speed', this.updateSpeed, this)
    },
    strop: function name(params) {
        console.log('stopSpeedControl');
        SensorSystem.gps.off('change:speed', this.updateSpeed)
    },

    startingPower: 65,
    normalPower: 90,
    maxPower: 120,

    //loop is abound 1s
    updateSpeed: function () {
        let currentSpeed = SensorSystem.gps.get('speed')
        let targetSpeed = this.get('targetSpeed')

        if (currentSpeed != undefined && targetSpeed != undefined) {
            let speedDiff = targetSpeed - currentSpeed

            if (speedDiff > 1) {
                if (speedDiff > 10) {
                    this.set('enginePower', this.maxPower)
                } else { //if speedDiff <= 10
                    let currentPower = this.get('enginePower')
                    currentPower = currentPower + 1
                    this.set('enginePower', currentPower)
                }
            } else if (speedDiff < -1) {
                let currentPower = this.get('enginePower')
                if (speedDiff < -10) {
                    currentPower = currentPower - 5
                } else {
                    currentPower = currentPower - 1
                }
                this.set('enginePower', currentPower)
            }
            this.updateEnginePower()
        }
    },

    updateTargetSpeed: function (targetSpeed) {
        if (targetSpeed != undefined) {
            SystemConfig.set('targetSpeed', targetSpeed)
        } else {
            targetSpeed = SystemConfig.get('targetSpeed', targetSpeed)
        }
        if (targetSpeed != undefined) {
            this.set('targetSpeed', targetSpeed)
            return true
        }

    },
    updateEnginePower: function () {
        let currentPower = this.get('enginePower')
        ServoControl.setDegree(ServoControl.planeToPin['engine'], currentPower)
    },
    setEnginePower: function (power) {
        this.set('enginePower', power)
        ServoControl.setDegree(ServoControl.planeToPin['engine'], power)
    }

})

module.exports = new SpeedControl()