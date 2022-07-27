const SystemConfig = require("../driver/SystemConfig.js")

var SensorSystem = require('../driver/SensorSystem.js');
var ServoControl = require("../driver/ServoControl.js");

var Backbone = require("backbone");

// let startDegree = 50;
// let endDegree = 130;
let startDegree = 45;
let endDegree = 135;

let StabilizerSystem = Backbone.Model.extend({
   mode: 'straight',//turn_left , trun_right
   defaults: {
      enable: false,
      offsetValue: null,
      lastValue: null,
   },
   initialize: function () {

      this.set('offsetValue', SystemConfig.get('StabilizerSystem_offsetValue'))
      console.log('StabilizerSystem', this.attributes.offsetValue);
      if (!this.attributes.offsetValue) {

         this.offsetValueReset()
      }
      // setTimeout(() => {
      //    StabilizerSystem.offsetValue = StabilizerSystem.lastValue
      // }, 3000);
   },
   offsetValueReset: function () {
      this.set('offsetValue', { roll: 0, pitch: 0 })
      SystemConfig.set('StabilizerSystem_offsetValue', this.get('offsetValue'))
   },
   offsetValueLock: function () {
      this.set('offsetValue', this.get('lastValue'))
      //console.log('offsetValueLock', this.attributes.offsetValue);
      SystemConfig.set('StabilizerSystem_offsetValue', this.attributes.offsetValue)
   },
   updateRollpitch: function (model, value) {
      // console.log('updateRollpitch', value);
      this.set('lastValue', value)

      var roll = value.roll - this.attributes.offsetValue.roll
      var pitch = value.pitch - this.attributes.offsetValue.pitch

      //console.log('updateRollpitch', value);
      this.updateRoll(roll)
      this.updatePitch(pitch)
      ServoControl.setDegree(ServoControl.planeToPin['flaps'], 90)
   },
   updateRoll: function (value) {

      //rollValue = Math.round(rollValue)
      // value.pitch = Math.round(value.pitch)
      let rollValue = value
      //console.log(rollValue, Math.pow(rollValue, 2));

      // let div = 3
      // let divValue = rollValue / div
      // rollValue = div * parseInt(divValue)

      // if (rollValue < startDegree) {
      //    rollValue = startDegree
      // } else if (rollValue > endDegree) {
      //    rollValue = endDegree
      // }

      ServoControl.setDegree(ServoControl.planeToPin['ailerons'], 90 - (rollValue))
      //console.log(rollValue, value);
   },
   updatePitch: function (value) {

      let pitchValue = value * 2 /// 2
      pitchValue = 90 - (pitchValue)
      if (pitchValue < startDegree) {
         pitchValue = startDegree
      } else if (pitchValue > endDegree) {
         pitchValue = endDegree
      }

      ServoControl.setDegree(ServoControl.planeToPin['elevator'], pitchValue)
   },
   start: function () {
      this.set('enable', true)
      console.log('StabilizerSystem start');
      ServoControl.setDegree(ServoControl.planeToPin['rudder'], 90)
      SensorSystem.sensor.on('change:rollpitch', this.updateRollpitch, this)
   },
   stop: function () {
      this.set('enable', false)
      SensorSystem.sensor.off('change:rollpitch', this.updateRollpitch)
   }

})

module.exports = new StabilizerSystem()