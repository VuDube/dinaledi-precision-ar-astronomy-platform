export interface ConstellationDef {
  id: string;
  name: string;
  localName?: string;
  culture?: string;
  lines: [number, number, number, number][]; // [RA1, Dec1, RA2, Dec2]
}
export const CONSTELLATIONS: ConstellationDef[] = [
  {
    id: "cru",
    name: "Crux",
    localName: "Dithutlwa",
    culture: "Sotho/Tswana",
    lines: [
      [12.44, -63.1, 12.52, -57.11], 
      [12.79, -59.69, 12.25, -60.37], 
    ]
  },
  {
    id: "cen",
    name: "Centaurus",
    localName: "The Centaur",
    lines: [
      [14.66, -60.83, 14.06, -60.37], // Alpha to Beta
      [14.06, -60.37, 13.9, -53.5], // Beta to Gamma (approx)
      [14.66, -60.83, 13.5, -47.0], // Alpha to Theta (approx)
    ]
  },
  {
    id: "car",
    name: "Carina",
    localName: "The Keel",
    lines: [
      [6.4, -52.7, 9.22, -69.72], // Canopus to Miaplacidus
      [9.22, -69.72, 8.38, -59.51], // Miaplacidus to Avior
    ]
  },
  {
    id: "ori",
    name: "Orion",
    localName: "The Hunter",
    lines: [
      [5.24, -8.2, 5.6, -1.2], 
      [5.6, -1.2, 5.68, -1.94], 
      [5.92, 7.4, 5.68, -1.94], 
      [5.42, 6.35, 5.6, -1.2], 
      [5.92, 7.4, 5.42, 6.35], 
    ]
  }
];