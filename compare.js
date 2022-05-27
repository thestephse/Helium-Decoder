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
