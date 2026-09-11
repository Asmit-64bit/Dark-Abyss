export const DOMAIN_SLOT_TOPICS = {
  'DevOps & Cloud Infrastructure': {
    1: {
      topic: 'Docker Fundamentals / Dockerfile Instructions (FROM, RUN, COPY, CMD, WORKDIR)',
      tags: ['docker', 'dockerfile', 'containers', 'devops'],
      focusArea: 'Containerization Basics',
      suggestedLanguages: ['dockerfile', 'bash'],
    },
    2: {
      topic: 'Docker Networking & Port Mapping (-p host:container) & Volume Mounts (-v)',
      tags: ['docker', 'networking', 'ports', 'volumes'],
      focusArea: 'Container Storage & Network Isolation',
      suggestedLanguages: ['bash', 'dockerfile', 'yaml'],
    },
    3: {
      topic: 'Multi-Stage Docker Builds / Alpine Minimal Images & Attack Surface Reduction',
      tags: ['docker', 'multi-stage', 'security', 'optimization'],
      focusArea: 'Container Build Optimization',
      suggestedLanguages: ['dockerfile'],
    },
    4: {
      topic: 'Kubernetes Pods & Deployments / Declarative YAML Spec & Replica Sets',
      tags: ['kubernetes', 'k8s', 'pods', 'deployments'],
      focusArea: 'Container Orchestration & Scaling',
      suggestedLanguages: ['yaml'],
    },
    5: {
      topic: 'Kubernetes Networking / Services (ClusterIP, NodePort, LoadBalancer) & Ingress Rules',
      tags: ['kubernetes', 'services', 'ingress', 'networking'],
      focusArea: 'Cluster Routing & Exposure',
      suggestedLanguages: ['yaml'],
    },
    6: {
      topic: 'Kubernetes Configuration / ConfigMaps, Secrets, Liveness & Readiness Probes',
      tags: ['kubernetes', 'configmaps', 'secrets', 'probes'],
      focusArea: 'Application Health & Secret Management',
      suggestedLanguages: ['yaml'],
    },
    7: {
      topic: 'CI/CD Pipelines (GitHub Actions / GitLab CI) / Workflow YAML Syntax & Artifact Caching',
      tags: ['ci-cd', 'github-actions', 'workflows', 'automation'],
      focusArea: 'Continuous Integration & Delivery',
      suggestedLanguages: ['yaml'],
    },
    8: {
      topic: 'Infrastructure as Code (IaC) / Terraform Resource Blocks & State File Locking',
      tags: ['terraform', 'iac', 'hcl', 'cloud-provisioning'],
      focusArea: 'Declarative Cloud Infrastructure',
      suggestedLanguages: ['hcl', 'terraform'],
    },
    9: {
      topic: 'Cloud Computing Architecture / Serverless (Lambda / Functions), Autoscaling & Load Balancers',
      tags: ['cloud', 'serverless', 'autoscaling', 'aws'],
      focusArea: 'High Availability & Cloud Architectures',
      suggestedLanguages: ['yaml', 'json', 'python'],
    },
    10: {
      topic: 'Observability & Monitoring / Prometheus Exporters, Metrics & Grafana Dashboards',
      tags: ['observability', 'prometheus', 'metrics', 'monitoring'],
      focusArea: 'Telemetry & SRE Metrics',
      suggestedLanguages: ['yaml', 'promql'],
    },
    11: {
      topic: 'GitOps Continuous Deployment / ArgoCD Sync Policies & Rollbacks',
      tags: ['gitops', 'argocd', 'k8s', 'cd'],
      focusArea: 'Declarative CD Operations',
      suggestedLanguages: ['yaml'],
    },
    12: {
      topic: 'Container Security Hardening / Rootless Containers & CVE Vulnerability Scanning',
      tags: ['security', 'rootless', 'cve', 'docker'],
      focusArea: 'Container Security & Compliance',
      suggestedLanguages: ['dockerfile', 'yaml'],
    },
    13: {
      topic: 'Cloud Networking Architecture / VPC Peering, Subnets, NAT Gateways & Route Tables',
      tags: ['networking', 'vpc', 'subnets', 'nat-gateway'],
      focusArea: 'VPC & Hybrid Cloud Networking',
      suggestedLanguages: ['hcl', 'json'],
    },
    14: {
      topic: 'Site Reliability Engineering (SRE) / SLO, SLI, Error Budgets & Chaos Engineering',
      tags: ['sre', 'slo', 'sli', 'reliability'],
      focusArea: 'Resilience & Disaster Recovery',
      suggestedLanguages: ['json', 'yaml'],
    },
  },

  'React & Frontend Architecture': {
    1: {
      topic: 'React useState Hook / State Immutability / Component Re-renders',
      tags: ['react', 'useState', 'hooks', 'state'],
      focusArea: 'Component State Reactivity',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    2: {
      topic: 'React useEffect Dependency Array / Preventing Infinite Re-render Cycles',
      tags: ['react', 'useEffect', 'lifecycle', 'dependencies'],
      focusArea: 'Side Effect Lifecycle',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    3: {
      topic: 'React useEffect Cleanup Functions / Memory Leak Prevention on Component Unmount',
      tags: ['react', 'useEffect', 'cleanup', 'memory-leaks'],
      focusArea: 'Unmount Safety & Resource Disposal',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    4: {
      topic: 'React useRef Hook / Persistent Mutable Values Without Triggering Re-renders',
      tags: ['react', 'useRef', 'dom-refs', 'mutable-state'],
      focusArea: 'Direct DOM Access & Refs',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    5: {
      topic: 'React Context API / createContext & useContext / Eliminating Prop Drilling',
      tags: ['react', 'context', 'useContext', 'state-management'],
      focusArea: 'Global Scope Context Sharing',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    6: {
      topic: 'Virtual DOM & Reconciliation / Efficient Diffing with List "key" Props',
      tags: ['virtual-dom', 'reconciliation', 'keys', 'performance'],
      focusArea: 'DOM Diffing & Key Mechanics',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    7: {
      topic: 'React Performance Optimization / useMemo & useCallback Hooks / React.memo',
      tags: ['useMemo', 'useCallback', 'React.memo', 'performance'],
      focusArea: 'Memoization & Render Tuning',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    8: {
      topic: 'Custom Hooks Architecture / Encapsulating & Sharing Reusable State Logic',
      tags: ['custom-hooks', 'reusability', 'patterns', 'architecture'],
      focusArea: 'Modular Logic Extraction',
      suggestedLanguages: ['jsx', 'tsx', 'typescript'],
    },
    9: {
      topic: 'Global State Management Architecture / Zustand or Redux Store Selectors & Immutability',
      tags: ['zustand', 'redux', 'global-state', 'selectors'],
      focusArea: 'Predictable State Containers',
      suggestedLanguages: ['typescript', 'javascript'],
    },
    10: {
      topic: 'React Error Boundaries / componentDidCatch & getDerivedStateFromError Lifecycle',
      tags: ['error-boundaries', 'resilience', 'lifecycle', 'react'],
      focusArea: 'Defensive UI & Crash Fallbacks',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    11: {
      topic: 'Code Splitting & Suspense / React.lazy Dynamic Imports & Fallback Boundaries',
      tags: ['suspense', 'code-splitting', 'react-lazy', 'performance'],
      focusArea: 'Async Bundle Loading',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    12: {
      topic: 'React Server Components (RSC) vs Client Components ("use client" Boundary)',
      tags: ['rsc', 'server-components', 'nextjs', 'architecture'],
      focusArea: 'Modern Hybrid Rendering',
      suggestedLanguages: ['tsx', 'jsx'],
    },
    13: {
      topic: 'Frontend Security / XSS Prevention & Sanitization (dangerouslySetInnerHTML)',
      tags: ['security', 'xss', 'sanitization', 'frontend-security'],
      focusArea: 'Client-Side Attack Defenses',
      suggestedLanguages: ['jsx', 'tsx', 'javascript'],
    },
    14: {
      topic: 'Hydration Mismatch Resolution & Server-Side Rendering (SSR) Consistency',
      tags: ['ssr', 'hydration', 'nextjs', 'rendering'],
      focusArea: 'Isomorphic Rendering Invariants',
      suggestedLanguages: ['tsx', 'jsx', 'javascript'],
    },
  },

  'Data Structures & Algorithms': {
    1: {
      topic: 'Array Manipulation / Two-Pointer Technique / Sliding Window Maximum',
      tags: ['arrays', 'two-pointer', 'sliding-window', 'dsa'],
      focusArea: 'Contiguous Subarrays & Pointers',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    2: {
      topic: 'Linked List Reversal / Fast & Slow Pointers (Tortoise and Hare Cycle Detection)',
      tags: ['linked-list', 'cycle-detection', 'pointers', 'dsa'],
      focusArea: 'Node Pointer Manipulation',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    3: {
      topic: 'Recursion Invariants / Base Case Conditions / Call Stack Overflow Prevention',
      tags: ['recursion', 'base-case', 'call-stack', 'dsa'],
      focusArea: 'Recursive Call Termination',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    4: {
      topic: 'Binary Search Tree (BST) Properties / In-Order Traversal & Search Bounds',
      tags: ['trees', 'bst', 'inorder-traversal', 'binary-tree'],
      focusArea: 'Hierarchical Search Structures',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    5: {
      topic: 'Breadth-First Search (BFS) / Shortest Path in Unweighted Graph / Queue FIFO Operations',
      tags: ['bfs', 'graphs', 'queue', 'shortest-path'],
      focusArea: 'Level-Order Graph Exploration',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    6: {
      topic: 'Depth-First Search (DFS) / Graph Cycle Detection / Recursion Stack & Visited Tracking',
      tags: ['dfs', 'graphs', 'cycle-detection', 'stack'],
      focusArea: 'Deep Graph Search & Backtracking',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    7: {
      topic: 'Dynamic Programming (DP) / Memoization Top-Down vs Tabulation Bottom-Up',
      tags: ['dynamic-programming', 'memoization', 'tabulation', 'optimization'],
      focusArea: 'Overlapping Subproblems & Optimal Substructure',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    8: {
      topic: 'Binary Search O(log n) Boundaries / Off-By-One Midpoint Calculation',
      tags: ['binary-search', 'time-complexity', 'search', 'dsa'],
      focusArea: 'Logarithmic Array Lookup',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    9: {
      topic: 'Heap & Priority Queue / Min-Heap Property & Kth Largest Element',
      tags: ['heap', 'priority-queue', 'min-heap', 'dsa'],
      focusArea: 'Streaming Priority Ordering',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    10: {
      topic: 'Trie (Prefix Tree) / String Auto-Completion & Fast Key Prefix Insertion',
      tags: ['trie', 'prefix-tree', 'strings', 'dsa'],
      focusArea: 'Prefix-Based String Indexing',
      suggestedLanguages: ['python', 'javascript', 'typescript'],
    },
    11: {
      topic: 'Dijkstra\'s Algorithm / Shortest Path in Weighted Graphs with Priority Queue',
      tags: ['dijkstra', 'graphs', 'greedy', 'shortest-path'],
      focusArea: 'Weighted Graph Optimization',
      suggestedLanguages: ['python', 'javascript'],
    },
    12: {
      topic: 'Topological Sort / Kahn\'s Algorithm with In-Degree Array / Directed Acyclic Graphs',
      tags: ['topological-sort', 'dag', 'kahns-algorithm', 'graphs'],
      focusArea: 'Dependency Graph Ordering',
      suggestedLanguages: ['python', 'javascript'],
    },
    13: {
      topic: 'Bit Manipulation / Bitwise XOR Properties / Finding Unique Single Element',
      tags: ['bitwise', 'xor', 'binary', 'bit-manipulation'],
      focusArea: 'Low-Level Bitwise Algebra',
      suggestedLanguages: ['python', 'javascript', 'c'],
    },
    14: {
      topic: 'Disjoint Set Union (DSU / Union-Find) / Path Compression & Union by Rank',
      tags: ['union-find', 'dsu', 'graphs', 'kruskal'],
      focusArea: 'Dynamic Connectivity & Cycle Checks',
      suggestedLanguages: ['python', 'javascript'],
    },
  },

  'Python & Backend Systems': {
    1: {
      topic: 'Python Core Syntax / Lists, Tuples, Sets, Dictionaries & Mutable vs Immutable Types',
      tags: ['python', 'syntax', 'data-types', 'backend'],
      focusArea: 'Primitive & Collection Fundamentals',
      suggestedLanguages: ['python'],
    },
    2: {
      topic: 'Python List Comprehensions & Fast O(1) Dictionary Key Lookups',
      tags: ['python', 'comprehensions', 'dictionaries', 'performance'],
      focusArea: 'Idiomatic Data Transformations',
      suggestedLanguages: ['python'],
    },
    3: {
      topic: 'Context Managers ("with" Statement) / __enter__ & __exit__ Clean Resource Deallocation',
      tags: ['python', 'context-managers', 'with', 'resources'],
      focusArea: 'Deterministic File & Socket Cleanup',
      suggestedLanguages: ['python'],
    },
    4: {
      topic: 'Python Generators / "yield" Expression & Lazy Memory-Efficient Evaluation',
      tags: ['python', 'generators', 'yield', 'iterators'],
      focusArea: 'Lazy Evaluation Streams',
      suggestedLanguages: ['python'],
    },
    5: {
      topic: 'RESTful API Architecture / HTTP Methods (GET, POST, PUT, DELETE) & Status Codes',
      tags: ['rest-api', 'http', 'backend', 'api-design'],
      focusArea: 'API Standards & Status Semantics',
      suggestedLanguages: ['python', 'json', 'javascript'],
    },
    6: {
      topic: 'Python Decorators / Function Wrappers (@decorator) & *args / **kwargs Forwarding',
      tags: ['python', 'decorators', 'functions', 'metaprogramming'],
      focusArea: 'Cross-Cutting Logic Decorators',
      suggestedLanguages: ['python'],
    },
    7: {
      topic: 'Relational Databases & SQL / Transactions, ACID Guarantees & Safe Parameterized Queries',
      tags: ['sql', 'acid', 'transactions', 'databases'],
      focusArea: 'Database Consistency & Concurrency',
      suggestedLanguages: ['sql', 'python'],
    },
    8: {
      topic: 'Python Concurrency / Asyncio ("async" & "await") vs Threading vs Multiprocessing & The GIL',
      tags: ['asyncio', 'gil', 'concurrency', 'threading'],
      focusArea: 'Asynchronous Non-Blocking I/O',
      suggestedLanguages: ['python'],
    },
    9: {
      topic: 'High-Performance Caching / Redis In-Memory Key-Value & Cache Invalidation',
      tags: ['redis', 'caching', 'performance', 'backend'],
      focusArea: 'Distributed In-Memory Stores',
      suggestedLanguages: ['python', 'bash'],
    },
    10: {
      topic: 'Backend Authentication / Password Hashing (bcrypt / Argon2) & Secure JWT Verification',
      tags: ['auth', 'jwt', 'bcrypt', 'security'],
      focusArea: 'Stateless Token & Credential Safety',
      suggestedLanguages: ['python'],
    },
    11: {
      topic: 'API Rate Limiting / Token Bucket Algorithm / Leaky Bucket & HTTP 429 Status',
      tags: ['rate-limiting', 'token-bucket', 'throttling', 'apis'],
      focusArea: 'Traffic Control & DoS Mitigation',
      suggestedLanguages: ['python'],
    },
    12: {
      topic: 'Real-Time Communication / WebSockets Full-Duplex Connection Lifecycle',
      tags: ['websockets', 'networking', 'real-time', 'backend'],
      focusArea: 'Persistent Bidirectional Sockets',
      suggestedLanguages: ['python', 'javascript'],
    },
    13: {
      topic: 'Database Query Optimization / Indexes (B-Trees) & EXPLAIN Query Execution Plans',
      tags: ['sql', 'indexes', 'optimization', 'performance'],
      focusArea: 'Relational Index Tuning',
      suggestedLanguages: ['sql'],
    },
    14: {
      topic: 'Microservices & Message Queues / Event-Driven Architecture with RabbitMQ or Kafka',
      tags: ['message-queues', 'kafka', 'rabbitmq', 'microservices'],
      focusArea: 'Asynchronous Event Streaming',
      suggestedLanguages: ['python', 'json'],
    },
  },

  'Cybersecurity & Cryptography': {
    1: {
      topic: 'Cryptographic Hashing (SHA-256 vs MD5) / Salt Generation & Rainbow Table Defense',
      tags: ['hashing', 'sha-256', 'salting', 'passwords'],
      focusArea: 'One-Way Hash Integrity',
      suggestedLanguages: ['python', 'javascript', 'bash'],
    },
    2: {
      topic: 'Symmetric vs Asymmetric Encryption / AES-256 vs RSA Public-Private Key Pairs',
      tags: ['encryption', 'aes', 'rsa', 'asymmetric-crypto'],
      focusArea: 'Cipher Systems & Key Management',
      suggestedLanguages: ['python', 'javascript'],
    },
    3: {
      topic: 'SQL Injection (SQLi) Vulnerabilities / Tautology Attacks & Parameterized Query Defenses',
      tags: ['sqli', 'sql-injection', 'owasp', 'parameterized-queries'],
      focusArea: 'Database Query Poisoning Mitigation',
      suggestedLanguages: ['sql', 'python', 'javascript'],
    },
    4: {
      topic: 'Cross-Site Scripting (XSS) / Stored vs Reflected XSS & Context-Aware Output Escaping',
      tags: ['xss', 'owasp', 'sanitization', 'csp'],
      focusArea: 'Client Script Injection Prevention',
      suggestedLanguages: ['javascript', 'html'],
    },
    5: {
      topic: 'Cross-Site Request Forgery (CSRF) / Anti-CSRF Synchronizer Tokens & SameSite Cookies',
      tags: ['csrf', 'tokens', 'cookies', 'web-security'],
      focusArea: 'Unauthorized Request Defenses',
      suggestedLanguages: ['javascript', 'python'],
    },
    6: {
      topic: 'JSON Web Tokens (JWT) / Header-Payload-Signature Architecture & None-Algorithm Flaws',
      tags: ['jwt', 'tokens', 'hmac', 'auth-bypass'],
      focusArea: 'Cryptographic Token Verification',
      suggestedLanguages: ['javascript', 'json', 'python'],
    },
    7: {
      topic: 'Transport Layer Security (TLS/SSL) / Asymmetric Handshake & Certificate Verification',
      tags: ['tls', 'https', 'certificates', 'pki'],
      focusArea: 'Encrypted Transport & PKI Trust',
      suggestedLanguages: ['bash', 'python'],
    },
    8: {
      topic: 'Buffer Overflow Attacks / Stack Canaries, ASLR & Memory Safety in C/C++',
      tags: ['buffer-overflow', 'memory-safety', 'c-cpp', 'exploitation'],
      focusArea: 'Low-Level Memory Corruption',
      suggestedLanguages: ['c', 'cpp', 'assembly'],
    },
    9: {
      topic: 'Zero Trust Architecture / Principle of Least Privilege & Role-Based Access Control (RBAC)',
      tags: ['zero-trust', 'rbac', 'least-privilege', 'access-control'],
      focusArea: 'Continuous Verification Security',
      suggestedLanguages: ['json', 'python'],
    },
    10: {
      topic: 'Side-Channel Timing Attacks / Constant-Time String & HMAC Comparisons',
      tags: ['timing-attacks', 'side-channel', 'cryptography'],
      focusArea: 'Micro-Timing Information Leaks',
      suggestedLanguages: ['python', 'c'],
    },
    11: {
      topic: 'Command Injection Vulnerabilities / Shell Escaping & Subprocess Isolation',
      tags: ['command-injection', 'subprocess', 'owasp', 'shell'],
      focusArea: 'OS Command Execution Boundaries',
      suggestedLanguages: ['python', 'bash'],
    },
    12: {
      topic: 'Server-Side Request Forgery (SSRF) / Cloud Metadata API (169.254.169.254) Protection',
      tags: ['ssrf', 'cloud-security', 'metadata', 'network-filtering'],
      focusArea: 'Internal Service Impersonation',
      suggestedLanguages: ['python', 'javascript'],
    },
    13: {
      topic: 'Diffie-Hellman Key Exchange / Ephemeral Keys (DHE) & Perfect Forward Secrecy (PFS)',
      tags: ['diffie-hellman', 'key-exchange', 'forward-secrecy', 'cryptography'],
      focusArea: 'Key Agreement Protocols',
      suggestedLanguages: ['python', 'c'],
    },
    14: {
      topic: 'Zero-Knowledge Proofs & Merkle Tree Cryptographic Integrity Verification',
      tags: ['zero-knowledge', 'zkp', 'merkle-tree', 'cryptography'],
      focusArea: 'Verifiable Computation & Hashes',
      suggestedLanguages: ['python', 'solidity'],
    },
  },
};

export function getDomainSlotInfo(domain, puzzleId) {
  const normalizedDomain = (domain || '').trim();
  if (normalizedDomain && DOMAIN_SLOT_TOPICS[normalizedDomain]?.[puzzleId]) {
    return DOMAIN_SLOT_TOPICS[normalizedDomain][puzzleId];
  }

  return {
    topic: `Advanced Concepts in ${normalizedDomain || 'General Software Engineering'} (Sector Slot ${puzzleId})`,
    tags: [normalizedDomain ? normalizedDomain.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'general', 'programming'],
    focusArea: normalizedDomain || 'Software Architecture',
    suggestedLanguages: ['python', 'javascript', 'typescript'],
  };
}
