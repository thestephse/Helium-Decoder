const keysOfInterest = [
  "batV",
  "temp",
  "hum",
  "lat",
  "lon",
  "hotspots",
  "payload_type",
  "reported_at",
];

let fields = {};

for (let key in msg.payload.decoded.payload) {
  if (keysOfInterest.includes(key)) {
    fields[key] = msg.payload.decoded.payload[key];
  }
}

let hotspots = msg.payload.hotspots;

for (let i = 0; i < hotspots.length; i++) {
  fields[`hotspot_${i}`] = hotspots[i].name;
  fields[`rssi_${i}`] = hotspots[i].rssi;
  fields[`snr_${i}`] = hotspots[i].snr;
}

delete fields.hotspots; // Remove the hotspots array from the fields

let influxMessage = {
  measurement: msg.payload.id,
  fields: fields,
  tags: { name: msg.payload.name },
  timestamp: new Date(msg.payload.reported_at).getTime() * 1000000, // Nanoseconds
};

msg.payload = [influxMessage];
return msg;
