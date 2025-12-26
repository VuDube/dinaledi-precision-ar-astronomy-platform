export interface ConstellationDef {
  id: string;
  name: string;
  localName?: string;
  culture?: string;
  lore?: string;
  lines: [number, number, number, number][]; // [RA1, Dec1, RA2, Dec2]
  boundaries?: [number, number][]; // Array of [RA, Dec] for the polygon
}
export const CONSTELLATIONS: ConstellationDef[] = [
  {
    id: "cru",
    name: "Crux",
    localName: "Dithutlwa",
    culture: "Sotho/Tswana",
    lore: "Represented as two giraffes. The two bright stars of the Southern Cross (Alpha and Beta Crucis) are the male giraffes, while the Pointers are the female giraffes.",
    lines: [
      [12.44, -63.1, 12.52, -57.11],
      [12.79, -59.69, 12.25, -60.37],
    ],
    boundaries: [
      [11.9, -64.7], [12.9, -64.7], [12.9, -55.7], [11.9, -55.7], [11.9, -64.7]
    ]
  },
  {
    id: "ori",
    name: "Orion",
    localName: "Magakgala",
    culture: "Sotho/Tswana",
    lore: "In many Southern African traditions, the belt stars of Orion are seen as three tortoises or 'magakgala', crawling across the sky.",
    lines: [
      [5.24, -8.2, 5.6, -1.2],
      [5.6, -1.2, 5.68, -1.94],
      [5.92, 7.4, 5.68, -1.94],
      [5.42, 6.35, 5.6, -1.2],
      [5.92, 7.4, 5.42, 6.35],
    ],
    boundaries: [
      [4.7, -11.0], [6.4, -11.0], [6.4, 23.0], [4.7, 23.0], [4.7, -11.0]
    ]
  },
  {
    id: "car",
    name: "Carina",
    localName: "The Keel",
    lines: [
      [6.4, -52.7, 9.22, -69.72],
      [9.22, -69.72, 8.38, -59.51],
    ],
    boundaries: [
      [6.0, -75.0], [11.0, -75.0], [11.0, -50.0], [6.0, -50.0], [6.0, -75.0]
    ]
  }
];