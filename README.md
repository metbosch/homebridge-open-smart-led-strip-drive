# homebridge-open-smart-led-strip-driver

Supports the Open Smart LED Strip Driver module controled through GPIO pins.
This plugin requires/uses third-party NodeJS libraries to send the crontrols to the driver module using the GPIO pins (probably in your Raspberry PI).

# Installation

1. Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.

2. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-open-smart-led-strip-driver) and should be installed "globally" by typing: `npm install -g homebridge-open-smart-led-strip-driver`

3. Update your configuration file. See [config-sample.json](https://github.com/metbosch/homebridge-open-smart-led-strip-driver/blob/master/config-sample.json) in this repository for a sample.

# Configuration

Example:

```bash
{
  "accessory": "OpenSmartLedStrip",
  "name": "RGB Led Strip",
  "pin_clk": "GPIO17",
  "pin_dat": "GPIO18"
}
```

The mandatory options are:
 * ```name``` Accessory name.
 * ```pin_clk``` Pin identifier for the clock port (See [raspi-pi wiki](https://github.com/nebrius/raspi-io/wiki/Pin-Information) for more information about pin naming).
 * ```pin_dat``` Pin identifier for the data port (See [raspi-pi wiki](https://github.com/nebrius/raspi-io/wiki/Pin-Information) for more information about pin naming).

The other available options are:
 * ```manufacter``` Manufacter name to be displayed.
 * ```model``` Model name to be displayed.
 * ```serial``` Serial number to be displayed.
 * ```delay``` Delay in miliseconds between writes in the clock/data pins.
