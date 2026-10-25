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
1. **Reporting Flow:** Upload photo -> EXIF stripped -> Gemini analysis -> User edits draft -> Duplicate check -> Submit report -> Visible on map/list.
2. **City Quest Flow:** Verified report unlocks Quest -> Citizens join quest squad -> Complete safety-screened tasks -> Submit photographic evidence.
3. **Verification & Impact Flow:** Community or admin confirms evidence -> Case resolved -> Deterministic points awarded -> Leaderboard & Dashboard updated.

---

## 3. Live Implementation Checklist

### MUST (The Demo Journey; Fully Built & Verified)
- [x] Upload photo, choose location, Gemini analysis (or clearly labeled mock), user edits result, submit `[done and verified]`
- [x] Report saved to database and shown on the map and in list `[done and verified]`
- [x] Duplicate suggestions (rule-based, location + category + time) `[done and verified]`
- [x] Report details page with status history `[done and verified]`
- [x] A quest linked to a report; join it; submit evidence `[done and verified]`
- [x] Backend-controlled verification and deterministic points `[done and verified]`
- [x] Dashboard with real persisted numbers, clearly separating demo data from live data `[done and verified]`
- [x] English/Hindi toggle on the main flow `[done and verified]`
- [x] Demo mode that works without Gemini credentials `[done and verified]`

### SHOULD
- [x] Leaderboard (weekly and all-time) and badges `[done and verified]`
- [x] Moderation dashboard (flags, status correction, audit log) `[done and verified]`
- [x] Full RLS policies with schema DDL `[done and verified]`
- [x] Hindi translation endpoint with a faithful-translation check `[done and verified]`
- [x] Accessible list alternative to the map `[done and verified]`
- [x] Browser subagent end-to-end execution of main journey `[done and verified]`

### COULD
- [ ] Notifications real-time webhooks `[not started]`
- [x] Quest generation polish `[done and verified]`
- [ ] Offline / ServiceWorker PWA caching `[not started]`
- [ ] Image similarity as secondary duplicate vector `[not started]`

---

## 4. Technical Constraints
- Operating System: Windows
- Node.js: v24.19.0
- Relational Database: PostgreSQL with Supabase migrations
- AI Provider: Google Gemini via `@google/generative-ai`
- Frontend: React + Vite + Tailwind CSS + Leaflet
- Backend: Express + TypeScript + Zod
