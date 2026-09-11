import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_QUESTIONS } from '../server/seedQuestionsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '../src/data/domainPuzzles.ts');

const SLOT_META = {
  1: { level: 1, reward: 'Gold Key', nextClue: 'A hum resonates from the locked drawer console.' },
  2: { level: 1, reward: 'Master Key', nextClue: 'The exit gate terminal begins broadcasting an unhandled breach query.' },
  3: { level: 1, reward: 'Escape', nextClue: 'Sector 1 seal broken. Proceed to the Deep Net Server Room.' },
  4: { level: 2, reward: 'Server Key', nextClue: 'Network packet routes are diverging down the corridor.' },
  5: { level: 2, reward: 'Admin Card', nextClue: 'The blast door lock is awaiting cryptographic integrity verification.' },
  6: { level: 2, reward: 'Escape', nextClue: 'Sector 2 seal broken. Proceed to the Critical Reactor Core.' },
  7: { level: 3, reward: 'Coolant Override', nextClue: 'The final reactor lockdown terminal is drawing unconstrained power.' },
  8: { level: 3, reward: 'Escape', nextClue: 'Sector 3 seal broken. Descend into the Anomaly Debug Wing.' },
  9: { level: 4, reward: 'Memory Bypass Key', nextClue: 'Corrupted registers flicker across the deconstructed debug console.' },
  10: { level: 4, reward: 'Cipher Chip', nextClue: 'The anomaly containment gate thread is locking under high contention.' },
  11: { level: 4, reward: 'Escape', nextClue: 'Sector 4 seal broken. Step through the threshold into The Nexus singularity.' },
  12: { level: 5, reward: 'Singularity Prism', nextClue: 'Gravitational inversion hub is calculating recursive spacetime coordinates.' },
  13: { level: 5, reward: 'Omni Core', nextClue: 'The extraction portal is online. Prove knowledge without revelation.' },
  14: { level: 5, reward: 'Escape', nextClue: 'Singularity achieved. Containment breach neutralized.' },
};

// Group SEED_QUESTIONS by domain
const domainGroups = {};
for (const q of SEED_QUESTIONS) {
  if (!domainGroups[q.domain]) domainGroups[q.domain] = {};
  domainGroups[q.domain][q.puzzle_slot] = q;
}

let ts = `import type { Puzzle } from './puzzles';

/**
 * Facility Domain Curriculum Puzzles
 * Covers all 5 facility domains across all 14 puzzle slots (Sectors 1 to 5).
 * Total puzzles: 70
 */
export const domainSpecificPuzzles: Record<string, Record<number, Puzzle>> = {
`;

for (const [domain, slotMap] of Object.entries(domainGroups)) {
  ts += `  '${domain}': {\n`;
  for (let slot = 1; slot <= 14; slot++) {
    const q = slotMap[slot];
    if (!q) continue;

    const meta = SLOT_META[slot] || { level: q.sector_level, reward: 'Reward', nextClue: '' };
    const codeSnippetJson = q.code_snippet ? JSON.stringify(q.code_snippet) : 'undefined';
    const answerJson = JSON.stringify(q.answer);

    ts += `    ${slot}: {\n`;
    ts += `      id: ${slot},\n`;
    ts += `      level: ${meta.level},\n`;
    ts += `      title: ${JSON.stringify(q.title)},\n`;
    ts += `      scenario: ${JSON.stringify(q.scenario)},\n`;
    ts += `      question: ${JSON.stringify(q.question)},\n`;
    if (q.code_snippet) {
      ts += `      codeSnippet: ${codeSnippetJson},\n`;
    }
    ts += `      answer: ${answerJson},\n`;
    ts += `      reward: ${JSON.stringify(meta.reward)},\n`;
    if (q.hint) {
      ts += `      hint: ${JSON.stringify(q.hint)},\n`;
    }
    ts += `      nextClue: ${JSON.stringify(meta.nextClue)},\n`;
    ts += `      debrief: {\n`;
    ts += `        domain: ${JSON.stringify(q.domain)},\n`;
    ts += `        difficulty: ${JSON.stringify(q.difficulty)},\n`;
    ts += `        keyTakeaway: ${JSON.stringify(q.explanation)},\n`;
    ts += `        realWorldImpact: ${JSON.stringify(`Essential mastery for production reliability in ${q.domain}.`)},\n`;
    ts += `      },\n`;
    ts += `    },\n`;
  }
  ts += `  },\n\n`;
}

ts += `};\n`;

fs.writeFileSync(targetPath, ts, 'utf8');
console.log(`[TypeScript Ready] Generated complete 70-puzzle domain library: ${targetPath}`);
