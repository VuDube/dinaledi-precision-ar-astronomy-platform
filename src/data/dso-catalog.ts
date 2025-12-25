export interface DSORecord {
  id: string;
  name: string;
  localName?: string;
  culture?: string;
  lore?: string;
  type: 'Galaxy' | 'Nebula' | 'Cluster' | 'Quasar';
  ra: number; // Hours
  dec: number; // Degrees
  mag: number;
  messier?: string;
  caldwell?: string;
  description?: string;
  tags?: string[];
}
export const DSO_CATALOG: DSORecord[] = [
  { id: "m31", name: "Andromeda Galaxy", type: "Galaxy", ra: 0.712, dec: 41.26, mag: 3.44, messier: "M31", description: "The nearest major galaxy to our own.", tags: ["Spiral"] },
  { id: "m42", name: "Orion Nebula", type: "Nebula", ra: 5.588, dec: -5.38, mag: 4.0, messier: "M42", description: "A massive star-forming region in Orion's Sword.", tags: ["Stellar Nursery"] },
  { id: "m45", name: "Pleiades", localName: "Isilimela", culture: "Xhosa", lore: "The 'Digging Stars'. Their appearance in June signals the time to begin plowing.", type: "Cluster", ra: 3.783, dec: 24.12, mag: 1.6, messier: "M45", description: "The 'Seven Sisters' open star cluster.", tags: ["M45"] },
  { id: "jewelbox", name: "Jewel Box", type: "Cluster", ra: 12.89, dec: -60.33, mag: 4.2, caldwell: "C94", description: "A brilliant open cluster near the Southern Cross.", tags: ["C94", "Crux"] },
  { id: "omega", name: "Omega Centauri", type: "Cluster", ra: 13.44, dec: -47.48, mag: 3.9, caldwell: "C80", description: "The largest globular cluster in the Milky Way.", tags: ["Globular"] },
  { id: "eta_carina", name: "Carina Nebula", type: "Nebula", ra: 10.75, dec: -59.87, mag: 1.0, caldwell: "C92", description: "A giant nebula complex in the constellation Carina.", tags: ["Nebula", "C92"] },
  { id: "centaurus_a", name: "Centaurus A", type: "Galaxy", ra: 13.42, dec: -43.02, mag: 6.84, caldwell: "C77", description: "One of the closest radio galaxies to Earth.", tags: ["Active Galaxy"] },
  { id: "m8", name: "Lagoon Nebula", type: "Nebula", ra: 18.06, dec: -24.38, mag: 6.0, messier: "M8", description: "Giant interstellar cloud in Sagittarius.", tags: ["M8"] },
  { id: "m104", name: "Sombrero Galaxy", type: "Galaxy", ra: 12.66, dec: -11.62, mag: 8.0, messier: "M104", description: "Features a brilliant white core and a prominent dust lane.", tags: ["M104"] }
];