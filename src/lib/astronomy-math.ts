import * as THREE from 'three';
/**
 * Converts Degrees to Radians
 */
export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};
/**
 * Converts Right Ascension (hours 0-24) and Declination (degrees -90 to +90)
 * to a normalized Vector3 on a celestial sphere of a given radius.
 * 
 * RA is usually in hours, where 1 hour = 15 degrees.
 */
export const radecToVector3 = (raHours: number, decDegrees: number, radius: number = 100): THREE.Vector3 => {
  const raRad = degToRad(raHours * 15);
  const decRad = degToRad(decDegrees);
  // Standard spherical to cartesian conversion
  // In astronomy, RA starts from the vernal equinox (X-axis)
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);
  return new THREE.Vector3(x, y, z);
};
/**
 * Maps B-V color index to a rough RGB color
 * Simplified mapping for star visualization
 */
export const bvToColor = (bv: number): string => {
  if (bv < -0.4) return "#9bb2ff"; // O class (Blue)
  if (bv < 0.0) return "#bbccff";  // B class (Blue-White)
  if (bv < 0.3) return "#f8f7ff";  // A class (White)
  if (bv < 0.6) return "#fff4ea";  // F class (Yellow-White)
  if (bv < 0.8) return "#fff2a1";  // G class (Yellow)
  if (bv < 1.1) return "#ffcc6f";  // K class (Orange)
  return "#ff6060";               // M class (Red)
};