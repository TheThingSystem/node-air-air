var NobleDevice = require('noble-device');

                         
var SERVICE_UUID       = '0000ffe000001000800000805f9b34fb';
var VOLTAGE_UUID       = '0000ffe000001000800000805f9b34fb';

var AirAir = function(peripheral) {
  NobleDevice.call(this, peripheral);
};

AirAir.SCAN_UUIDS = [SERVICE_UUID];

AirAir.is = function(peripheral) {
console.log(require('util').inspect(peripheral, { depth: null }));
  return (peripheral.advertisement.localName === 'AIRAIR');
};

NobleDevice.Util.inherits(AirAir, NobleDevice);
NobleDevice.Util.mixin(AirAir, NobleDevice.DeviceInformationService);

AirAir.prototype.readValues = function(callback) {
  this.readUInt16LECharacteristic(SERVICE_UUID, VOLTAGE_UUID, function(bytes) {
    var data, i, j, results;

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
    results.concentration = ((results.Vout - results.voc) * 100) / results.kValue;

    for (i = 0, j = 0; j < 15; j++) i += data[j];
    if (data[15] !== (i & 0xff)) return callback(new Error('wrong checksum'));

    callback(null, results);
  }.bind(this));
};

AirAir.prototype.readDeviceName = function(callback) {
  this.readStringCharacteristic('1800', '2A00', callback);
};

AirAir.prototype.writeDeviceName = function(deviceName, callback) {
  for (var i = deviceName.length; i < 16; i++) {
    deviceName += '\0';
  }

  this.writeStringCharacteristic('1800', '2A00', deviceName, callback);
};

module.exports = AirAir;
