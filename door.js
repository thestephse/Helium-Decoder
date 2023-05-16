function Decoder(bytes, port) {
  var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  var bat = value / 1000;

  var door_open_status = bytes[0] & 0x80 ? 1 : 0;
  var water_leak_status = bytes[0] & 0x40 ? 1 : 0;

  var mod = bytes[2];
  var alarm = bytes[9] & 0x01;

  let fields = {};
  fields['batV'] = bat;
  fields['mod'] = mod;

  if (mod == 1) {
    var open_times = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
    var open_duration = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];

    fields['door_open_status'] = door_open_status > 0 ? true : false;
    fields['door_open_times'] = open_times;
    fields['last_door_open_duration'] = open_duration;
    fields['alarm'] = alarm > 0 ? true : false;
  } else if (mod == 2) {
    var leak_times = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
    var leak_duration = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];

    fields['water_leak_status'] = water_leak_status;
    fields['water_leak_times'] = leak_times;
    fields['last_water_leak_duration'] = leak_duration;
  } else if (mod == 3) {
    fields['door_open_status'] = door_open_status;
    fields['water_leak_status'] = water_leak_status;
    fields['alarm'] = alarm;
  }

  // LORA data might be added in future
  // fields['LORA_RSSI'] = ... ;
  // fields['LORA_SNR'] = ... ;
  // fields['LORA_DATARATE'] = ... ;

  return fields;
}
