# 🎮 ABYSS

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r173-black?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash%20AI-4285F4?style=flat&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A 3D Psychological Horror Coding Escape Room & Adaptive CS Learning Platform**

*"The building has been empty for nine years. You came down here to steal a hard drive. The door locked behind you. Somewhere in the dark, a machine is still running — and it has been waiting a very long time for someone to talk to."*

</div>

---

## 📖 Overview

**Abyss** combines first-person 3D atmospheric horror with technical computer science puzzles. Players explore the subterranean research laboratory (*"Schrodinger's Abyss"*), inspect interactive physics-based props, hack logic terminals, write and test code in an integrated REPL sandbox, and balance cognitive sanity while being pursued by a paranormal entity (*Sadako*).

---

## ✨ Key Features

### 🧠 1. AI-Powered Dynamic Puzzle Engine & 6-Key Rotator
- **Adaptive Generation**: Coding challenges generated dynamically using Google Gemini models tailored to your performance and chosen curriculum domain.
- **Failover Pool**: Intelligent rotator supporting up to 6 Gemini API keys (`GEMINI_API_KEY_1` through `GEMINI_API_KEY_6`). Automatically handles 429 quota exhaustion or billing limits by switching keys with zero player downtime.
- **Dynamic Difficulty**: Real-time threat adaptation that escalates or recalibrates difficulty tiers (`Easy`, `Intermediate`, `Advanced`, `Expert`) based on solve speed and error count.

### 🏆 2. Solo Solve Scoring & Global Leaderboard
- **Independent Solve Multiplier**: Awards a **+25% bonus** when puzzles are deciphered without opening hints, tagging the record as an unassisted *Independent Solo Solve*.
- **Precision & Speed Bonuses**: Earn bonus points for first-try precision (0 errors), speed runs ($< 45\text{s}$), and high sanity preservation ($\ge 80\%$).
- **Live Leaderboard**: Ranked standings directly queried from Supabase with filter modes for **Top Score**, **Solo Purists**, and **Sanity Masters**.

### 💻 3. Interactive REPL Sandbox & Forensic Debriefs
- **In-Game Logic Runner**: Integrated JavaScript/TypeScript execution sandbox to experiment and verify algorithms before committing sequences.
- **Forensic Debriefs**: Educational takeaways, syntax patterns, and security principles displayed after solving each node.

### 👁️ 4. Psychological Horror & Cognitive Sanity System
- **Dynamic Sanity Meter ($0 - 100$)**: Decreases on failed submissions or revealing solutions; restores upon stabilizing an anomaly node.
- **Procedural Fear Response**: Heartbeat audio scales dynamically from **72 BPM** (nominal) to **152 BPM** (critical dread) alongside camera static, subliminal flashes, and jumpscares.

### 🌐 5. Subterranean 3D World & Physics
- First-person exploration powered by **React Three Fiber** and **Rapier Physics**.
- Smooth pointer lock controls, head-bobbing, flashlight raycasting, and interactive 3D assets (computers, safes, routers, reactor consoles).

---

## 🎯 CS Curriculum Domains

Operators can target specific curriculum domains before initiating their incursion:

| Domain | Focus Areas |
| :--- | :--- |
| **Programming Fundamentals** | Syntax, scoping, type coercion, recursion, basic data structures |
| **Control Flow & Logic** | Loop boundaries, off-by-one errors, state machines, branching |
| **Web Security & APIs** | SQL injection, XSS, authentication bypass, REST idempotency |
| **Frontend Engineering** | React hooks lifecycle, state management, dependency arrays |
| **Networking & Cryptography** | Regular expressions, subnet masks, hashing algorithms, ZK proofs |
| **Systems & Performance** | Memory management (`malloc`/`free`), race conditions, mutex locks |

---

## 🕹️ Controls

| Action | Key / Input |
| :--- | :--- |
| **Movement** | `W`, `A`, `S`, `D` |
| **Look / Turn** | `Mouse Movement` (Pointer Lock) |
| **Interact / Hack Terminal** | `E` or `Left Click` (when crosshair targets object) |
| **Flashlight Toggle** | `F` |
| **Close Modal / Pause** | `Escape` or `Q` |
| **Run REPL Sandbox** | `Run` button inside terminal console |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### 2. Clone and Install
```bash
git clone https://github.com/Asmit-64bit/Abyss.git
cd Abyss
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Gemini API Multi-Key Failover Pool
GEMINI_API_KEY_1=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...
GEMINI_API_KEY_3=AIzaSy...
GEMINI_API_KEY_4=AIzaSy...
GEMINI_API_KEY_5=AIzaSy...
GEMINI_API_KEY_6=AIzaSy...

# Default / Fallback Key & Model
VITE_GEMINI_API_KEY=AIzaSy...
VITE_GEMINI_MODEL=gemini-3.6-flash

# Supabase Cloud Database & Authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 4. Database Setup (Supabase)
Run the SQL migration script located in [`supabase/schema.sql`](supabase/schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard) to create the `profiles`, `generated_questions`, and `users` view.

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

```bash
# Lint check
npm run lint

# Compile production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🏗️ Architecture & Project Structure

```
Abyss/
├── public/                 # 3D GLTF models, audio files, textures
├── server/                 # Backend proxy & services
│   ├── geminiKeyPool.js    # 6-Key Gemini API failover rotator
│   ├── supabaseService.js  # Supabase auth, profile sync & leaderboard
│   └── index.js            # Standalone Node.js server
├── src/
│   ├── components/
│   │   ├── Audio/          # Horror ambience & dynamic heartbeat generator
│   │   ├── Environment/    # 3D sectors (Apartment, ReactorCore, ServerRoom)
│   │   ├── Objects/        # Interactive 3D props (Computer, Desk, ExitDoor)
│   │   ├── UI/             # GameUI, LeaderboardModal, ProfileDashboard
│   │   ├── LevelManager.tsx# Dynamic level & object renderer
│   │   └── Player.tsx      # First-person Rapier physics controller
│   ├── data/               # Pre-generated puzzles & curriculum mappings
│   ├── lib/                # Backend API client (`apiClient.ts`)
│   ├── services/           # Gemini AI puzzle generator & evaluator
│   ├── store/              # Zustand global state (`gameStore`, `authStore`)
│   └── utils/              # Sound synthesizers & audio effects
├── supabase/
│   └── schema.sql          # Database tables, RLS policies, and triggers
└── vite.config.ts          # Vite configuration & dev API middleware
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
