var cmd = require('node-cmd');
const { exec, spawn } = require('child_process');


var wvdial = {}
wvdial.isConneced = false
wvdial.run = function () {
console.log('run wvdial');
    const subprocess = spawn('wvdial');
    subprocess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    subprocess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);

        if (data.indexOf('DNS address') > -1) {
            wvdial.isConneced = true;
            console.log('isConneced');
            //wvdial.ping()
        }
    });

    subprocess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (!wvdial.isConneced) {
            wvdial.run()
        }
    });


    setTimeout(() => {
        if (!wvdial.isConneced) {
            subprocess.kill(); // Does not terminate the Node.js process in the shell.
            console.log('kill');
        }
    }, 5000);

    return subprocess
}
var on = true;

wvdial.ping = function () {
    function lightOn(isOn) {
        if (isOn) {
            //cmd.run('sudo /bin/echo 1 > /sys/class/leds/led0/brightness');
            cmd.run('echo 1 | sudo tee /sys/class/leds/led0/brightness');
        } else {
            cmd.run('echo 0 | sudo tee /sys/class/leds/led0/brightness');
        }
    }

    const subprocess = spawn('ping', ['8.8.8.8']);
    subprocess.stdout.on('data', (data) => {
        if (data.indexOf('time') > -1) {

            on = !on;
            lightOn(on)
        }
        // console.log(`stdout: ${data}`);
    });

    // subprocess.stderr.on('data', (data) => {
    //     console.error(`stderr: ${data}`);
    // });

    // subprocess.on('close', (code) => {
    //     console.log(`child process exited with code ${code}`);
    // });
    return subprocess
}
module.exports = wvdial

wvdial.run()