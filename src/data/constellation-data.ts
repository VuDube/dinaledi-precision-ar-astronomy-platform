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
    culture: "South Africa (Sotho/Tswana)",
    lines: [
      [12.44, -63.1, 12.52, -57.11], // Acrux to Gacrux
      [12.79, -59.69, 12.25, -60.37], // Mimosa to Delta Crucis (estimated)
    ]
  },
  {
    id: "ori",
    name: "Orion",
    localName: "The Hunter",
    lines: [
      [5.24, -8.2, 5.6, -1.2], // Rigel to Alnilam (belt)
      [5.6, -1.2, 5.68, -1.94], // Alnilam to Alnitak
      [5.92, 7.4, 5.68, -1.94], // Betelgeuse to Alnitak
      [5.42, 6.35, 5.6, -1.2], // Bellatrix to Alnilam
      [5.24, -8.2, 5.79, -9.67], // Rigel to Saiph (approx)
      [5.92, 7.4, 5.42, 6.35], // Betelgeuse to Bellatrix (shoulders)
    ]
  },
  {
    id: "uma",
    name: "Ursa Major",
    localName: "Great Bear",
    lines: [
      [11.06, 61.75, 11.03, 56.38], // Dubhe to Merak
      [11.03, 56.38, 11.9, 53.69], // Merak to Phecda
      [11.9, 53.69, 12.25, 57.03], // Phecda to Megrez
      [12.25, 57.03, 11.06, 61.75], // Megrez to Dubhe
      [12.25, 57.03, 12.9, 55.96], // Megrez to Alioth
      [12.9, 55.96, 13.4, 54.92], // Alioth to Mizar
      [13.4, 54.92, 13.79, 49.31], // Mizar to Alkaid
    ]
  },
  {
    id: "sco",
    name: "Scorpius",
    localName: "The Scorpion",
    lines: [
      [16.49, -26.43, 16.0, -22.62], // Antares to Graffias
      [16.49, -26.43, 16.83, -34.29], // Antares to Wei
      [16.83, -34.29, 17.56, -37.1], // Wei to Shaula
      [17.56, -37.1, 17.62, -43.01], // Shaula to Sargas
    ]
  }
];