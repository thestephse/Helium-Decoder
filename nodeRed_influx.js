const keysOfInterest = [
  'batV',
  'temp',
  'hum',
  'lat',
  'lon',
  'hotspots',
  'payload_type',
  'reported_at',
  'alarm',
  'door_open_status',
  'organization_id',
  'multibuy',
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
  fields[`hs_rssi_${i}`] = hotspots[i].rssi;
  fields[`hs_snr_${i}`] = hotspots[i].snr;
  fields[`hs_lat_${i}`] = hotspots[i].lat;
  fields[`hs_lon_${i}`] = hotspots[i].long;
  fields[`hs_reported_${i}`] = hotspots[i].reported_at;
}

delete fields.hotspots; // Remove the hotspots array from the fields

let influxMessage = {
  measurement: msg.payload.id,
  fields: fields,
  tags: {
    name: msg.payload.name,
    organization: msg.payload.metadata.organization_id,
    multibuy: msg.payload.metadata.multibuy,
    payload_size: msg.payload.metadata.payload_size,
  },
  timestamp: new Date(msg.payload.reported_at).getTime() * 1000000, // Nanoseconds
};

msg.payload = [influxMessage];
return msg;
