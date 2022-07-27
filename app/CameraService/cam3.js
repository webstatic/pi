const { StillCamera } = require("pi-camera-connect");

const stillCamera = new StillCamera({
    // width: 1280,
    // height: 720,
    width: 640,
    height: 480,
    // fps: 0,
    quality: 20,
    // encoding: 'JPEG'
});

const http = require('http');
console.log('start Cam3');

const server = http.createServer((req, res) => {

    console.log('start Take');
    let st = new Date()
    stillCamera.takeImage().then(image => {
        console.log('taked', new Date() - st);
        res.end(image);
    });


});


server.listen(8000);

// stillCamera.takeImage().then(image => {

//     fs.writeFileSync("still-image.jpg", image);
// });