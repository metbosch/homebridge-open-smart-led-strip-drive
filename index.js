const colorsys = require( 'colorsys' );
const raspi = require('raspi');
const gpio = require('raspi-gpio');
const sleep = require('sleep');
const wait = require('wait.for');
var Service, Characteristic;

module.exports = function( homebridge ) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory( "homebridge-open-smart-led-strip", "OpenSmartLedStrip", RgbAccessory );
};

function RgbAccessory( log, config ) {
  this.log = log;
  this.name = config.name;
  this.manufacturer = config.manufacturer || "@metbosch manufacturer";
  this.model = config.model || "Model not available";
  this.serial = config.serial || "Non-defined serial";
  this.hsv = {
    h: 0,
    s: 0,
    v: 0
  };
  this.pin_clk = config.pin_clk;
  this.pin_dat = config.pin_dat;
  this.delay = config.delay || 0;
  this.clock = undefined;
  this.data = undefined;
  
  wait.launchFiber(() => {
    //NOTE: Synchronously execute the init
    wait.for(raspi.init);
  });
  this.clock = new gpio.DigitalOutput(this.pin_clk);
  this.data = new gpio.DigitalOutput(this.pin_dat);
  this.log( "Initialized '" + this.name + "'" );
}

RgbAccessory.prototype.setColor = function(hsv) {
  const sendClock = () => {
    this.clock.write(gpio.LOW);
    sleep.sleep(this.delay);
    this.clock.write(gpio.HIGH);
    sleep.sleep(this.delay);
  };

  const send32zero = () => {
    for (let x = 0; x < 32; ++x) {
      this.data.write(gpio.LOW);
      sendClock();
    }
  };

  const sendData = (data) => {
    send32zero();
    for (let x = 0; x < 32; ++x) {
      let val = (data & 0x80000000) !== 0 ? gpio.HIGH : gpio.LOW;
      this.data.write(val);
      sendClock();
      data <<= 1;
    }
    send32zero();
  };

  const getCode = (data) => {
    let tmp = 0;
    if ((data & 0x80) == 0) {
      tmp |= 0x02;
    }
    if ((data & 0x40) == 0) {
      tmp |= 0x01;
    }
    return tmp;
  };
  
  let rgb = colorsys.hsvToRgb(hsv);

  let data = 0;
  data |= 0x03 << 30;
  data |= getCode(rgb.b);
  data |= getCode(rgb.g);
  data |= getCode(rgb.r);
  data |= rgb.b << 16;
  data |= rgb.g << 8;
  data |= rgb.r;
  
  this.log('Setting color (r: ' + rgb.r + ', g: ' + rgb.g + ', b: ' + rgb.b + ') with data: "' + data.toString(16) + '"');
  sendData(data);
};

RgbAccessory.prototype.getColor = function(callback) {
  callback(null, this.hsv);
};

RgbAccessory.prototype.getServices = function() {
  var lightbulbService = new Service.Lightbulb( this.name );
  var bulb = this;

  lightbulbService
    .getCharacteristic( Characteristic.On )
    .on( 'get', function( callback ) {
      bulb.getColor((err, hsv) => {
        callback(err, hsv.v !== 0);
      });
    } )
    .on( 'set', function( value, callback ) {
      bulb.log('Set Characteristic.On to ' + value);
      bulb.hsv.v = value ? (bulb.hsv.v > 0 ? bulb.hsv.v : 100) : 0;
      bulb.setColor(bulb.hsv);
      callback();
    } );

  lightbulbService
    .addCharacteristic( Characteristic.Brightness )
    .on( 'get', function( callback ) {
      bulb.getColor((err, hsv) => {
        callback( err, hsv.v );
      });
    } )
    .on( 'set', function( value, callback ) {
      bulb.log('Set Characteristic.Brightness to ' + value);
      bulb.hsv.v = value;
      bulb.setColor(bulb.hsv);
      callback();
    } );

  lightbulbService
    .addCharacteristic( Characteristic.Hue )
    .on( 'get', function( callback ) {
      bulb.getColor((err, hsv) => {
        callback( err, hsv.h );
      });
    } )
    .on( 'set', function( value, callback ) {
      bulb.log('Set Characteristic.Hue to ' + value);
      bulb.hsv.h = value;
      bulb.setColor(bulb.hsv);
      callback();
    } );

  lightbulbService
    .addCharacteristic( Characteristic.Saturation )
    .on( 'get', function( callback ) {
      bulb.getColor((err, hsv) => {
        callback( err, hsv.s );
      });
    } )
    .on( 'set', function( value, callback ) {
      bulb.log('Set Characteristic.Saturation to ' + value);
      bulb.hsv.s = value;
      bulb.setColor(bulb.hsv);
      callback();
    } );

  return [ lightbulbService ];
};
