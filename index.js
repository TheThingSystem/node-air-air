var NobleDevice = require('noble-device');


var SERVICE_UUID = 'ffe0';
var SENSOR_UUID  = 'ffe1';

var AirAir = function(peripheral) {
  NobleDevice.call(this, peripheral);
};

AirAir.SCAN_UUIDS = [SERVICE_UUID];

AirAir.is = function(peripheral) {
  return (peripheral.advertisement.localName === 'AIRAIR');
};

NobleDevice.Util.inherits(AirAir, NobleDevice);

var listener = function(self, bytes, callback) {
  var data, i, j, results;

  console.log(bytes);
  if (bytes.length != 16) return callback(new Error('wrong length: ' + bytes.length));

  data = [];
  for (i = 0; i < bytes.length; i++) data[i] = bytes.readUInt8(i);
  if (data[0] !== 0xff) return console.log('wrong initial octet: ' + data[0]);

  results = { protocolVersion  : data[1]
            , hardwareVersion  : data[2]
            , infoType         : data[3]
            , densityVhi       : data[4]
            , densityVlo       : data[5]
            , densityVout      : (3.3 * ((data[4] << 5) | data[5])) / 1024
            , temperature      : data[6] - 0x20
            , batteryGrade     : data[7]
            , batteryLevel     : { '0' : 5, '1' : 20, '2' : 40, '3' : 60, '4' : 80, '5' : 100 }[data[7]]
            , voc              : data[8] / 255
            , kValue           : data[9] / 255
            , samplingInterval : data[10]
            , payload          : data
            };
  if (results.protocolVersion !== 0x01) return callback(new Error('wrong version: ' + results.protocolVersion));
  if (results.infoType !== 0xa1) return callback(new Error('unexpected data type: ' + results.infoType));
  if (results.kValue === 0) return callback(new Error('unexpected K value: ' + results.kValue));
// reportedly micro-grams / cubic meter
  results.concentration = ((results.densityVout - results.voc) * 100) / results.kValue;

  for (i = 0, j = 0; j < 15; j++) i += data[j];
  if (data[15] !== (i & 0xff)) return callback(new Error('wrong checksum'));

  callback(null, results);
};

AirAir.prototype.readValues = function(callback) {
  this.notifyCharacteristic(SERVICE_UUID, SENSOR_UUID, true,
                            function(bytes) { listener(this, bytes, callback); },
                            function() { });
};

AirAir.prototype.writeDeviceName = function(deviceName, callback) {
  for (var i = deviceName.length; i < 16; i++) {
    deviceName += '\0';
  }

  this.writeStringCharacteristic('1800', '2a00', deviceName, callback);
};

module.exports = AirAir;
return;

/*
// stateChange: poweredOn
// connect: ... (AIRAIR)
// RSSI update: -68 (AIRAIR)
{ "...":
  { localName: "AIRAIR",
{ '1800':
   { name: 'Generic Access',
     type: 'org.bluetooth.service.generic_access',
     characteristics:
      { '2a00':
         { name: 'Device Name',
           type: 'org.bluetooth.characteristic.gap.device_name',
           properties: [ 'read' ],
           descriptors: {},
           value: 'AIRAIR' },
        '2a01':
         { name: 'Appearance',
           type: 'org.bluetooth.characteristic.gap.appearance',
           properties: [ 'read' ],
           descriptors: {},
           value: '0000' },
        '2a02':
         { name: 'Peripheral Privacy Flag',
           type: 'org.bluetooth.characteristic.gap.peripheral_privacy_flag',
           properties: [ 'read', 'write' ],
           descriptors: {},
           value: '' },
        '2a03':
         { name: 'Reconnection Address',
           type: 'org.bluetooth.characteristic.gap.reconnection_address',
           properties: [ 'read', 'write' ],
           descriptors: {},
           value: '000000000000' },
        '2a04':
         { name: 'Peripheral Preferred Connection Parameters',
           type: 'org.bluetooth.characteristic.gap.peripheral_preferred_connection_parameters',
           properties: [ 'read' ],
           descriptors: {},
           value: '5000a0000000e803' } } },
  '1801':
   { name: 'Generic Attribute',
     type: 'org.bluetooth.service.generic_attribute',
     characteristics:
      { '2a05':
         { name: 'Service Changed',
           type: 'org.bluetooth.characteristic.gatt.service_changed',
           properties: [ 'indicate' ],
           descriptors:
            { '2902':
               { name: 'Client Characteristic Configuration',
                 type: 'org.bluetooth.descriptor.gatt.client_characteristic_configuration' } } } } },
  ffe0:
   { name: null,
     type: null,
     characteristics:
      { ffe1:
         { name: null,
           type: null,
           properties: [ 'read', 'writeWithoutResponse', 'notify' ],
           descriptors:
            { '2901':
               { name: 'Characteristic User Description',
                 type: 'org.bluetooth.descriptor.gatt.characteristic_user_description' },
              '2902':
               { name: 'Client Characteristic Configuration',
                 type: 'org.bluetooth.descriptor.gatt.client_characteristic_configuration' } } } } } }
  }
}
 */
