export interface ForensicDebrief {
  domain: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';
  keyTakeaway: string;
  realWorldImpact: string;
  remediationCode?: string;
}

export type Puzzle = {
  id: number;
  level: number;
  title: string;
  scenario: string;
  question: string;
  codeSnippet?: string;
  answer: string[];
  reward: string;
  hint?: string;
  nextClue?: string;
  debrief?: ForensicDebrief;
};

export const puzzles: Puzzle[] = [
  // --- LEVEL 1: Laboratory ---
  {
    id: 1,
    level: 1,
    title: "The Syntax Cipher",
    scenario: "The computer is locked. You find a corrupted Python script on the screen.",
    question: "What single character is missing to make this code compile?",
    codeSnippet: "def greet(name)\n    return 'Hello ' + name",
    answer: [":", ": "],
    reward: "Gold Key",
    hint: "A Python block opens with a promise, not a brace.",
    nextClue: "Something in the drawer hums louder each time a loop finally breaks.",
    debrief: {
      domain: "Programming Fundamentals",
      difficulty: "Easy",
      keyTakeaway: "Python block definitions (def, if, for, while) require a colon (:) to define the start of an indented suite.",
      realWorldImpact: "Syntax parsing errors halt interpreter compilation before bytecode generation, preventing execution.",
      remediationCode: "def greet(name):\n    return 'Hello ' + name",
    },
  },
  {
    id: 2,
    level: 1,
    title: "The Infinite Loop Trap",
    scenario: "The drawer is secured by an electronic lock running an infinite loop.",
    question: "The lock won't open because the system is crashing. What line of code must be added to fix this loop?",
    codeSnippet: "let x = 10;\nwhile(x > 0) {\n  console.log('Unlocking...');\n  // ADD CODE HERE \n}",
    answer: ["x--;", "x--", "x -= 1;", "x-=1;", "x -= 1", "x-=1", "x = x - 1;", "x=x-1;", "x = x - 1", "x=x-1", "break;", "break"],
    reward: "Master Key",
    hint: "The condition never lies — only the variable refuses to change.",
    nextClue: "The gate outside is waiting for a very old kind of forged query.",
    debrief: {
      domain: "Control Flow & Logic",
      difficulty: "Easy",
      keyTakeaway: "Loop invariants must decrement or modify control state toward the exit condition on each iteration.",
      realWorldImpact: "Unbounded loops freeze the single-threaded JavaScript event loop, causing denial of service (DoS) and application unresponsiveness.",
      remediationCode: "let x = 10;\nwhile (x > 0) {\n  console.log('Unlocking...');\n  x--;\n}",
    },
  },
  {
    id: 3,
    level: 1,
    title: "Level 1 Exit",
    scenario: "The main exit door terminal was hacked! The logs show the breach query.",
    question: "You are given the query used in the login form. What type of attack was used here?",
    codeSnippet: "SELECT * FROM users \nWHERE username = 'admin' \nAND password = '' OR '1'='1'",
    answer: ["SQL Injection", "SQLi", "SQL injection attack", "sql injection"],
    reward: "Escape",
    hint: "OR '1'='1' doesn't ask a question — it answers every question at once.",
    nextClue: "Beyond this door, the servers keep score of every packet that ever passed through.",
    debrief: {
      domain: "Web Security",
      difficulty: "Intermediate",
      keyTakeaway: "SQL Injection occurs when user input manipulates the query structure, evaluating tautologies (e.g. '1'='1') to bypass authentication.",
      realWorldImpact: "Ranked consistently in OWASP Top 10; responsible for massive data exfiltration breaches and total database compromise.",
      remediationCode: "// Secure with Parameterized Queries / Prepared Statements\nconst result = await db.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, hash]);",
    },
  },

  // --- LEVEL 2: Server Room ---
  {
    id: 4,
    level: 2,
    title: "The Missing Dependency",
    scenario: "A server rack is showing a critical React rendering error.",
    question: "This hook is meant to run only once on mount, but it runs on every render. What is missing?",
    codeSnippet: "useEffect(() => {\n  initServerConnection();\n});",
    answer: ["[]", "[] ", "[]\n", "empty array", "an empty array", "dependency array", "a dependency array"],
    reward: "Server Key",
    hint: "Nothing runs 'once' unless you tell React there's nothing left to watch.",
    nextClue: "A router down the hall refuses anything that doesn't begin exactly right.",
    debrief: {
      domain: "Frontend Development",
      difficulty: "Intermediate",
      keyTakeaway: "Passing an empty dependency array `[]` ensures useEffect runs once on initial mount and cleans up on unmount.",
      realWorldImpact: "Omitting dependency arrays triggers infinite re-render loops when state is updated inside the effect, crashing the browser tab.",
      remediationCode: "useEffect(() => {\n  initServerConnection();\n}, []); // Empty array runs on mount only",
    },
  },
  {
    id: 5,
    level: 2,
    title: "Regex Router",
    scenario: "The network router requires a specific regex pattern to allow SSH traffic.",
    question: "What regex character matches the start of a string?",
    codeSnippet: "const pattern = /__ssh-traffic/;",
    answer: ["^", "^ "],
    reward: "Admin Card",
    hint: "Anchors don't move — they mark where a string is allowed to begin.",
    nextClue: "The door beyond doesn't care about your answer. It cares how it was hashed.",
    debrief: {
      domain: "Networking & Regex",
      difficulty: "Intermediate",
      keyTakeaway: "Anchors like `^` (start of string) and `$` (end of string) prevent partial substring match bypasses in security filters.",
      realWorldImpact: "Failing to anchor route matching regexes leads to authorization bypasses where malicious query parameters circumvent access filters.",
      remediationCode: "const pattern = /^ssh-traffic$/; // Anchored start and end",
    },
  },
  {
    id: 6,
    level: 2,
    title: "Level 2 Exit",
    scenario: "The blast door is secured with a hashing challenge.",
    question: "Which cryptographic hash function is famously considered broken and insecure for passwords, producing a 128-bit hash value?",
    codeSnippet: "",
    answer: ["MD5", "md5", "MD-5"],
    reward: "Escape",
    hint: "128 bits, decades old, and cryptographers still tell horror stories about it.",
    nextClue: "Something further down leaks memory the way a wound leaks time.",
    debrief: {
      domain: "Cryptography & Security",
      difficulty: "Intermediate",
      keyTakeaway: "MD5 produces 128-bit hashes and suffers from severe collision attacks and rapid GPU rainbow table cracking.",
      realWorldImpact: "Modern standards require adaptive salted password hashing algorithms such as Argon2id, bcrypt, or PBKDF2.",
      remediationCode: "const hash = await bcrypt.hash(password, 12); // Salted adaptive key derivation",
    },
  },

  // --- LEVEL 3: Reactor Core ---
  {
    id: 7,
    level: 3,
    title: "Memory Leak Menace",
    scenario: "The core coolant system is running out of memory.",
    question: "Which cleanup expression should you return from this hook when the component unmounts?",
    codeSnippet: "useEffect(() => {\n  window.addEventListener('resize', handleResize);\n  // WHAT GOES HERE?\n}, []);",
    answer: ["return () => window.removeEventListener('resize', handleResize);", "return () => window.removeEventListener('resize', handleResize)", "() => window.removeEventListener('resize', handleResize)"],
    reward: "Coolant Override",
    hint: "Whatever you attach in the effect, you must detach on the way out.",
    nextClue: "The final lock doesn't ask what changed. It asks how completely you replaced it.",
    debrief: {
      domain: "Systems & Performance",
      difficulty: "Advanced",
      keyTakeaway: "Global event listeners and intervals retain component references in memory closures if not unhooked in cleanup functions.",
      realWorldImpact: "Uncleaned listeners cause single-page apps (SPAs) to accumulate memory over hours of usage until browser tab crashes.",
      remediationCode: "useEffect(() => {\n  window.addEventListener('resize', handleResize);\n  return () => window.removeEventListener('resize', handleResize);\n}, []);",
    },
  },
  {
    id: 8,
    level: 3,
    title: "The Final Breach",
    scenario: "The reactor lockdown mechanism is controlled by a faulty API endpoint.",
    question: "What HTTP method should ideally be used to completely replace an existing resource?",
    codeSnippet: "fetch('/api/reactor/status', {\n  method: '__',\n  body: JSON.stringify({ locked: false })\n})",
    answer: ["PUT", "put"],
    reward: "Escape",
    hint: "One method replaces the whole resource; its cousin only patches a piece.",
    nextClue: "Somewhere ahead, a register is bleeding pointers it was never given.",
    debrief: {
      domain: "Web APIs & Protocols",
      difficulty: "Advanced",
      keyTakeaway: "PUT is idempotent and replaces the complete resource; PATCH applies partial modifications; POST creates sub-resources.",
      realWorldImpact: "Using non-idempotent methods for state synchronization can cause duplicate unintended state transitions during network retries.",
      remediationCode: "fetch('/api/reactor/status', { method: 'PUT', body: JSON.stringify({ locked: false }) });",
    },
  },

  // --- LEVEL 4: Debug Wing ---
  {
    id: 9,
    level: 4,
    title: "Heap Glitch Matrix",
    scenario: "A suspended memory register is throwing unhandled pointer exceptions.",
    question: "In C/C++, which function is used to deallocate memory allocated with 'malloc'?",
    codeSnippet: "char *buffer = (char*)malloc(1024);\n// ... process anomalous packets ...\n// WHAT FUNCTION RELEASES THIS BUFFER?",
    answer: ["free", "free()", "free(buffer)", "free(buffer);"],
    reward: "Memory Bypass Key",
    hint: "Whatever malloc gives, only one function is allowed to take back.",
    nextClue: "The bits ahead don't shift themselves — someone has to move them.",
    debrief: {
      domain: "Low-Level & Memory",
      difficulty: "Advanced",
      keyTakeaway: "Memory allocated on the heap via malloc() must be explicitly deallocated using free() to return pages to the OS allocator.",
      realWorldImpact: "Failing to free memory leads to memory leaks; calling free() multiple times causes catastrophic Double-Free vulnerabilities.",
      remediationCode: "char *buffer = (char*)malloc(1024);\n// ... work with buffer ...\nfree(buffer);\nbuffer = NULL; // Null pointer to avoid use-after-free",
    },
  },
  {
    id: 10,
    level: 4,
    title: "The Bitwise Obfuscator",
    scenario: "The sub-routine decrypts security registers using binary bit shifts.",
    question: "What is the numerical result of the evaluated expression (1 << 3) in decimal?",
    codeSnippet: "const authMask = 1 << 3;\nconsole.log(authMask); // Output?",
    answer: ["8", "8 "],
    reward: "Cipher Chip",
    hint: "Each shift left doubles whatever was already there.",
    nextClue: "Two threads are about to touch the same memory at the same time. Neither will notice until it's too late.",
    debrief: {
      domain: "Computer Architecture",
      difficulty: "Advanced",
      keyTakeaway: "Bitwise left shift `x << k` computes `x * 2^k`. Binary 00000001 shifted left by 3 positions becomes 00001000 (decimal 8).",
      realWorldImpact: "Bitmasks are fundamental for high-speed permission flags, network subnet calculations, and cryptographic ciphers.",
      remediationCode: "const READ = 1 << 0;  // 1 (001)\nconst WRITE = 1 << 1; // 2 (010)\nconst EXEC = 1 << 2;  // 4 (100)",
    },
  },
  {
    id: 11,
    level: 4,
    title: "The Race Condition",
    scenario: "Two asynchronous threads are mutating the same memory address simultaneously without a mutex lock.",
    question: "What concurrency flaw occurs when multiple threads attempt to read and write shared state without synchronization?",
    codeSnippet: "let counter = 0;\nasync function worker() { counter++; }\nPromise.all([worker(), worker()]);",
    answer: ["Race Condition", "Race condition", "race condition", "data race", "Data race", "Data Race"],
    reward: "Escape",
    hint: "When two threads write without asking, the last one in wins — and neither meant to.",
    nextClue: "The Nexus doesn't wait in line. It arrives everywhere at once.",
    debrief: {
      domain: "Concurrency & Systems",
      difficulty: "Advanced",
      keyTakeaway: "Race conditions occur when the outcome of concurrent operations depends on the execution sequence and timing.",
      realWorldImpact: "Led to infamous vulnerabilities including the 2016 DAO reentrancy attack ($60M stolen) and Therac-25 radiation accidents.",
      remediationCode: "// Fix with Mutex Locks or Atomic Operations\nawait mutex.runExclusive(async () => {\n  counter++;\n});",
    },
  },

  // --- LEVEL 5: The Nexus ---
  {
    id: 12,
    level: 5,
    title: "Topological Singularity",
    scenario: "The nexus core graphs all node dependencies to resolve the spacetime cycle.",
    question: "Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue data structure?",
    codeSnippet: "const queue = [rootNode];\nwhile(queue.length > 0) {\n  const current = queue.shift();\n  // ... explore neighbors\n}",
    answer: ["Breadth First Search", "BFS", "breadth-first search", "breadth first search", "Breadth-First Search"],
    reward: "Singularity Prism",
    hint: "First in, first out — the queue never lets a node cut the line.",
    nextClue: "Somewhere in this convergence, a function is about to solve the same problem for the hundredth time.",
    debrief: {
      domain: "Data Structures & Algorithms",
      difficulty: "Advanced",
      keyTakeaway: "Breadth-First Search (BFS) explores graphs level-by-level using a FIFO queue, guaranteeing shortest-path discovery in unweighted graphs.",
      realWorldImpact: "Powers network routing, web crawlers, dependency resolution (npm/cargo), and GPS pathfinding.",
      remediationCode: "function bfs(graph, start) {\n  const queue = [start];\n  const visited = new Set([start]);\n  while (queue.length) {\n    const node = queue.shift();\n    for (const neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}",
    },
  },
  {
    id: 13,
    level: 5,
    title: "Quantum State Memoization",
    scenario: "The temporal loop is recalculating identical Fibonacci subproblems exponentially.",
    question: "What optimization technique stores the results of expensive function calls to return cached results for identical inputs?",
    codeSnippet: "const cache = {};\nfunction compute(n) {\n  if (n in cache) return cache[n];\n  // ... compute & save to cache\n}",
    answer: ["Memoization", "memoization", "caching", "Memoize", "memoize"],
    reward: "Omni Core",
    hint: "Why solve it twice when you can simply remember it once?",
    nextClue: "The final gateway doesn't want your key. It wants proof you never had to show one.",
    debrief: {
      domain: "Algorithms & Complexity",
      difficulty: "Advanced",
      keyTakeaway: "Memoization caches deterministic function outputs, eliminating redundant subproblem calculations in recursion.",
      realWorldImpact: "Reduces algorithmic time complexity from exponential O(2^N) to linear O(N), saving millions in cloud compute costs.",
      remediationCode: "const memo = new Map();\nfunction fib(n) {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n  const res = fib(n - 1) + fib(n - 2);\n  memo.set(n, res);\n  return res;\n}",
    },
  },
  {
    id: 14,
    level: 5,
    title: "Genesis Genesis Protocol",
    scenario: "The central intelligence demands a cryptographic proof that you know the secret key without revealing the key itself.",
    question: "What class of cryptographic method enables one party to prove to another that a statement is true without revealing any secret information?",
    codeSnippet: "ZK-SNARK Protocol // Verification Stage\n// PROVE SECRET WITHOUT REVEALING KEY",
    answer: ["Zero-Knowledge Proof", "Zero Knowledge Proof", "ZKP", "zk-SNARK", "zero knowledge", "zero-knowledge proof", "Zero-Knowledge", "zero knowledge proof"],
    reward: "Escape",
    hint: "You can prove you hold a secret without ever saying the secret out loud.",
    nextClue: "The Abyss has nothing left to hide from you.",
    debrief: {
      domain: "Advanced Cryptography",
      difficulty: "Expert",
      keyTakeaway: "Zero-Knowledge Proofs (ZKPs) allow a prover to mathematically prove statement validity to a verifier with zero knowledge leakage.",
      realWorldImpact: "Powers privacy-preserving blockchain rollups, anonymous identity verification, and secure authentication protocols.",
      remediationCode: "// Conceptual ZK-SNARK Verification\nconst isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);",
    },
  },
];
