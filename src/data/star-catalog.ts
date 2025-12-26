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
  {
    id: "1",
    name: "Sirius",
    localName: "Inkhanyeti",
    culture: "SeSwati",
    lore: "The 'Brightest One', often used as a seasonal marker for the harvest in the Mpumalanga region.",
    ra: 6.75, dec: -16.71, mag: -1.46, bv: 0.00, dist: 8.6
  },
  {
    id: "2",
    name: "Canopus",
    localName: "Naka",
    culture: "Sotho/Tswana",
    lore: "The 'Messenger Star'. Its appearance in the winter morning sky signals the beginning of the traditional new year and the arrival of frost.",
    ra: 6.4, dec: -52.7, mag: -0.72, bv: 0.15, dist: 310
  },
  { 
    id: "3", 
    name: "Alpha Centauri", 
    localName: "Isandla", 
    culture: "Zulu", 
    lore: "Part of the 'Hand' or 'Eyes' of the giant celestial hunter. Its brightness represents the watchful eyes of ancestors.", 
    ra: 14.66, dec: -60.83, mag: -0.27, bv: 0.71, dist: 4.37 
  },
  { 
    id: "15", 
    name: "Antares", 
    localName: "Khuphu", 
    culture: "Venda", 
    lore: "The 'Fire Star'. In Venda tradition, its deep red color represents the fire of the cosmic hearth during the cold months.", 
    ra: 16.49, dec: -26.43, mag: 0.96, bv: 1.83, dist: 550 
  },
  { 
    id: "16", 
    name: "Spica", 
    localName: "Inonzi", 
    culture: "Shona", 
    lore: "The 'Sweet Star'. Associated with the arrival of spring rains and the ripening of fruits in the northern regions of Southern Africa.", 
    ra: 13.42, dec: -11.16, mag: 0.98, bv: -0.23, dist: 260 
  },
  { id: "4", name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, bv: 1.23, dist: 36.7 },
  { id: "5", name: "Vega", ra: 18.61, dec: 38.78, mag: 0.03, bv: 0.00, dist: 25 },
  { id: "6", name: "Capella", ra: 5.28, dec: 46.0, mag: 0.08, bv: 0.8, dist: 42.9 },
  { id: "7", name: "Rigel", ra: 5.24, dec: -8.2, mag: 0.12, bv: -0.03, dist: 860 },
  { id: "8", name: "Procyon", ra: 7.65, dec: 5.22, mag: 0.34, bv: 0.42, dist: 11.4 },
  { id: "9", name: "Betelgeuse", ra: 5.92, dec: 7.4, mag: 0.45, bv: 1.85, dist: 640 },
  { id: "10", name: "Achernar", ra: 1.63, dec: -57.24, mag: 0.45, bv: -0.16, dist: 140 },
  { id: "11", name: "Hadar", ra: 14.06, dec: -60.37, mag: 0.61, bv: -0.23, dist: 350 },
  { id: "12", name: "Altair", ra: 19.85, dec: 8.87, mag: 0.76, bv: 0.22, dist: 16.7 },
  { id: "13", name: "Acrux", ra: 12.44, dec: -63.1, mag: 0.77, bv: -0.24, dist: 320 },
  { id: "14", name: "Aldebaran", ra: 4.59, dec: 16.51, mag: 0.85, bv: 1.54, dist: 65.1 },
  { id: "17", name: "Pollux", ra: 7.76, dec: 28.02, mag: 1.14, bv: 1.0, dist: 33.7 },
  { id: "18", name: "Fomalhaut", ra: 22.96, dec: -29.62, mag: 1.16, bv: 0.09, dist: 25.1 },
  { id: "19", name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, bv: 0.09, dist: 2600 },
  { id: "20", name: "Mimosa", ra: 12.79, dec: -59.69, mag: 1.25, bv: -0.23, dist: 280 },
  { id: "21", name: "Regulus", ra: 10.14, dec: 11.97, mag: 1.35, bv: -0.11, dist: 77.5 },
  { id: "22", name: "Adhara", ra: 6.98, dec: -28.97, mag: 1.5, bv: -0.21, dist: 430 },
  { id: "23", name: "Castor", ra: 7.58, dec: 31.89, mag: 1.58, bv: 0.04, dist: 51.5 },
  { id: "24", name: "Gacrux", ra: 12.52, dec: -57.11, mag: 1.59, bv: 1.59, dist: 88.6 },
  { id: "25", name: "Shaula", ra: 17.56, dec: -37.1, mag: 1.62, bv: -0.22, dist: 570 },
  { id: "26", name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.64, bv: -0.22, dist: 240 },
  { id: "27", name: "Elnath", ra: 5.44, dec: 28.6, mag: 1.65, bv: -0.13, dist: 130 },
  { id: "28", name: "Miaplacidus", ra: 9.22, dec: -69.72, mag: 1.67, bv: -0.06, dist: 110 },
  { id: "29", name: "Alnilam", ra: 5.6, dec: -1.2, mag: 1.69, bv: -0.19, dist: 1300 },
  { id: "30", name: "Alnair", ra: 22.14, dec: -46.96, mag: 1.74, bv: -0.13, dist: 100 },
  { id: "31", name: "Alioth", ra: 12.9, dec: 55.96, mag: 1.76, bv: -0.02, dist: 81 },
  { id: "32", name: "Alnitak", ra: 5.68, dec: -1.94, mag: 1.77, bv: -0.21, dist: 820 },
  { id: "33", name: "Dubhe", ra: 11.06, dec: 61.75, mag: 1.79, bv: 1.07, dist: 124 },
  { id: "34", name: "Mirfak", ra: 3.4, dec: 49.86, mag: 1.79, bv: 0.48, dist: 590 },
  { id: "35", name: "Wezen", ra: 7.14, dec: -26.39, mag: 1.83, bv: 0.68, dist: 1800 },
  { id: "36", name: "Sargas", ra: 17.62, dec: -43.01, mag: 1.86, bv: 1.15, dist: 270 },
  { id: "37", name: "Kaus Australis", ra: 18.4, dec: -34.38, mag: 1.85, bv: -0.03, dist: 140 },
  { id: "38", name: "Avior", ra: 8.38, dec: -59.51, mag: 1.86, bv: 1.15, dist: 630 },
  { id: "39", name: "Alkaid", ra: 13.79, dec: 49.31, mag: 1.85, bv: -0.19, dist: 101 },
  { id: "40", name: "Menkalinan", ra: 5.99, dec: 44.95, mag: 1.9, bv: 0.03, dist: 82 },
  { id: "41", name: "Atria", ra: 16.81, dec: -69.03, mag: 1.91, bv: 1.44, dist: 415 },
  { id: "42", name: "Alhena", ra: 6.63, dec: 16.39, mag: 1.93, bv: 0.00, dist: 105 },
  { id: "43", name: "Peacock", ra: 20.43, dec: -56.73, mag: 1.94, bv: -0.2, dist: 183 },
  { id: "44", name: "Alsephina", ra: 8.75, dec: -47.34, mag: 1.95, bv: -0.18, dist: 80 },
  { id: "45", name: "Mirzam", ra: 6.38, dec: -17.96, mag: 1.98, bv: -0.23, dist: 500 },
  { id: "46", name: "Alphard", ra: 9.46, dec: -8.66, mag: 1.99, bv: 1.44, dist: 177 },
  { id: "47", name: "Polaris", ra: 2.53, dec: 89.26, mag: 1.97, bv: 0.6, dist: 433 },
  { id: "48", name: "Hamal", ra: 2.11, dec: 23.46, mag: 2.0, bv: 1.15, dist: 66 },
];