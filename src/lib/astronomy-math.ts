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
  const JHB = { lat: -26.2, lon: 28.0 };
  const CPT = { lat: -33.9, lon: 18.4 };
  const DUR = { lat: -29.8, lon: 31.0 };
  const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lon - p2.lon, 2));
  const minCityDist = Math.min(dist({lat, lon}, JHB), dist({lat, lon}, CPT), dist({lat, lon}, DUR));
  if (minCityDist < 0.1) return 8;
  if (minCityDist < 0.5) return 6;
  if (minCityDist < 1.5) return 4;
  return 2;
};
export const getSkyColor = (sunAltitude: number): string => {
  if (sunAltitude > 0) return "#87ceeb";
  if (sunAltitude > -6) return "#1e3a8a";
  if (sunAltitude > -12) return "#1e1b4b";
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
/**
 * High-Precision Precession (Meeus formula)
 * Valid for +/- 100 years from J2000
 */
export const applyPrecession = (ra: number, dec: number, years: number): { ra: number; dec: number } => {
  const t = years / 100.0;
  const m = 3.07496 + 0.00186 * t;
  const n = 1.33621 - 0.00057 * t;
  const raRad = degToRad(ra * 15);
  const decRad = degToRad(dec);
  const dra = m + n * Math.sin(raRad) * Math.tan(decRad);
  const ddec = n * Math.cos(raRad);
  return {
    ra: (ra + (dra * years) / 3600) % 24,
    dec: Math.max(-90, Math.min(90, dec + (ddec * years) / 3600))
  };
};
/**
 * Keplerian Planetary Elements (Simplified for Phase 13)
 * Reference: Jean Meeus 'Astronomical Algorithms'
 */
const PLANET_ELEMENTS: Record<string, any> = {
  Mercury: { a: 0.387098, e: 0.205630, i: 7.0047, L: 252.2503, lp: 77.4577, ln: 48.3307, color: "#9ca3af" },
  Venus: { a: 0.723332, e: 0.006773, i: 3.3946, L: 181.9790, lp: 131.5702, ln: 76.6806, color: "#fef3c7" },
  Mars: { a: 1.523662, e: 0.093412, i: 1.8506, L: 355.4533, lp: 336.0408, ln: 49.5785, color: "#ef4444" },
  Jupiter: { a: 5.203363, e: 0.048392, i: 1.3053, L: 34.4043, lp: 14.7538, ln: 100.5561, color: "#fdba74" },
  Saturn: { a: 9.537070, e: 0.054150, i: 2.4844, L: 49.9443, lp: 92.4319, ln: 113.7150, color: "#fde047" },
};
export const getPlanetaryPosition = (planet: string, date: Date) => {
  const el = PLANET_ELEMENTS[planet];
  if (!el) return { ra: 0, dec: 0 };
  const d = getJulianDate(date) - 2451545.0;
  const T = d / 36525.0;
  const M = (el.L - el.lp) + (0.9856 * d); // Simplified mean anomaly
  const e = el.e;
  const E = M + (180 / Math.PI) * e * Math.sin(degToRad(M)) * (1 + e * Math.cos(degToRad(M)));
  const xv = el.a * (Math.cos(degToRad(E)) - e);
  const yv = el.a * (Math.sqrt(1.0 - e * e) * Math.sin(degToRad(E)));
  const v = radToDeg(Math.atan2(yv, xv));
  const r = Math.sqrt(xv * xv + yv * yv);
  const lon = (v + el.lp) % 360;
  // Convert ecliptic to equatorial
  const epsilon = degToRad(23.439);
  const ra = radToDeg(Math.atan2(Math.sin(degToRad(lon)) * Math.cos(epsilon), Math.cos(degToRad(lon)))) / 15;
  const dec = radToDeg(Math.asin(Math.sin(degToRad(lon)) * Math.sin(epsilon)));
  return { ra: ra < 0 ? ra + 24 : ra, dec, color: el.color };
};