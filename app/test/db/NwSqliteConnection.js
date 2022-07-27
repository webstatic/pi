/// <reference path="../../lib/NwLib.js" />
// /// <reference path="../../lib/underscore/underscore.js" />

(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {
        NwLib = require('../../lib/NwLib.js');
        _ = require('underscore');
        Class = NwLib.Nwjsface.Class;

        sqlite3 = require('sqlite3').verbose();

    } else {

    }
    //#endregion
    var NwSqliteConnection = Class(function () {

        return {
            dbPath: '',

            constructor: function (dbPath) {
                this.dbPath = dbPath;
            },

            getAllTable: function (cb) {
                var sql = "SELECT name FROM sqlite_master WHERE type='table'";

                var db = new sqlite3.Database(this.dbPath);
                db.all(sql, function (err, resultObj) {
                    db.close();
                    if (cb) cb(resultObj);
                });
            },

            getAll: function (tableName, callback) {
                var db = new sqlite3.Database(this.dbPath);
                var sql = "select * from " + tableName;

                db.all(sql, function (err, result) {
                    db.close();
                    callback(result)
                })
            },
            find: function (tableName, findObj, callback) {
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

            },
            findOne: function (tableName, findObj, callback) {
                var db = new sqlite3.Database(this.dbPath);

                var whereStrArr = [];
                var paramObj = {};
                for (var i in findObj) {
                    whereStrArr.push(i + ' = $' + i);
                    paramObj['$' + i] = findObj[i];
                }

                var sql = "select * from " + tableName + " where " + whereStrArr.join(' and ');

                db.get(sql, paramObj, function (err, result) {
                    db.close();
                    callback(result)
                })

            },
            findLimit: function (tableName, findObj, limit, callback) {
                var db = new sqlite3.Database(this.dbPath);

                var whereStrArr = [];
                var paramObj = {};
                for (var i in findObj) {
                    whereStrArr.push(i + ' = $' + i);
                    paramObj['$' + i] = findObj[i];
                }

                var sql = "select * from " + tableName +
                     " where " + whereStrArr.join(' and ') +
                     ' LIMIT ' + limit;

                db.all(sql, paramObj, function (err, result) {
                    db.close();
                    callback(result)
                })

            },

            findStartWith: function (tableName, findObj, limit, callback) {
                var db = new sqlite3.Database(this.dbPath);

                var whereStrArr = [];
                var paramObj = {};
                for (var i in findObj) {
                    whereStrArr.push(i + ' like $' + i);
                    paramObj['$' + i] = findObj[i] + '%';
                }

                var sql = 'Select * From ' + tableName +
                '  WHERE ' + whereStrArr.join(' or ') + //fieldName + ' like $' + fieldName +
                //'  order by ' + fieldName +
                '  COLLATE NOCASE ' +
                '  LIMIT ' + limit;

                db.all(sql, paramObj, function (err, resultObj) {
                    db.close();
                    if (callback) callback(resultObj);
                });

            },

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
                    db.close();
                    var id = this.lastID;

                    if (cb) cb(id, insertObj);
                });
            },
            update: function (tableName, findObj, updateObj, cb) {

                var db = new sqlite3.Database(this.dbPath);

                //var param = {};
                var setSqlArray = [];

                var whereStrArr = [];
                var paramObj = {};

                for (var i in findObj) {
                    whereStrArr.push(i + ' = $w_' + i);
                    paramObj['$w_' + i] = findObj[i];
                }

                _.each(updateObj, function (value, key) {
                    paramObj['$' + key] = value;
                    setSqlArray.push(key + ' = ' + '$' + key);
                });

                var setSql = setSqlArray.join(',');

                var sql = "UPDATE " + tableName +
                           " SET " + setSql +
                           " WHERE " + whereStrArr.join(' and ');

                //param["$" + fieldName] = valueCondition;
                //console.log(sql);

                db.run(sql, paramObj, function (error) {
                    db.close();

                    if (cb) cb(this.changes);
                });
            },
            deleteAll: function (tableName, cb) {
                var sql = "DELETE FROM " + tableName;

                var db = new sqlite3.Database(this.dbPath);

                db.run(sql, function () {
                    db.close();
                    //var id = this.lastID;

                    if (cb) cb(this.changes);
                });
            },
            destroy: function (tableName, findObj, cb) {

                var db = new sqlite3.Database(this.dbPath);

                var whereStrArr = [];
                var paramObj = {};

                for (var i in findObj) {
                    whereStrArr.push(i + ' = $w_' + i);
                    paramObj['$w_' + i] = findObj[i];
                }

                var sql = "DELETE FROM " + tableName +
                          " WHERE " + whereStrArr.join(' and ');


                db.run(sql, paramObj, function () {
                    db.close();
                    //var id = this.lastID;

                    if (cb) cb(this.changes);
                });
            }

        };
    });

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwSqliteConnection;
    } else {

        context.NwSqliteConnection = NwSqliteConnection;
    }

})(this);