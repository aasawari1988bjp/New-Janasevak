export interface Coordinate {
  lat: number;
  lng: number;
}

export const WARD_26_BOUNDARY: Coordinate[] = [
  { lat: 19.2245, lng: 73.0835 },
  { lat: 19.2258, lng: 73.0872 },
  { lat: 19.2275, lng: 73.0905 },
  { lat: 19.2282, lng: 73.0932 },
  { lat: 19.2278, lng: 73.0968 },
  { lat: 19.2265, lng: 73.0995 },
  { lat: 19.2248, lng: 73.1012 },
  { lat: 19.2225, lng: 73.1025 },
  { lat: 19.2198, lng: 73.1018 },
  { lat: 19.2175, lng: 73.0998 },
  { lat: 19.2158, lng: 73.0972 },
  { lat: 19.2148, lng: 73.0938 },
  { lat: 19.2152, lng: 73.0898 },
  { lat: 19.2168, lng: 73.0862 },
  { lat: 19.2192, lng: 73.0838 },
  { lat: 19.2218, lng: 73.0828 },
  { lat: 19.2245, lng: 73.0835 },
];

export const WARD_26_CENTER = {
  lat: 19.2215,
  lng: 73.0925,
};

export function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

export function isInWard26(lat: number, lng: number): boolean {
  return isPointInPolygon({ lat, lng }, WARD_26_BOUNDARY);
}

export function getDistanceFromWard(lat: number, lng: number): number {
  const R = 6371;
  const dLat = ((WARD_26_CENTER.lat - lat) * Math.PI) / 180;
  const dLon = ((WARD_26_CENTER.lng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((WARD_26_CENTER.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
