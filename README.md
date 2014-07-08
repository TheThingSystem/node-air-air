node-air-air
============

node.js library for the Air.Air! Portal Air Quality Detector

Install
-------

    npm install air-air

Usage
-----

    var AirAir = require('air-air');

__Discover__

    AirAir.discover(callback(sensor));

__Connect and Setup (discover services and characteristics)__

    sensor.connectAndSetup(callback);

__Disconnect__

    sensor.disconnect(callback);

__Reading__

    sensor.readValues(callback(err, result));

__Device Name__

    sensor.readDeviceName(callback(deviceName));

    var deviceName = 'AIRAIR 1';

    sensor.writeDeviceName(deviceName, callback);

Credits
-------

Based entirely on Sandeep Mistry's [node-tethercell](https://github.com/sandeepmistry/node-tethercell) package.
