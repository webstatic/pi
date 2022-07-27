(function (context, undefined) {
    var lazy = require("lazy")

    var async = require("async")
    var fs = require('fs-extra')
    var path = require("path");
    var _ = require('underscore');

    var Waypoints = {}
    Waypoints.wpData = []
    Waypoints.currentSate = 0

    Waypoints.init = function (cb, fileName) {
        var self = this

        self.wpData = []
        Waypoints.currentSate = 0

        fileName = fileName ? fileName : __dirname + "/../data/nevigator.waypoints"
        var lineId = 0;
        console.log(fileName);
        new lazy(fs.createReadStream(fileName))
            .lines
            .skip(1)
            .forEach(function (line, i) {

                if (line) {
                    //console.log(lineId);
                    var str = line.toString();
                    // if (lineId > 0) {
                    //console.log(str);
                    var strSp = str.split('	')
                    var wpDataObj = { id: lineId }
                    wpDataObj.lat = parseFloat(strSp[8])
                    wpDataObj.lon = parseFloat(strSp[9])
                    wpDataObj.alt = parseFloat(strSp[10])
                    console.log(wpDataObj);
                    self.wpData.push(wpDataObj)
                    // console.log(wpDataObj);
                    // }

                    ++lineId;
                }
            }).on('pipe', function () {
                console.log("Waypoints init finish");
                if (cb) cb(self.wpData)
                //console.log(self.wpData);
            });
    }
    Waypoints.getWp = function () {
        return this.wpData[this.currentSate]
    }

    //get current Waypoint and move state to next one
    Waypoints.nextWp = function (isLoop) {
        var lastWp = this.getWp()
        this.currentSate++
        if (this.currentSate == this.wpData.length && isLoop) {
            this.currentSate = 0
        }
        return lastWp
    }

    module.exports = Waypoints;
})(this);