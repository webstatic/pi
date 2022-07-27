var sqlite3 = require('sqlite3').verbose();
_ = require('underscore')


var dbConn = {
    dbPath: 'test.db',
    insert: function (tableName, insertObj, cb) {

        var param = {};
        _.each(insertObj, function (value, key) {
            param['$' + key] = value;
        });

        var fieldsSql = _.keys(insertObj).join(',');
        var paramSql = _.keys(param).join(',');

        var sql = "INSERT INTO " + tableName +
            " (" + fieldsSql + ")  VALUES (" + paramSql + ")";

        var db = new sqlite3.Database(this.dbPath);

        db.run(sql, param, function (error) {
            if (error)
                console.log(error);
            db.close();
            var id = this.lastID;

            if (cb) cb(id, insertObj);
        });
    },
    getAllTable: function (cb) {
        var sql = "SELECT name FROM sqlite_master WHERE type='table'";

        var db = new sqlite3.Database(this.dbPath);
        db.all(sql, function (err, resultObj) {
            db.close();
            if (cb) cb(resultObj);
        });
    }, getAll: function (tableName, callback) {
        var db = new sqlite3.Database(this.dbPath);
        var sql = "select * from " + tableName;

        db.all(sql, function (err, result) {
            db.close();
            callback(result)
        })
    }, find: function (tableName, findObj, callback) {
        var db = new sqlite3.Database(this.dbPath);

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


}


module.exports = dbConn;