// BATTERY
if (channel_id === 0x01 && channel_type === 0x75) {
  decoded.battery = bytes[i];
  i += 1;
}

// BATTERY
if (channel_id === 0x01 && channel_type === 0x75) {
    decoded.push({
        "field": "BATTERY",
        "value": bytes[i]
    });
    i += 1;


    function Decoder(bytes, port) {
        var decoded = [];
        if (port === 1) {
            var latitudeDeg = bytes[0] + bytes[1] * 256 +
                bytes[2] * 65536 + bytes[3] * 16777216;
            if (latitudeDeg >= 0x80000000)
                latitudeDeg -= 0x100000000;
            latitudeDeg /= 1e7;
    
            var longitudeDeg = bytes[4] + bytes[5] * 256 +
                bytes[6] * 65536 + bytes[7] * 16777216;
            if (longitudeDeg >= 0x80000000)
                longitudeDeg -= 0x100000000;
            longitudeDeg /= 1e7;
    
            decoded.push({
                field: "LOCATION",
                value: "(" + latitudeDeg + "," + longitudeDeg + ")"
            })
    
            decoded.push({
                field: "IN_TRIP",
                value: ((bytes[8] & 0x1) !== 0) ? true : false
            })
            decoded.push({
                field: "FIX_FAILED",
                value: ((bytes[8] & 0x2) !== 0) ? true : false
            })
            decoded.push({
                field: "MAN_DOWN",
                value: ((bytes[8] & 0x4) !== 0) ? true : false
            })
            decoded.push({
                field: "HEADING_DEG",
                value: (bytes[9] & 0x7) * 45
            })
    
            decoded.push({
                field: "SPEED",
                value: (bytes[9] >> 3) * 5
            })
            decoded.push({
                field: "BATTERY",
                value: bytes[10] * 0.025
            })
        } else if (port === 2) {
            // downlink ack
            // decoded.sequence = (bytes[0] & 0x7F);
            // decoded.accepted = ((bytes[0] & 0x80) !== 0) ? true : false;
            // decoded.fwMaj = bytes[1];
            // decoded.fwMin = bytes[2];
        }
        else if (port === 3) {
            decoded.push({
                field: "INITIAL_BAT",
                value: 4.0 + 0.100 * (bytes[0] & 0xF)
            });
            decoded.push({
                field: "TX_COUNT",
                value: 32 * ((bytes[0] >> 4) + (bytes[1] & 0x7F) * 16)
            })
            decoded.push({
                field: "TRIP_COUNT",
                value: 32 * ((bytes[1] >> 7) + (bytes[2] & 0xFF) * 2
                + (bytes[3] & 0x0F) * 512)
            })
            decoded.push({
                field: "GPS_SUCCESSES",
                value: 32 * ((bytes[3] >> 4) + (bytes[4] & 0x3F) * 16)
            })
            decoded.push({
                field: "GPS_FAILS",
                value: 32 * ((bytes[4] >> 6) + (bytes[5] & 0x3F) * 4)
            })
            decoded.push({
                field: "WAKEUPS_PER_TRIP",
                value: 1 * ((bytes[8] >> 8) + (bytes[9] & 0x7F) * 1)
            });
            decoded.push({
                field: "UPTIME",
                value: 1 * ((bytes[9] >> 7) + (bytes[10] & 0xFF) * 2)
            })
        }
        return decoded;
    }
