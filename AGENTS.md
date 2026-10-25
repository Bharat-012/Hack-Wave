# AGENTS.md — PatchMyCity Engineering Directives & Standards

**Project:** PatchMyCity (Hack Wave Hackathon)  
**Operating Philosophy:** Honesty over appearance. Original code only. AI proposes, backend decides.

---

## 1. Core Operating Principles

1. **Absolute Honesty:** Never report an unexecuted test as passing. Never label mock data as live or AI. Mark mock outputs clearly in the UI and backend responses (`source: "mock"`).
2. **Hack Wave Originality:** All code must be authored cleanly and original. No copying or lifting modules or assets from external reference repositories.
3. **AI Boundaries:** Gemini is an advisory micro-service behind strict server-side validation. The backend alone mutates database state, transitions report statuses, evaluates quests, and issues points.
4. **Security & Privacy by Default:**
   - No API keys, service roles, or database secrets in client bundles.
   - Strip EXIF GPS metadata on image ingest before processing.
   - User inputs sanitized against XSS; database queries parameterized.
   - Row Level Security (RLS) enabled on all tables.
5. **Deterministic Points:** Point transactions must be idempotent using unique constraints on `{event_type}:{source_id}:{user_id}`.
6. **Bilingual & Accessible:** All UI strings must use i18n resources (English and Hindi). All components must support keyboard navigation and WCAG AA contrast.

---

## 2. Technology Stack & Workspace Structure

- **Client (`client/`):** React 19 / 18, Vite, TypeScript, Tailwind CSS, React Router, Lucide React, Leaflet + OpenStreetMap.
- **Server (`server/`):** Node.js, Express, TypeScript, Zod, Google GenAI SDK (`@google/genai` or `@google/generative-ai`), CORS, Helmet, Rate Limiter.
- **Database & Storage:** Supabase PostgreSQL with versioned SQL migrations (`supabase/migrations/`) and Row Level Security.
- **Testing:** Vitest, React Testing Library, Supertest.

### Directory Layout
```
/
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   ├── DEMO_SCRIPT.md
│   ├── DEPENDENCY_MAP.md
│   ├── HANDOFF.md
│   ├── PROJECT_CONTEXT.md
│   └── REFERENCE_ANALYSIS.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── i18n/
│       ├── pages/
│       ├── types/
│       └── utils/
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
└── supabase/
    └── migrations/
```

---

## 3. Code & Architecture Conventions

- **State Machine:** Report status transitions must strictly follow Section 5.1 domain rules. Every transition MUST create a `report_events` audit record.
- **Validation:** Every HTTP endpoint receiving user input must parse and validate payloads using Zod schemas.
- **Error Envelopes:** Express endpoints return structured JSON envelopes:
  - Success: `{ success: true, data: ... }`
  - Error: `{ success: false, error: { message: string, code: string, details?: any } }`
- **Zero Raw HTML Injection:** Never use `dangerouslySetInnerHTML` on untrusted user strings.

---

## 4. Change Management Workflow

Before every non-trivial change:
1. Review relevant docs and inspect real workspace files.
2. Outline direct and downstream dependencies and regression risks.
3. Keep `.env.example` synchronized with newly introduced configuration variables.
4. Update `docs/CHANGELOG.md`, `docs/PROJECT_CONTEXT.md` checklist, and `docs/HANDOFF.md`.
