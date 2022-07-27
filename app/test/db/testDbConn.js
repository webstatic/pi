let dbconn = require("../../driver/sqliteConn.js")

dbconn.dbPath = "infodata.db"

let date = new Date();
console.log('current', date);
dbconn.insert('data', { tm: date, 'sensor': '', gps: '', servo: '', signal: 0 })
dbconn.getAll('data', function (result) {
    result.forEach(elem => {
        console.log(elem);
        console.log(new Date(elem.tm));
    });

})