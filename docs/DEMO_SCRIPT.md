# DEMO SCRIPT: PatchMyCity (3–5 Minute Judge Walkthrough)

**Audience:** Hack Wave Hackathon Judges  
**Core Thesis:** "AI proposes, the backend decides. Verified civic problems become City Quests."

---

## 0. Preparation & Fallback Plan
- Ensure backend (`npm run dev` in `server/`) and frontend (`npm run dev` in `client/`) are running.
- Ensure seeded demo data is loaded (`npm run seed` or built-in demo fixtures).
- **Fallback Rule:** If internet or Gemini API is slow or unavailable, demo mode activates instantly with clear label: `Demo analysis (not AI)`. The entire flow continues without disruption.

---

## 1. Walkthrough Timeline (Total: 4 Minutes)

### Minute 0:00 - 0:45: The Problem & The Shift in Tone
- **Action:** Open PatchMyCity landing page in browser (`http://localhost:5173`).
- **Narration:**
  > "Most civic tech apps look like bureaucratic grievance portals where citizen complaints disappear into a void. PatchMyCity flips the script: we turn neighborhood complaints into collaborative **City Quests**, where neighbors rally, gather evidence, and verify real impact."
- **Key Visuals:** Warm, modern design system, live community impact metrics, and quick toggle between **English** and **Hindi (हिंदी)**.

### Minute 0:45 - 1:45: Live Report Flow with Honest Gemini Integration
- **Action:**
  1. Click **"Report an Issue"** (or use the Hindi interface: "समस्या दर्ज करें").
  2. Upload a sample photo (e.g., broken streetlight or pothole).
  3. Gemini Vision processes the image server-side and extracts:
     - Category (Roads & Sidewalks / Sanitation / Lighting)
     - Severity rating with evidence-based rationale
     - Visible evidence items vs. missing information
  4. Point out the **editable AI fields**:
     > "Notice that AI only proposes. The citizen retains control, can edit any field, and sees the confidence rating."
  5. Demonstrate **Duplicate Suggestion Radar**:
     > "Before submitting, our backend runs a multi-factor check (distance < 100m, category, and recency) to prevent duplicate spam."
  6. Click **Submit Report**.

### Minute 1:45 - 2:30: Interactive Map & Report Details
- **Action:**
  1. Show the newly created report appearing in real-time on the **City Map** and in the accessible **List Alternative**.
  2. Click into the Report Details page.
  3. Highlight the **immutable status audit trail** (`report_events`).
     > "Every status change is verified by the backend. The frontend cannot arbitrarily advance state or fabricate points."

### Minute 2:30 - 3:30: Signature Feature — City Quest Mode
- **Action:**
  1. Navigate to **"City Quests"**.
  2. Show the Quest unlocked by the verified report (e.g., *"Mission: Pothole Patch Verification Squad"*).
  3. Join the quest with one click.
  4. Submit evidence (photo after fix or corroborating photo).
  5. Show **safety screening**: Quest actions are carefully checked to never instruct citizens to fix hazardous infrastructure directly.
  6. Trigger verification: Show the case transitioning to `resolved` and points being awarded.

### Minute 3:30 - 4:00: Impact Dashboard & Leaderboard
- **Action:**
  1. Open the **Community Impact Dashboard**.
  2. Show real computed statistics from PostgreSQL (active quests, resolved issues, community points).
  3. Point out the clear separation: **Demo data is labeled `[Demo]`**, separating mock data from real submissions.
  4. Show the **Leaderboard** and deterministic points with idempotency keys.
- **Closing Statement:**
  > "PatchMyCity makes civic participation collaborative, transparent, and trustworthy. Powered by Gemini, governed by code."
