const SerialPort = require("serialport");
const SerialPortParser = require("@serialport/parser-readline");
const GPS = require("gps");

const port = new SerialPort("/dev/serial0", { baudRate: 9600 });
const gps = new GPS();

const parser = port.pipe(new SerialPortParser());


gps.on("data", data => {
    
    if (data.type == "GGA" || data.type == "RMC" || data.type == "GLL") {
        if (data.quality != null || data.status == "active") {
            console.log(data.lat + "," + data.lon);
            console.log(data.type,data.time)
        } else {
            console.log("no gps fix available");
        }
    }
  
});

parser.on("data", data => {
    console.log(data);
    try {
        console.log(data);
        gps.update(data);
    } catch (e) {
        throw e;
    }
});


// {
//   time: 2022-01-07T05:03:07.000Z,
//   lat: 7.885069,
//   lon: 98.38886333333333,
//   alt: 6.3,
//   quality: 'fix',
//   satellites: 6,
//   hdop: 1.17,
//   geoidal: -27.9,
//   age: null,
//   stationID: null,
//   raw: '$GNGGA,050307.00,0753.10414,N,09823.33180,E,1,06,1.17,6.3,M,-27.9,M,,*6E\r',
//   valid: true,
//   type: 'GGA'
// }

// {
//     time: 2022-01-07T05:03:07.000Z,
//     status: 'active',
//     lat: 7.885069,
//     lon: 98.38886333333333,
//     speed: 0.25187200000000004,
//     track: null,
//     variation: null,
//     faa: 'autonomous',
//     navStatus: null,
//     raw: '$GNRMC,050307.00,A,0753.10414,N,09823.33180,E,0.136,,070122,,,A*65\r',
//     valid: true,
//     type: 'RMC'
//   }
  

// {
//   time: 2022-01-07T05:03:07.000Z,
//   status: 'active',
//   lat: 7.885069,
//   lon: 98.38886333333333,
//   faa: 'autonomous',
//   raw: '$GNGLL,0753.10414,N,09823.33180,E,050307.00,A,A*7E\r',
//   valid: true,
//   type: 'GLL'
// }
