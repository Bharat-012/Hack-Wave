# DECISIONS: Architecture & Design Records

Format: Date | Decision | Rationale | Alternatives Rejected

---

## ADR-001: Modular Monolith (Client + Express Server + Supabase DB)
- **Date:** 2026-10-25
- **Decision:** Build a single coherent repository with `client/` and `server/` rather than microservices or serverless functions.
- **Rationale:** Minimizes latency, simplifies local developer environment and hackathon evaluation, avoids cold starts, and keeps state machine and points logic centralized.
- **Alternatives Rejected:**
  - *Serverless micro-functions:* High complexity, cold start latency, difficult transaction guarantees.
  - *Next.js full-stack:* Express provides cleaner separation of concerns, native middleware chains (rate limiting, helmet), and deterministic backend execution.

## ADR-002: "AI Proposes, Backend Decides" Security Boundary
- **Date:** 2026-10-25
- **Decision:** Gemini analysis and quest drafts are treated as unverified advice. The server validates payloads with Zod schemas and executes all state transitions and point awards.
- **Rationale:** Prevents prompt-injection attacks, hallucinated status updates, and automated point abuse.
- **Alternatives Rejected:**
  - *Direct client-to-Gemini SDK calls:* Leaks API keys to the browser, eliminates server verification, and violates security requirements.

## ADR-003: Deterministic Idempotent Points Engine
- **Date:** 2026-10-25
- **Decision:** Enforce idempotency on `point_transactions` using a composite unique constraint `{event_type}:{source_id}:{user_id}` and daily caps.
- **Rationale:** Protects against double-submission, network retries, and gaming of the community reputation score.
- **Alternatives Rejected:**
  - *Client-calculated points:* Trivial to exploit with forged payloads.

## ADR-004: Explicit Mock Mode & Transparency
- **Date:** 2026-10-25
- **Decision:** When `GEMINI_API_KEY` is absent or unconfigured, server returns a curated mock analysis with `source: "mock"`, and UI displays an unambiguous "Demo analysis (not AI)" badge.
- **Rationale:** Adheres strictly to Principle 1 ("Honesty over appearance"). Ensures seamless local evaluation without requiring judge credentials.
- **Alternatives Rejected:**
  - *Failing completely on startup:* Prevents offline review.
  - *Silently returning fake AI output:* Deceptive and violates hackathon rules.
