export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_breach',
    title: 'Terminal Initiate',
    description: 'Solve your first anomaly puzzle in Abyss.',
    icon: '⚡',
  },
  {
    id: 'sandbox_pilot',
    title: 'Sandbox Hacker',
    description: 'Execute and test a live snippet inside the In-Terminal REPL Sandbox.',
    icon: '💻',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete any sector in under 90 seconds.',
    icon: '⏱️',
  },
  {
    id: 'zero_leak',
    title: 'Zero Leak',
    description: 'Clear a sector without requesting hints or making submission errors.',
    icon: '🛡️',
  },
  {
    id: 'paranormal_curator',
    title: 'Paranormal Investigator',
    description: 'Interact with 6 different anomaly terminals across the facility.',
    icon: '👁️',
  },
  {
    id: 'quantum_sovereign',
    title: 'Quantum Sovereign',
    description: 'Breach and purge all 5 Sectors of Abyss.',
    icon: '🧬',
  },
];
