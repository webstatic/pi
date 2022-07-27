var i2c = require('i2c-bus');

var i2c1 = i2c.openSync(1);
var result = i2c1.scanSync()
console.log(result);