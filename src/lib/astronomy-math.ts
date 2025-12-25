import * as THREE from 'three';
export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);
export const radToDeg = (radians: number): number => radians * (180 / Math.PI);
export const radecToVector3 = (raHours: number, decDegrees: number, radius: number = 100): THREE.Vector3 => {
  const raRad = degToRad(raHours * 15);
  const decRad = degToRad(decDegrees);
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);
  return new THREE.Vector3(x, y, z);
};
export const bvToColor = (bv: number): string => {
  if (bv < -0.4) return "#9bb2ff";
  if (bv < 0.0) return "#bbccff";
  if (bv < 0.3) return "#f8f7ff";
  if (bv < 0.6) return "#fff4ea";
  if (bv < 0.8) return "#fff2a1";
  if (bv < 1.1) return "#ffcc6f";
  return "#ff6060";
};
export const getJulianDate = (date: Date): number => {
  return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
};
export const getLocalSiderealTime = (date: Date, longitude: number): number => {
  const jd = getJulianDate(date);
  const d = jd - 2451545.0;
  let lst = 18.697374558 + 24.06570982441908 * d;
  lst = (lst + longitude / 15.0) % 24;
  return lst < 0 ? lst + 24 : lst;
};
export const getSunPosition = (date: Date, lat: number, lon: number) => {
  const jd = getJulianDate(date);
  const d = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * d) % 360;
  const g = degToRad((357.528 + 0.9856003 * d) % 360);
  const lambda = degToRad(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
  const epsilon = degToRad(23.439 - 0.0000004 * d);
  const ra = radToDeg(Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda))) / 15;
  const dec = radToDeg(Math.asin(Math.sin(epsilon) * Math.sin(lambda)));
  const lst = getLocalSiderealTime(date, lon);
  const ha = degToRad((lst - ra) * 15);
  const phi = degToRad(lat);
  const delta = degToRad(dec);
  const alt = radToDeg(Math.asin(Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(ha)));
  const az = radToDeg(Math.atan2(-Math.sin(ha), Math.cos(phi) * Math.tan(delta) - Math.sin(phi) * Math.cos(ha)));
  return { altitude: alt, azimuth: az };
};
export const predictBortleFromLocation = (lat: number, lon: number): number => {
  // Mock prediction: Higher Bortle near South African city centers
  const JHB = { lat: -26.2, lon: 28.0 };
  const CPT = { lat: -33.9, lon: 18.4 };
  const DUR = { lat: -29.8, lon: 31.0 };
  const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lon - p2.lon, 2));
  const minCityDist = Math.min(dist({lat, lon}, JHB), dist({lat, lon}, CPT), dist({lat, lon}, DUR));
  if (minCityDist < 0.1) return 8; // City center
  if (minCityDist < 0.5) return 6; // Suburban
  if (minCityDist < 1.5) return 4; // Rural
  return 2; // Dark sky
};
export const getSkyColor = (sunAltitude: number): string => {
  if (sunAltitude > 0) return "#87ceeb";
  if (sunAltitude > -6) return "#1e3a8a";
  if (sunAltitude > -12) return "#1e1b4b";
  if (sunAltitude > -18) return "#020617";
  return "#020617";
};
export const getLunarPhase = (date: Date): { phase: number; name: string } => {
  const jd = getJulianDate(date);
  const cycle = 29.530588853;
  const knownNewMoon = 2451550.1;
  const phase = ((jd - knownNewMoon) % cycle) / cycle;
  const p = phase < 0 ? phase + 1 : phase;
  let name = "New Moon";
  if (p < 0.03) name = "New Moon";
  else if (p < 0.22) name = "Waxing Crescent";
  else if (p < 0.28) name = "First Quarter";
  else if (p < 0.47) name = "Waxing Gibbous";
  else if (p < 0.53) name = "Full Moon";
  else if (p < 0.72) name = "Waning Gibbous";
  else if (p < 0.78) name = "Last Quarter";
  else name = "Waning Crescent";
  return { phase: p, name };
};
export const applyPrecession = (ra: number, dec: number, years: number): { ra: number; dec: number } => {
  const raChange = (3.075 + 1.336 * Math.sin(degToRad(ra * 15)) * Math.tan(degToRad(dec))) * (years / 3600);
  const decChange = (20.04 * Math.cos(degToRad(ra * 15))) * (years / 3600);
  return {
    ra: (ra + raChange / 15) % 24,
    dec: Math.max(-90, Math.min(90, dec + decChange))
  };
};