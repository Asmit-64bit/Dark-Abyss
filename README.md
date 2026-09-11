# 🎮 ABYSS

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%20%26%20GPT--OSS-F55036?style=flat)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A 3D Psychological Horror Coding Escape Room & Adaptive CS Learning Platform**

*"The building has been empty for nine years. You came down here to steal a hard drive. The door locked behind you. Somewhere in the dark, a machine is still running — and it has been waiting a very long time for someone to talk to."*

[Live Demo](https://abyss-genesis-nine.vercel.app/) • [Report Bug](https://github.com/Asmit-64bit/Dark-Abyss/issues) • [Request Feature](https://github.com/Asmit-64bit/Dark-Abyss/issues)

</div>

---

## 📖 Overview

**Abyss** merges first-person 3D atmospheric horror with technical computer science challenges. Players explore an abandoned subterranean research laboratory (*"Schrödinger's Abyss"*), examine physics-based props, hack retro CRT terminals, write and evaluate algorithms in an integrated REPL sandbox, and preserve cognitive sanity while pursued by an anomalous entity (*Sadako*).

The platform dynamically adapts its curriculum difficulty in real time based on speed, hint reliance, and code execution errors.

---

## ✨ Key Features

### 🧠 1. AI-Powered Dynamic Puzzle Engine & Groq 6-Key Pool
- **Adaptive Generation**: Coding challenges generated dynamically using Groq (`openai/gpt-oss-120b` and `llama-3.3-70b-versatile`) with sub-second inference latency.
- **Failover Key Pool**: Intelligent rotation supporting up to 6 Groq API keys (`GROQ_API_KEY_1` through `GROQ_API_KEY_6`). Automatically handles 429 TPM/RPM rate limits by seamlessly cycling to active backup keys with zero gameplay interruption.
- **Dynamic Threat Adaptation**: Calibrates difficulty tiers (`Easy`, `Intermediate`, `Advanced`, `Expert`) based on player solve velocity and error count.

### 🏆 2. Solo Solve Scoring & Global Leaderboard
- **Independent Solo Multiplier**: Awards a **+25% score bonus** when puzzles are deciphered without requesting hint files.
- **Precision & Speed Telemetry**: Earn bonus points for first-try precision (0 syntax errors), speed runs ($< 45\text{s}$), and high sanity preservation ($\ge 80\%$).
- **Dual-Mode Cloud Leaderboard**: Standings queried directly from Supabase with automatic REST fallback for static hosting deployments (e.g. Vercel, Netlify). Includes dedicated filter modes for **Top Score**, **Solo Purists**, and **Sanity Masters**.

### 📱 3. Comprehensive Mobile & Tablet Responsiveness
- **Adaptive Touch Controls**: Virtual floating movement joystick, dual-finger swipe view controls, and dedicated touch buttons for interaction, jumping, and flashlight toggling.
- **Orientation & Screen Scalability**: Optimized across portrait, landscape, foldables, and ultra-wide displays with safe-area notch insets (`env(safe-area-inset-*)`).
- **Hardware Document Scrolling**: Native momentum scrolling across all modals, terminals, and dossier dashboards on iOS and Android.

### 💻 4. Interactive REPL Sandbox & Forensic Debriefs
- **In-Game Logic Runner**: Integrated JavaScript/TypeScript execution sandbox to experiment and verify algorithms before committing sequences to the mainframe.
- **Forensic Debriefs**: Educational takeaways, algorithmic patterns, and security principles displayed after stabilizing each anomaly node.

### 👁️ 5. Psychological Horror & Cognitive Sanity System
- **Dynamic Sanity Meter ($0 - 100$)**: Depletes on failed submissions or revealing solutions; restores upon stabilizing an anomaly node.
- **Procedural Fear Response**: Heartbeat audio scales dynamically from **72 BPM** (nominal) to **152 BPM** (critical dread) alongside camera static, subliminal flashes, CRT distortion, and jumpscares.

### 🌐 6. Subterranean 3D World & Physics
- First-person exploration powered by **React Three Fiber** and **Rapier Physics**.
- Smooth pointer lock controls, head-bobbing, flashlight raycasting, and interactive 3D assets (computers, safes, routers, reactor consoles).

---

## 🎯 CS Curriculum Domains

Operators can target specific curriculum domains before initiating their incursion:

| Domain | Focus Areas |
| :--- | :--- |
| **Programming Fundamentals** | Syntax, scoping, type coercion, recursion, core data structures |
| **Control Flow & Logic** | Loop boundaries, off-by-one errors, state machines, branching algorithms |
| **Web Security & APIs** | SQL injection, XSS, authentication bypass, REST idempotency, CORS |
| **Frontend Engineering** | React hooks lifecycle, state management, dependency arrays, virtual DOM |
| **Networking & Cryptography** | Regular expressions, subnet masks, hashing algorithms, ZK proofs |
| **Systems & Performance** | Memory management (`malloc`/`free`), race conditions, mutex locks, Big-O |

---

## 🕹️ Controls

### Desktop (Keyboard & Mouse)
| Action | Key / Input |
| :--- | :--- |
| **Movement** | `W`, `A`, `S`, `D` |
| **Look / Turn** | `Mouse Movement` (Click to Lock Pointer) |
| **Interact / Hack Terminal** | `E` or `Left Click` (when targeting interactive object) |
| **Flashlight Toggle** | `F` |
| **Jump** | `Space` |
| **Close Modal / Pause** | `Escape` or `Q` |
| **Run Code in Sandbox** | `Run` button inside terminal console |

### Mobile & Tablet (Touch Gestures)
| Action | Touch Input |
| :--- | :--- |
| **Movement** | Left Virtual Touchpad / Joystick |
| **Look / Aim** | Right Screen Swipe / Drag Surface |
| **Interact / Hack** | Diegetic `[ INTERACT ]` Button |
| **Flashlight** | Diegetic `[ LIGHT ]` Button |
| **Jump** | Diegetic `[ JUMP ]` Button |
| **Navigation Menu** | `[ MENU ]` Button in Header |
| **Fullscreen Mode** | Tap `[ FULLSCREEN ]` in Navigation |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or **pnpm** / **yarn**)

### 2. Clone and Install
```bash
git clone https://github.com/Asmit-64bit/Dark-Abyss.git
cd Dark-Abyss
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# --- GROQ AI MULTI-KEY FAILOVER POOL ---
GROQ_MODEL=openai/gpt-oss-120b
GROQ_API_KEY=gsk_...
GROQ_API_KEY_1=gsk_...
GROQ_API_KEY_2=gsk_...
GROQ_API_KEY_3=gsk_...
GROQ_API_KEY_4=gsk_...
GROQ_API_KEY_5=gsk_...
GROQ_API_KEY_6=gsk_...

# --- SUPABASE DATABASE & AUTH ---
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 4. Database Setup (Supabase)
1. Run [`supabase/schema.sql`](supabase/schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard) to create the `profiles`, `generated_questions`, and unified views.
2. Run [`supabase/seed_leaderboard.sql`](supabase/seed_leaderboard.sql) to seed baseline NPC operators into the leaderboard.
3. *(Optional)* Seed curated domain questions:
   ```bash
   npm run seed:questions
   ```
   Or execute [`supabase/seed_questions.sql`](supabase/seed_questions.sql) directly in Supabase.

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & Deployment

```bash
# Type check and lint
npm run lint

# Compile optimized production bundle
npm run build

# Preview build locally
npm run start
```

### Deploying to Vercel / Netlify
Abyss is fully optimized for static single-page deployments. When deployed on Vercel or Netlify without a Node.js backend:
- Leaderboard queries seamlessly fall back to direct Supabase REST requests using your public anon key.
- Offline and connection drops are gracefully absorbed by the bundled baseline roster.

---

## 🏗️ Architecture & Project Structure

```
Abyss/
├── public/                 # 3D GLTF models, audio files, textures, horror assets
├── server/                 # Backend services & proxies
│   ├── groqKeyPool.js      # 6-Key Groq API failover rotator
│   ├── supabaseService.js  # Supabase auth, profile sync & leaderboard handler
│   └── index.js            # Standalone production Node.js server
├── src/
│   ├── components/
│   │   ├── Audio/          # Horror ambience & dynamic BPM heartbeat generator
│   │   ├── Environment/    # 3D sectors (Apartment, ReactorCore, ServerRoom)
│   │   ├── Objects/        # Interactive 3D props (Computer, Desk, ExitDoor)
│   │   ├── UI/             # GameUI, LeaderboardModal, ProfileDashboard, TouchControls
│   │   ├── LevelManager.tsx# Dynamic sector level & object renderer
│   │   └── Player.tsx      # First-person Rapier physics character controller
│   ├── data/               # Pre-generated puzzles, dossiers & curriculum mappings
│   ├── lib/                # Client API (`apiClient.ts` with direct REST fallbacks)
│   ├── services/           # Groq AI puzzle generator & evaluator (`aiService.ts`)
│   ├── store/              # Zustand global state (`gameStore.ts`, `authStore.ts`)
│   └── utils/              # Web Audio synthesizers & horror sound effects
├── supabase/
│   ├── schema.sql          # Core tables, RLS policies, and triggers
│   ├── seed_leaderboard.sql# NPC leaderboard seed & constraint configuration
│   └── seed_questions.sql  # 70+ curated domain puzzles
└── vite.config.ts          # Vite configuration, COOP/COEP, and dev middleware
```

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
