# REFERENCE ANALYSIS: Civic Tech & Issue Reporting Ecosystem

**Project:** PatchMyCity (Hack Wave Hackathon)  
**Date:** October 2026  
**Purpose:** Time-boxed architectural and feature study of existing reference projects to inform PatchMyCity's conceptual design, avoid common pitfalls, and establish clear originality.

---

## 1. Executive Summary of Examined Repositories

| Repository | Primary Stack | Core Focus | Architectural Strength | Critical Weakness / Vulnerability |
|---|---|---|---|---|
| **marvillage/civicfix** (Fixity) | React 19, Express 5, Prisma 7, PostgreSQL, Cloudinary, Gemini | Municipal officer pipeline, SLA tracking, ward budgets, public council desk | Clean permission matrix (`resource:action`), transactional audit logs | Heavy government bureaucratic overhead; complex officer workflow; not suited for community rallying; heavy dependencies |
| **Jyatin/-fixmyway** | React Native (Expo), Firebase (Auth, Firestore, Storage), Gemini Vision | Mobile citizen reporting with location & nearby duplicate detection | Client-side Haversine filtering, clear mobile UX, community verification | Client-side trust model; Firestore client writes lack relational integrity constraints; duplicate matching client-side |
| **AnshiPandey/CivicAI** | Next.js, React, Tailwind CSS, Google Maps, Gemini API | Incident diagnostics, AI severity score, authority triage dashboard | Rich AI telemetry prompts (confidence, fake risk, dispatch recommendation) | Frontend-centric; lacks persistent backend state machine and true RLS; no collaborative gamification |
| **bagde-priyanshi/civiclens-ai** | React, Vite, Tailwind CSS, Leaflet.js, Framer Motion, Gemini | Gamified civic audit with Leaflet geospatial pins & "Trust Score" | Polished aesthetic, interactive map snapping, compact drawer dashboard | Client-side mock state in React memory; no persistent SQL backend; client-exposed AI keys; points not idempotent |

---

## 2. In-Depth Project Breakdowns

### 2.1 marvillage/civicfix (Fixity)
- **Features Implemented:**
  - Citizen "Quick Drop" reporting with up to 5 photos and GPS geocoding.
  - Gemini-based AutoSort category and severity suggestion.
  - Crew Queue with Fix Clock SLA countdowns and role-based dispatching (Citizen, Authority, Admin).
  - City Pulse public analytics and Ward Bulletins.
- **Strengths:**
  - Strong transactional integrity: append-only status history (`AuditEvent`).
  - Separation of authorization into a discrete permission matrix.
- **Weaknesses:**
  - Overly bureaucratic: framed as an administrative grievance ticketing tool rather than community empowerment.
  - High operational barrier: requires Docker, Cloudinary, Prisma, and complex officer provisioning.
- **What PatchMyCity Adopts Conceptually:**
  - Append-only audit logging (`report_events`) for every status transition.
  - Strict server-side status transition rules where the frontend never directly updates status.
- **What PatchMyCity Improves:**
  - Replaces government-only dispatch with **City Quest Mode**, empowering neighborhood teams to rally around verified issues.

### 2.2 Jyatin/-fixmyway
- **Features Implemented:**
  - Mobile photo capture, Gemini category/severity suggestion, and address lookup.
  - Client-side Haversine distance duplicate candidate detection.
  - Basic community verification check.
- **Strengths:**
  - Pragmatic duplicate candidate preview before submission to prevent spam.
  - Separation of raw uploaded image from report submission metadata.
- **Weaknesses:**
  - Direct Firestore client writes without strict transactional boundaries or relational foreign keys.
  - Client-side duplicate detection suffers from scale limitations and network overhead.
- **What PatchMyCity Adopts Conceptually:**
  - Multi-factor duplicate candidate detection (distance + category + time proximity).
- **What PatchMyCity Improves:**
  - Moves duplicate calculation and candidate ranking to a trusted backend endpoint with weighted scoring.
  - Relational database schema with Supabase PostgreSQL and Row Level Security (RLS).

### 2.3 AnshiPandey/CivicAI
- **Features Implemented:**
  - Image analysis with Gemini returning structured attributes (severity, confidence, safety recommendations).
  - Google Maps GIS dashboard with severity heatmaps and filters.
  - Municipal authority triage view.
- **Strengths:**
  - Structured prompt engineering requesting explicit reasoning and public safety precautions.
- **Weaknesses:**
  - No database-backed state machine; transitions are simulated.
  - No bilingual support or community mission layer.
- **What PatchMyCity Adopts Conceptually:**
  - Structured JSON output schemas validated with Zod on the server.
  - Distinguishing visible evidence from inferred hypotheses.
- **What PatchMyCity Improves:**
  - Enforces "AI proposes, backend decides": Gemini never awards points, changes status, or resolves cases.
  - Full bilingual support (English and Hindi) throughout the user journey.

### 2.4 bagde-priyanshi/civiclens-ai
- **Features Implemented:**
  - Leaflet-based geospatial mapping with regional snapping.
  - Citizen Trust Score and drawer-based leaderboard.
  - Community upvoting and flagging.
- **Strengths:**
  - Responsive, modern visual design with CartoDB/Leaflet tiles.
  - Fast feedback loop with toast notifications.
- **Weaknesses:**
  - Client-side in-memory mock state; data does not persist across reloads or multi-user sessions.
  - Points and scores are calculated directly in frontend components without idempotency or server verification.
- **What PatchMyCity Adopts Conceptually:**
  - Clean Leaflet + OpenStreetMap integration with accessible list alternatives.
- **What PatchMyCity Improves:**
  - Fully persistent database with deterministic points, unique database idempotency keys, and anti-farming daily caps.

---

## 3. Originality Statement for PatchMyCity

PatchMyCity is built 100% from scratch with an original architectural and product identity:
1. **City Quest Mode (Signature Innovation):** Rather than routing complaints into black-hole bureaucratic queues, verified civic issues spawn community missions where neighbors form squads, contribute photographic evidence, and track tangible improvements.
2. **Honest AI Architecture:** Gemini operates as an untrusted advisory service behind server-side Zod validation. It downscales images, strips EXIF data, never touches API keys on the client, and includes an explicit, honest Mock Mode for environments without credentials.
3. **Deterministic, Idempotent Points Engine:** Gamification is safeguarded against manipulation via `{event_type}:{source_id}:{user_id}` database-enforced unique constraints, daily point caps, and server-side verification checks.
4. **Bilingual Accessibility:** Complete English and Hindi (Devanagari) localization baked into the design tokens, typography, and schema from day one.
5. **No Borrowed Code:** All schemas, Express services, React components, and styling tokens are original works created specifically for PatchMyCity during Hack Wave.
