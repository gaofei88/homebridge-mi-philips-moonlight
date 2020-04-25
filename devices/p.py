import sys
import json
import argparse

import miio.philips_moonlight

parser = argparse.ArgumentParser(description='Script which communicate with Bedside Lamp')
parser.add_argument('--ip');
parser.add_argument('--token');
parser.add_argument('--action');
parser.add_argument('--brightness', type=int);
parser.add_argument('--colorTemperature', type=int);
parser.add_argument('--rgb', type=int);

args = parser.parse_args()

if args.ip and args.token:
    Light = miio.philips_moonlight.PhilipsMoonlight(args.ip, args.token)
else:
    print('IP and token must be present.')
    sys.exit()

if args.action == 'on':
    Light.on()
elif args.action == 'off':
    Light.off()
elif args.action == 'status':
    status = Light.status()
    print(json.dumps(status.__dict__))
elif args.brightness:
    Light.set_brightness(args.brightness)
elif args.colorTemperature:
    Light.set_color_temperature(args.colorTemperature)
elif args.rgb:
    b = args.rgb & 255
    g = (args.rgb >> 8) & 255
    r = (args.rgb >> 16) & 255
    Light.set_rgb([r, g, b])
