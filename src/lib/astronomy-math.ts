import * as THREE from 'three';
export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);
export const radToDeg = (radians: number): number => radians * (180 / Math.PI);
/**
 * Converts Right Ascension (hours 0-24) and Declination (degrees -90 to +90)
 * to a normalized Vector3 on a celestial sphere.
 */
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
/**
 * Calculates Julian Date for a given JS Date.
 */
export const getJulianDate = (date: Date): number => {
  return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
};
/**
 * Calculates Local Sidereal Time (LST) in hours.
 */
export const getLocalSiderealTime = (date: Date, longitude: number): number => {
  const jd = getJulianDate(date);
  const d = jd - 2451545.0;
  let lst = 18.697374558 + 24.06570982441908 * d;
  lst = (lst + longitude / 15.0) % 24;
  return lst < 0 ? lst + 24 : lst;
};
/**
 * Predicts Lunar Phase (0-1).
 * 0 = New Moon, 0.5 = Full Moon, 1.0 = New Moon again.
 */
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
 * Simple precession adjustment (approx 50 arcseconds per year).
 */
export const applyPrecession = (ra: number, dec: number, years: number): { ra: number; dec: number } => {
  const raChange = (3.075 + 1.336 * Math.sin(degToRad(ra * 15)) * Math.tan(degToRad(dec))) * (years / 3600);
  const decChange = (20.04 * Math.cos(degToRad(ra * 15))) * (years / 3600);
  return {
    ra: (ra + raChange / 15) % 24,
    dec: Math.max(-90, Math.min(90, dec + decChange))
  };
};