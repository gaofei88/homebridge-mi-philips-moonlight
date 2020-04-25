# homebridge-mi-philips-moonlight

A homebridge plugin to support Philips Zhi Rui Bedside Lamp. (飞利浦智睿床头灯)

This repo heavily refers to [Philips Light](https://github.com/YinHangCode/homebridge-mi-philips-light). Due to the lack of support from [miio](https://github.com/aholstenson/miio) for **Philips Zhi Rui Bedside Lamp**, this plugin is depending on the python version miio ([python-miio](https://github.com/rytilahti/python-miio)). Please follow the instruction from python-miio's [Get Started](https://python-miio.readthedocs.io/en/latest/discovery.html#installation) page to have **python-miio** installed and get your **token** ready.

# Installation

Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-fake-rgb) and should be installed "globally" by typing:

```bash
npm install -g homebridge-mi-philips-moonlight
```

# Configuration
```json
"platforms": [{
	"platform": "MiPhilipsMoonLightPlatform",
	"devices": [{
		"type": "MiPhilipsZhiRuiBedsideLamp",
		"name": "BedSide Lamp",
		"ip": "YOUR DEVICE IP",
		"token": "YOUR DEVICE TOKEN"
	}]
}]
```
Please refer to the [`config.sample.json`](https://github.com/gaofei88/homebridge-mi-philips-moonlight/blob/master/config.sample.json)

