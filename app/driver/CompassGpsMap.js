const SystemConfig = require("../driver/SystemConfig.js")
const SensorSystem = require('../driver/SensorSystem.js');
const ServoControl = require("../driver/ServoControl.js");
const GPS = require("gps");
var Backbone = require("backbone");


let CompassGpsMap = Backbone.Model.extend({
    //turn_left , trun_right
    CompassMap: {
        mapdata: {},
        mapdataWeight: {},
        add: function (id, value) {

            if (this.mapdata[id] == undefined) {
                this.mapdata[id] = value
                this.mapdataWeight[id] = 1
            } else {
                let max = this.mapdata[id] * this.mapdataWeight[id]
                max += this.mapdata[id]
                this.mapdataWeight[id]++
                this.mapdata[id] = max / this.mapdataWeight[id]
            }
            return this.mapdata[id]
        },
        get: function (id) {
            return this.mapdata[id]
        },
        clear: function () {
            this.mapdata = {}
            this.mapdataWeight = {}
        }
    },

    defaults: {
        lastPoint: {},
        pointList: [],
        sumDistance: 0
    },

    initialize: function () {
        let self = this
        SensorSystem.gps.on('change:pos', this.updateValue, this)
    },
    updateValue: function () {
        let lastPoint = this.attributes.lastPoint

        let lat = SensorSystem.gps.get('lat')
        let lon = SensorSystem.gps.get('lon')

        let currentDistance = 1000 * GPS.Distance(lat, lon, lastPoint.lat, lastPoint.lon)

        this.attributes.lastPoint.lat = lat;
        this.attributes.lastPoint.lon = lon;

        let compassHeading = SensorSystem.sensor.get('compassHeading')

    },
})

module.exports = new CompassGpsMap()