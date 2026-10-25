-- PatchMyCity Demo Seed Data
-- Clearly labeled with is_demo = TRUE to maintain separation from live submissions

-- 1. SEED BADGES
INSERT INTO badges (id, name, name_hi, description, description_hi, icon_name, criteria) VALUES
('first_verified_report', 'First Spark', 'पहली पहल', 'First submitted report verified by moderators', 'पहला सबमिट किया गया मुद्दा सत्यापित हुआ', 'Sparkles', '1 verified report'),
('evidence_hero', 'Evidence Hero', 'साक्ष्य नायक', 'Contributed 3+ accepted photographic evidence updates', '3 या अधिक स्वीकृत तस्वीरें और अपडेट जमा किए', 'Camera', '3 accepted evidence submissions'),
('team_player', 'Quest Squad Member', 'मिशन साथी', 'Joined and actively contributed to a City Quest', 'एक सिटी मिशन में शामिल होकर योगदान दिया', 'Users', '1 completed quest participation'),
('neighborhood_guardian', 'Neighborhood Guardian', 'वार्ड रक्षक', 'Earned 100+ civic points through verified improvements', 'सत्यापित सुधारों के माध्यम से 100+ अंक अर्जित किए', 'ShieldCheck', '100+ verified points')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED DEMO PROFILES
INSERT INTO profiles (id, username, display_name, role, points_total, is_demo) VALUES
('a0000000-0000-0000-0000-000000000001', 'aarav_civic', 'Aarav Sharma', 'citizen', 85, TRUE),
('a0000000-0000-0000-0000-000000000002', 'priya_volunteer', 'Priya Patel', 'citizen', 145, TRUE),
('a0000000-0000-0000-0000-000000000003', 'rohan_mod', 'Rohan Verma', 'moderator', 220, TRUE),
('a0000000-0000-0000-0000-000000000004', 'city_admin', 'Civic Admin Council', 'admin', 500, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED USER BADGES
INSERT INTO user_badges (user_id, badge_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'first_verified_report'),
('a0000000-0000-0000-0000-000000000002', 'first_verified_report'),
('a0000000-0000-0000-0000-000000000002', 'evidence_hero'),
('a0000000-0000-0000-0000-000000000002', 'neighborhood_guardian')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 4. SEED DEMO REPORTS (Centered around Bhopal civic coords)
INSERT INTO reports (
    id, reporter_id, title, description, category, severity, status,
    latitude, longitude, address, image_url, ai_analysis, supports_count, evidence_count, is_demo
) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Deep Asphalt Pothole near MP Nagar Crossing',
    'Large pothole expanding rapidly after monsoon showers. Vehicles swerving into oncoming traffic.',
    'roads_potholes',
    'high',
    'verified',
    23.2325,
    77.4330,
    'Zone-1 Commercial Area, near DB Mall & Chetak Bridge, MP Nagar, Bhopal',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    '{"category": "roads_potholes", "description": "Severely degraded asphalt with visible aggregate breakdown spanning approximately 1.2 meters.", "visible_evidence": ["loose gravel", "cracked bitumen edges", "standing puddle"], "suggested_severity": "high", "confidence": "high", "missing_information": ["sub-base water saturation depth"]}'::jsonb,
    14,
    2,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'Broken Streetlight Fixture Dangling near VIP Road Promenade',
    'Luminaire housing is detached from bracket and dangling by wiring, posing an immediate electrical and impact hazard.',
    'streetlights_electricity',
    'critical',
    'in_progress',
    23.2540,
    77.3955,
    'VIP Road at Kamla Park Lake View Curve, Bhopal',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    '{"category": "streetlights_electricity", "description": "Overhead street luminaire separated from mount, suspended solely by electrical cable.", "visible_evidence": ["hanging fixture", "exposed conduit", "pedestrian sidewalk proximity"], "suggested_severity": "critical", "confidence": "high", "missing_information": ["live voltage status"]}'::jsonb,
    26,
    1,
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Overflowing Dumpster and Plastic Waste Accumulation near New Market',
    'Public municipal bin has not been cleared for over 4 days, resulting in waste scattering onto the pedestrian footpath.',
    'sanitation_garbage',
    'medium',
    'awaiting_resolution_verification',
    23.2355,
    77.4015,
    'Malviya Nagar Road, near New Market & TT Nagar Stadium, Bhopal',
    'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
    '{"category": "sanitation_garbage", "description": "Commercial refuse bin overflowing onto pedestrian right-of-way.", "visible_evidence": ["scattered plastic bags", "uncontained organic waste", "sidewalk obstruction"], "suggested_severity": "medium", "confidence": "high", "missing_information": ["scheduled municipal pickup timing"]}'::jsonb,
    8,
    3,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED REPORT EVENTS (Audit Trail)
INSERT INTO report_events (report_id, actor_id, from_status, to_status, reason) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, 'submitted', 'Citizen filed initial photographic report'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'submitted', 'verified', 'Moderator verified location coordinates and severe traffic risk'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', NULL, 'submitted', 'Citizen filed electrical hazard report'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'submitted', 'verified', 'Fast-tracked due to critical school zone risk'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'verified', 'in_progress', 'Municipal electrical division dispatched crew');

-- 6. SEED DEMO QUESTS
INSERT INTO quests (
    id, report_id, title, objective, suggested_actions, status,
    target_contributors, current_contributors, points_reward, is_demo
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Mission: MP Nagar Pothole Evidence Patrol',
    'Rally nearby residents to safely photograph repair progress and confirm municipal asphalt patch completion.',
    '[{"action": "Check repair perimeter", "safe": true, "note": "Stand on pedestrian walkway only; do not step into traffic."}, {"action": "Submit after-fix photo", "safe": true, "note": "Capture asphalt patch when road crew finishes."}]'::jsonb,
    'active',
    3,
    2,
    20,
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'Mission: New Market Clean Footpath Verification',
    'Verify waste clearance and document that the pedestrian pathway is clear and accessible.',
    '[{"action": "Document bin clearance", "safe": true, "note": "Take daytime photo showing cleared bin and sidewalk."}, {"action": "Check drainage grill", "safe": true, "note": "Ensure storm runoff drain next to bin is unobstructed."}]'::jsonb,
    'active',
    3,
    3,
    20,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED QUEST MEMBERS
INSERT INTO quest_members (quest_id, user_id, contributed) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', TRUE),
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', FALSE),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', TRUE),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', TRUE)
ON CONFLICT (quest_id, user_id) DO NOTHING;

-- 8. SEED DETERMINISTIC POINT TRANSACTIONS
INSERT INTO point_transactions (user_id, points, event_type, source_id, idempotency_key) VALUES
('a0000000-0000-0000-0000-000000000001', 10, 'report_verified', 'b0000000-0000-0000-0000-000000000001', 'report_verified:b0000000-0000-0000-0000-000000000001:a0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000002', 10, 'report_verified', 'b0000000-0000-0000-0000-000000000002', 'report_verified:b0000000-0000-0000-0000-000000000002:a0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000002', 15, 'evidence_accepted', 'b0000000-0000-0000-0000-000000000003', 'evidence_accepted:b0000000-0000-0000-0000-000000000003:a0000000-0000-0000-0000-000000000002')
ON CONFLICT (idempotency_key) DO NOTHING;
