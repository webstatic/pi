TileSet = require('node-hgt').TileSet;
// const geolib = require('geolib');

var tileset = new TileSet('../../data/hgt/');
console.log('TileSet loaded');


setTimeout(() => {
    console.log('start');
    tileset.getElevation([8.697044333333332, 98.24069116666666], function (err, elevation) {
        if (err) {
            console.log('getElevation failed: ' + err.message);
        } else {
            console.log(elevation);
        }
        tileset.getElevation([8.6970325, 98.24066683333334], function (err, elevation) {
            if (err) {
                console.log('getElevation failed: ' + err.message);
            } else {
                console.log(elevation);
            }
        });
    });
}, 1000);
