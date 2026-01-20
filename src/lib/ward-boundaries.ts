export const WARD_26_BOUNDARIES = {
  name: "Ward 26 - KDMC",
  areas: [
    "Ayare Road",
    "Rajaji Path",
    "Ram Nagar",
    "Shiv Market",
    "Savarkar Road"
  ],
  center: {
    lat: 19.2403,
    lng: 73.1305
  },
  polygon: [
    { lat: 19.2450, lng: 73.1250 },
    { lat: 19.2450, lng: 73.1360 },
    { lat: 19.2356, lng: 73.1360 },
    { lat: 19.2356, lng: 73.1250 },
    { lat: 19.2450, lng: 73.1250 }
  ],
  bounds: {
    north: 19.2450,
    south: 19.2356,
    east: 73.1360,
    west: 73.1250
  }
};

export function isPointInWard(lat: number, lng: number): boolean {
  const { bounds } = WARD_26_BOUNDARIES;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

export function isPointInPolygon(lat: number, lng: number): boolean {
  const polygon = WARD_26_BOUNDARIES.polygon;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    
    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

export const VALID_PINCODES = ["421301", "421302", "421303", "421304", "421305", "421306"];

export function isValidPincode(pincode: string): boolean {
  return VALID_PINCODES.includes(pincode);
}
