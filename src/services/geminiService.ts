import type { Puzzle } from '../data/puzzles';
import { puzzles as defaultPuzzles } from '../data/puzzles';
import { apiClient } from '../lib/apiClient';
import { DOMAIN_KNOWLEDGE_BASES } from '../data/knowledgeBases';

export interface PuzzleContext {
  id: number;
  level: number;
  objectName: string;
  reward: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const PUZZLE_SLOTS: Record<number, PuzzleContext> = {
  1: {
    id: 1,
    level: 1,
    objectName: 'Laboratory Computer',
    reward: 'Gold Key',
    topic: 'Python or JavaScript Syntax / Basic Logic',
    difficulty: 'Beginner',
  },
  2: {
    id: 2,
    level: 1,
    objectName: 'Locked Drawer Console',
    reward: 'Master Key',
    topic: 'Loop Control / Infinite Loop Prevention / Off-by-one',
    difficulty: 'Beginner',
  },
  3: {
    id: 3,
    level: 1,
    objectName: 'Sector 1 Exit Terminal',
    reward: 'Escape',
    topic: 'SQL Injection / Web Vulnerabilities / Authentication Bypass',
    difficulty: 'Intermediate',
  },
  4: {
    id: 4,
    level: 2,
    objectName: 'Faulty Server Rack',
    reward: 'Server Key',
    topic: 'React Hooks Lifecycle / useEffect Dependency Array / State Management',
    difficulty: 'Intermediate',
  },
  5: {
    id: 5,
    level: 2,
    objectName: 'Network Router Terminal',
    reward: 'Admin Card',
    topic: 'Regular Expressions (Regex) / Network Filtering / Port Matching',
    difficulty: 'Intermediate',
  },
  6: {
    id: 6,
    level: 2,
    objectName: 'Sector 2 Blast Door',
    reward: 'Escape',
    topic: 'Cryptographic Hashing (MD5/SHA) / Salt / Password Security',
    difficulty: 'Intermediate',
  },
  7: {
    id: 7,
    level: 3,
    objectName: 'Coolant Core Console',
    reward: 'Coolant Override',
    topic: 'Memory Leaks / Event Listener Cleanup / Garbage Collection',
    difficulty: 'Advanced',
  },
  8: {
    id: 8,
    level: 3,
    objectName: 'Reactor Final Lockdown Terminal',
    reward: 'Escape',
    topic: 'REST API Methods (PUT vs POST vs PATCH) / Idempotency / HTTP Security',
    difficulty: 'Advanced',
  },
  9: {
    id: 9,
    level: 4,
    objectName: 'Corrupted Memory Shard',
    reward: 'Memory Bypass Key',
    topic: 'C/C++ Memory Allocation (malloc/free) / Pointers / Heap Corruption',
    difficulty: 'Advanced',
  },
  10: {
    id: 10,
    level: 4,
    objectName: 'Deconstructed Debug Console',
    reward: 'Cipher Chip',
    topic: 'Binary Bitwise Shifts / Masks / Hex Registers',
    difficulty: 'Advanced',
  },
  11: {
    id: 11,
    level: 4,
    objectName: 'Anomaly Containment Gate',
    reward: 'Escape',
    topic: 'Race Conditions / Mutex Locks / Concurrency Synchronization',
    difficulty: 'Advanced',
  },
  12: {
    id: 12,
    level: 5,
    objectName: 'Quantum Synthesizer Core',
    reward: 'Singularity Prism',
    topic: 'Graph Traversal (BFS / DFS / Topological Sort) / Data Structures',
    difficulty: 'Advanced',
  },
  13: {
    id: 13,
    level: 5,
    objectName: 'Gravity Inversion Hub',
    reward: 'Omni Core',
    topic: 'Dynamic Programming / Memoization / Big-O Time Complexity',
    difficulty: 'Advanced',
  },
  14: {
    id: 14,
    level: 5,
    objectName: 'Final Gateway Extraction Portal',
    reward: 'Escape',
    topic: 'Zero-Knowledge Proofs / Cryptographic Key Exchange / Consensus Protocols',
    difficulty: 'Advanced',
  },
};

const STORAGE_KEY = '_abyss_gm_sig';

/** Simple obfuscation to prevent plain-text inspection in storage */
function encodeKey(val: string): string {
  try {
    return btoa(encodeURIComponent(val));
  } catch {
    return val;
  }
}

function decodeKey(val: string): string {
  try {
    return decodeURIComponent(atob(val));
  } catch {
    return val;
  }
}

export function getGeminiApiKey(): string {
  // Check obfuscated localStorage first
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && raw.trim().length > 0) {
      const decoded = decodeKey(raw.trim());
      if (decoded.length > 0) return decoded;
    }
  }

  // Client-side only reads custom user-provided override if saved by player
  return '';
}

export function isGeminiKeyConfigured(): boolean {
  return getGeminiApiKey().length > 0;
}

export function getMaskedKeyDisplay(): string {
  const key = getGeminiApiKey();
  if (!key) return 'NOT CONFIGURED (Using Curated Puzzles)';
  if (key.length <= 8) return '••••••••••••';
  return `••••••••••••••••••••••••${key.slice(-4)}`;
}

export function setStoredGeminiApiKey(key: string) {
  if (typeof window !== 'undefined') {
    const trimmed = key.trim();
    if (!trimmed) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, encodeKey(trimmed));
    }
  }
}

export function clearStoredGeminiApiKey() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

import { useGameStore } from '../store/gameStore';

/**
 * Generate an atmospheric coding escape room puzzle using Backend API or direct Gemini.
 */
export async function generateGeminiPuzzle(
  puzzleId: number,
  difficulty?: string,
  customApiKey?: string
): Promise<Puzzle> {
  const context = PUZZLE_SLOTS[puzzleId];
  const defaultFallback = defaultPuzzles.find((p) => p.id === puzzleId) || defaultPuzzles[0];
  const apiKey = customApiKey || getGeminiApiKey();

  const store = useGameStore.getState();
  const domain = store.selectedDomain || 'General Programming';
  const finalDifficulty = difficulty || store.currentDifficulty || 'Beginner';
  const knowledgeBase = DOMAIN_KNOWLEDGE_BASES[domain] || '';

  // 1. First try calling our secure backend server
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['x-goog-api-key'] = apiKey;
    }

    const backendRes = await fetch('/api/ai/puzzle', {
      method: 'POST',
      headers,
      body: JSON.stringify({ puzzleId, domain, difficulty: finalDifficulty }),
      signal: AbortSignal.timeout(45000),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      // Two backends exist: the Vite dev middleware wraps the puzzle in
      // { puzzle: {...} }, while the standalone server/index.js returns it
      // flat. Accept either shape.
      const puzzleData = data?.puzzle ?? data;
      if (puzzleData && puzzleData.question && puzzleData.answer) {
        return {
          id: puzzleId,
          level: context?.level || defaultFallback.level,
          title: puzzleData.title || defaultFallback.title,
          scenario: puzzleData.scenario || defaultFallback.scenario,
          question: puzzleData.question || defaultFallback.question,
          codeSnippet: puzzleData.codeSnippet ?? defaultFallback.codeSnippet,
          answer: Array.isArray(puzzleData.answer) ? puzzleData.answer : [String(puzzleData.answer)],
          reward: context?.reward || defaultFallback.reward,
          hint: puzzleData.hint || defaultFallback.hint || 'Examine logic state boundaries.',
          nextClue: puzzleData.nextClue || defaultFallback.nextClue || "The signal is fading... seek the next anomaly.",
        };
      }
    }
  } catch {
    // Backend offline or running in static client mode - fallback below
  }

  // 2. Direct client-side generation fallback if client key is configured
  if (!apiKey) {
    return defaultFallback;
  }

  const model =
    (import.meta as any).env?.VITE_GEMINI_MODEL ||
    'gemini-3.6-flash';

  const prompt = `
You are the corrupted sentient core of a paranormal facility called "Abyss".
Generate a coding / cybersecurity escape room puzzle for Sector ${context?.level || 1} on the "${context?.objectName || 'Terminal'}".

Topic: ${context?.topic || 'Programming & Security'}
Difficulty: ${context?.difficulty || 'Intermediate'}
Expected Reward on Solve: "${context?.reward || defaultFallback.reward}"

Requirements:
1. "title": Atmospheric eerie title (e.g. "The Void Pointer // Buffer 04", "Spectral Packet Sniffer")
2. "scenario": 1-2 sentence atmospheric horror lore description about this specific terminal/device.
3. "question": Clear, concise question asking the player to identify a missing token, fix a bug, specify an attack name, or provide a regex/code fix.
4. "codeSnippet": A short, clean code snippet (in Python, JavaScript/TypeScript, SQL, or JSON) containing the bug or puzzle (or empty string if purely conceptual).
5. "answer": Array of 2-8 acceptable string variations of the correct answer (case-insensitive, including shorthand, punctuation variations).
6. "hint": A subtle, in-character cryptic clue.

Format your output strictly as a JSON object adhering to this schema:
{
  "title": string,
  "scenario": string,
  "question": string,
  "codeSnippet": string,
  "answer": string[],
  "hint": string,
  "nextClue": "a cryptic lore clue pointing to the next puzzle"
}
`;

  try {
    const modelsToTry = [model, 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
    let jsonResult: any = null;

    for (const m of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.8,
              },
            }),
            signal: AbortSignal.timeout(12000),
          }
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          jsonResult = JSON.parse(rawText);
          break;
        }
      } catch {
        // Silently try next model
      }
    }

    if (!jsonResult || !jsonResult.question || !jsonResult.answer) {
      throw new Error('Gemini did not return a valid puzzle structure');
    }

    const generatedPuzzle: Puzzle = {
      id: puzzleId,
      level: context?.level || defaultFallback.level,
      title: jsonResult.title || defaultFallback.title,
      scenario: jsonResult.scenario || defaultFallback.scenario,
      question: jsonResult.question || defaultFallback.question,
      codeSnippet: jsonResult.codeSnippet ?? defaultFallback.codeSnippet,
      answer: Array.isArray(jsonResult.answer) ? jsonResult.answer : [String(jsonResult.answer)],
      reward: context?.reward || defaultFallback.reward,
      hint: jsonResult.hint || defaultFallback.hint || 'Examine logic state boundaries.',
      nextClue: jsonResult.nextClue || defaultFallback.nextClue || "The signal is fading... seek the next anomaly.",
    };

    // Automatically archive to Supabase database
    apiClient
      .saveQuestion({
        question: generatedPuzzle.question,
        domain: (context as any)?.domain || 'Programming Fundamentals',
        tags: (context as any)?.tags || [`sector-${generatedPuzzle.level}`],
        difficulty: (context?.difficulty === 'Beginner' ? 'Easy' : context?.difficulty) || 'Intermediate',
        title: generatedPuzzle.title,
        scenario: generatedPuzzle.scenario,
        code_snippet: generatedPuzzle.codeSnippet,
        answer: generatedPuzzle.answer,
        hint: jsonResult.hint,
        explanation: jsonResult.explanation || 'Mainframe integrity verified.',
        sector_level: generatedPuzzle.level,
      })
      .catch(() => {});

    return generatedPuzzle;
  } catch {
    return defaultFallback;
  }
}

/**
 * Intelligent AI Answer Evaluator.
 * Checks string match first; if not matched, asks Backend API or Gemini to evaluate if the answer is semantically correct.
 */
export async function evaluateAnswerWithGemini(
  puzzle: Puzzle,
  userAnswer: string,
  solveTimeMs?: number,
  currentDifficulty?: string,
  customApiKey?: string
): Promise<{ isCorrect: boolean; feedback?: string; nextDifficulty?: string }> {
  // 1. Try static direct matching first
  const staticAnswers = Array.isArray(puzzle.answer) ? puzzle.answer : [String(puzzle.answer)];
  const isDirectMatch = staticAnswers.some(
    (a) => a.trim().toLowerCase() === userAnswer.trim().toLowerCase()
  );

  if (isDirectMatch && !solveTimeMs) {
    // Basic match without evaluation capability
    return { isCorrect: true };
  }

  const apiKey = customApiKey || getGeminiApiKey();

  // 2. Try Backend API evaluation first
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['x-goog-api-key'] = apiKey;
    }

    const backendRes = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ puzzle, userAnswer, solveTimeMs, currentDifficulty }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (typeof data?.isCorrect === 'boolean') {
        return {
          isCorrect: data.isCorrect,
          feedback: data.feedback || (data.isCorrect ? 'ACCESS GRANTED.' : 'Incorrect.'),
          nextDifficulty: data.nextDifficulty
        };
      }
    }
  } catch {
    // Backend offline - fallback to direct call if client key exists
  }

  // 3. Fallback direct client-side query if key available
  if (!apiKey) {
    return { isCorrect: false, feedback: 'Incorrect answer. Try again.' };
  }

  try {
    const evalPrompt = `
You are a strict but fair judge for a technical coding puzzle game.
Question: "${puzzle.question}"
Reference Code: "${puzzle.codeSnippet || 'None'}"
Expected Reference Answers: ${JSON.stringify(puzzle.answer)}
Player's Submission: "${userAnswer}"

Determine if the player's submission is a valid, correct solution/answer to the question.
Format your output strictly as a JSON object:
{
  "isCorrect": boolean,
  "feedback": "Short in-character 1-sentence explanation"
}
`;

    const evalModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
    for (const em of evalModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${em}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const result = JSON.parse(rawText);
            return {
              isCorrect: Boolean(result.isCorrect),
              feedback: result.feedback || (result.isCorrect ? 'Correct!' : 'Incorrect.'),
            };
          }
        }
      } catch {
        // try next
      }
    }
  } catch {
    // Evaluation fallback
  }

  return { isCorrect: false, feedback: 'Incorrect answer. Try again.' };
}
