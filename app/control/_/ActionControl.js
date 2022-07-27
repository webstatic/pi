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
        altControl_enable: false,
        mode: 'manual',//'fryInDistance'
        currentDistance: 0,
        startPosition: {},
        currentTarget: {},
        wpData: [],
        turnWith: 'rudder',
        enginePower: 30
    },
    initialize: function () {
        let self = this
        Waypoints.init(function () {
            self.set('currentTarget', Waypoints.nextWp(true))  // { lat: 7.88477600, lon: 98.38915320 };

            self.set('wpData', Waypoints.wpData)
        })

        SensorSystem.initGroundAlt()
    },
    updateValue: function () {
        //this.fryInDistance(20, 120)
        //this.fryToPointTest(5)
        this.turnTo(this.attributes.currentTarget, 5)
    },

    fryToPoint: function (targetCircle) {
        //not implement yet
    },

    passingAngle: function (originalHeadingAngle, targetLat, targetLon, currentLat, currentLon) {
        let currentHeading = GPS.Heading(currentLat, currentLon, targetLat, targetLon)
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
        this.originalHeadingAngle = GPS.Heading(latTarget, lonTarget, currentTarget.lat, currentTarget.lon)
    },

    checkMovingStraight: function () {

        let compassVariance = SensorSystem.sensor.get('variance')
        if (compassVariance < 2) {
            let gpsHeadingVariance = SensorSystem.gps.get('variance')
            if (gpsHeadingVariance < 10) { // m/s
                let speed = SensorSystem.gps.get('speed')
                if (speed > 1) {
                    return true;
                }
            }
        }
        return false
    },

    //convert body turning to motor turning
    turn: function (headingRelativeAngle, finishCallback) {

        let moveDirection = 90 - headingRelativeAngle;// move with linear value

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
        console.log('move servo', moveDirection);
        //ServoControl.setDegree(ServoControl.planeToPin['rudder'], moveDirection)
        this.turnServo(moveDirection)

        let timeout = 3000;//1000

        let headingRelativeAngleAbs = Math.abs(headingRelativeAngle)

        if (headingRelativeAngleAbs < 60) {
            timeout = timeout * headingRelativeAngleAbs / 60
        }

        setTimeout(() => {
            this.moveStraight()
            if (finishCallback) finishCallback(moveDirection)
        }, (timeout));

    },

    turnTo: function (currentTarget, targetCircle, finishCallback) {

        // console.log(currentTarget);
        if (this.checkMovingStraight()) {

            console.log('start turn', currentTarget, targetCircle);
            let latTarget = currentTarget.lat
            let lonTarget = currentTarget.lon

            let lat = SensorSystem.gps.get('lat')
            let lon = SensorSystem.gps.get('lon')

            let currentDistance = GPS.Distance(lat, lon, latTarget, lonTarget) * 1000

            this.set('currentDistance', currentDistance)
            // console.log(currentDistance);

            if (currentDistance < targetCircle || this.passingAngle(this.originalHeadingAngle, latTarget, lonTarget, lat, lon)) {
                this.updateTarget()

                currentTarget = this.attributes.currentTarget

                latTarget = currentTarget.lat
                lonTarget = currentTarget.lon
            }

            let angle = GPS.Heading(lat, lon, latTarget, lonTarget)
            SensorSystem.set('target', angle)
            let headingRelativeAngle = SensorSystem.getHeading();

            this.turn(headingRelativeAngle, finishCallback)
        } else {
            if (finishCallback) finishCallback(null)
        }

        // console.log('headingRelativeAngle', headingRelativeAngle);
    },
    moveStraight: function () {
        this.turning = false

        console.log('move servo straight');
        //ServoControl.setDegree(ServoControl.planeToPin['rudder'], 90)
        this.turnServo(90)
    },
    turnServo: function (value) {
        ServoControl.setDegree(ServoControl.planeToPin[this.attributes.turnWith], value)
    },
    roll: function () {
        //not implement yet
    },

    stayAltitude: 15,//m
    updateStayAltitude: function (alt) {
        let newStayAlt = alt
        if (!newStayAlt) {
            newStayAlt = SystemConfig.get('stayAltitude')
        } else {
            SystemConfig.set('stayAltitude', newStayAlt)
            SystemConfig.save()
        }

        if (newStayAlt) {
            this.stayAltitude = newStayAlt
        }
    },

    altitudeStaying: false,
    updateAltitude: function () {
        let altStay = this.stayAltitude
        let alt = SensorSystem.getAltitude()

        if (alt) {
            let altOffset = alt// - 10
            let diff = altStay - altOffset
            let diffAbs = Math.abs(diff)

            if (diffAbs < 5 && this.altitudeStaying) {
                if (diffAbs > 3) {
                    this.altitudeTo(altStay, altOffset)
                }
            } else {
                this.altitudeTo(altStay, altOffset)
            }

            console.log('alt', alt, diff, this.altitudeStaying, this.elevatorState);
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
                ServoControl.setDegree(ServoControl.planeToPin['elevator'], 90)
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
                let startDegree = 60
                let endDegree = 120;

                let servoMove
                if (diffAbs > 5) {
                    servoMove = this.elevatorState.state == 'up' ? endDegree : startDegree
                } else {
                    servoMove = 90 + (diff / 5 * 30)//max diffAbs is 5 max degree is 30
                }

                //this.elevatorState.state = servoMove > 90 ? 'up' : 'down'
                this.elevatorState.value = servoMove

                console.log('move elevator', servoMove);
                ServoControl.setDegree(ServoControl.planeToPin['elevator'], servoMove)
            }
        }

    },
    start: function () {
        let startPosition = { lat: SensorSystem.gps.get('lat'), lon: SensorSystem.gps.get('lon') }
        console.log('ActionControl start ', startPosition);
        this.set('enable', true)

        this.set('startPosition', startPosition)
        SystemConfig.set('ActionControl_startPosition', startPosition)

        SensorSystem.gps.on('change:pos', this.updateValue, this)
    },
    stop: function () {
        this.set('enable', false)
        SensorSystem.gps.off('change:pos', this.updateValue)
    },

    startAltControl: function () {
        console.log('startAltControl');
        this.set('altControl_enable', true)
        this.updateStayAltitude()
        SensorSystem.sensor.on('change:altitude', this.updateAltitude, this)
    },
    stopAltControl: function () {
        console.log('stopAltControl');

        this.set('altControl_enable', false)
        SensorSystem.sensor.off('change:altitude', this.updateAltitude)
    },

    startSpeedControl: function () {
        console.log('startSpeedControl');
        SensorSystem.gps.on('change:speed', this.updateSpeed, this)
    },
    stropSpeedControl: function name(params) {
        console.log('stopSpeedControl');
        SensorSystem.gps.off('change:speed', this.updateSpeed)
    },

    startingPower: 65,
    normalPower: 90,
    maxPower: 120,

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
    updateEnginePower: function () {
        let currentPower = this.get('enginePower')
        ServoControl.setDegree(ServoControl.planeToPin['power'], currentPower)
    },
    
    // fryInDistance: function (distance, enginePower) {
    //     let startPosition = this.attributes.startPosition
    //     let latFrom = startPosition.lat
    //     let lonFrom = startPosition.lon

    //     if (latFrom && lonFrom) {
    //         let currentDistance = 1000 * GPS.Distance(latFrom, lonFrom, SensorSystem.gps.get('lat'), SensorSystem.gps.get('lon'))
    //         this.set('currentDistance', currentDistance)
    //         if (currentDistance > distance) {
    //             ServoControl.setDegree(ServoControl.planeToPin['engine'], '30')
    //         } else {
    //             ServoControl.setDegree(ServoControl.planeToPin['engine'], enginePower)
    //         }
    //     }

    // },

    // fryToPointTest: async function (targetCircle) {

    //     let currentTarget = this.attributes.currentTarget
    //     // console.log(currentTarget);

    //     let latTarget = currentTarget.lat
    //     let lonTarget = currentTarget.lon

    //     let lat = SensorSystem.gps.get('lat')
    //     let lon = SensorSystem.gps.get('lon')

    //     let currentDistance = GPS.Distance(lat, lon, latTarget, lonTarget) * 1000

    //     this.set('currentDistance', currentDistance)
    //     // console.log(currentDistance);

    //     if (currentDistance < targetCircle || this.passingAngle(this.originalHeadingAngle, latTarget, lonTarget, lat, lon)) {
    //         this.updateTarget()

    //         currentTarget = this.attributes.currentTarget

    //         latTarget = currentTarget.lat
    //         lonTarget = currentTarget.lon
    //     }

    //     let angle = GPS.Heading(lat, lon, latTarget, lonTarget)
    //     SensorSystem.set('target', angle)
    //     let headingRelativeAngle = SensorSystem.sensor.get('heading')

    //     let moveDirection = 90 - headingRelativeAngle;
    //     let startDegree = 45;
    //     let endDegree = 135;

    //     if (moveDirection < startDegree) {
    //         moveDirection = startDegree
    //     }
    //     else if (moveDirection > endDegree) {
    //         moveDirection = endDegree
    //     }
    //     ServoControl.setDegree(ServoControl.planeToPin['rudder'], moveDirection)
    //     // console.log('headingRelativeAngle', headingRelativeAngle);
    // }
})

module.exports = new ActionControl()