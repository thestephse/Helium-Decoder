function Decoder(bytes, port) {
  const batV = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
  const tempC_SHT = ((((bytes[2] << 24) >> 16) | bytes[3]) / 100).toFixed(2);
  const hum_SHT = (((bytes[4] << 8) | bytes[5]) / 10).toFixed(2);
  const extSensor = bytes[6] & 0x7f;
  const extSensorFlag = (bytes[6] & 0x80) >> 7;

  const decoded = {
    batV: batV,
    temp: tempC_SHT,
    hum: hum_SHT,
  };

  if (extSensor === 1) {
    decoded.TempC_DS = Math.round((((bytes[7] << 24) >> 16) | bytes[8]) / 100);
    decoded.No_connect = extSensorFlag ? "Sensor no connection" : undefined;
  } else if (extSensor === 4) {
    decoded.Ext_sensor = "Interrupt Sensor send";
    decoded.Exti_pin_level = bytes[7] ? "High" : "Low";
    decoded.Exti_status = bytes[8] ? "True" : "False";
  } else if (extSensor === 5) {
    decoded.Ext_sensor = "Illumination Sensor";
    decoded.ILL_lux = (bytes[7] << 8) | bytes[8];
  } else if (extSensor === 6) {
    decoded.Ext_sensor = "ADC Sensor";
    decoded.ADC_V = ((bytes[7] << 8) | bytes[8]) / 1000;
  } else if (extSensor === 7) {
    decoded.Ext_sensor = "Interrupt Sensor count";
    decoded.Exit_count = (bytes[7] << 8) | bytes[8];
  } else {
    decoded.Ext_sensor = "No external sensor";
  }

  return decoded;
}
