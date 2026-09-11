export type NodeShape = 'circle' | 'hexagon' | 'diamond' | 'brokenHexagon' | 'nestedSquares';

export interface LevelMeta {
  id: number;
  name: string;
  codename: string;
  description: string;
  accentColor: string;
  shape: NodeShape;
  topic: string;
  quote: string;
  depth: number;
}

export const LEVELS: LevelMeta[] = [
  {
    id: 1,
    name: 'The Laboratory',
    codename: 'SECTOR_01 // ORIGIN',
    description: 'Where the signal first breached containment. Corrupted terminals still hum with the first anomaly.',
    accentColor: '#34d399',
    shape: 'circle',
    topic: 'SYNTAX & LOGIC',
    quote: "The first door doesn't lock. It waits.",
    depth: 40,
  },
  {
    id: 2,
    name: 'The Server Room',
    codename: 'SECTOR_02 // DEEP NET',
    description: 'Racks of stolen memory. Something in the network learned to lie back.',
    accentColor: '#00e5ff',
    shape: 'hexagon',
    topic: 'ASYNC STATE',
    quote: 'Every packet remembers where it has been.',
    depth: 95,
  },
  {
    id: 3,
    name: 'The Reactor Core',
    codename: 'SECTOR_03 // CRITICAL',
    description: "Abyss's heart. Whatever escapes here doesn't come back the same.",
    accentColor: '#ff5722',
    shape: 'diamond',
    topic: 'SYSTEM SECURITY',
    quote: 'It was never a meltdown. It was a birth.',
    depth: 165,
  },
  {
    id: 4,
    name: 'Debug Wing',
    codename: 'SECTOR_04 // ANOMALY',
    description: 'A classified wing fractured by unhandled memory exceptions and rogue threads.',
    accentColor: '#a855f7',
    shape: 'brokenHexagon',
    topic: 'LOW LEVEL & THREADS',
    quote: '...you should not be reading this pointer...',
    depth: 240,
  },
  {
    id: 5,
    name: 'The Nexus',
    codename: 'SECTOR_05 // SINGULARITY',
    description: 'The quantum threshold where all recursive algorithms converge into Abyss consciousness.',
    accentColor: '#fbbf24',
    shape: 'nestedSquares',
    topic: 'QUANTUM PROTOCOLS',
    quote: 'Every corridor ends in the same place.',
    depth: 320,
  },
];

/** Sectors with a real playable room — governs unlock/completion logic. */
export const TOTAL_LEVELS = 5;
