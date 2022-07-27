/// <reference path="lib/jquery-3.6.0.js" />

$(function () {
    var host = window.location.hostname;
    var port = window.location.port
    var protocol = 'ws:';
    var url = protocol + '//' + host + ":" + port;
    console.log('url:', url);
    wsClient = new NwWsClient(url);

    wsClient.setOnConnectEventListener(function (socket) {
        var id = wsClient.getId();
        console.log('onConnect ' + id);

        // wsClient.callService('getServerDateTime', null, function (result) {
        //     console.log(result);
        // })
    });

    wsClient.setOnDisconnectEventListener(function myfunction() {

    });

    var dev = [];
    var espip = '192.168.49.177'

    //var espip = '192.168.49.72'

    // wsClient.regEvent('change_ev', function (resp) {
    //     $('#msg').prepend(new Date() + ' ' + JSON.stringify(resp) + '\n')
    //     console.log(resp);
    // })
    wsClient.callService('remoteFunc', { ip: espip, func: 'getTime' }, function (result) {
        $('#msg').prepend(result + '\n')
        console.log(result);
    })

    wsClient.callService('getTime', {}, function (result) {
        $('#msg').prepend(result + '\n')
        var dt = new Date(result);
        var h = dt.getHours()
        console.log(dt, h);
    })


    $('#getTime').on('click', function () {
        wsClient.callService('remoteFunc', { ip: espip, func: 'getTime' }, function (result) {
            $('#msg').prepend(result + '\n')
            console.log(result);
        })
    })

    var ms = 1
    $('#setservo').on('click', function () {
        ms += 0.01
        if (ms > 2) ms = 1

        wsClient.callService('remoteFunc', { ip: espip, func: 'set_servo', para: { ch: 15, ms: ms } }, function (result) {

            $('#msg').prepend(result + '\n')
            console.log(result);
        })
    })


    var lastserviceMethod;
    var currentserviceMethod;
    function callservicebuffer(serviceMethod) {
        if (currentserviceMethod) {
            lastserviceMethod = serviceMethod
        } else {
            currentserviceMethod = serviceMethod
            serviceMethod(function () {
                currentserviceMethod = null
                if (lastserviceMethod) {
                    serviceMethod = lastserviceMethod
                    lastserviceMethod = null
                    callservicebuffer(serviceMethod)
                }
            })
        }
    }

    function updateServo(ch, ms, cb) {
        wsClient.callService('remoteFunc', { ip: espip, func: 'set_servo', para: { ch: ch, ms: ms } }, function (result) {

            $('#msg').prepend(result + '\n')
            console.log(result);
            if (cb) cb()
        })
    }
    function getState(params) {
        var ch15ms = parseFloat($("#slider-1").val())
        var ch13ms = parseFloat($("#slider-2").val())
        var ch14ms = parseFloat($("#slider-3").val())
        if (ch15ms) {
            return [{ ch: 15, ms: ch15ms }, { ch: 14, ms: ch14ms }, { ch: 13, ms: ch13ms }]
        } else {
            return [{ ch: 15, ms: 0.8 }, { ch: 14, ms: 1.5 }, { ch: 13, ms: 1.5 }]
        }

    }

    var currentState = null;
    function updateServoAll(cb) {
        var isStateChange = false;
        var newState = getState();
        if (currentState) {
            for (let index = 0; index < currentState.length; index++) {
                const s1 = currentState[index];
                const s2 = newState[index];
                if (!_.isEqual(s1, s2)) {
                    isStateChange = true;
                    break;
                }
            }
            currentState = newState

        } else {
            currentState = newState
            isStateChange = true;
        }

        if (isStateChange) {
            var timeout = setTimeout(() => {
                console.log('timeout');
                timeout = null
                if (cb) cb()
            }, 1000);
            wsClient.callService('remoteFunc', { ip: espip, func: 'set_servo_array', para: { data: currentState } }, function (result) {
                $('#msg').prepend(result + '\n')
                console.log(result);
                clearTimeout(timeout)
                if (timeout)
                    if (cb) cb()
            })
        } else {
            if (cb) cb()
        }

    }


    var updateTime = 100
    function updateServoAllInterval() {
        setTimeout(() => {
            updateServoAll(function () {
                updateServoAllInterval()
            })

        }, updateTime);
    }
    updateServoAllInterval()

    // updateServo(15, 0.8, function () {
    //     updateServo(14, 1.5, function () {
    //         updateServo(13, 1.5);
    //     })
    // })

    // $("#slider-1").on('change', function (value) {

    //     // console.log(val);
    //     function serviceMethod(cb) {
    //         var val = parseFloat($("#slider-1").val())
    //         updateServo(15, val, cb)
    //     }
    //     //serviceMethod()
    //     callservicebuffer(serviceMethod)
    // })

    // $("#slider-2").on('change', function (value) {

    //     // console.log(val);
    //     function serviceMethod(cb) {
    //         var val = parseFloat($("#slider-2").val())
    //         updateServo(14, val, cb)
    //     }
    //     //serviceMethod()
    //     callservicebuffer(serviceMethod)
    // })



    // $("#slider-3").on('change', function (value) {

    //     // console.log(val);
    //     function serviceMethod(cb) {
    //         var val = parseFloat($("#slider-3").val())
    //         updateServo(13, val, cb)
    //     }
    //     //serviceMethod()
    //     callservicebuffer(serviceMethod)
    // })



    $('#exit').on('click', function (พำหี) {

        wsClient.callService('exitProcess', {}, function (result) {
            console.log('exit', result);
        })
    })

    $('#test').on('click', function () {
        var val = 1;

        function runTest() {
            setTimeout(() => {
                val += 0.1;
                val = Number((val).toFixed(3));
                if (val > 2) {
                    val = 1;
                    $('#msg').html('')
                }

                updateServo(14, val, function () {
                    $('#msg').prepend('val:' + val + '\n')
                    runTest()
                })
            }, 100);
        }
        runTest();

    })
    $('#setGPIO').on('click', function () {
        if (dev && dev.length > 0) {
            callDivFuncton(dev[0], 'setGPIO', function (result) {
                console.log(result);
            }, { pin: '1', value: false })
            // ws.remoteFunc('getTime', function (result) {
            //     console.log('getTime:', result);
            // })
        } else {

        }
    })
    $('#getGPIO').on('click', function () {
        if (dev && dev.length > 0) {
            callDivFuncton(dev[0], 'getGPIO', function (result) {
                console.log(result);
            }, { pin: '1' })
            // ws.remoteFunc('getTime', function (result) {
            //     console.log('getTime:', result);
            // })
        } else {

        }
    })
    $('#ShowIdList').on('click', function () {
        ws.remoteFunc('getIdListByDev', function (result) {
            console.log('getIdListByDev', result);
            dev = result;
        }, { dev: 'blc' })
    })


})