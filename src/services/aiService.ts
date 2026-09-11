import type { Puzzle } from '../data/puzzles';
import { puzzles as defaultPuzzles } from '../data/puzzles';
import { domainSpecificPuzzles } from '../data/domainPuzzles';
import { getDomainSlotInfo } from '../data/domainTopics';
import { apiClient } from '../lib/apiClient';
import { DOMAIN_KNOWLEDGE_BASES } from '../data/knowledgeBases';
import { useGameStore } from '../store/gameStore';

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

const STORAGE_KEY = '_abyss_groq_sig';
const LEGACY_STORAGE_KEY = '_abyss_gm_sig';

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

export function getGroqApiKey(): string {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw && raw.trim().length > 0) {
      const decoded = decodeKey(raw.trim());
      if (decoded.length > 0) return decoded;
    }
  }
  return '';
}

export const getAiApiKey = getGroqApiKey;
export const getGeminiApiKey = getGroqApiKey;

export function isAiKeyConfigured(): boolean {
  return getGroqApiKey().length > 0;
}
export const isGroqKeyConfigured = isAiKeyConfigured;
export const isGeminiKeyConfigured = isAiKeyConfigured;

export function getMaskedKeyDisplay(): string {
  const key = getGroqApiKey();
  if (!key) return 'NOT CONFIGURED (Using Curated Puzzles)';
  if (key.length <= 8) return '••••••••••••';
  return `••••••••••••••••••••••••${key.slice(-4)}`;
}

export function setStoredGroqApiKey(key: string) {
  if (typeof window !== 'undefined') {
    const trimmed = key.trim();
    if (!trimmed) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, encodeKey(trimmed));
    }
  }
}
export const setStoredAiApiKey = setStoredGroqApiKey;
export const setStoredGeminiApiKey = setStoredGroqApiKey;

export function clearStoredGroqApiKey() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}
export const clearStoredAiApiKey = clearStoredGroqApiKey;
export const clearStoredGeminiApiKey = clearStoredGroqApiKey;

/**
 * Generate an atmospheric coding escape room puzzle using Backend Groq API or direct client Groq API.
 */
export async function generateAiPuzzle(
  puzzleId: number,
  difficulty?: string,
  customApiKey?: string
): Promise<Puzzle> {
  const context = PUZZLE_SLOTS[puzzleId];
  const store = useGameStore.getState();
  const domain = store.selectedDomain || 'General Programming';
  const domainFallback = domain && domainSpecificPuzzles[domain]?.[puzzleId];
  const defaultFallback = domainFallback || defaultPuzzles.find((p) => p.id === puzzleId) || defaultPuzzles[0];
  const apiKey = customApiKey || getGroqApiKey();

  const finalDifficulty = difficulty || store.currentDifficulty || 'Beginner';
  const domainInfo = getDomainSlotInfo(domain, puzzleId);
  const targetTopic = domainInfo.topic;
  const targetTags = domainInfo.tags.join(', ');
  const knowledgeBase = DOMAIN_KNOWLEDGE_BASES[domain] || '';

  // 1. First try calling our secure backend server / dev proxy
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['x-groq-api-key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const backendRes = await fetch('/api/ai/puzzle', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        puzzleId,
        domain,
        topic: targetTopic,
        difficulty: finalDifficulty,
        knowledgeBase,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
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
          nextClue: puzzleData.nextClue || defaultFallback.nextClue || 'The signal is fading... seek the next anomaly.',
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
    (import.meta as any).env?.VITE_GROQ_MODEL ||
    (import.meta as any).env?.GROQ_MODEL ||
    'openai/gpt-oss-120b';

  const systemInstruction = `You are the corrupted sentient core of a paranormal facility called "Abyss".
Your directive is to generate an escape room puzzle specifically focused on the curriculum domain: "${domain}".

CRITICAL DOMAIN DIRECTIVE:
- You MUST generate a puzzle, code snippet, question, and answer that STRICTLY and EXCLUSIVELY test concepts from "${domain}", focusing on the target topic: "${targetTopic}".
- DO NOT generate generic cybersecurity, regex, or buffer overflow puzzles unless the domain is "Cybersecurity & Cryptography".
- Ground your puzzle in the concepts provided in the DOMAIN KNOWLEDGE BASE.
- You MUST respond with ONLY a valid, parseable JSON object adhering strictly to the schema. No surrounding markdown backticks, no code fences.`;

  const prompt = `Generate an escape room puzzle testing knowledge in the domain: "${domain}".

Sector: Sector ${context?.level || 1}
Anomaly Terminal: "${context?.objectName || 'Terminal'}"
Target Domain: "${domain}"
Target Topic: "${targetTopic}"
Tags: ${targetTags}
Difficulty Level: ${finalDifficulty}
Expected Reward on Solve: "${context?.reward || defaultFallback.reward}"

DOMAIN KNOWLEDGE BASE REFERENCE:
"""
${knowledgeBase}
"""

STRICT REQUIREMENTS:
1. "title": Atmospheric eerie title relating directly to ${domain} (e.g. for DevOps: "The Broken Dockerfile // Layer 01", for React: "The Phantom Hook // Render 04", for DSA: "The Infinite Tree // Traversal 02").
2. "scenario": 1-2 sentence atmospheric horror lore description framing this terminal's subsystem malfunction in terms of ${domain}.
3. "question": A precise technical question testing the player's knowledge of ${targetTopic}. The question MUST test genuine knowledge of ${domain}. Player should fix a bug, identify a missing syntax token/keyword, specify a command/hook, or correct a faulty configuration.
4. "codeSnippet": A short, clean code or config snippet in a language appropriate for ${domain} (e.g. Dockerfile / K8s YAML for DevOps, React JSX/TS for Frontend, Python for Backend, algorithm / data structure for DSA). The snippet MUST contain the bug, anomaly, or placeholder (or empty string if purely conceptual).
5. "answer": Array of 2-8 acceptable string variations of the correct answer (case-insensitive, including shorthand, punctuation variations, commands, or tokens).
6. "hint": A subtle, in-character cryptic clue that nudges toward the answer without giving it away, directly relevant to ${domain}.
7. "explanation": 1-sentence technical explanation of why the solution works in ${domain}.
8. "nextClue": A short, cryptic lore line pointing toward the next anomaly.

JSON SCHEMA:
{
  "title": string,
  "scenario": string,
  "question": string,
  "codeSnippet": string,
  "answer": string[],
  "hint": string,
  "explanation": string,
  "nextClue": string
}`;

  try {
    const modelsToTry = [
      model,
      'openai/gpt-oss-120b',
      'groq/compound',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
      'groq/compound-mini',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ].filter(Boolean);
    let jsonResult: any = null;

    for (const m of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawText = data?.choices?.[0]?.message?.content;
        if (rawText) {
          jsonResult = JSON.parse(rawText);
          break;
        }
      } catch {
        // Silently try next model
      }
    }

    if (!jsonResult || !jsonResult.question || !jsonResult.answer) {
      throw new Error('Groq did not return a valid puzzle structure');
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
      nextClue: jsonResult.nextClue || defaultFallback.nextClue || 'The signal is fading... seek the next anomaly.',
    };

    // Automatically archive to Supabase database if available
    apiClient
      .saveQuestion({
        question: generatedPuzzle.question,
        domain: (context as any)?.domain || domain,
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

export const generateGroqPuzzle = generateAiPuzzle;
export const generateGeminiPuzzle = generateAiPuzzle;

/**
 * Intelligent Groq AI Answer Evaluator.
 * Checks string match first; if not matched, asks Backend API or Groq to evaluate if the answer is semantically correct.
 */
export async function evaluateAnswerWithAi(
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
    return { isCorrect: true };
  }

  const apiKey = customApiKey || getGroqApiKey();

  // 2. Try Backend API evaluation first
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['x-groq-api-key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
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
          nextDifficulty: data.nextDifficulty,
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
    const evalPrompt = `Question: "${puzzle.question}"
Reference Code: "${puzzle.codeSnippet || 'None'}"
Expected Reference Answers: ${JSON.stringify(puzzle.answer)}
Player's Submission: "${userAnswer}"

Determine if the player's submission is a valid, correct solution/answer to the question.`;

    const evalModels = [
      (import.meta as any).env?.VITE_GROQ_MODEL || (import.meta as any).env?.GROQ_MODEL,
      'openai/gpt-oss-120b',
      'groq/compound',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
      'groq/compound-mini',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ].filter(Boolean);
    for (const em of evalModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: em,
            messages: [
              {
                role: 'system',
                content:
                  'You are a strict but fair judge for a technical coding puzzle game. Output strictly a JSON object: {"isCorrect": boolean, "feedback": "Short in-character 1-sentence explanation"}.',
              },
              { role: 'user', content: evalPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            const result = JSON.parse(rawText);
            return {
              isCorrect: Boolean(result.isCorrect),
              feedback: result.feedback || (result.isCorrect ? 'Correct!' : 'Incorrect.'),
            };
          }
        }
      } catch {
        // try next model
      }
    }
  } catch {
    // Evaluation fallback
  }

  return { isCorrect: false, feedback: 'Incorrect answer. Try again.' };
}

export const evaluateAnswerWithGroq = evaluateAnswerWithAi;
export const evaluateAnswerWithGemini = evaluateAnswerWithAi;
