# CHANGELOG: PatchMyCity

All notable changes to this project will be documented in this file.
Format follows Keep a Changelog (Added, Changed, Fixed, Security).

---

## [1.0.0] - 2026-10-25

### Added
- **Full-Stack Architecture:**
  - Single coherent repository with `server/` (Express, TypeScript, Zod, Helmet, Rate Limiter) and `client/` (React, Vite, TypeScript, Tailwind CSS, Leaflet).
  - Versioned PostgreSQL schema migrations (`supabase/migrations/`) with Row Level Security (RLS) policies and seed data (`is_demo = TRUE`).
- **Google Gemini 2.5 Flash Vision Integration:**
  - Dedicated backend service `server/src/services/gemini.ts` using official `@google/generative-ai` SDK.
  - Zod structured output validation for image diagnostics, translation, and quest generation.
  - Prompt-injection sanitization and transparent Mock Mode fallback when API credentials are absent.
- **Enforced Lifecycle State Machine:**
  - Strict server-side state transitions following Section 5.1 domain rules.
  - Immutable append-only audit trail (`report_events`) tracking actor, from_status, to_status, and justification.
  - Verification requirements: minimum accepted evidence and admin or community confirmations.
- **Geospatial & Weighted Duplicate Radar:**
  - Haversine distance screening (max 100 meters, within 30 days).
  - Multi-factor scoring (distance 0.5, category 0.3, time 0.2) with 0.6 threshold preventing duplicate clutter.
- **Deterministic Points & Badges Engine:**
  - Unique composite idempotency key `{event_type}:{source_id}:{user_id}` on all point transactions.
  - Daily point caps preventing farming.
  - Rule-based badges: First Spark, Evidence Hero, Quest Squad Member, Neighborhood Guardian.
- **City Quest Mode (Signature Innovation):**
  - Verified issues unlock collaborative neighborhood missions.
  - Safety screening prohibiting hazardous manual repair instructions.
  - Squad enlistment and photographic evidence submissions.
- **Bilingual & Accessible UI:**
  - Seamless English and Hindi (Devanagari) internationalization (`en.json`, `hi.json`).
  - Accessible list alternative to the interactive map (`ReportListView`).
  - WCAG AA high-contrast design system.
- **End-to-End Verification:**
  - Vitest test suite with 14 passing unit and integration tests across state machine, points idempotency, duplicate radar, and API routes.
  - Automated browser subagent recording full demo journey (`full_demo_journey_1792913788766.webp`).
