var cmd = require('node-cmd');

var OnbordLed = {}
OnbordLed.blink = function (timeInterval, onTime) {
    if (timeInterval == 0) {
        this.stop()
        return
    }

    function lightOn(isOn) {
        if (isOn) {
            cmd.runSync('echo 1 | sudo tee /sys/class/leds/led0/brightness');
        } else {
            cmd.runSync('echo 0 | sudo tee /sys/class/leds/led0/brightness');
        }
    }

    if (this.blinkOnbordLedInterval) clearInterval(this.blinkOnbordLedInterval)

    var on = true;
    this.blinkOnbordLedInterval = setInterval(() => {
        if (onTime) {
            lightOn(true)
            setTimeout(() => {
                lightOn(false)
            }, onTime);
        } else {
            on = !on;
            lightOn(on)
        }

    }, timeInterval);
}

OnbordLed.stop = function () {
    if (this.blinkOnbordLedInterval) clearInterval(this.blinkOnbordLedInterval)
}

module.exports = OnbordLed