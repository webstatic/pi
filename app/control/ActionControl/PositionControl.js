const SystemConfig = require("../../driver/SystemConfig.js")
const SensorSystem = require('../../driver/SensorSystem.js');
const ServoControl = require("../../driver/ServoControl.js");

const ActionControl = require("../ActionControl.js")
const GPS = require("gps");
var Backbone = require("backbone");
const Waypoints = require('../../modules/Waypoints.js');

let PositionControl = Backbone.Model.extend({

    defaults: {
        enable: false,
        currentDistance: 0,
        startPosition: {},
        currentTarget: {},
        wpData: [],
        turnWith: 'rudder',//'ailerons'

        maxServoMove: 30,
        movingTime: 3000,
    },

    initialize: function () {
        let self = this
        Waypoints.init(function () {
            self.set('currentTarget', Waypoints.nextWp(true))  // { lat: 7.88477600, lon: 98.38915320 };
            self.set('wpData', Waypoints.wpData)

            self.updateTarget() // use homve(id 0) as starting point and set target to id 1 
        })

    },

    start: function () {
        let startPosition = { lat: SensorSystem.gps.get('lat'), lon: SensorSystem.gps.get('lon') }
        console.log('PositionControl start ', startPosition);
        this.set('enable', true)

        this.set('startPosition', startPosition)
        SystemConfig.set('ActionControl_startPosition', startPosition)

        SensorSystem.gps.on('change:pos', this.updateValue, this)
    },
    stop: function () {
        this.set('enable', false)
        SensorSystem.gps.off('change:pos', this.updateValue)
    },

    updateValue: function () {
        if (this.get('enable'))
            //this.fryInDistance(20, 120)
            //this.fryToPointTest(5)
            this.turnTo(this.attributes.currentTarget, 5)
    },

    fryToPoint: function (targetCircle) {
        //not implement yet
    },

    passingAngle: function (originalHeadingAngle, currentHeading) {
        //let currentHeading = GPS.Heading(currentLat, currentLon, targetLat, targetLon)
        let result = originalHeadingAngle - currentHeading;
        let resultAbs = Math.abs(result)
        if (resultAbs > 180) {
            resultAbs = 360 - resultAbs
            //result = result < 0 ? resultAbs : resultAbs * -1
        }
        return resultAbs > 80;
    },

    updateTarget: function () {
        console.log('updateTarget');
        let currentTarget = this.attributes.currentTarget
        let latTarget = currentTarget.lat
        let lonTarget = currentTarget.lon

        this.set('currentTarget', Waypoints.nextWp(true))  // { lat: 7.88477600, lon: 98.38915320 };
        currentTarget = this.attributes.currentTarget
        //this.set('originalPoint', { lat: latTarget, lon: lonTarge })
        this.set('originalHeadingAngle', GPS.Heading(latTarget, lonTarget, currentTarget.lat, currentTarget.lon))
    },

    checkMovingStraight: function () {
        // let compassVariance = SensorSystem.sensor.get('variance')
        // if (compassVariance < 20) {
        //     let gpsHeadingVariance = SensorSystem.gps.get('variance')
        //     if (gpsHeadingVariance < 10) { // m/s
        //         let speed = SensorSystem.gps.get('speed')
        //         if (speed > 1) {
        //             return true;
        //         }
        //     }
        // }
        //return false

        // Do noting for now...
        return true
    },

    turnTo: function (currentTarget, targetCircle, finishCallback) {

        // console.log(currentTarget);
        if (this.checkMovingStraight() && !this.turning) {

            //console.log('start turn', currentTarget, targetCircle);
            let latTarget = currentTarget.lat
            let lonTarget = currentTarget.lon

            let lat = SensorSystem.gps.get('lat')
            let lon = SensorSystem.gps.get('lon')

            let currentDistance = GPS.Distance(lat, lon, latTarget, lonTarget) * 1000

            let currentHeadingToTarget = GPS.Heading(lat, lon, latTarget, lonTarget)

            this.set('currentDistance', currentDistance)
            // console.log(currentDistance);

            if (currentDistance < targetCircle || this.passingAngle(this.get('originalHeadingAngle'), currentHeadingToTarget)) {
                this.updateTarget()

                currentTarget = this.attributes.currentTarget

                latTarget = currentTarget.lat
                lonTarget = currentTarget.lon

                currentHeadingToTarget = GPS.Heading(lat, lon, latTarget, lonTarget)
            }
            //console.log('currentHeadingToTarget', currentHeadingToTarget);
            //this.set('headingToTarget', currentHeadingToTarget)
            SensorSystem.set('target', currentHeadingToTarget)

            let headingRelativeAngle = SensorSystem.getHeading();

            this.turn(headingRelativeAngle, finishCallback)
        } else {
            if (finishCallback) finishCallback(null)
        }

        // console.log('headingRelativeAngle', headingRelativeAngle);
    },

    //convert body turning to motor turning
    turn: function (headingRelativeAngle, finishCallback) {

        let moveDirection = 90 + headingRelativeAngle;// move with linear value

        //limit servo
        let startDegree = 60 // 45;
        let endDegree = 120//135;

        if (moveDirection < startDegree) {
            moveDirection = startDegree
        }
        else if (moveDirection > endDegree) {
            moveDirection = endDegree
        }

        this.turning = true
        //console.log('move servo', moveDirection);
        //ServoControl.setDegree(ServoControl.planeToPin['rudder'], moveDirection)

        this.set('turnServo', moveDirection)
        this.turnServo(moveDirection)

        // is it possible to make it dynamic?
        // for example by detect number of trying to turn to the angle
        // and increase number of timeout until curtain max 
        let timeout = 500;//1000 

        let headingRelativeAngleAbs = Math.abs(headingRelativeAngle)

        if (headingRelativeAngleAbs < 60) {
            timeout = timeout * headingRelativeAngleAbs / 60
        }

        this.set('turnTime', timeout)
        setTimeout(() => {
            this.moveStraight()
            if (finishCallback) finishCallback(moveDirection)
        }, (timeout));

    },

    moveStraight: function () {
        //console.log('move servo straight');
        this.set('turnServo', 90)

        //ServoControl.setDegree(ServoControl.planeToPin['rudder'], 90)
        this.turnServo(90)

        this.set('turnTime', 500)
        setTimeout(() => {
            this.turning = false
            this.updateValue()
        }, 500);
    },

    turnServo: function (value) {
        ServoControl.setDegree(ServoControl.planeToPin[this.attributes.turnWith], value)

        let elevatorMoveDevise = 2

        let elevatorMove = 90 - value
        elevatorMove = Math.abs(elevatorMove)
        elevatorMove = 90 + (elevatorMove / elevatorMoveDevise) // or -
        //elevatorMove = elevatorMove/3
        ServoControl.setDegree(ServoControl.planeToPin['elevator'], elevatorMove)

    },

})

module.exports = new PositionControl()