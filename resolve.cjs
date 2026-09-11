const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

// Resolution for puzzle generation
const conflict1Pattern = /<<<<<<< HEAD\n              const clientKey = req\.headers\['x-goog-api-key'\] \|\| data\.customApiKey;[\s\S]*?>>>>>>> Gemini2/g;

const puzzleRes = `              const clientKey = req.headers['x-goog-api-key'] || data.customApiKey;

              const context = PUZZLE_SLOTS[puzzleId] || PUZZLE_SLOTS[1];
              const domain = data.domain || context.domain || 'General Programming';
              const difficulty = data.difficulty || context.difficulty || 'Beginner';
              const knowledgeBase = data.knowledgeBase || '';

              const systemInstruction = \`You are the corrupted sentient core of a paranormal facility called "Schrodinger's Abyss".
You generate coding / cybersecurity escape room puzzles.

CRITICAL INSTRUCTION: You MUST ONLY generate questions and code snippets based strictly on the concepts explicitly mentioned in the provided KNOWLEDGE BASE. Do not invent outside concepts.\`;

              const userPrompt = \`Generate puzzle for:
Sector: \${context.level}
Terminal Name: "\${context.objectName}"`;

code = code.replace(conflict1Pattern, puzzleRes);

const conflict2Pattern = /<<<<<<< HEAD\n              const jsonResult: any = await executeGeminiWithRotation\([\s\S]*?>>>>>>> Gemini2/g;

const jsonRotationRes = `              const jsonResult: any = await executeGeminiWithRotation(
                async (apiKey) => {
                  const models = [
                    env.VITE_GEMINI_MODEL || 'gemini-3.6-flash',
                    'gemini-3.6-flash',
                    'gemini-3.5-flash',
                    'gemini-2.5-flash',
                  ];

                  let lastErr = null;
                  for (const m of models) {
                    try {
                      const gRes = await fetch(
                        \`https://generativelanguage.googleapis.com/v1beta/models/\${m}:generateContent\`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(apiKey) },
                          body: JSON.stringify({
                            systemInstruction: { parts: [{ text: systemInstruction }] },
                            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                            generationConfig: { 
                              responseMimeType: 'application/json', 
                              temperature: 0.7,
                              responseSchema: {
                                type: "OBJECT",
                                properties: {
                                  title: { type: "STRING" },
                                  scenario: { type: "STRING" },
                                  question: { type: "STRING" },
                                  codeSnippet: { type: "STRING" },
                                  answer: { type: "ARRAY", items: { type: "STRING" } },
                                  hint: { type: "STRING" },
                                  nextClue: { type: "STRING" }
                                },
                                required: ["title", "scenario", "question", "codeSnippet", "answer", "hint", "nextClue"]
                              }
                            },
                          }),
                        }
                      );

                      if (!gRes.ok) {
                        const errText = await gRes.text();
                        console.error("Gemini API Error Response:", gRes.status, errText);
                        const err: any = new Error(errText || \`Gemini API HTTP \${gRes.status}\`);
                        err.status = gRes.status;
                        throw err;
                      }

                      const gData = await gRes.json();
                      const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (raw) {
                        return JSON.parse(raw);
                      }
                    } catch (err: any) {
                      lastErr = err;
                      if (err.status === 429 || err.status === 402 || err.status === 403) {
                        throw err; // Trigger key rotation
                      }
                    }
                  }`;

code = code.replace(conflict2Pattern, jsonRotationRes);


// Resolution for evaluate logic
const conflict3Pattern = /<<<<<<< HEAD\n              const evalPrompt = \`You are a strict but fair judge for a technical coding puzzle game.[\s\S]*?>>>>>>> Gemini2/g;

const evalRes = `              const systemInstruction = \`You are a strict but fair judge for a technical coding puzzle game.
Determine if the player's submission is a valid, correct solution/answer to the question.\`;

              const userPrompt = \`Question: "\${puzzle.question}"
Reference Code: "\${puzzle.codeSnippet || 'None'}"
Expected Reference Answers: \${JSON.stringify(puzzle.answer || [])}
Player's Submission: "\${userAnswer}"
\${solveTimeMs ? \`The player solved this puzzle in \${Math.round(solveTimeMs / 1000)} seconds. Current Difficulty: \${currentDifficulty || 'Beginner'}. Based on this time (if they solved it very quickly under 30s, increase difficulty. If over 120s, decrease it. Otherwise keep it same).\` : ''}\`;

              const { executeGeminiWithRotation } = await import('./server/geminiKeyPool.js');

              const evalRes: any = await executeGeminiWithRotation(
                async (apiKey) => {
                  const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
                  let lastErr = null;

                  for (const m of models) {
                    try {
                      const gRes = await fetch(
                        \`https://generativelanguage.googleapis.com/v1beta/models/\${m}:generateContent\`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(apiKey) },
                          body: JSON.stringify({
                            systemInstruction: { parts: [{ text: systemInstruction }] },
                            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                            generationConfig: { 
                              responseMimeType: 'application/json', 
                              temperature: 0.1,
                              responseSchema: {
                                type: "OBJECT",
                                properties: {
                                  isCorrect: { type: "BOOLEAN" },
                                  feedback: { type: "STRING" },
                                  nextDifficulty: { type: "STRING" }
                                },
                                required: ["isCorrect", "feedback", "nextDifficulty"]
                              }
                            },
                          }),
                        }
                      );

                      if (!gRes.ok) {
                        const errText = await gRes.text();
                        console.error("Gemini API Error Response:", gRes.status, errText);
                        const err: any = new Error(errText || \`Gemini API HTTP \${gRes.status}\`);
                        err.status = gRes.status;
                        throw err;
                      }

                      const gData = await gRes.json();
                      const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (raw) {
                        const result = JSON.parse(raw);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        return res.end(
                          JSON.stringify({
                            isCorrect: Boolean(result.isCorrect),
                            feedback: result.feedback || (result.isCorrect ? 'Correct!' : 'Incorrect.'),
                            nextDifficulty: result.nextDifficulty
                          })
                        );
                      }
                    } catch (err: any) {
                      lastErr = err;
                      if (err.status === 429 || err.status === 402 || err.status === 403) {
                        throw err; // Rotate key
                      }
                    }
                  }
                  throw lastErr || new Error('Evaluation parsing error');
                },
                clientKey,
                env
              );
              // if evalRes didn't return early
              return;`;

code = code.replace(conflict3Pattern, evalRes);

fs.writeFileSync('vite.config.ts', code);
console.log("Resolved");
