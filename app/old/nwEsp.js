var app = app || { models: {}, collections: {}, views: {} };
//#region requre

if (typeof module !== "undefined") {
    Backbone = require('backbone');

} else {

}

(function () {
    'use strict';

    // Person Model
    app.models.nwEsp = Backbone.Model.extend({
        defaults: {
            id: null,
            ip: null,
            name: null,
            BOARD: null,
            dev: null,
            conn: null
        },

        initialize: function () {
            var self = this;
            if (this.attributes.name == null) {
                this.attributes.name = this.attributes.id
            }
            // console.log(this.attributes);
            // setInterval(() => {
            //     self.trigger('trigger', new Date())
            // }, 1000);
            self.get('ws').on('close', function (code, reason) {
                // console.log('close in model: %s %s', code, reason);
                self.destroy()
            });
        },

        validate: function (attrs, options) {
            if (!attrs.code) {

                //alert("validate false -> (!attrs.code || !attrs.name) ");
                //alert("ข้อมูลไม่ครบหรือผิดพลาด \n To err is human, but so, too, is to repent for those mistakes and learn from them.");
                alert("validate false");

                return "false";
            }
        },
        save: function (stockName, cb) {

            var self = this;

        },
        update: function (cb) {
            var self = this;

        },

        destroy: function (cb) {
            this.trigger('destroy', this)
        },

        isEmty: function () {
            var attrs = this.attributes;
            return !(attrs.code || attrs.unit_type);
        },
        remoteFunc: function (func, cb, paraObj) {
            this.attributes.conn.remoteFunc(this.attributes.ip, func, function (result, err) {
                cb(result, err)
            }, paraObj)
        },
        getTime: function (cb) {
            this.remoteFunc('getTime', cb)
        },
        echo: function (msg, cb) {
            this.remoteFunc('echo', cb, { data: msg })
        }

        //removeUi: function () {
        //    alert('trigger remove');

        //    this.trigger('removeUi', this);
        //}
    });
    if (typeof module !== "undefined") {
        module.exports = app.models.nwEsp;

    } else {

    }

    // var esp = new app.models.nwEsp({ code: 1 })
    // esp.on('trigger', function (arg) {
    //     console.log(arg);
    // })
})();

