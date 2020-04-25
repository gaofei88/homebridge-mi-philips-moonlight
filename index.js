require("./devices/MiPhilipsBedsideLamp");

var fs = require('fs');
var PlatformAccessory, Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
    console.log(homebridge.user.configPath());
    if (!isConfig(homebridge.user.configPath(), "platforms", "MiPhilipsMoonLightPlatform")) {
	return;
    }

    PlatformAccessory = homebridge.platformAccessory;
    Accessory = homebridge.hap.Accessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform('homebridge-mi-philips-light', 'MiPhilipsMoonLightPlatform', MiPhilipsLightPlatform, true);
}

function isConfig(configFile, type, name) {
    var config = JSON.parse(fs.readFileSync(configFile));
    if("accessories" === type) {
        var accessories = config.accessories;
        for(var i in accessories) {
            if(accessories[i]['accessory'] === name) {
                return true;
            }
        }
    } else if("platforms" === type) {
        var platforms = config.platforms;
        for(var i in platforms) {
            if(platforms[i]['platform'] === name) {
                return true;
            }
        }
    } else {
    }
    
    return false;
}

function MiPhilipsLightPlatform(log, config, api) {
    if(null == config) {
        return;
    }
    
    this.Accessory = Accessory;
    this.PlatformAccessory = PlatformAccessory;
    this.Service = Service;
    this.Characteristic = Characteristic;
    this.UUIDGen = UUIDGen;
    
    this.log = log;
    this.config = config;
    if (api) {
        this.api = api;
    }
}

MiPhilipsLightPlatform.prototype = {
    accessories: function(callback) {
        callback(
           this.config['devices'].map(device => {
                switch(device.type) {
                    case "MiPhilipsZhiRuiBedsideLamp":
                        return new MiPhilipsBedsideLamp(this, device);
                    default:
                        return null;
                }
            })
        );
   }
}
