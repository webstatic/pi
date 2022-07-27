var PiServo = require('pi-servo');

// pass the GPIO number
var sv1 = new PiServo(4);

sv1.open().then(function () {

  console.log('setDegree');

  var i = 0;
  var s = 1;

  function run() {

    setTimeout(() => {

      i = i + s;

      if (i > 180) {
        i = 0;
      }
      sv1.setDegree(i); // 0 - 180
      run();
    }, 10);
  }
  run();

});