/// <reference path="lib/jquery-3.6.0.js" />

$(function () {
    host = window.location.hostname;
    port = window.location.port
    //protocol = 'http:' + '//';
    url = host + ":" + port;
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

})