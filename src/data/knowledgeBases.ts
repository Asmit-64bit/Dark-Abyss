export const DOMAIN_KNOWLEDGE_BASES: Record<string, string> = {
  'Data Structures & Algorithms': `
SUBJECT: DATA STRUCTURES & ALGORITHMS (DSA)
CLASSIFICATION: CORE LOGIC

1. Arrays & Strings:
- Arrays are contiguous memory blocks. O(1) access, O(n) insertion/deletion.
- Strings are character arrays. Two-pointer techniques are highly effective for palindromes or reversing.
- Sliding Window technique is used for contiguous subarrays or substrings (e.g., max sum, longest substring without repeating characters).

2. Linked Lists:
- Nodes contain data and a pointer to the next node.
- Fast and Slow pointers (Tortoise and Hare) are used to detect cycles or find the middle node.
- Reversing a linked list requires manipulating 'prev', 'curr', and 'next' pointers carefully to avoid dropping references.

3. Trees & Graphs:
- Binary Search Tree (BST): Left child is smaller, right child is larger. In-order traversal yields sorted order.
- Breadth-First Search (BFS): Uses a Queue. Ideal for finding the shortest path in an unweighted graph.
- Depth-First Search (DFS): Uses a Stack (or recursion). Ideal for exploring all paths or topological sorting.
- Detect cycles in a graph using DFS (keeping track of visited and recursion stack).

4. Dynamic Programming (DP):
- Used for overlapping subproblems and optimal substructure.
- Memoization (Top-Down) vs. Tabulation (Bottom-Up).
- Classic problems: Fibonacci, Knapsack, Longest Common Subsequence.

5. Sorting & Searching:
- Binary Search: O(log n) time, requires a sorted array. Keep track of 'low', 'high', and 'mid'.
- Merge Sort & Quick Sort are O(n log n) average. Merge sort uses extra space; Quick sort does not (but has O(n^2) worst case).
  `,

  'React & Frontend Architecture': `
SUBJECT: REACT & FRONTEND ARCHITECTURE
CLASSIFICATION: VISUAL INTERFACE SUBSYSTEMS

1. Component Lifecycle & Hooks:
- React components render based on State and Props.
- useState: Local component state. Calling the setter triggers a re-render.
- useEffect: Side effects (fetching data, subscriptions). The dependency array controls when it runs. Empty array [] runs only on mount. Return a function for cleanup (unmount).
- useRef: Mutable reference that does NOT trigger a re-render when changed. Useful for direct DOM access or storing previous values.

2. State Management:
- Prop Drilling: Passing state down multiple levels. Avoid when possible.
- Context API (createContext, useContext): Global state for themes, user auth, etc.
- External stores (Zustand, Redux): Used for complex global state to prevent unnecessary re-renders across the app.

3. Performance Optimization:
- React.memo: Prevents functional component re-renders if props haven't changed.
- useMemo: Caches expensive calculations between renders.
- useCallback: Caches a function definition between renders (useful when passing callbacks to child components).

4. Virtual DOM:
- React keeps a lightweight representation of the real DOM.
- When state changes, it compares the new Virtual DOM with the old one (Reconciliation) and only updates the changed nodes in the real DOM.
- The 'key' prop in lists is critical for efficient reconciliation.

5. Routing & Architecture:
- Single Page Applications (SPAs) use client-side routing (e.g., React Router) to change the URL without reloading the page.
- Component composition: Building complex UIs by combining small, reusable components rather than massive monolithic files.
  `,

  'Cybersecurity & Cryptography': `
SUBJECT: CYBERSECURITY & CRYPTOGRAPHY
CLASSIFICATION: CONTAINMENT & ENCRYPTION

1. Cryptography Basics:
- Symmetric Encryption: Uses the same key for encryption and decryption (e.g., AES). Fast, but key distribution is hard.
- Asymmetric Encryption: Uses a Public Key (to encrypt) and a Private Key (to decrypt) (e.g., RSA). Slower, but secure for key exchange.
- Hashing: One-way function turning data into a fixed-size string (e.g., SHA-256). Used for verifying integrity and storing passwords. Hashes cannot be reversed.
- Salting: Adding random data to a password before hashing to defeat Rainbow Table attacks.

2. Common Vulnerabilities (OWASP Top 10):
- SQL Injection (SQLi): Inserting malicious SQL code into input fields to manipulate the database. Mitigation: Parameterized queries / Prepared statements.
- Cross-Site Scripting (XSS): Injecting malicious JavaScript into a webpage viewed by other users. Mitigation: Sanitize and escape all user input.
- Cross-Site Request Forgery (CSRF): Tricking a logged-in user's browser into executing unwanted actions on a trusted site. Mitigation: Anti-CSRF tokens.

3. Authentication & Authorization:
- Authentication verifies WHO you are (e.g., passwords, biometrics, 2FA).
- Authorization verifies WHAT you can do (e.g., RBAC - Role-Based Access Control).
- JWT (JSON Web Tokens): Stateless authentication tokens. They are encoded, NOT encrypted (anyone can read the payload). Signature verifies authenticity.

4. Network Security:
- TLS/SSL: Encrypts data in transit over HTTP (making it HTTPS).
- Firewalls: Filter incoming and outgoing network traffic based on rules.
- Zero Trust Architecture: "Never trust, always verify." No implicit trust granted based on network location.
  `,

  'Python & Backend Systems': `
SUBJECT: PYTHON & BACKEND SYSTEMS
CLASSIFICATION: CORE PROCESSING

1. Python Fundamentals:
- Interpreted, dynamically typed language.
- Lists (mutable, ordered), Tuples (immutable, ordered), Sets (mutable, unordered, unique), Dictionaries (Key-Value pairs, fast lookups).
- List Comprehensions: Concise way to create lists \`[x for x in iterable if condition]\`.
- Generators: Use \`yield\` instead of \`return\`. They evaluate lazily, saving memory for large datasets.

2. Object-Oriented & Advanced Python:
- Decorators: Functions that modify the behavior of other functions (using \`@decorator_name\`).
- Context Managers: Manage resources efficiently using the \`with\` statement (e.g., \`with open('file.txt') as f:\`). Ensures files/connections are closed automatically.
- Dunder Methods: Magic methods like \`__init__\`, \`__str__\`, \`__len__\` that define object behavior.

3. Backend APIs:
- REST (Representational State Transfer): Uses standard HTTP methods (GET, POST, PUT, DELETE). Stateless. Resource-based URLs.
- GraphQL: Clients request exactly the data they need. Single endpoint.
- WebSockets: Persistent, full-duplex communication channel over a single TCP connection. Ideal for real-time apps.

4. Databases (SQL vs NoSQL):
- SQL (Relational): Structured data, predefined schemas, ACID properties (Atomicity, Consistency, Isolation, Durability). Good for complex queries and relations. (e.g., PostgreSQL).
- NoSQL: Flexible schemas, document/key-value/graph structures. Good for unstructured data or rapid scaling. (e.g., MongoDB, Redis).

5. Concurrency:
- Threading: Good for I/O-bound tasks (network requests). Python's GIL (Global Interpreter Lock) prevents true parallel execution of CPU-bound threads.
- Multiprocessing: Good for CPU-bound tasks (math processing). Bypasses the GIL by spawning separate processes.
- Asyncio: Single-threaded, concurrent code using \`async\` and \`await\`. Highly efficient for massive I/O operations.
  `,

  'DevOps & Cloud Infrastructure': `
SUBJECT: DEVOPS & CLOUD INFRASTRUCTURE
CLASSIFICATION: INFRASTRUCTURE & DEPLOYMENT

1. Containerization (Docker):
- Packages an application and its dependencies into a standardized unit (Container) that runs consistently anywhere.
- Images: Read-only templates used to build containers (defined in a Dockerfile).
- Containers: Running instances of images. They share the host OS kernel but are isolated.
- Volumes: Used for persistent data storage, as containers are ephemeral (data dies when the container stops).

2. Orchestration (Kubernetes):
- Manages clusters of containers. Handles scaling, self-healing, and deployments.
- Pods: The smallest deployable unit in K8s, usually running one container.
- Services: Expose Pods to the network (since Pod IPs constantly change).
- Deployments: Declarative way to manage replicas of Pods and rolling updates.

3. CI/CD (Continuous Integration / Continuous Deployment):
- CI: Automatically building and testing code every time a commit is pushed to the repository.
- CD: Automatically deploying the validated code to staging or production environments.
- Ensures code quality, catches bugs early, and allows for rapid release cycles.

4. Infrastructure as Code (IaC):
- Managing and provisioning data centers through machine-readable definition files (e.g., Terraform, Ansible) rather than manual configuration.
- Allows infrastructure to be version-controlled, tested, and reliably reproduced.

5. Cloud Concepts:
- IaaS (Infrastructure as a Service): Raw compute/storage (e.g., AWS EC2).
- PaaS (Platform as a Service): Managed environment to run apps (e.g., Heroku, AWS Elastic Beanstalk).
- Serverless: You write functions; the cloud provider manages the underlying servers entirely (e.g., AWS Lambda). You pay only for compute time used.
  `
};
