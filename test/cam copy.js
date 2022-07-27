const http = require('http');

const raspberryPiCamera = require('raspberry-pi-camera-native'); // or require('raspberry-pi-camera-native');

raspberryPiCamera.start({
  width: 1280,
  height: 720,
  fps: 30,
  quality: 80,
  encoding: 'JPEG'
});

const server = http.createServer((req, res) => {
  raspberryPiCamera.once('frame', (data) => {


    res.end('<img src="' + data + '">');
    // res.end(data);
  });
});


// const PiCamera = require('pi-camera');
// const myCamera = new PiCamera({
//   mode: 'photo',
//   width: 640,
//   height: 480,
//   nopreview: true,
// });


// const server = http.createServer((req, res) => {

//   myCamera.snapDataUrl()
//     .then((result) => {
//       // Your picture was captured
//       res.end('<img src="' + result + '">');
//     })
//     .catch((error) => {
//       // Handle your error
//     });

// });

// server.listen(8000);