const childProcess = require('child_process')
// const express = require('express')
// const bodyParser = require('body-parser')

// const app = express();
// app.use(bodyParser.json());


// app.post("/someBigProcess", (req, res) => {
//     const forked_child_process = childProcess.fork('./checkIfPrime.js');
//     // send message to the child process
//     forked_child_process.send(parseInt(req.body.number));
//     // listen for a response from the child process
//     forked_child_process.on("message", isTheNumberPrime => res.send(isTheNumberPrime));
// })

// app.listen(3000, () => {
//     console.log('server started on port 3000');
// })

const forked_child_process = childProcess.fork('../driver/process/SensorProcess.js');
//const forked_child_process = childProcess.fork('../driver/process/GpsProcess.js');

//const forked_child_process = childProcess.fork('./err.js');
// send message to the child process
forked_child_process.send("hello from master");
// listen for a response from the child process
forked_child_process.on("message", result => {

    // if (result.type == 'cp')
    //     console.log(result.variance)

    // if (result.type == 'rp')
    //     console.log(result)
});

forked_child_process.on('error', function (err) {
    console.log('Oh noez, teh errurz: ' + err);
});

forked_child_process.on('uncaughtException', function (err) {
    console.log('uncaughtException');
    console.log(err);
});