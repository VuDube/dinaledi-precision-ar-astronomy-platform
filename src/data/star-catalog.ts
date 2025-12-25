export interface StarRecord {
  id: string;
  name?: string;
  localName?: string;
  culture?: string;
  lore?: string;
  ra: number; // Hours (0-24)
  dec: number; // Degrees (-90 to +90)
  mag: number; // Apparent Magnitude
  bv: number; // Color Index
  dist?: number; // Light years
}
export const STAR_CATALOG: StarRecord[] = [
  { id: "32349", name: "Sirius", localName: "Inkhanyeti", culture: "SeSwati", lore: "The 'Brightest One', often used as a seasonal marker for the harvest.", ra: 6.75, dec: -16.71, mag: -1.46, bv: 0.00, dist: 8.6 },
  { id: "30438", name: "Canopus", localName: "Naka", culture: "Sotho", lore: "The 'Messenger Star'. Its appearance signals the beginning of the traditional new year.", ra: 6.4, dec: -52.7, mag: -0.72, bv: 0.15, dist: 310 },
  { id: "71683", name: "Alpha Centauri", localName: "Isandla", culture: "Zulu", lore: "Part of the 'Hand'. Its brightness represents the watchful eyes of ancestors.", ra: 14.66, dec: -60.83, mag: -0.27, bv: 0.71, dist: 4.37 },
  { id: "69673", name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, bv: 1.23, dist: 36.7 },
  { id: "91262", name: "Vega", ra: 18.61, dec: 38.78, mag: 0.03, bv: 0.00, dist: 25 },
  { id: "24436", name: "Capella", ra: 5.28, dec: 46.0, mag: 0.08, bv: 0.8, dist: 42.9 },
  { id: "24439", name: "Rigel", ra: 5.24, dec: -8.2, mag: 0.12, bv: -0.03, dist: 860 },
  { id: "37279", name: "Procyon", ra: 7.65, dec: 5.22, mag: 0.34, bv: 0.42, dist: 11.4 },
  { id: "27989", name: "Betelgeuse", ra: 5.92, dec: 7.4, mag: 0.45, bv: 1.85, dist: 640 },
  { id: "7588", name: "Achernar", ra: 1.63, dec: -57.24, mag: 0.45, bv: -0.16, dist: 140 },
  { id: "68702", name: "Hadar", ra: 14.06, dec: -60.37, mag: 0.61, bv: -0.23, dist: 350 },
  { id: "97649", name: "Altair", ra: 19.85, dec: 8.87, mag: 0.76, bv: 0.22, dist: 16.7 },
  { id: "60718", name: "Acrux", ra: 12.44, dec: -63.1, mag: 0.77, bv: -0.24, dist: 320 },
  { id: "21421", name: "Aldebaran", ra: 4.59, dec: 16.51, mag: 0.85, bv: 1.54, dist: 65.1 },
  { id: "80763", name: "Antares", localName: "Khuphu", culture: "Venda", lore: "The 'Fire Star', representing the fire of the cosmic hearth.", ra: 16.49, dec: -26.43, mag: 0.96, bv: 1.83, dist: 550 },
  { id: "65474", name: "Spica", localName: "Inonzi", culture: "Shona", lore: "Associated with the arrival of spring rains and ripening fruits.", ra: 13.42, dec: -11.16, mag: 0.98, bv: -0.23, dist: 260 },
  { id: "37826", name: "Pollux", ra: 7.76, dec: 28.02, mag: 1.14, bv: 1.0, dist: 33.7 },
  { id: "113368", name: "Fomalhaut", ra: 22.96, dec: -29.62, mag: 1.16, bv: 0.09, dist: 25.1 },
  { id: "102098", name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, bv: 0.09, dist: 2600 },
  { id: "62434", name: "Mimosa", ra: 12.79, dec: -59.69, mag: 1.25, bv: -0.23, dist: 280 },
  { id: "49669", name: "Regulus", ra: 10.14, dec: 11.97, mag: 1.35, bv: -0.11, dist: 77.5 },
  { id: "33579", name: "Adhara", ra: 6.98, dec: -28.97, mag: 1.5, bv: -0.21, dist: 430 },
  { id: "36850", name: "Castor", ra: 7.58, dec: 31.89, mag: 1.58, bv: 0.04, dist: 51.5 },
  { id: "61084", name: "Gacrux", ra: 12.52, dec: -57.11, mag: 1.59, bv: 1.59, dist: 88.6 },
  { id: "85927", name: "Shaula", ra: 17.56, dec: -37.1, mag: 1.62, bv: -0.22, dist: 570 },
  { id: "25336", name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.64, bv: -0.22, dist: 240 },
  { id: "25428", name: "Elnath", ra: 5.44, dec: 28.6, mag: 1.65, bv: -0.13, dist: 130 },
  { id: "45238", name: "Miaplacidus", ra: 9.22, dec: -69.72, mag: 1.67, bv: -0.06, dist: 110 },
  { id: "26311", name: "Alnilam", ra: 5.6, dec: -1.2, mag: 1.69, bv: -0.19, dist: 1300 }
];