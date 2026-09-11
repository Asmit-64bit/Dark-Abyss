import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const PUZZLE_SLOTS: Record<number, { level: number; objectName: string; reward: string; topic: string; difficulty: string; domain: string; tags: string[] }> = {
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

function groqDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'groq-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // GET /api/ai/pool-status
        if (req.method === 'GET' && req.url === '/api/ai/pool-status') {
          try {
            const { getGroqPoolStatus } = await import('./server/groqKeyPool.js');
            const status = getGroqPoolStatus(env);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(status));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Pool status error' }));
          }
        }

        // POST /api/ai/knowledge
        if (req.method === 'POST' && req.url === '/api/ai/knowledge') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const domain = data.domain || '';
              const { DOMAIN_KNOWLEDGE_BASES } = await import('./src/data/knowledgeBases.ts');
              const text = DOMAIN_KNOWLEDGE_BASES[domain] || `DOSSIER NOT FOUND FOR DOMAIN: ${domain}`;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ text }));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: e?.message || 'Knowledge fetch error' }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/ai/puzzle') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const puzzleId = Number(data.puzzleId) || 1;
              const clientKey =
                req.headers['x-groq-api-key'] ||
                req.headers['x-goog-api-key'] ||
                (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null) ||
                data.customApiKey;

              const context = PUZZLE_SLOTS[puzzleId] || PUZZLE_SLOTS[1];
              const domain = data.domain || context.domain || 'General Programming';
              const difficulty = data.difficulty || context.difficulty || 'Beginner';

              const { getDomainSlotInfo } = await import('./src/data/domainTopics.ts');
              const { DOMAIN_KNOWLEDGE_BASES } = await import('./src/data/knowledgeBases.ts');

              const domainInfo = getDomainSlotInfo(domain, puzzleId);
              const targetTopic = data.topic || domainInfo.topic;
              const targetTags = domainInfo.tags.join(', ');
              const knowledgeBase = data.knowledgeBase || DOMAIN_KNOWLEDGE_BASES[domain] || '';

              const systemInstruction = `You are the corrupted sentient core of a paranormal facility called "Abyss".
Your directive is to generate an escape room puzzle specifically focused on the curriculum domain: "${domain}".

CRITICAL DOMAIN DIRECTIVE:
- You MUST generate a puzzle, code snippet, question, and answer that STRICTLY and EXCLUSIVELY test concepts from "${domain}", focusing on the target topic: "${targetTopic}".
- DO NOT generate generic cybersecurity, regex, or buffer overflow puzzles unless the domain is "Cybersecurity & Cryptography".
- Ground your puzzle in the concepts provided in the DOMAIN KNOWLEDGE BASE.
- You MUST respond with ONLY a valid, parseable JSON object adhering strictly to the schema. No surrounding markdown backticks, no code fences.`;

              const userPrompt = `Generate an escape room puzzle testing knowledge in the domain: "${domain}".

Sector: Sector ${context.level}
Anomaly Terminal: "${context.objectName}"
Target Domain: "${domain}"
Target Topic: "${targetTopic}"
Tags: ${targetTags}
Difficulty Level: ${difficulty}
Expected Reward on Solve: "${context.reward}"

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

              const { executeGroqWithRotation } = await import('./server/groqKeyPool.js');

              const jsonResult: any = await executeGroqWithRotation(
                async (apiKey) => {
                  const models = [
                    env.GROQ_MODEL,
                    'openai/gpt-oss-120b',
                    'groq/compound',
                    'qwen/qwen3.8-27b',
                    'openai/gpt-oss-20b',
                    'groq/compound-mini',
                    'llama-3.3-70b-versatile',
                    'llama-3.1-8b-instant',
                  ].filter(Boolean) as string[];

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
                              { role: 'system', content: systemInstruction },
                              { role: 'user', content: userPrompt },
                            ],
                            response_format: { type: 'json_object' },
                            temperature: 0.7,
                          }),
                        }
                      );

                      if (!groqRes.ok) {
                        const errText = await groqRes.text();
                        console.error('Groq API Error Response:', groqRes.status, errText);
                        const err: any = new Error(errText || `Groq API HTTP ${groqRes.status}`);
                        err.status = groqRes.status;
                        throw err;
                      }

                      const gData = await groqRes.json();
                      const raw = gData?.choices?.[0]?.message?.content;
                      if (raw) {
                        return JSON.parse(raw);
                      }
                    } catch (err: any) {
                      lastErr = err;
                      if (err.status === 429 || err.status === 401 || err.status === 402 || err.status === 403) {
                        throw err; // Trigger key rotation
                      }
                    }
                  }

                  throw lastErr || new Error('Groq puzzle generation failed');
                },
                clientKey,
                env
              );

              // Automatically archive newly generated question to Supabase
              try {
                const { handleSaveQuestion } = await import('./server/supabaseService.js');
                handleSaveQuestion(
                  {
                    question: jsonResult.question,
                    domain: domain,
                    tags: domainInfo.tags,
                    difficulty: difficulty,
                    title: jsonResult.title,
                    scenario: jsonResult.scenario,
                    code_snippet: jsonResult.codeSnippet ?? '',
                    answer: Array.isArray(jsonResult.answer) ? jsonResult.answer : [String(jsonResult.answer)],
                    hint: jsonResult.hint,
                    explanation: jsonResult.explanation || 'Mainframe bypass verified.',
                    sector_level: context.level,
                  },
                  env
                ).catch((err: any) => {
                  console.warn('Could not archive question to Supabase:', err?.message);
                });
              } catch {
                // Ignore if backend service unavailable
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(
                JSON.stringify({
                  puzzle: {
                    id: puzzleId,
                    level: context.level,
                    title: jsonResult.title,
                    scenario: jsonResult.scenario,
                    question: jsonResult.question,
                    codeSnippet: jsonResult.codeSnippet ?? '',
                    answer: Array.isArray(jsonResult.answer) ? jsonResult.answer : [String(jsonResult.answer)],
                    reward: context.reward,
                    nextClue: jsonResult.nextClue || "The signal is fading... seek the next anomaly.",
                  },
                })
              );
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Server error' }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/ai/evaluate') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const question = data.question || data.puzzle?.question;
              const codeSnippet = data.codeSnippet || data.puzzle?.codeSnippet || '';
              const rawExpected = data.expectedAnswers || data.puzzle?.answer || [];
              const expectedAnswers = Array.isArray(rawExpected) ? rawExpected : [rawExpected];
              const userAnswer = data.userAnswer || data.playerAnswer || '';
              const solveTimeMs = data.solveTimeMs;
              const currentDifficulty = data.currentDifficulty;
              const clientKey =
                req.headers['x-groq-api-key'] ||
                req.headers['x-goog-api-key'] ||
                (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null) ||
                data.customApiKey;

              if (!userAnswer || !question) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing parameters' }));
              }

              const trimmed = String(userAnswer).trim().toLowerCase();
              const isDirectMatch = expectedAnswers.some((ans: string) => String(ans).trim().toLowerCase() === trimmed);

              if (isDirectMatch) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ isCorrect: true, feedback: 'ACCESS GRANTED.' }));
              }

              const systemInstruction = `You are a strict but fair judge for a technical coding puzzle game.
Determine if the player's submission is a valid, correct solution/answer to the question.
Format your output strictly as a JSON object:
{
  "isCorrect": boolean,
  "feedback": string,
  "nextDifficulty": string
}`;

              const userPrompt = `Question: "${question}"
Reference Code: "${codeSnippet || 'None'}"
Expected Reference Answers: ${JSON.stringify(expectedAnswers)}
Player's Submission: "${userAnswer}"
${solveTimeMs ? `The player solved this puzzle in ${Math.round(solveTimeMs / 1000)} seconds. Current Difficulty: ${currentDifficulty || 'Beginner'}. Based on this time (if they solved it very quickly under 30s, increase difficulty. If over 120s, decrease it. Otherwise keep it same).` : ''}`;

              const { executeGroqWithRotation } = await import('./server/groqKeyPool.js');

              const evalRes: any = await executeGroqWithRotation(
                async (apiKey) => {
                  const models = [
                    env.GROQ_MODEL,
                    'openai/gpt-oss-120b',
                    'groq/compound',
                    'qwen/qwen3.8-27b',
                    'openai/gpt-oss-20b',
                    'groq/compound-mini',
                    'llama-3.3-70b-versatile',
                    'llama-3.1-8b-instant',
                  ].filter(Boolean) as string[];
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
                              { role: 'system', content: systemInstruction },
                              { role: 'user', content: userPrompt },
                            ],
                            response_format: { type: 'json_object' },
                            temperature: 0.1,
                          }),
                        }
                      );

                      if (!groqRes.ok) {
                        const errText = await groqRes.text();
                        console.error('Groq Evaluation API Error Response:', groqRes.status, errText);
                        const err: any = new Error(errText || `Groq API HTTP ${groqRes.status}`);
                        err.status = groqRes.status;
                        throw err;
                      }

                      const gData = await groqRes.json();
                      const raw = gData?.choices?.[0]?.message?.content;
                      if (raw) {
                        return JSON.parse(raw);
                      }
                    } catch (err: any) {
                      lastErr = err;
                      if (err.status === 429 || err.status === 401 || err.status === 402 || err.status === 403) {
                        throw err; // Rotate key
                      }
                    }
                  }

                  throw lastErr || new Error('Evaluation parsing error');
                },
                clientKey,
                env
              );

              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(
                JSON.stringify({
                  isCorrect: Boolean(evalRes.isCorrect),
                  feedback: evalRes.feedback || (evalRes.isCorrect ? 'Correct!' : 'Incorrect.'),
                  nextDifficulty: evalRes.nextDifficulty,
                })
              );
            } catch {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ isCorrect: false, feedback: 'Incorrect answer. Try again.' }));
            }
          });
          return;
        }

        // --- BACKEND AUTH & USER DATABASE ROUTES ---

        // POST /api/auth/signup
        if (req.method === 'POST' && req.url === '/api/auth/signup') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { handleSignUp } = await import('./server/supabaseService.js');
              const data = body ? JSON.parse(body) : {};
              const result = await handleSignUp(data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: e?.message || 'Server error' }));
            }
          });
          return;
        }

        // POST /api/auth/signin
        if (req.method === 'POST' && req.url === '/api/auth/signin') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { handleSignIn } = await import('./server/supabaseService.js');
              const data = body ? JSON.parse(body) : {};
              const result = await handleSignIn(data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: e?.message || 'Server error' }));
            }
          });
          return;
        }

        // GET /api/auth/me
        if (req.method === 'GET' && req.url === '/api/auth/me') {
          try {
            const { authenticateUser, handleGetProfile } = await import('./server/supabaseService.js');
            const { user, error } = await authenticateUser(req, env);
            if (error || !user) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ user: null, profile: null, error }));
            }
            const profileRes = await handleGetProfile(user, env);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ user, profile: profileRes.profile }));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Session error' }));
          }
        }

        // GET /api/profile
        if (req.method === 'GET' && req.url === '/api/profile') {
          try {
            const { authenticateUser, handleGetProfile } = await import('./server/supabaseService.js');
            const { user, error } = await authenticateUser(req, env);
            if (error || !user) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: error || 'Unauthorized' }));
            }
            const result = await handleGetProfile(user, env);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Profile error' }));
          }
        }

        // POST /api/profile/sync
        if (req.method === 'POST' && req.url === '/api/profile/sync') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { authenticateUser, handleSyncProfile } = await import('./server/supabaseService.js');
              const { user, error } = await authenticateUser(req, env);
              if (error || !user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: error || 'Unauthorized' }));
              }
              const data = body ? JSON.parse(body) : {};
              const result = await handleSyncProfile(user, data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: e?.message || 'Sync error' }));
            }
          });
          return;
        }

        // POST /api/profile/reset
        if (req.method === 'POST' && req.url === '/api/profile/reset') {
          try {
            const { authenticateUser, handleResetProfile } = await import('./server/supabaseService.js');
            const { user, error } = await authenticateUser(req, env);
            if (error || !user) {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: error || 'Unauthorized' }));
            }
            const result = await handleResetProfile(user, env);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Reset error' }));
          }
        }

        // GET /api/questions
        if (req.method === 'GET' && req.url?.startsWith('/api/questions')) {
          try {
            const { handleGetQuestions } = await import('./server/supabaseService.js');
            const url = new URL(req.url, 'http://localhost');
            const filters = {
              domain: url.searchParams.get('domain') || undefined,
              difficulty: url.searchParams.get('difficulty') || undefined,
              sector_level: url.searchParams.get('sector_level') || undefined,
              limit: url.searchParams.get('limit') || undefined,
            };
            const result = await handleGetQuestions(filters, env);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Error fetching questions' }));
          }
        }

        // POST /api/questions
        if (req.method === 'POST' && req.url === '/api/questions') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { handleSaveQuestion } = await import('./server/supabaseService.js');
              const data = body ? JSON.parse(body) : {};
              const result = await handleSaveQuestion(data, env);
              res.writeHead(result.status, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(result));
            } catch (e: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: e?.message || 'Error saving question' }));
            }
          });
          return;
        }

        // GET /api/leaderboard
        if (req.method === 'GET' && req.url?.startsWith('/api/leaderboard')) {
          try {
            const { handleGetLeaderboard } = await import('./server/supabaseService.js');
            const url = new URL(req.url, 'http://localhost');
            const limit = url.searchParams.get('limit') || 50;
            const result = await handleGetLeaderboard(limit, env);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e?.message || 'Error fetching leaderboard' }));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), groqDevPlugin(env)],
    server: {
      port: 5173,
      host: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react', '@react-three/rapier'],
    },
  };
});
