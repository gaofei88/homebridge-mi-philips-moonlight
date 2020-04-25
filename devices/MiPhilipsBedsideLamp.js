const colorsys = require('colorsys');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;
const {spawn} = require('child_process');

MiPhilipsBedsideLamp = function(platform, config) {
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;

    this.config = config;
    this.platform = platform;

    this.device = {
        address: config.ip,
        token: config.token
    }
    
    if (this.config['name']) {
    	this.name = this.config['name'];
	    return this;
    }

    this.status = undefined;

    throw new Exception("Unable to create accessory.");
}

MiPhilipsBedsideLamp.prototype.getServices = function() {
    var infoService = new Service.AccessoryInformation();
    infoService.setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
               .setCharacteristic(Characteristic.Model, "Philips ZhiRui Bedside Lamp")
               .setCharacteristic(Characteristic.SerialNumber, "Unknown");
    
    var lightService = new Service.Lightbulb(this.name);
    lightService.getCharacteristic(Characteristic.On)
                .on('get', this.getPower.bind(this))
                .on('set', this.setPower.bind(this));
    lightService.addCharacteristic(Characteristic.Brightness)
                .on('get', this.getBrightness.bind(this))
                .on('set', this.setBrightness.bind(this));
  //  lightService.addCharacteristic(Characteristic.ColorTemperature)
//		.setProps({ minValue: 1, maxValue: 100, minStep: 1 })
//		.on('get', this.getColorTemperature.bind(this))
//		.on('set', this.setColorTemperature.bind(this));
    lightService.addCharacteristic(Characteristic.Hue)
		.on('get', this.getHue.bind(this))
                .on('set', this.setHue.bind(this));
    lightService.addCharacteristic(Characteristic.Saturation)
                .on('get', this.getSaturation.bind(this))
                .on('set', this.setSaturation.bind(this));
    return [infoService, lightService];
}

MiPhilipsBedsideLamp.prototype.getPower = function(callback) {
    this.getStatus(() => {
        callback(null, this.status.pow == 'on');
    });
}

MiPhilipsBedsideLamp.prototype.setPower = function(val, callback) {
    var action = val ? 'on' : 'off';
    const params = prepareArgs(this.config, '--action', action);
    execPython(params, (code) => {
        callback(null);
    });
}

MiPhilipsBedsideLamp.prototype.getBrightness = function(callback) {
    this.getStatus(() => {
        callback(null, this.status.bri);
    });
}

MiPhilipsBedsideLamp.prototype.setBrightness = function(val, callback) {
    this.hsv.v = val;
    const params = prepareArgs(this.config, '--brightness', val);
    execPython(params, (code) => {
        callback(null);
    });
}

MiPhilipsBedsideLamp.prototype.getColorTemperature = function(callback) {
    this.getStatus(() => {
        callback(null, this.status.cct);
    });
}

MiPhilipsBedsideLamp.prototype.setColorTemperature = function(val, callback) {
    const params = prepareArgs(this.config, '--colorTemperature', val);
    execPython(params, (code) => {
        callback(null);
    });
}

MiPhilipsBedsideLamp.prototype.getHue = function(callback) {
    if (this.hsv) {
	callback(null, this.hsv.h);
	return;
    }
    this.getStatus(() => {
        this.hsv = convert_RGBInt_to_Hsv(this.status.rgb);
        this.hsv = this.status.bri;
	callback(null, this.hsv.h);
    });
}

MiPhilipsBedsideLamp.prototype.setHue = function(val, callback) {
    this.hsv.h = val;

    const params = prepareArgs(this.config, '--rgb', convert_Hsv_to_RGBInt(this.hsv));
    execPython(params, (code) => {
        callback(null);
    });  
}

MiPhilipsBedsideLamp.prototype.getSaturation = function(callback) {
    if (this.hsv) {
	callback(null, this.hsv.s);
	return;
    }
    this.getStatus(() => {
        this.hsv = convert_RGBInt_to_Hsv(this.status.rgb);
    	this.hsv.v = this.status.bri;
        callback(null, this.hsv.s);
    });
}

MiPhilipsBedsideLamp.prototype.setSaturation = function(val, callback) {
    this.hsv.s = val;
    callback(null);
// const params = prepareArgs(this.config, '--rgb', convert_Hsv_to_RGBInt(this.hsv));
//    execPython(params, (code) => {
//        callback(null);
 //   });
}

MiPhilipsBedsideLamp.prototype.getStatus = function(callback) {
    if (this.status) {
        callback()
        return;
    }

    var dataSet = [];
    const python = spawn('python3', prepareArgs(this.config, '--action', 'status'));
    python.stdout.on('data', (data) => dataSet.push(data));
    python.on('close', (code) => {
       this.status = JSON.parse(dataSet.join(""))["data"];
       callback();
    });  
}

convert_RGBInt_to_Hsv = function(rgbInt) {
    const b = rgbInt & 255;
    const g = (rgbInt >> 8) & 255;
    const r = (rgbInt >> 16) & 255;
    return colorsys.rgb_to_hsv({r: r, g: g, b: b});
}

convert_Hsv_to_RGBInt = function(hsv) {
   hsv.v = 100;
   const rgb = colorsys.hsv_to_rgb(hsv);
   var RGBInt = rgb.r;
   RGBInt = (RGBInt << 8) + rgb.g;
   RGBInt = (RGBInt << 8) + rgb.b;
   return RGBInt;
}

execPython = function(params, callback) {
    const python = spawn('python3', params);
    python.on('close', callback);
}

prepareArgs = function(config, ...params) {
   return [
      './devices/p.py',
      '--ip',
      config.ip,
      '--token',
      config.token
   ].concat(params);
}
