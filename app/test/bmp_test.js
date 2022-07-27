const bmp180 = require('bmp180-sensor')

//var sealevel = 99867; // current sea level pressure in Pa
var sealevel = 101325;
var getAltitude = function (pressure, sealevel) {
    return 44330 * (1 - Math.pow(pressure / sealevel, 1 / 5.255));
};

getSeaLevel = function (pressure, altitude) {
    return pressure / Math.pow(1 - (altitude / 44330), 5.255);
};

let currentSeaLevel = null

async function readBmp180() {
    const sensor = await bmp180({
        address: 0x77
    })

    const data = await sensor.read()
    if (!currentSeaLevel) {
        currentSeaLevel = getSeaLevel(data.pressure, 11)
        if (Math.abs(currentSeaLevel - sealevel) < 5000) {
            console.log(currentSeaLevel, currentSeaLevel - sealevel);
        } else {
            currentSeaLevel = null
        }
    } else {
        console.log(getAltitude(data.pressure, currentSeaLevel), data);
    }



    // console.log(data)

    await sensor.close()
}

setInterval(() => {
    readBmp180();
}, 1000);
