-- PatchMyCity Initial Migration
-- Supabase PostgreSQL Schema with RLS and Audit Triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'moderator', 'admin')),
    points_total INTEGER NOT NULL DEFAULT 0 CHECK (points_total >= 0),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles (points_total DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_demo ON profiles (is_demo);

-- 2. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'roads_potholes',
        'streetlights_electricity',
        'sanitation_garbage',
        'water_drainage',
        'parks_public_spaces',
        'other'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted',
        'under_review',
        'verified',
        'in_progress',
        'awaiting_resolution_verification',
        'resolved',
        'reopened',
        'rejected'
    )),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    image_url TEXT NOT NULL,
    ai_analysis JSONB,
    supports_count INTEGER NOT NULL DEFAULT 0,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    resolution_type TEXT CHECK (resolution_type IN ('admin_verified', 'community_verified', NULL)),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Geospatial and status query indexes
CREATE INDEX IF NOT EXISTS idx_reports_lat_lng ON reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_demo ON reports (is_demo);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);

-- 3. REPORT EVENTS (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS report_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_events_report ON report_events (report_id, created_at ASC);

-- 4. REPORT SUPPORTS (Endorsements / "Back It")
CREATE TABLE IF NOT EXISTS report_supports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_report_user_support UNIQUE (report_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_report_supports_user ON report_supports (user_id, created_at DESC);

-- 5. REPORT EVIDENCE (Photos & Observations Submitted Towards Resolution)
CREATE TABLE IF NOT EXISTS report_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'disputed')),
    reviewer_id UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_evidence_report ON report_evidence (report_id);
CREATE INDEX IF NOT EXISTS idx_report_evidence_user ON report_evidence (user_id);

-- 6. QUESTS TABLE (City Quests for Verified Problems)
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    suggested_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    target_contributors INTEGER NOT NULL DEFAULT 3,
    current_contributors INTEGER NOT NULL DEFAULT 0,
    points_reward INTEGER NOT NULL DEFAULT 20,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quests_report ON quests (report_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests (status);

-- 7. QUEST MEMBERS
CREATE TABLE IF NOT EXISTS quest_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contributed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_quest_user UNIQUE (quest_id, user_id)
);

-- 8. POINT TRANSACTIONS (Deterministic & Idempotent)
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'report_verified',
        'report_supported',
        'evidence_accepted',
        'quest_completed',
        'moderation_penalty'
    )),
    source_id UUID NOT NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_date ON point_transactions (user_id, created_at DESC);

-- 9. BADGES & USER BADGES
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_hi TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    criteria TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

-- 10. MODERATION FLAGS
CREATE TABLE IF NOT EXISTS moderation_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('report', 'evidence')),
    target_id UUID NOT NULL,
    flagged_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'fake_photo', 'inappropriate', 'unsafe', 'duplicate', 'other')),
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'upheld', 'dismissed')),
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies for open civic data
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public reports are viewable by everyone" ON reports FOR SELECT USING (true);
CREATE POLICY "Report audit events are viewable by everyone" ON report_events FOR SELECT USING (true);
CREATE POLICY "Report supports are viewable by everyone" ON report_supports FOR SELECT USING (true);
CREATE POLICY "Report evidence is viewable by everyone" ON report_evidence FOR SELECT USING (true);
CREATE POLICY "Quests are viewable by everyone" ON quests FOR SELECT USING (true);
CREATE POLICY "Quest members are viewable by everyone" ON quest_members FOR SELECT USING (true);
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- User-scoped access for sensitive records
CREATE POLICY "Users can view their own point transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
