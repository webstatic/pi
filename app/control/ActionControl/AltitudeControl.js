const SystemConfig = require("../../driver/SystemConfig.js")
const SensorSystem = require('../../driver/SensorSystem.js');
const ServoControl = require("../../driver/ServoControl.js");

const ActionControl = require("../ActionControl.js")
//const GPS = require("gps");
var Backbone = require("backbone");

let AltitudeControl = Backbone.Model.extend({

    defaults: {
        enable: false,
        stayAltitude: 15,//m

        maxServoMove: 30,
        pitchLimit: 20
    },

    initialize: function () {
        SensorSystem.initGroundAlt()
        this.updateStayAltitude()

        this.initializeParameter()
    },
    initializeParameter: function () {
        console.log('init AltitudeControlParameter');
        if (SystemConfig.has('AltitudeControlParameter')) {
            let parameter = SystemConfig.get('AltitudeControlParameter')
            this.set(parameter)
        } else {
            this.setParameter(this.getParameter())
        }
    },
    setParameter: function (para) {
        this.set(para)
        SystemConfig.set('AltitudeControlParameter', para)
    },
    getParameter: function () {
        let result = {
            maxServoMove: this.attributes.maxServoMove,
            pitchLimit: this.attributes.pitchLimit
        }
        return result
    },

    updateStayAltitude: function (newStayAlt) {
        if (newStayAlt == undefined) {
            newStayAlt = SystemConfig.get('stayAltitude')
        } else {
            SystemConfig.set('stayAltitude', newStayAlt)
            //SystemConfig.save()
        }

        if (newStayAlt != undefined) {
            this.set('stayAltitude', newStayAlt)
            return true
        }
    },

    altitudeStaying: false,
    updateAltitude: function () {

        let pitch = SensorSystem.sensor.get("roll_pitch").pitch

        let pitchLimit = this.attributes.pitchLimit// 20

        if (pitch > -pitchLimit && pitch < pitchLimit) {
            //console.log(pitch);
            let altStay = this.attributes.stayAltitude
            let alt = SensorSystem.getAltitude()

            if (alt) {
                let altOffset = alt// - 10
                let diff = altStay - altOffset
                let diffAbs = Math.abs(diff)

                if (this.altitudeStaying && diffAbs < 5) {
                    if (diffAbs > 2) {
                        this.altitudeTo(altStay, altOffset)
                    }
                } else {
                    this.altitudeTo(altStay, altOffset)
                }

                console.log('alt', alt, diff, this.altitudeStaying, this.elevatorState);
            }
        } else {
            this.moveServo(90)
        }

    },
    elevatorState: { state: 'center', value: 90 },

    altitudeTo: function (altitude, currentAlt) {

        if (currentAlt) {
            //let speed = SensorSystem.gps.get('speed')
            let diff = altitude - currentAlt

            let diffAbs = Math.abs(diff)
            if (diffAbs < 1.5) {
                this.altitudeStaying = true
                this.elevatorState.state = 'center'
                this.moveServo(90)
            } else {
                this.altitudeStaying = false

                this.elevatorState.state = diff > 0 ? 'up' : 'down'
                // if (diff > 0
                //     //    || speed < 5
                // ) {
                //     //increase speed first
                // } else 
                // {
                //limit servo
                let maxServoMove = this.attributes.maxServoMove//30

                let startDegree = 90 - maxServoMove //60//45//
                let endDegree = 90 + maxServoMove //120//135//;

                let servoMove
                if (diffAbs > 5) {
                    servoMove = this.elevatorState.state == 'up' ? endDegree : startDegree
                }
                else {
                    servoMove = 90 + (diff / 5 * 45)//max diffAbs is 5 max degree is 45
                    if (servoMove > endDegree) {
                        servoMove = endDegree
                    } else if (servoMove < startDegree) {
                        servoMove = startDegree
                    }
                }

                //this.elevatorState.state = servoMove > 90 ? 'up' : 'down'
                this.elevatorState.value = servoMove

                console.log('move elevator', servoMove);
                this.moveServo(servoMove)
            }
        }

    },
    moveServo: function (degree) {
        this.set('elevatorMove', degree)
        ServoControl.setDegree(ServoControl.planeToPin['elevator'], degree)
    },
    start: function () {
        console.log('startAltControl');
        this.set('enable', true)
        this.updateStayAltitude()
        SensorSystem.sensor.on('change:altitude', this.updateAltitude, this)
    },
    stop: function () {
        console.log('stopAltControl');

        this.set('enable', false)
        SensorSystem.sensor.off('change:altitude', this.updateAltitude)
        this.moveServo(90)
    },

})

module.exports = new AltitudeControl()