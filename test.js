var async = require('async');

var AirAir = require('./index');

AirAir.discover(function(sensor) {
  console.log('found ' + sensor.uuid);

  sensor.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });

  async.series([
      function(callback) {
        console.log('connectAndSetup');
        sensor.connectAndSetup(callback);
      },
      function(callback) {
        console.log('readModelNumber');
        sensor.readModelNumber(function(modelNumber) {
          console.log('\tmodel name = ' + modelNumber);
          callback();
        });
      },
      function(callback) {
        console.log('readSerialNumber');
        sensor.readSerialNumber(function(serialNumber) {
          console.log('\tserial name = ' + serialNumber);
          callback();
        });
      },
      function(callback) {
        console.log('readFirmwareRevision');
        sensor.readFirmwareRevision(function(firmwareRevision) {
          console.log('\tfirmware revision = ' + firmwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readHardwareRevision');
        sensor.readHardwareRevision(function(hardwareRevision) {
          console.log('\thardware revision = ' + hardwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readSoftwareRevision');
        sensor.readSoftwareRevision(function(softwareRevision) {
          console.log('\tsoftware revision = ' + softwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readManufacturerName');
        sensor.readManufacturerName(function(manufacturerName) {
          console.log('\tmanufacturer name = ' + manufacturerName);
          callback();
        });
      },
      function(callback) {
        console.log('readValues');
        sensor.readValues(function(err, result) {
          if (!!err) console.log('\tvalues error: ' + err.message); else console.log('\tvalues = ' + JSON.stringify(result));
          callback();
        });
      },
      function(callback) {
        console.log('readDeviceName');
        sensor.readDeviceName(function(deviceName) {
          console.log('\tdevice name = ' + deviceName);

          deviceName = 'SENSOR ONE';

          console.log('writeDeviceName');
          sensor.writeDeviceName(deviceName, callback);
        });
      },
      function(callback) {
        console.log('disconnect');
        sensor.disconnect(callback);
      }
    ]
  );
});
