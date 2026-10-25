# PatchMyCity 🏙️⚡

> **Report a problem. Rally your neighborhood. Make change visible.**  
> An original project built for the **Hack Wave** hackathon.

---

## 🌟 The Vision

PatchMyCity transforms traditional, bureaucratic civic reporting into **City Quest Mode** — an engaging community adventure where residents turn problems into collaborative neighborhood missions. 

Using Google Gemini, photos are analyzed server-side with structured reasoning and safety boundaries. Once verified, issues become team quests where neighbors join forces, submit photographic evidence of progress, and track real, verified civic improvements on an interactive map.

### 🛡️ Core Architectural Principles
1. **AI Proposes, the Backend Decides:** Gemini provides suggestions and drafts; it never awards points, mutates status, or confirms fixes.
2. **Deterministic Points Engine:** Gamification is secured via composite unique idempotency constraints (`{event_type}:{source_id}:{user_id}`) preventing duplicate point farming.
3. **Honesty Over Appearance:** Transparent Demo Mode when Gemini keys are missing, labeled mocks (`source: "mock"`), and clean separation between demo data (`is_demo: true`) and live submissions.
4. **Bilingual & Accessible:** Full English and Hindi (हिंदी) localization, WCAG AA contrast, and screen-reader accessible list alternatives to maps.

---

## 🏗️ Tech Stack

- **Frontend:** React 18 / 19, Vite, TypeScript, Tailwind CSS, React Router, Lucide Icons, Leaflet + OpenStreetMap.
- **Backend:** Node.js, Express, TypeScript, Zod, Google GenAI SDK.
- **Data & Storage:** Supabase PostgreSQL with versioned migrations, Row Level Security (RLS).
- **Testing:** Vitest, React Testing Library, Supertest.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Setup
Create a `.env` file in the root directory (or copy `.env.example`):
```bash
cp .env.example .env
```
Add your `GEMINI_API_KEY`. If left empty, the application runs automatically in **Demo Mock Mode** with labeled mock responses.

### 3. Installation & Run
```bash
# Install root, server, and client dependencies
npm run install:all

# Start backend and frontend concurrently
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/v1/health

---

## 🗺️ Project Structure

```
├── AGENTS.md               # Engineering principles and operational contract
├── docs/                   # Architectural documentation & project memory
│   ├── ARCHITECTURE.md     # Detailed data flows and ER diagrams
│   ├── DECISIONS.md        # Architecture Decision Records (ADRs)
│   ├── DEMO_SCRIPT.md      # 3–5 minute judge walkthrough & fallback steps
│   ├── DEPENDENCY_MAP.md   # Contracts, schemas, and dependencies
│   ├── HANDOFF.md          # State of the project and current milestone
│   ├── PROJECT_CONTEXT.md  # Live MoSCoW implementation checklist
│   └── REFERENCE_ANALYSIS.md# Evaluation of 4 reference civic repos
├── client/                 # React + Vite frontend application
├── server/                 # Express + TypeScript backend API
└── supabase/
    └── migrations/         # Versioned PostgreSQL DDL with RLS
```

---

## ⚠️ Honest Limitations
- **Geocoding:** Reverse geocoding uses OpenStreetMap Nominatim with client rate-limiting.
- **Image Storage:** Development mode supports base64 and local buffer previews; production utilizes signed URLs.
- **Mock Mode:** In demo environments without a valid Gemini API key, AI outputs are explicitly marked as `[Demo Analysis (Not AI)]`.
