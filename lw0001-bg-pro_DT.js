function Decoder(bytes, port) {
  var decoded = [];
  // warnings = [];
  // errors = [];

  common_header = bytes.slice(0, 3);

  // make status fields on events. boolean
  statusB = common_header[0];

  decoded.push({
    field: "HAS_MOVED",
    value: (statusB >> 5) & 0x01,
  });

  decoded.push({
    field: "OPERATION_MODE",
    value: statusB & 0x03,
  });
  decoded.push({
    field: "TAMPER_ALARM",
    value: (statusB >> 3) & 0x01,
  });
  decoded.push({
    field: "BATTERY_LOW",
    value: (statusB >> 2) & 0x01,
  });
  decoded.push({
    field: "MAN_DOWN",
    value: (statusB >> 4) & 0x01,
  });

  temperature = common_header[1];
  insertTemp = temperature -= temperature > 128 ? 256 : 0;

  decoded.push({
    field: "TEMPERATURE",
    value: insertTemp,
  });

  ack_frm_cnt = common_header[2] & 0x0f;
  battery_voltage = (common_header[2] >> 4) & 0x0f;

  decoded.push({
    field: "VOLTAGE",
    value: Math.round(10 * (2.2 + 0.1 * battery_voltage)) / 10,
  });

  if (port === 1) {
    payload_type = "HEARTBEAT";
    reboot_reason = bytes[3];
    fw_ver =
      ((bytes[4] >> 6) & 0x03) +
      "." +
      ((bytes[4] >> 4) & 0x03) +
      "." +
      (bytes[4] & 0x0f);
    active_state_count = Bytes2Int(bytes.slice(5, 8));

    decoded.push({
      field: "HEARTBEAT",
      value: active_state_count,
    });
  }

  if (port === 2) {
    payload_type = "location_fix";
    positioning_type = (statusB >> 6) & 0x01; //not sure if statusB , original code is decoded.status , but status was not defined before
    positioning_success_type = bytes[3];
    date_time = Bytes2DateTime(bytes.slice(4, 12));
    data_length = bytes[12];
    payload = bytes.slice(13, 13 + data_length + 1);
    if (positioning_success_type === 0) {
      //wifi
      wifi = {};
      for (i = 0; i < data_length / 7; i++) {
        wifi[Bytes2MAC(payload.slice(i * 7, i * 7 + 6))] =
          payload[i * 7 + 6] - 256;

        decoded.push({
          field: "GPS_LOCATION",
          value: wifi,

          // decoded.push({
          //   field: "FIX",
          //   value: "WIFI"
          // }),
        });
      }
    } else if (positioning_success_type === 1) {
      //bt
      bluetooth = {};

      for (i = 0; i < data_length / 7; i++) {
        bluetooth[Bytes2MAC(payload.slice(i * 7, i * 7 + 6))] =
          payload[i * 7 + 6] - 256;

        decoded.push({
          field: "GPS_LOCATION",
          value: bluetooth,

          field: "FIX",
          value: "BT",
        });
      }
    } else if (positioning_success_type === 2) {
      //gps
      gps = {};
      gps.pdop = Math.round(payload[8] / 10);
      gps.latitude = Bytes2Int(payload.slice(0, 4));
      gps.latitude -= latitude > 0x80000000 ? 0x0100000000 : 0;
      gps.latitude /= 10000000;
      gps.longitude = Bytes2Int(payload.slice(4, 8));
      gps.longitude -= longitude > 0x80000000 ? 0x0100000000 : 0;
      gps.longitude /= 10000000;

      decoded.push({
        field: "GPS_LOCATION",
        value: gps,

        field: "FIX",
        value: "GPS",
      });
    }
  }

  if (port === 3) {
    payload_type = "location_failure";
    position_failure = Bytes2Hex([bytes[3]]);
    data_length = bytes[4];
    payload = bytes.slice(5, 5 + data_length + 1);
    if (bytes[3] < 0x03) {
      //wifi
      wifi = {};
      for (i = 0; i < data_length / 7; i++) {
        wifi[Bytes2MAC(payload.slice(i * 7, i * 7 + 6))] =
          payload[i * 7 + 6] - 256;
      }
    } else if (bytes[3] < 0x06) {
      //bt
      bluetooth = {};
      for (i = 0; i < data_length / 7; i++) {
        bluetooth[Bytes2MAC(payload.slice(i * 7, i * 7 + 6))] =
          payload[i * 7 + 6] - 256;
      }
    } else if (bytes[3] < 0x0c) {
      //gps
      gps = {};
      gps.pdop = payload[0] === 0xff ? "unknown" : Math.round(payload[0] / 10);
      gps.cn = payload.slice(1, 5);
    }
  }

  if (port === 4) {
    payload_type = "shutdown";
    shutdown_type = bytes[3];
  }

  if (port == 5) {
    payload_type = "VIBRATION";
    vibrations_count = Bytes2Int([bytes[3], bytes[4]]);
  }

  if (port === 6) {
    payload_type = "man_down";
    idle_hours = Bytes2Int([bytes[3], bytes[4]]);
  }

  if (port === 7) {
    payload_type = "tamper_alarm";
    date_time = Bytes2DateTime(bytes.slice(3, 11));
  }

  if (port === 8) {
    decoded.push({
      field: "MOVEMENT",
      value: (decoded.event_type = bytes[3]),
    });
  }

  if (port === 9) {
    payload_type = "battery_consumption";
    gps_worktime = Bytes2Int(bytes.slice(3, 7));
    wifi_worktime = Bytes2Int(bytes.slice(7, 11));
    bt_scan_worktime = Bytes2Int(bytes.slice(11, 15));
    bt_brdcast_worktime = Bytes2Int(bytes.slice(15, 19));
    lora_worktime = Bytes2Int(bytes.slice(19, 23));
  }

  raw_bytes = bytes;
  raw_bytes = Bytes2Hex(bytes);

  return decoded;
  // return {
  //   data: decoded,
  //   warnings: [],
  //   errors: [],
  // };
}

/* 4-byte float in IEEE 754 standard, byte order is low byte first */
function Bytes2Float(byteArray) {
  var bits =
    (byteArray[3] << 24) |
    (byteArray[2] << 16) |
    (byteArray[1] << 8) |
    byteArray[0];
  var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  var e = (bits >>> 23) & 0xff;
  var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

/* n-bytes array to integer - most significant byte is stored first (Big Endian) */
function Bytes2Int(byteArray) {
  var n = 0;
  for (i = 0; i < byteArray.length; i++) {
    n = (n << 8) + byteArray[i];
  }
  return n;
}

function Bytes2Hex(byteArray) {
  return Array(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

function Bytes2MAC(byteArray) {
  return Array(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join(":");
}

function Bytes2DateTime(byteArray) {
  dt = {};
  dt.ts_year = Bytes2Int([byteArray[0], byteArray[1]]);
  dt.ts_month = byteArray[2];
  dt.ts_day = byteArray[3];
  dt.ts_hour = byteArray[4];
  dt.ts_min = byteArray[5];
  dt.ts_sec = byteArray[6];

  dt.ts_tz = byteArray[7];
  dt.ts_tz -= dt.ts_tz > 128 ? 256 : 0;
  dt.ts_tz = dt.ts_tz >= 0 ? "+" + dt.ts_tz : dt.ts_tz;

  dt.datetime = "";
  dt.datetime += dt.ts_year + "-" + dt.ts_month + "-" + dt.ts_day;
  dt.datetime += " " + dt.ts_hour + ":" + dt.ts_min + ":" + dt.ts_sec;
  dt.datetime += " " + "UTC" + dt.ts_tz;
  return dt;
}
