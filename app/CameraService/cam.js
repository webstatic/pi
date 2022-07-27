const http = require('http');
console.log('start Cam');
const raspberryPiCamera = require('raspberry-pi-camera-native');// or require('raspberry-pi-camera-native');

raspberryPiCamera.start({
  width: 1280,
  height: 720,
  //   width: 640,
  //   height: 480,
  fps: 10,
  quality: 30,
  encoding: 'JPEG'
});

const server = http.createServer((req, res) => {
  let st = new Date()
  raspberryPiCamera.once('frame', (data) => {
    console.log('taked', new Date() - st);
    res.end(data);
  });
});

// raspberryPiCamera.on('frame', (data) => {
//   console.log(new Date());
// });

server.listen(8000);