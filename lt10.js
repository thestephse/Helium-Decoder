function hexToBits(hex) {
  let out = "";
  for (let c of hex) {
    switch (c) {
      case "0":
        out += "0000";
        break;
      case "1":
        out += "0001";
        break;
      case "2":
        out += "0010";
        break;
      case "3":
        out += "0011";
        break;
      case "4":
        out += "0100";
        break;
      case "5":
        out += "0101";
        break;
      case "6":
        out += "0110";
        break;
      case "7":
        out += "0111";
        break;
      case "8":
        out += "1000";
        break;
      case "9":
        out += "1001";
        break;
      case "a":
        out += "1010";
        break;
      case "b":
        out += "1011";
        break;
      case "c":
        out += "1100";
        break;
      case "d":
        out += "1101";
        break;
      case "e":
        out += "1110";
        break;
      case "f":
        out += "1111";
        break;
      default:
        return "";
    }
  }
  return out;
}

function bitsToSigned(bits) {
  let value = parseInt(bits, 2);
  const limit = 1 << (bits.length - 1);

  if (value >= limit) {
    value = value - limit - limit;
  }
  return value;
}

function bitsToUnsigned(bits) {
  return parseInt(bits, 2);
}

function toLittleEndianSigned(hex) {
  let hexArray = [];
  while (hex.length >= 2) {
    hexArray.push(hex.substring(0, 2));
    hex = hex.substring(2, hex.length);
  }
  hex = hexArray.join("");
  const hex2bits = hexToBits(hex);
  const signedInt = bitsToSigned(hex2bits);
  return signedInt;
}

function toPaddedHexString(number) {
  let hex = number.toString(16).toLowerCase();
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  return hex;
}

function Decoder(bytes, port) {
  // Protocol version and command id are not used here, similar to the provided Decoder function.

  // Longitude
  const longitudeInteger = bytes[2] + (bytes[3] << 8) + (bytes[4] << 16);
  const longitude =
    ((toLittleEndianSigned(toPaddedHexString(longitudeInteger)) * 215) / 10) *
    0.000001;

  // Latitude
  const latitudeInteger = bytes[5] + (bytes[6] << 8) + (bytes[7] << 16);
  const latitude =
    ((toLittleEndianSigned(toPaddedHexString(latitudeInteger)) * 108) / 10) *
    0.000001;

  // GPS fix status and report type
  const gpsStatus = Math.round(
    bitsToUnsigned(hexToBits(toPaddedHexString(bytes[8] << 8))) / 256 / 32
  );
  const gps =
    gpsStatus === 0 ? "No fix" : gpsStatus === 1 ? "2D fix" : "3D fix";

  // Report type
  const reportTypeCode = Math.round(
    (bitsToUnsigned(hexToBits(toPaddedHexString(bytes[8] << 8))) / 256) % 32
  );
  const reportType =
    reportTypeCode === 2
      ? "Periodic mode report"
      : reportTypeCode === 4
      ? "Motion mode static report"
      : reportTypeCode === 5
      ? "Motion mode moving report"
      : reportTypeCode === 6
      ? "Motion mode static to moving report"
      : reportTypeCode === 7
      ? "Motion mode moving to static report"
      : "Low battery alarm report";

  // Battery capacity
  const batteryPercent =
    bitsToUnsigned(hexToBits(toPaddedHexString(bytes[9] << 8))) / 256;

  // Decoded data
  const decoded = {
    Longitude: longitude,
    Latitude: latitude,
    Gps: gps,
    ReportType: reportType,
    BatteryPercent: batteryPercent,
  };

  // Preserved field is not used here, similar to the provided Decoder function.

  return decoded;
}
