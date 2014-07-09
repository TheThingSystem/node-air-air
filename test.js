var async  = require('async')
  , util   = require('util')
  , AirAir = require('./index')
  ;

AirAir.discover(function(sensor) {
  console.log('found ' + sensor.uuid);

  sensor.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });

  sensor.on('sensorDataChange', function(err, results) {
    if (!!err) console.log('\tvalues error: ' + err.message); else console.log(util.inspect(results, { depth: null }));
  });

  async.series([
      function(callback) {
        console.log('connectAndSetup');
        sensor.connectAndSetup(callback);
      },
      function(callback) {
        console.log('notifySensorData');
        sensor.notifySensorData(callback);
      },
      function(callback) {
        setTimeout(callback, 60000);
      },
      function(callback) {
        console.log('unnotifySensorData');
        sensor.unnotifySensorData(callback);
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

