/// <reference path="lib/jquery-3.6.0.js" />

$(function () {
    var host = window.location.hostname;
    var port = window.location.port
    var protocol = 'ws:';
    var url = protocol + '//' + host + ":" + port;
    console.log('url:', url);
    var wsClient = new NwWsClient(url);

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
    var espip = '192.168.1.13'
    //var espip = '192.168.49.177'

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
        console.log(result);
    })


    $('.food_feeder_flip').on('change', function () {
        var elem = $(this);
        var id = 0;
        var val = elem.val() == 'on' ? 0 : 1;
        var pin = elem.attr('id').split('_')[1];
        wsClient.callService('remoteFunc', { ip: espip, func: 'set_pcf', para: { id: id, pin: pin, val: val } }, function (result) {

            $('#msg').prepend(result + '\n')
            console.log(result);
        })
        console.log('change', val, pin);
    })
    $('.food_feeder_button').on('click', function () {
        var elem = $(this);
        var id = 0;
        var pin = elem.attr('pid');
        console.log('food_feeder_button');
        wsClient.callService('remoteFunc', { ip: espip, func: 'set_pcf', para: { id: id, pin: pin, val: 0, tm: 1000 } }, function (result) {

            $('#msg').prepend(result + '\n')
            console.log(result);
        })
        console.log('click', pin);
    })

    $('.set_pcf_series').on('click', function () {
        var elem = $(this);
        var id = 0;
        console.log('set_pcf_series');
        wsClient.callService('remoteFunc', { ip: espip, func: 'set_pcf_series', para: { id: id, pins: [0,1, 2, 3, 4, 5], val: 0, tm: 500 } }, function (result) {

            $('#msg').prepend('set_pcf_series ' + result + '\n')
            console.log(result);
        })
        console.log('click', pin);
    })

    $('.gpio_flip').on('change', function () {

        var elem = $(this);
        var val = elem.val() == 'on' ? 1 : 0;
        wsClient.callService('remoteFunc', { ip: espip, func: 'set_pin', para: { pin: elem.attr('id'), val: val } }, function (result) {

            $('#msg').prepend(result + '\n')
            console.log(result);
        })
    })

})