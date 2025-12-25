export interface DSORecord {
  id: string;
  name: string;
  type: 'Galaxy' | 'Nebula' | 'Cluster' | 'Quasar';
  ra: number; // Hours
  dec: number; // Degrees
  mag: number;
  messier?: string;
  caldwell?: string;
  description?: string;
}
export const DSO_CATALOG: DSORecord[] = [
  { id: "m31", name: "Andromeda Galaxy", type: "Galaxy", ra: 0.712, dec: 41.26, mag: 3.44, messier: "M31" },
  { id: "m42", name: "Orion Nebula", type: "Nebula", ra: 5.588, dec: -5.38, mag: 4.0, messier: "M42" },
  { id: "m45", name: "Pleiades", type: "Cluster", ra: 3.783, dec: 24.12, mag: 1.6, messier: "M45" },
  { id: "m44", name: "Beehive Cluster", type: "Cluster", ra: 8.667, dec: 19.67, mag: 3.7, messier: "M44" },
  { id: "m13", name: "Great Hercules Cluster", type: "Cluster", ra: 16.69, dec: 36.46, mag: 5.8, messier: "M13" },
  { id: "omega", name: "Omega Centauri", type: "Cluster", ra: 13.44, dec: -47.48, mag: 3.9, caldwell: "C80" },
  { id: "m8", name: "Lagoon Nebula", type: "Nebula", ra: 18.06, dec: -24.38, mag: 6.0, messier: "M8" },
  { id: "m51", name: "Whirlpool Galaxy", type: "Galaxy", ra: 13.49, dec: 47.19, mag: 8.4, messier: "M51" },
  { id: "m1", name: "Crab Nebula", type: "Nebula", ra: 5.575, dec: 22.01, mag: 8.4, messier: "M1" },
  { id: "m104", name: "Sombrero Galaxy", type: "Galaxy", ra: 12.66, dec: -11.62, mag: 8.0, messier: "M104" }
];