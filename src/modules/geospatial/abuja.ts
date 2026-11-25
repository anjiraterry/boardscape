export const ABUJA_CENTER = {
  latitude: 9.0765,
  longitude: 7.3986,
} as const;

export const ABUJA_CORRIDORS = [
  "CBD / Garki / Wuse",
  "Jabi / Utako",
  "Maitama / Mabushi",
  "Airport Road / Lugbe",
  "Gwarinpa / Kubwa",
] as const;

export const ABUJA_DISTRICTS = [
  "Central Business District",
  "Wuse II",
  "Wuse",
  "Garki",
  "Maitama",
  "Asokoro",
  "Jabi",
  "Utako",
  "Mabushi",
  "Gwarinpa",
  "Kubwa",
  "Lugbe",
  "Gudu",
  "Katampe",
] as const;

/**
 * Haversine distance in meters between two WGS84 coordinates.
 * Used client-side and in unit tests alongside PostGIS ST_DWithin on the server.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatAzimuthCompass(azimuthDeg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((azimuthDeg % 360) / 45)) % 8;
  return `${azimuthDeg}° (${dirs[idx]})`;
}
