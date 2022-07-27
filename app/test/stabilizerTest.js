var ServoControl = require("../driver/ServoControl.js")
ServoControl.startServos()

let StabilizerSystem = require("../control/StabilizerSystem.js");
StabilizerSystem.start()

setTimeout(() => {
    StabilizerSystem.offsetValue = StabilizerSystem.lastValue
}, 10000);