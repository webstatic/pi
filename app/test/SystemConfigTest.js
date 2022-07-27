
deviceId = null
require('systeminformation').blockDevices(function (data) {
    deviceId = data[0].serial;

    deviceId = require('crypto').createHash('sha256').update(deviceId + "'").digest('base64url')
    const SystemConfig = require("../driver/SystemConfig.js")


    SystemConfig.set('startDate', new Date())

    console.log(SystemConfig.get('startDate'));
    // SystemConfig.save()
})
