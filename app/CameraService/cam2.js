const PiCamera = require('pi-camera');
const myCamera = new PiCamera({
    mode: 'photo',
    output: `${ __dirname }/test.jpg`,
    width: 640,
    height: 480,
    nopreview: true,
});

const http = require('http');
console.log('start Cam2');

const server = http.createServer((req, res) => {

    myCamera.snap()
        .then((result) => {
            // Your picture was captured
            console.log(result);
            res.end(result);
        })
        .catch((error) => {
            // Handle your error
        });

});


server.listen(8000);


