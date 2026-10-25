# DEPENDENCY MAP: PatchMyCity

Format: Module | Responsibility | API Contracts | DB Dependencies | Downstream Effects | Status

---

| Module | Responsibility | API Contracts | DB Dependencies | Downstream Effects | Status |
|---|---|---|---|---|---|
| `server/src/services/gemini.ts` | Structured vision analysis & quest generation | `analyzeImage`, `translateReport`, `generateQuest` | None (Stateless) | Report draft formulation; Mock fallback | Verified (Spec) |
| `server/src/services/stateMachine.ts` | Enforces report lifecycle rules | `transitionReport(id, toStatus, actor, reason)` | `reports`, `report_events` | Emits audit events; Unlocks quests on 'verified' | Verified (Spec) |
| `server/src/services/pointsService.ts` | Calculates and awards deterministic points | `awardPoints(userId, type, sourceId)` | `point_transactions`, `profiles` | Updates leaderboard; Evaluates badge rules | Verified (Spec) |
| `server/src/services/duplicateService.ts` | Geospatial and multi-factor duplicate scoring | `findDuplicates(lat, lng, category, time)` | `reports` | Informs report creation UI to prevent duplicate filings | Verified (Spec) |
| `server/src/controllers/reportController.ts` | Express handlers for reports and evidence | `POST /api/v1/reports`, `GET /api/v1/reports/:id` | `reports`, `report_evidence`, `report_supports` | Drives Map and Issue Details views | Verified (Spec) |
| `server/src/controllers/questController.ts` | Express handlers for city quests | `GET /api/v1/quests`, `POST /api/v1/quests/:id/join` | `quests`, `quest_members` | Drives Quest Mode exploration and squad joining | Verified (Spec) |
| `client/src/components/Map/CityMap.tsx` | Interactive Leaflet issue & quest map | Props: `reports`, `selectedId`, `onSelect` | None (receives state) | Map pin interaction and viewport filtering | Verified (Spec) |
| `client/src/i18n/` | Internationalization dictionary | `en.json`, `hi.json` | None | Entire UI text rendering in English & Hindi | Verified (Spec) |
