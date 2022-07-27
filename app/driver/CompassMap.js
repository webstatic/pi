CompassMap = {
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

}