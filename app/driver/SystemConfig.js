var Backbone = require("backbone");
var fs = require('fs');


// var data = JSON.stringify(myOptions);


let SystemConfig = Backbone.Model.extend({
    configPath: __dirname + '/SystemConfig.json',
    initialize: function () {
        var myObj;
        try {
            var data = fs.readFileSync(this.configPath);
            myObj = JSON.parse(data);
            console.log('SystemConfig', myObj);
        }
        catch (err) {
            // console.log('There has been an error parsing your JSON.')
            // console.log(err);
        }

        if (myObj) {

        } else {
            myObj = { 'id': deviceId }
            this.save()
        }
        this.set(myObj)

        this.on('change', this.save, this)
    }, save: function (attr) {
        // console.log('attr', attr);
        // if (attr) {
        //     this.set(attr)
        // }
        // var attr = this.attributes
        // console.log(JSON.stringify(this));

        // var data = JSON.stringify(myOptions);

        fs.writeFile(this.configPath, JSON.stringify(this), function (err) {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                return;
            }
            // console.log('Configuration saved successfully.')
        });

    }

})

module.exports = new SystemConfig()