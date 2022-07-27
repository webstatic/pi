// /// <reference path="../../Lib/step/step.js" />
// /// <reference path="../lib/async/async.js" />
// /// <reference path="../../NwLib/NwLib.js" />
// /// <reference path="../lib/underscore/underscore.js" />


// /// <reference path="../NwConn/NwConn.js" />



(function (context, undefined) {
    //#region requre

    if (typeof module !== "undefined") {

        NwLib = require('../NwLib/NwLib.js');
        Class = NwLib.Nwjsface.Class;

        //NwDataMsgObj = require('../NwUtil/NwDataMsgObj.js');

        ////http = require('http');

        //NwConn = require('../NwConn/NwConn.js');

        //_ = require('../Lib/underscore/underscore.js');

    } else {

    }

    //#endregion

    var objArrCompress = function (objArr) {
        var fields = [];
        var data = [];

        _.each(objArr, function (obj) {
            var dataArray = [];

            _.each(obj, function (value, key) {
                var idf = fields.indexOf(key);
                if (idf == -1) {
                    idf = fields.length;
                    fields.push(key);
                }
                dataArray[idf] = value;
            });

            data.push(dataArray);
        });

        var resultData = { fds: fields, dt: data };

        return resultData;
    }

    var objArrDecompress = function (resultData) {
        var objArr = [];
        var fields = resultData.fds;

        _.each(resultData.dt, function (dataArray) {

            var obj = {};

            _.each(dataArray, function (value, id) {
                if (!_.isUndefined(value)) {
                    var key = fields[id];
                    obj[key] = value
                }
            });

            objArr.push(obj);
        });

        return objArr;
    }

    var NwServiceConn = Class(function () {

        return {
            //$singleton: true,
            wsClient: {},
            getSocketId: function () {
                return this.wsClient.getId();
            },
            regEvent: function (eventName, cb) {
                this.wsClient.regEvent(eventName, cb);
            },
            constructor: function (wsClient) {
                this.wsClient = wsClient;
            },

            login: function (dataObj, cb) {
                dataObj.sid = this.getSocketId();
                this.wsClient.callService('login', dataObj, cb);
            },

            getAllStockName: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllStockName', dataObj, cb);
            },

            //#region Products
            getProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('getProduct', dataObj, cb);
            },
            getProductByCodeArray: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('getProductByCodeArray', dataObj, cb);
            },
            getAllProducts: function (stockName, cb) {
                var dataObj = { stock_name: stockName };
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllProducts', dataObj, function (result) {
                    if (cb) cb(objArrDecompress(result))
                });
            },
            findeProductStartWith: function (stockName, findWord, limit, cb) {
                var dataObj = { stock_name: stockName, findWord: findWord, limit: limit };
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('findeProductStartWith', dataObj, function (result) {
                    if (cb) cb(objArrDecompress(result))
                });
            },
            insertProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('insertProduct', dataObj, cb);
            },
            updateProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('updateProduct', dataObj, cb);
            },
            deleteProduct: function (stockName, code, cb) {
                var dataObj = { stock_name: stockName, code: code }
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('deleteProduct', dataObj, cb);
            },

            addProductUnitNumber: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('addProductUnitNumber', dataObj, cb);
            },

            unsetProductUnitNumber: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('unsetProductUnitNumber', dataObj, cb);
            },
            updateProductUnitNumber: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('updateProductUnitNumber', dataObj, cb);
            },
            checkDuplicateProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('checkDuplicateProduct', dataObj, cb);
            },
            //#endregion

            //#region SupplyLog
            insertSupplyLog: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('insertSupplyLog', dataObj, cb);
            },
            updateSupplyLog: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();
                this.wsClient.callService('updateSupplyLog', dataObj, cb);
            },
            findeSupplyLog: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('findeSupplyLog', dataObj, cb);
            },
            checkForInsertSupplyLog: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('checkForInsertSupplyLog', dataObj, cb);
            },
            getAllSupplyLog: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllSupplyLog', dataObj, cb);
            },
            getLastSupplyLog: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getLastSupplyLog', dataObj, cb);
            },
            getLastSupplyLogAll: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getLastSupplyLogAll', dataObj, cb);
            },
            //#endregion

            insertImportProductBackup: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertImportProductBackup', dataObj, cb);
            },

            //#region ImportProduct
            insertImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertImportProduct', dataObj, cb);
            },
            getImportProductInPeriod: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getImportProductInPeriod', dataObj, function (result) {
                    if (cb) cb(objArrDecompress(result))
                });
            },
            getImportProductInPeriodWithSearch: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getImportProductInPeriodWithSearch', dataObj, function (result) {
                    if (cb) cb(result)// cb(objArrDecompress(result))
                });
            },
            getAllImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllImportProduct', dataObj, function (result) {
                    if (cb) cb(objArrDecompress(result))
                });
            },
            getLastImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getLastImportProduct', dataObj, cb);
            },

            findImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('findImportProduct', dataObj, cb);
            },

            removeImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('removeImportProduct', dataObj, cb);
            },
            updateImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('updateImportProduct', dataObj, cb);
            },
            checkDuplicateImportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('checkDuplicateImportProduct', dataObj, cb);
            },
            //#endregion

            //#region PurchaseSession
            getLastPettyCash: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getLastPettyCash', dataObj, cb);
            },
            getฺBeforePettyCash: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getฺBeforePettyCash', dataObj, cb);
            },
            getLastPurchaseSession: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getLastPurchaseSession', dataObj, cb);
            },
            genNewPurchaseSessionId: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('genNewPurchaseSessionId', dataObj, cb);
            },
            getPurchaseSessionInPeriod: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getPurchaseSessionInPeriod', dataObj, cb);
            },
            findPurchaseSession: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('findPurchaseSession', dataObj, cb);
            },
            insertPurchaseSession: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertPurchaseSession', dataObj, cb);
            },

            reCalulatePurchaseSession: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('reCalulatePurchaseSession', dataObj, cb);
            },
            //#endregion


            //#region ExportProduct
            insertExportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertExportProduct', dataObj, cb);
            },
            getAllExportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllExportProduct', dataObj, cb);
            },
            getExportProductInPeriod: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getExportProductInPeriod', dataObj, cb);
            },
            getExportProductInPeriodWithSearch: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getExportProductInPeriodWithSearch', dataObj, cb);
            },
            removeExportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('removeExportProduct', dataObj, cb);
            },
            updateExportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('updateExportProduct', dataObj, cb);
            },

            checkDuplicateExportProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('checkDuplicateExportProduct', dataObj, cb);
            },
            //#endregion

            //#region CheckProduct
            insertCheckProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertCheckProduct', dataObj, cb);
            },
            getCheckProductDate: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getCheckProductDate', dataObj, cb);
            },
            getCheckProduct: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getCheckProduct', dataObj, cb);
            },
            editCheckProductDate: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('editCheckProductDate', dataObj, cb);
            },
            deleteCheckProducts: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('deleteCheckProducts', dataObj, cb);
            },
            //#endregion

            //#region Supplier
            getAllSupplier: function (cb) {
                var userObj = app.userModel.getUserObj();

                this.wsClient.callService('getAllSupplier', userObj, cb);
            },
            insertSupplier: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertSupplier', dataObj, cb);
            },
            updateSupplier: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('updateSupplier', dataObj, cb);
            },
            deleteSupplier: function (code, cb) {
                var dataObj = { code: code };
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('deleteSupplier', dataObj, cb);
            },
            checkDuplicateSupplier: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('checkDuplicateSupplier', dataObj, cb);
            },
            findeSupplierStartWith: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('findeSupplierStartWith', dataObj, cb);
            },
            //#endregion

            //#region Account
            getMenuStructure: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getMenuStructure', dataObj, cb);
            },

            //#endregion

            //#region list
            getAllList: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllList', dataObj, cb);
            },
            insertList: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertList', dataObj, cb);
            },
            deleteList: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('deleteList', dataObj, cb);
            },
            findList: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('findList', dataObj, cb);
            },
            //#endregion

            //#region user
            getAllUser: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('getAllUser', dataObj, cb);
            },
            insertUser: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('insertUser', dataObj, cb);
            },
            updateUser: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('updateUser', dataObj, cb);
            },
            deleteUser: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('deleteUser', dataObj, cb);
            },
            findUser: function (dataObj, cb) {
                var userObj = app.userModel.getUserObj();
                dataObj = _.extend(dataObj, userObj); dataObj.sid = this.getSocketId();

                this.wsClient.callService('findUser', dataObj, cb);
            },
            //#endregion
            getServerDateTime: function (dataObj, cb) {
                dataObj.sid = this.getSocketId();
                this.wsClient.callService('getServerDateTime', dataObj, cb);
            },
            setServerDateTime: function (dataObj, cb) {
                dataObj.sid = this.getSocketId();
                this.wsClient.callService('setServerDateTime', dataObj, cb);
            },
        };
    });

    if (typeof module !== "undefined" && module.exports) {                       // NodeJS/CommonJS
        module.exports = NwServiceConn;
    } else {

        context.NwServiceConn = NwServiceConn;
    }

})(this);
