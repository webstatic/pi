
const Backbone = require("backbone");
const childProcess = require('child_process')

let SensorSystem = Backbone.Model.extend({

    sensor: new Backbone.Model(),
    gps: new Backbone.Model(),
    defaults: {
        target: 0
    },
    Sensor_child_process: null,
    Gps_child_process: null,
    initialize: function () {
        let self = this;

        var startSensor = function () {
            self.Sensor_child_process = childProcess.fork(__dirname + '/process/SensorProcess.js');

            self.Sensor_child_process.on('exit', function (error) {
                console.log("sensor exit here with exit: ", error);
                //if (exitCb) exitCb()
                setTimeout(() => {
                    startSensor()
                }, 1000);
            });

            self.Sensor_child_process.on("message", result => {
                // console.log(result)
                if (result.type == 'rp') {
                    let roll_pitch = { roll: result.roll, pitch: result.pitch }

                    // if (self.sensor.get('roll_pitch') == null || (roll_pitch.roll != self.sensor.get('roll_pitch').roll || roll_pitch.pitch != self.sensor.get('roll_pitch').pitch)) {
                    // self.update = true;
                    self.sensor.set('roll_pitch', roll_pitch)
                    // }
                } else if (result.type == 'bmp') {
                    let temperature = result.temperature
                    let altitude = result.altitude
                    let pressure = result.pressure

                    if (self.sensor.get('temperature') != temperature) {
                        //self.update = true;
                        self.sensor.set('temperature', temperature)
                    }
                    
                    if (self.sensor.get('pressure') != pressure) {
                        //self.update = true;
                        self.sensor.set('pressure', pressure)
                    }

                    if (altitude) {
                        if (self.sensor.get('altitude') != altitude) {
                            //self.update = true;
                            let def = Math.abs(self.sensor.get('altitude') - altitude)
                            if (!self.sensor.get('altitude') || def > 0.5) {
                                self.sensor.set('altitude', altitude)
                            }

                        }
                    } else if (self.gps.has('elevation')) {
                        self.updateGroundAlt()
                    }
                

                } else if (result.type == 'cp') {
                    self.sensor.set({ compassHeading: result.compassHeading, variance: result.variance })
                }

            });

        }

        startSensor()

        var startGps = function () {
            self.Gps_child_process = childProcess.fork(__dirname + '/process/GpsProcess.js');
            self.Gps_child_process.on('exit', function (error) {
                console.log("gps exit here with exit: ", error);
                //if (exitCb) exitCb()
                setTimeout(() => {
                    startGps()
                }, 1000);
            });

            self.Gps_child_process.on("message", result => {
                // console.log(result)
                if (result.type == 'pos') {
                    self.gps.set({ lat: result.lat, lon: result.lon })
                    self.gps.trigger("change:pos", self.gps)

                } else if (result.type == 'alt') {
                    self.gps.set('alt', result.alt)
                    //let altitude = self.sensor.get('altitude')
                    // if (altitude) {
                    //     self.sensor.set('altitudeBmpToGps', { bmp: altitude, gps: self.gps.get('alt') })
                    // }

                } else if (result.type == 'speed') {
                    self.gps.set('speed', result.speed)
                } else if (result.type == 'time') {
                    self.gps.set('time', result.time)
                } else if (result.type == 'gpsHeading') {
                    self.gps.set({
                        gpsHeading: result.gpsHeading,
                        variance: result.variance,
                        //moveDistance: result.moveDistance
                    })
                }
                else if (result.type == 'elevation') {
                    self.gps.set('elevation', result.elevation)
                }

            });
        }
        startGps()
      
    },
    updateCurrentSeaLevel: function (altitude, currentPressure) {
        if (this.Sensor_child_process) {
            this.Sensor_child_process.send({ type: 'update_currentSeaLevel', altitude: altitude, currentPressure: currentPressure })
            return true
        }
    },
    updateGroundAlt: function () {
        let elevation = this.gps.get('elevation')
        let pressure = this.sensor.get('pressure')
        console.log('initGroundAlt', elevation,pressure);

        if (elevation && pressure) {
            if (this.updateCurrentSeaLevel(elevation, pressure)) {
                this.sensor.set('baseAlt', { elevation: elevation, pressure: pressure })
                return true
            }
        }
    },

    initGroundAlt: function () {
        console.log('start initGroundAlt');

        let getAlt = () => {
            if (this.updateGroundAlt()) {
                this.gps.off('change:elevation', getAlt)
            }
        }
        this.gps.on('change:elevation', getAlt)
    },

    lastAlt: null,
    getAltitude: function () {
        let altitude = this.sensor.get('altitude')

        if (altitude) {

            if (!this.lastAlt) {
                this.lastAlt = altitude
            } else if (Math.abs(this.lastAlt - altitude) > 100) {
                altitude = this.lastAlt
            }

            //let altitudeBmpToGps = this.sensor.get('altitudeBmpToGps')
            //console.log('getAltitude', altitude, altitudeBmpToGps, this.baseAlt);
            // if (!this.baseAlt || this.baseAlt.temp) {
            //     if (!this.updateGroundAlt()) {
            //         this.baseAlt = { bmp: altitude, gps: 0, temp: true }
            //     }
            // }

            // if (altitudeBmpToGps) {

            //     if (this.baseAlt.temp) {
            //         console.log('update baseAlt', altitudeBmpToGps);
            //         this.baseAlt = altitudeBmpToGps
            //     }
            //     // else {
            //     //     let diffFromBaseAlt = altitudeBmpToGps.gps - this.baseAlt.gps
            //     //     if (diffFromBaseAlt > 10) {
            //     //         console.log('update baseAlt', altitudeBmpToGps);
            //     //         this.baseAlt = altitudeBmpToGps
            //     //     }
            //     // }
            // }

            // console.log('altitudeBmpToGps', altitudeBmpToGps, altitude);
            // let altDff = altitude - this.baseAlt.bmp
            // let estimateAlt = this.baseAlt.gps + altDff
            return altitude
        }
    },
    getHeading: function () {
        let gpsHeading = this.gps.get('gpsHeading')
        let heading = gpsHeading - this.get('target')
        if (heading < -180) { heading = heading + 360 }
        return heading
    },
    // updateCommpass: function () {
    //     let self = this;
    //     // compass.getHeadingDegrees('z', 'x', self.get('target'), async function (err, heading, compassHeading) {
    //     //     // Heading = heading

    //     //     console.log(compassHeading);
    //     //     // if (sensorUpdate) sensorUpdate(Heading, roll_pitch, altitude)
    //     //     if (self.sensor.get('heading') != heading || self.sensor.get('compassHeading') != compassHeading) {
    //     //         self.update = true;
    //     //         self.sensor.set({ heading: heading, compassHeading: compassHeading })
    //     //     }

    //     // })
    //     mag.readAxes(function (err, axes) {
    //         if (err) {
    //             console.log("Error reading Magnetometer Heading : " + err);
    //         }
    //         if (axes) {
    //             let declination = geomagnetisminfo.decl / 180 * Math.PI
    //             var theta = Math.PI / 2 - (Math.atan2(axes.y, axes.x) + declination);
    //             if (theta < 0) {
    //                 theta += 2 * Math.PI;
    //             }
    //             theta = 2 * Math.PI - theta;
    //             theta = (180 / Math.PI * theta);
    //             theta = ((theta != 360) ? theta : 0);

    //             theta = (theta - 180) * -1

    //             let compassHeading = theta;

    //             theta = theta - self.get('target')

    //             if (theta < -180) { theta = theta + 360 }
    //             let heading = theta

    //             if (self.sensor.get('heading') != heading || self.sensor.get('compassHeading') != compassHeading) {
    //                 self.update = true;
    //                 self.sensor.set({ heading: heading, compassHeading: compassHeading })
    //             }

    //             //console.log(compassHeading);
    //             // var heading =  Math.atan2(axes.y, axes.x);
    //             // //heading += this.declination;

    //             // while (heading < 0) {
    //             //     heading += twoPies;
    //             // }
    //             // while (heading > twoPies) {
    //             //     heading -= twoPies;
    //             // }
    //             // heading = heading * 180 / Math.PI
    //             // heading = heading - 180

    //             // // let compassHeading = heading;
    //             // // heading = heading - target
    //             // if (heading < -180) { heading = heading + 360 }
    //             // console.log('heading', theta);

    //         }
    //     });
    // }
})

module.exports = new SensorSystem()