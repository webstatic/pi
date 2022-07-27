var sqlite3 = require('sqlite3').verbose();
_ = require('underscore')
var dbPath = 'test.db'

// db.serialize(function () {
//     //   db.run("CREATE TABLE lorem (info TEXT)");

//     var stmt = db.prepare("INSERT INTO data VALUES (?)");
//     stmt.bind(1, 'test')

//     stmt.finalize();

//     //   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//     //       console.log(row.id + ": " + row.info);
//     //   });
// });

// db.close();

function insert(tableName, insertObj, cb) {

    var param = {};
    _.each(insertObj, function (value, key) {
        param['$' + key] = value;
    });

    var fieldsSql = _.keys(insertObj).join(',');
    var paramSql = _.keys(param).join(',');

    var sql = "INSERT INTO " + tableName +
        " (" + fieldsSql + ")  VALUES (" + paramSql + ")";

    // var db = new sqlite3.Database(this.dbPath);
    var db = new sqlite3.Database(dbPath);
    db.run(sql, param, function (error) {
        db.close();
        var id = this.lastID;

        if (cb) cb(id, insertObj);
    });
}


getAllTable = function (cb) {
    var sql = "SELECT name FROM sqlite_master WHERE type='table'";

    var db = new sqlite3.Database(dbPath);
    db.all(sql, function (err, resultObj) {
        db.close();
        if (cb) cb(resultObj);
    });
}

getAll = function (tableName, callback) {
    var db = new sqlite3.Database(dbPath);
    var sql = "select * from " + tableName;

    db.all(sql, function (err, result) {
        db.close();
        callback(result)
    })
}
find = function (tableName, findObj, callback) {
    var db = new sqlite3.Database(dbPath);

    var whereStrArr = [];
    var paramObj = {};
    for (var i in findObj) {
        whereStrArr.push(i + ' = $' + i);
        paramObj['$' + i] = findObj[i];
    }

    var sql = "select * from " + tableName + " where " + whereStrArr.join(' and ');

    db.all(sql, paramObj, function (err, result) {
        db.close();
        callback(result)
    })

}


const raspberryPiCamera = require('raspberry-pi-camera-native');// or require('raspberry-pi-camera-native');

raspberryPiCamera.start({
    // width: 1280,
    // height: 720,
    width: 640,
    height: 480,
    fps: 30,
    quality: 80,
    encoding: 'JPEG'
});

// const http = require('http');

// const server = http.createServer((req, res) => {
//     raspberryPiCamera.once('frame', (data) => {
//         res.end(data);
//     });
// });

// server.listen(8000);

setInterval(() => {

    raspberryPiCamera.once('frame', (img) => {
        insert('data', { 'date': new Date(), 'img': img }, function (id, insertObj) {
            console.log(insertObj);

        })


    });

}, 1000);

function vacuum(cb) {
    var sql = "VACUUM;"

    var db = new sqlite3.Database(dbPath);

    db.exec(sql, function (err) {
        db.close();
        //var id = this.lastID;
        //this.changes
        if (cb) cb(err);
    });

}

    // getAll('data', function (params) {
            //     for (const key in params) {
            //         if (Object.hasOwnProperty.call(params, key)) {
            //             const element = params[key];
            //             var date = new Date()
            //             date.setTime(element['date'])
            //             // console.log(date.getTimezoneOffset());
            //             date.setHours(6)
            //             console.log(date.toISOString());

            //         }
            //     }
            // })