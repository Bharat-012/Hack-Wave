# PROJECT CONTEXT: PatchMyCity

**Tagline:** Report a problem. Rally your neighborhood. Make change visible.  
**One-line pitch:** Gemini turns a photo into a structured civic report, then verified problems become **City Quests**: community missions where neighbors contribute evidence, and real, verified improvement is tracked.

---

## 1. Target Audience & Roles
- **Resident / Citizen:** Reports infrastructure issues with photos and notes; reviews nearby duplicate candidates; joins quests; submits evidence.
- **Neighborhood Volunteer / Quest Champion:** Organizes or participates in community evidence gathering and cleanup drives.
- **Moderator / Administrator:** Reviews flags, verifies resolution evidence, and enforces community integrity.
- **Hackathon Judges:** Evaluates live demo journey, architecture, honest AI bounds, and test coverage.

---

## 2. Core Workflows
1. **Reporting Flow:** Upload photo -> Exif stripped -> Gemini analysis -> User edits draft -> Duplicate check -> Submit report -> Visible on map/list.
2. **City Quest Flow:** Verified report unlocks Quest -> Citizens join quest squad -> Complete safety-screened tasks -> Submit photographic evidence.
3. **Verification & Impact Flow:** Community or admin confirms evidence -> Case resolved -> Deterministic points awarded -> Leaderboard & Dashboard updated.

---

## 3. Live Implementation Checklist

### MUST (Demo Journey & Core Requirements)
- [ ] Upload photo, choose location, Gemini analysis (or clearly labeled mock), user edits result, submit `[not started]`
- [ ] Report saved to database and shown on the map and in list `[not started]`
- [ ] Duplicate suggestions (rule-based, location + category + time) `[not started]`
- [ ] Report details page with status history `[not started]`
- [ ] A quest linked to a report; join it; submit evidence `[not started]`
- [ ] Backend-controlled verification and deterministic points `[not started]`
- [ ] Dashboard with real persisted numbers, clearly separating demo data from live data `[not started]`
- [ ] English/Hindi toggle on the main flow `[not started]`
- [ ] Demo mode that works without Gemini credentials `[not started]`

### SHOULD
- [ ] Leaderboard (weekly and all-time) and badges `[not started]`
- [ ] Moderation dashboard (flags, status correction, audit log) `[not started]`
- [ ] Full RLS policies with tests `[not started]`
- [ ] Hindi translation endpoint with a faithful-translation check `[not started]`
- [ ] Accessible list alternative to the map `[not started]`
- [ ] Playwright / E2E test of the main journey `[not started]`

### COULD
- [ ] Notifications system `[not started]`
- [ ] Quest generation polish `[not started]`
- [ ] Offline / PWA behavior `[not started]`
- [ ] Image similarity as a secondary duplicate signal `[not started]`

---

## 4. Technical Constraints
- Operating System: Windows
- Node.js: v24.19.0
- Relational Database: PostgreSQL with Supabase
- AI Provider: Google Gemini via `@google/genai` or `@google/generative-ai`
- Frontend: React + Vite + Tailwind CSS + Leaflet
- Backend: Express + TypeScript + Zod
