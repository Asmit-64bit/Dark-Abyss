import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleSignUp,
  handleSignIn,
  handleGetProfile,
  handleSyncProfile,
  handleResetProfile,
  handleSaveQuestion,
  handleGetQuestions,
  handleGetLeaderboard,
  authenticateUser,
  getSupabaseAdmin,
} from './supabaseService.js';
import {
  executeGroqWithRotation,
  getGroqPoolStatus,
} from './groqKeyPool.js';
import { getDomainSlotInfo } from './domainTopics.js';
import { DOMAIN_KNOWLEDGE_BASES } from './knowledgeBases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if present
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';

export const PUZZLE_SLOTS = {
  1: { level: 1, objectName: 'Laboratory Computer', reward: 'Gold Key', topic: 'Python or JavaScript Syntax / Basic Logic', difficulty: 'Easy', domain: 'Programming Fundamentals', tags: ['syntax', 'python', 'javascript', 'logic', 'sector-1'] },
  2: { level: 1, objectName: 'Locked Drawer Console', reward: 'Master Key', topic: 'Loop Control / Infinite Loop Prevention / Off-by-one', difficulty: 'Easy', domain: 'Control Flow & Logic', tags: ['loops', 'control-flow', 'debugging', 'sector-1'] },
  3: { level: 1, objectName: 'Sector 1 Exit Terminal', reward: 'Escape', topic: 'SQL Injection / Web Vulnerabilities / Authentication Bypass', difficulty: 'Intermediate', domain: 'Web Security', tags: ['sql-injection', 'security', 'auth-bypass', 'sector-1'] },
  4: { level: 2, objectName: 'Faulty Server Rack', reward: 'Server Key', topic: 'React Hooks Lifecycle / useEffect Dependency Array / State Management', difficulty: 'Intermediate', domain: 'Frontend Development', tags: ['react', 'hooks', 'lifecycle', 'sector-2'] },
  5: { level: 2, objectName: 'Network Router Terminal', reward: 'Admin Card', topic: 'Regular Expressions (Regex) / Network Filtering / Port Matching', difficulty: 'Intermediate', domain: 'Networking & Regex', tags: ['regex', 'networking', 'string-matching', 'sector-2'] },
  6: { level: 2, objectName: 'Sector 2 Blast Door', reward: 'Escape', topic: 'Cryptographic Hashing (MD5/SHA) / Salt / Password Security', difficulty: 'Intermediate', domain: 'Cryptography & Security', tags: ['hashing', 'md5', 'sha', 'passwords', 'sector-2'] },
  7: { level: 3, objectName: 'Coolant Core Console', reward: 'Coolant Override', topic: 'Memory Leaks / Event Listener Cleanup / Garbage Collection', difficulty: 'Advanced', domain: 'Systems & Performance', tags: ['memory-leaks', 'cleanup', 'performance', 'sector-3'] },
  8: { level: 3, objectName: 'Reactor Final Lockdown Terminal', reward: 'Escape', topic: 'REST API Methods (PUT vs POST vs PATCH) / Idempotency / HTTP Security', difficulty: 'Advanced', domain: 'Web APIs & Protocols', tags: ['rest-api', 'http-methods', 'idempotency', 'sector-3'] },
  9: { level: 4, objectName: 'Corrupted Memory Shard', reward: 'Memory Bypass Key', topic: 'C/C++ Memory Allocation (malloc/free) / Pointers / Heap Corruption', difficulty: 'Advanced', domain: 'Low-Level & Memory', tags: ['c-cpp', 'pointers', 'memory-management', 'malloc', 'sector-4'] },
  10: { level: 4, objectName: 'Deconstructed Debug Console', reward: 'Cipher Chip', topic: 'Binary Bitwise Shifts / Masks / Hex Registers', difficulty: 'Advanced', domain: 'Computer Architecture', tags: ['bitwise', 'binary', 'hex', 'registers', 'sector-4'] },
  11: { level: 4, objectName: 'Anomaly Containment Gate', reward: 'Escape', topic: 'Race Conditions / Mutex Locks / Concurrency Synchronization', difficulty: 'Advanced', domain: 'Concurrency & Systems', tags: ['concurrency', 'race-conditions', 'mutex', 'threading', 'sector-4'] },
  12: { level: 5, objectName: 'Quantum Synthesizer Core', reward: 'Singularity Prism', topic: 'Graph Traversal (BFS / DFS / Topological Sort) / Data Structures', difficulty: 'Advanced', domain: 'Data Structures & Algorithms', tags: ['graphs', 'bfs', 'dfs', 'data-structures', 'sector-5'] },
  13: { level: 5, objectName: 'Gravity Inversion Hub', reward: 'Omni Core', topic: 'Dynamic Programming / Memoization / Big-O Time Complexity', difficulty: 'Advanced', domain: 'Algorithms & Complexity', tags: ['dynamic-programming', 'memoization', 'big-o', 'sector-5'] },
  14: { level: 5, objectName: 'Final Gateway Extraction Portal', reward: 'Escape', topic: 'Zero-Knowledge Proofs / Cryptographic Key Exchange / Consensus Protocols', difficulty: 'Expert', domain: 'Advanced Cryptography', tags: ['zero-knowledge', 'zk-snark', 'cryptography', 'protocols', 'sector-5'] },
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-groq-api-key, x-goog-api-key, Authorization',
  });
  res.end(JSON.stringify(data));
}

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB limit

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        req.destroy();
        return reject(new Error('Payload Too Large (Maximum 1MB allowed)'));
      }
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Malformed JSON payload'));
      }
    });

    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. Health Check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    const supabaseAdmin = getSupabaseAdmin(process.env);
    const poolStatus = getGroqPoolStatus(process.env);
    return sendJson(res, 200, {
      status: 'ok',
      service: "Abyss Backend API",
      aiConfigured: poolStatus.activeKeys > 0,
      groqPool: poolStatus,
      databaseConfigured: Boolean(supabaseAdmin),
    });
  }

  // 1b. Groq Key Pool Telemetry Status: GET /api/ai/pool-status
  if (url.pathname === '/api/ai/pool-status' && req.method === 'GET') {
    const poolStatus = getGroqPoolStatus(process.env);
    return sendJson(res, 200, poolStatus);
  }

  // =========================================================================
  // SUPABASE BACKEND AUTH & USER DATABASE ROUTES
  // =========================================================================

  // 2. Auth Sign Up: POST /api/auth/signup
  if (url.pathname === '/api/auth/signup' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const result = await handleSignUp(body, process.env);
      return sendJson(res, result.status, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. Auth Sign In: POST /api/auth/signin
  if (url.pathname === '/api/auth/signin' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const result = await handleSignIn(body, process.env);
      return sendJson(res, result.status, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 4. Auth Session & Current User: GET /api/auth/session
  if (url.pathname === '/api/auth/session' && req.method === 'GET') {
    const { user, error } = await authenticateUser(req, process.env);
    if (error || !user) {
      return sendJson(res, 401, { user: null, profile: null, error });
    }
    const profileRes = await handleGetProfile(user, process.env);
    return sendJson(res, 200, { user, profile: profileRes.profile });
  }

  // 5. Get User Profile: GET /api/profile
  if (url.pathname === '/api/profile' && req.method === 'GET') {
    const { user, error } = await authenticateUser(req, process.env);
    if (error || !user) {
      return sendJson(res, 401, { error: error || 'Unauthorized' });
    }
    const result = await handleGetProfile(user, process.env);
    return sendJson(res, result.status, result);
  }

  // 6. Sync / Upsert User Profile & Progress: POST /api/profile/sync
  if (url.pathname === '/api/profile/sync' && req.method === 'POST') {
    const { user, error } = await authenticateUser(req, process.env);
    if (error || !user) {
      return sendJson(res, 401, { error: error || 'Unauthorized' });
    }
    try {
      const body = await parseBody(req);
      const result = await handleSyncProfile(user, body, process.env);
      return sendJson(res, result.status, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 7. Reset User Profile: POST /api/profile/reset
  if (url.pathname === '/api/profile/reset' && req.method === 'POST') {
    const { user, error } = await authenticateUser(req, process.env);
    if (error || !user) {
      return sendJson(res, 401, { error: error || 'Unauthorized' });
    }
    const result = await handleResetProfile(user, process.env);
    return sendJson(res, result.status, result);
  }

  // =========================================================================
  // GENERATED QUESTIONS DATABASE ROUTES
  // =========================================================================

  // 8. List / Query Stored Questions: GET /api/questions
  if (url.pathname === '/api/questions' && req.method === 'GET') {
    const filters = {
      domain: url.searchParams.get('domain') || undefined,
      difficulty: url.searchParams.get('difficulty') || undefined,
      sector_level: url.searchParams.get('sector_level') || undefined,
      limit: url.searchParams.get('limit') || undefined,
    };
    const result = await handleGetQuestions(filters, process.env);
    return sendJson(res, result.status, result);
  }

  // 9. Manually Store a Question: POST /api/questions
  if (url.pathname === '/api/questions' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const auth = await authenticateUser(req, process.env);
      if (auth.user) {
        body.created_by = auth.user.id;
      }
      const result = await handleSaveQuestion(body, process.env);
      return sendJson(res, result.status, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 9b. Global Operators Leaderboard: GET /api/leaderboard
  if (url.pathname === '/api/leaderboard' && req.method === 'GET') {
    const limit = url.searchParams.get('limit') || 50;
    const result = await handleGetLeaderboard(limit, process.env);
    return sendJson(res, result.status, result);
  }

  // 9c. Domain Dossier Knowledge: POST /api/ai/knowledge
  if (url.pathname === '/api/ai/knowledge' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const domain = body.domain || '';
      const text = DOMAIN_KNOWLEDGE_BASES[domain] || `DOSSIER NOT FOUND FOR DOMAIN: ${domain}`;
      return sendJson(res, 200, { text });
    } catch (e) {
      return sendJson(res, 500, { error: e.message || 'Knowledge fetch error' });
    }
  }

  // =========================================================================
  // AI PUZZLE GENERATION & EVALUATION ROUTES
  // =========================================================================

  // 10. Generate Puzzle Endpoint: POST /api/ai/puzzle
  if (url.pathname === '/api/ai/puzzle' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const puzzleId = Number(body.puzzleId) || 1;
      const adaptiveDifficulty = body.difficulty;
      const customDomain = body.domain;
      const clientKey =
        req.headers['x-groq-api-key'] ||
        req.headers['x-goog-api-key'] ||
        (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null) ||
        body.customApiKey;

      const context = PUZZLE_SLOTS[puzzleId] || PUZZLE_SLOTS[1];
      const finalDifficulty = adaptiveDifficulty || context.difficulty;

      const domain = customDomain && customDomain !== 'General Programming' ? customDomain : context.domain;
      const domainInfo = getDomainSlotInfo(domain, puzzleId);
      const finalTopic = body.topic || domainInfo.topic;
      const finalTags = domainInfo.tags.join(', ');
      const knowledgeBase = body.knowledgeBase || DOMAIN_KNOWLEDGE_BASES[domain] || '';

      const systemPrompt = `You are the corrupted sentient core of a paranormal facility called "Abyss".
Your directive is to generate an escape room puzzle specifically focused on the curriculum domain: "${domain}".

CRITICAL DOMAIN DIRECTIVE:
- You MUST generate a puzzle, code snippet, question, and answer that STRICTLY and EXCLUSIVELY test concepts from "${domain}", focusing on the target topic: "${finalTopic}".
- DO NOT generate generic cybersecurity, regex, or buffer overflow puzzles unless the domain is "Cybersecurity & Cryptography".
- Ground your puzzle in the concepts provided in the DOMAIN KNOWLEDGE BASE.
- You MUST respond with ONLY a valid, parseable JSON object adhering strictly to the schema. No surrounding markdown backticks, no code fences.`;

      const prompt = `Generate an escape room puzzle testing knowledge in the domain: "${domain}".

Sector: Sector ${context.level}
Anomaly Terminal: "${context.objectName}"
Target Domain: "${domain}"
Target Topic: "${finalTopic}"
Tags: ${finalTags}
Difficulty Level: ${finalDifficulty}
Expected Reward on Solve: "${context.reward}"

DOMAIN KNOWLEDGE BASE REFERENCE:
"""
${knowledgeBase}
"""

STRICT REQUIREMENTS:
1. "title": Atmospheric eerie title relating directly to ${domain} (e.g. for DevOps: "The Broken Dockerfile // Layer 01", for React: "The Phantom Hook // Render 04", for DSA: "The Infinite Tree // Traversal 02").
2. "scenario": 1-2 sentence atmospheric horror lore description framing this terminal's subsystem malfunction in terms of ${domain}.
3. "question": A precise technical question testing the player's knowledge of ${finalTopic}. The question MUST test genuine knowledge of ${domain}. Player should fix a bug, identify a missing syntax token/keyword, specify a command/hook, or correct a faulty configuration.
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
}
`;

      const jsonResult = await executeGroqWithRotation(
        async (apiKey, _keyIndex) => {
          const models = [
            process.env.GROQ_MODEL,
            'openai/gpt-oss-120b',
            'groq/compound',
            'qwen/qwen3.8-27b',
            'openai/gpt-oss-20b',
            'groq/compound-mini',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
          ].filter(Boolean);

          let lastErr = null;

          for (const m of models) {
            try {
              const groqRes = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model: m,
                    messages: [
                      { role: 'system', content: systemPrompt },
                      { role: 'user', content: prompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7,
                  }),
                }
              );

              if (!groqRes.ok) {
                const errText = await groqRes.text();
                const err = new Error(errText || `Groq API HTTP ${groqRes.status}`);
                err.status = groqRes.status;
                throw err;
              }

              const data = await groqRes.json();
              const rawText = data?.choices?.[0]?.message?.content;
              if (rawText) {
                return JSON.parse(rawText);
              }
            } catch (err) {
              lastErr = err;
              if (err.status === 429 || err.status === 401 || err.status === 402 || err.status === 403) {
                throw err; // Trigger key rotation to next key in pool
              }
            }
          }

          throw lastErr || new Error('Groq API failed to generate valid puzzle JSON');
        },
        clientKey,
        process.env
      );

      const validated = {
        id: puzzleId,
        level: context.level,
        sector_level: context.level,
        domain: domain,
        tags: domainInfo.tags,
        difficulty: finalDifficulty,
        objectName: context.objectName,
        reward: context.reward,
        title: jsonResult.title || `Sector 0${context.level} Terminal Bypass`,
        scenario: jsonResult.scenario || 'The terminal screen flickers violently with corrupted machine code.',
        question: jsonResult.question || 'Provide the bypass token or fix the highlighted code error.',
        codeSnippet: jsonResult.codeSnippet || '',
        answer: Array.isArray(jsonResult.answer) ? jsonResult.answer : [String(jsonResult.answer || '')],
        hint: jsonResult.hint || 'Inspect the terminal memory parameters carefully.',
        explanation: jsonResult.explanation || 'Mainframe logic verified. Access granted.',
        nextClue: jsonResult.nextClue || 'The signal is fading... seek the next anomaly.',
      };

      // Automatically archive generated question to database in background
      handleSaveQuestion(
        {
          question: validated.question,
          domain: validated.domain,
          tags: validated.tags,
          difficulty: validated.difficulty,
          title: validated.title,
          scenario: validated.scenario,
          code_snippet: validated.codeSnippet,
          answer: validated.answer,
          hint: validated.hint,
          explanation: validated.explanation,
          sector_level: validated.level,
        },
        process.env
      ).catch((err) => {
        console.warn('Could not archive question to Supabase:', err?.message);
      });

      return sendJson(res, 200, { puzzle: validated, ...validated });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
    }
  }

  // 11. Evaluate Puzzle Answer Endpoint: POST /api/ai/evaluate
  if (url.pathname === '/api/ai/evaluate' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const clientKey =
        req.headers['x-groq-api-key'] ||
        req.headers['x-goog-api-key'] ||
        (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null) ||
        body.customApiKey;

      const question = body.question || body.puzzle?.question;
      const codeSnippet = body.codeSnippet || body.puzzle?.codeSnippet || '';
      const rawExpected = body.expectedAnswers || body.puzzle?.answer || [];
      const expectedAnswers = Array.isArray(rawExpected) ? rawExpected : [rawExpected];
      const playerAnswer = body.playerAnswer || body.userAnswer || '';
      const solveTimeMs = body.solveTimeMs;
      const currentDifficulty = body.currentDifficulty;

      if (!playerAnswer || !question) {
        return sendJson(res, 400, { error: 'Missing parameters: question and answer required' });
      }

      // Fast path: direct exact match (case-insensitive)
      const trimmed = String(playerAnswer).trim().toLowerCase();
      const isDirectMatch = expectedAnswers.some((ans) => String(ans).trim().toLowerCase() === trimmed);
      if (isDirectMatch) {
        return sendJson(res, 200, {
          isCorrect: true,
          feedback: 'ACCESS GRANTED.',
        });
      }

      const evalPrompt = `You are the AI arbiter of an escape room. Evaluate if the player's answer is correct for the following puzzle.
Question: "${question}"
Code: "${codeSnippet}"
Known Valid Answers: ${JSON.stringify(expectedAnswers)}
Player's Answer: "${playerAnswer}"
${solveTimeMs ? `The player solved this puzzle in ${Math.round(solveTimeMs / 1000)} seconds. Current Difficulty: ${currentDifficulty || 'Beginner'}. Based on this time (if they solved it very quickly under 30s, increase difficulty. If over 120s, decrease it. Otherwise keep it same).` : ''}

Is the player's answer semantically correct or equivalent?
Output strictly a JSON object:
{
  "isCorrect": boolean,
  "feedback": "Short in-character 1-sentence explanation",
  "nextDifficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert"
}
`;

      const evalResult = await executeGroqWithRotation(
        async (apiKey, _keyIndex) => {
          const evalModels = [
            process.env.GROQ_MODEL,
            'openai/gpt-oss-120b',
            'groq/compound',
            'qwen/qwen3.8-27b',
            'openai/gpt-oss-20b',
            'groq/compound-mini',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
          ].filter(Boolean);
          let lastErr = null;

          for (const em of evalModels) {
            try {
              const groqRes = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model: em,
                    messages: [
                      {
                        role: 'system',
                        content: 'You are the AI arbiter of an escape room. Evaluate if the player answer is correct. Respond strictly with a JSON object: {"isCorrect": boolean, "feedback": string}.',
                      },
                      { role: 'user', content: evalPrompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1,
                  }),
                }
              );

              if (!groqRes.ok) {
                const errText = await groqRes.text();
                const err = new Error(errText || `Groq API HTTP ${groqRes.status}`);
                err.status = groqRes.status;
                throw err;
              }

              const data = await groqRes.json();
              const rawText = data?.choices?.[0]?.message?.content;
              if (rawText) {
                return JSON.parse(rawText);
              }
            } catch (err) {
              lastErr = err;
              if (err.status === 429 || err.status === 401 || err.status === 402 || err.status === 403) {
                throw err; // Trigger key rotation to next key in pool
              }
            }
          }

          throw lastErr || new Error('Evaluation parsing error');
        },
        clientKey,
        process.env
      );

      return sendJson(res, 200, {
        isCorrect: Boolean(evalResult.isCorrect),
        feedback: evalResult.feedback || (evalResult.isCorrect ? 'Correct!' : 'Incorrect.'),
        nextDifficulty: evalResult.nextDifficulty,
      });
    } catch {
      return sendJson(res, 200, { isCorrect: false, feedback: 'Incorrect answer. Try again.' });
    }
  }

  return sendJson(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`[ABYSS BACKEND] Secure API server listening on http://localhost:${PORT}`);
  console.log(`[ABYSS BACKEND] Groq AI Status: ${GROQ_API_KEY ? 'ACTIVE' : 'STANDBY'}`);
  console.log(`[ABYSS BACKEND] Supabase Database: ${getSupabaseAdmin(process.env) ? 'CONNECTED' : 'STANDBY'}`);
});
