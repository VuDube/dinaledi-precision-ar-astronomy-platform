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
  tags?: string[];
}
export const DSO_CATALOG: DSORecord[] = [
  { 
    id: "m31", 
    name: "Andromeda Galaxy", 
    type: "Galaxy", 
    ra: 0.712, 
    dec: 41.26, 
    mag: 3.44, 
    messier: "M31",
    description: "The nearest major galaxy to our own, visible as a faint smudge in dark skies.",
    tags: ["M31", "Andromeda", "Great Andromeda"]
  },
  { 
    id: "m42", 
    name: "Orion Nebula", 
    type: "Nebula", 
    ra: 5.588, 
    dec: -5.38, 
    mag: 4.0, 
    messier: "M42",
    description: "A massive star-forming region located in Orion's Sword.",
    tags: ["M42", "Orion", "Great Nebula"]
  },
  { 
    id: "m45", 
    name: "Pleiades", 
    type: "Cluster", 
    ra: 3.783, 
    dec: 24.12, 
    mag: 1.6, 
    messier: "M45",
    description: "The 'Seven Sisters', an open star cluster and one of the most recognizable sky objects.",
    tags: ["M45", "Seven Sisters", "Subaru"]
  },
  { 
    id: "m44", 
    name: "Beehive Cluster", 
    type: "Cluster", 
    ra: 8.667, 
    dec: 19.67, 
    mag: 3.7, 
    messier: "M44",
    description: "An open cluster in the constellation Cancer.",
    tags: ["M44", "Praesepe", "Beehive"]
  },
  { 
    id: "omega", 
    name: "Omega Centauri", 
    type: "Cluster", 
    ra: 13.44, 
    dec: -47.48, 
    mag: 3.9, 
    caldwell: "C80",
    description: "The largest and brightest globular cluster in the Milky Way.",
    tags: ["C80", "Centaurus", "Globular"]
  },
  { 
    id: "m8", 
    name: "Lagoon Nebula", 
    type: "Nebula", 
    ra: 18.06, 
    dec: -24.38, 
    mag: 6.0, 
    messier: "M8",
    description: "A giant interstellar cloud in the constellation Sagittarius.",
    tags: ["M8", "Lagoon", "Sagittarius"]
  },
  { 
    id: "m51", 
    name: "Whirlpool Galaxy", 
    type: "Galaxy", 
    ra: 13.49, 
    dec: 47.19, 
    mag: 8.4, 
    messier: "M51",
    description: "An interacting grand-design spiral galaxy in Canes Venatici.",
    tags: ["M51", "Spiral", "Interacting"]
  },
  { 
    id: "m104", 
    name: "Sombrero Galaxy", 
    type: "Galaxy", 
    ra: 12.66, 
    dec: -11.62, 
    mag: 8.0, 
    messier: "M104",
    description: "Features a brilliant white core and a prominent dust lane.",
    tags: ["M104", "Sombrero", "Virgo"]
  }
];