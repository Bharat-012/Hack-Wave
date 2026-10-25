import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  Report,
  ReportEvent,
  ReportEvidence,
  Quest,
  QuestMember,
  PointTransaction,
  Badge,
  UserBadge,
} from '../types/index.js';

class InMemoryStore {
  public profiles: Map<string, UserProfile> = new Map();
  public reports: Map<string, Report> = new Map();
  public reportEvents: ReportEvent[] = [];
  public reportSupports: Map<string, { id: string; report_id: string; user_id: string; created_at: string }> = new Map();
  public reportEvidence: Map<string, ReportEvidence> = new Map();
  public quests: Map<string, Quest> = new Map();
  public questMembers: Map<string, QuestMember> = new Map();
  public pointTransactions: Map<string, PointTransaction> = new Map();
  public badges: Map<string, Badge> = new Map();
  public userBadges: UserBadge[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Badges
    const defaultBadges: Badge[] = [
      {
        id: 'first_verified_report',
        name: 'First Spark',
        name_hi: 'पहली पहल',
        description: 'First submitted report verified by moderators',
        description_hi: 'पहला सबमिट किया गया मुद्दा सत्यापित हुआ',
        icon_name: 'Sparkles',
        criteria: '1 verified report',
      },
      {
        id: 'evidence_hero',
        name: 'Evidence Hero',
        name_hi: 'साक्ष्य नायक',
        description: 'Contributed 3+ accepted photographic evidence updates',
        description_hi: '3 या अधिक स्वीकृत तस्वीरें और अपडेट जमा किए',
        icon_name: 'Camera',
        criteria: '3 accepted evidence submissions',
      },
      {
        id: 'team_player',
        name: 'Quest Squad Member',
        name_hi: 'मिशन साथी',
        description: 'Joined and actively contributed to a City Quest',
        description_hi: 'एक सिटी मिशन में शामिल होकर योगदान दिया',
        icon_name: 'Users',
        criteria: '1 completed quest participation',
      },
      {
        id: 'neighborhood_guardian',
        name: 'Neighborhood Guardian',
        name_hi: 'वार्ड रक्षक',
        description: 'Earned 100+ civic points through verified improvements',
        description_hi: 'सत्यापित सुधारों के माध्यम से 100+ अंक अर्जित किए',
        icon_name: 'ShieldCheck',
        criteria: '100+ verified points',
      },
    ];
    defaultBadges.forEach((b) => this.badges.set(b.id, b));

    // 2. Seed Demo Profiles
    const demoProfiles: UserProfile[] = [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        username: 'aarav_civic',
        display_name: 'Aarav Sharma',
        role: 'citizen',
        points_total: 85,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        username: 'priya_volunteer',
        display_name: 'Priya Patel',
        role: 'citizen',
        points_total: 145,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        username: 'rohan_mod',
        display_name: 'Rohan Verma',
        role: 'moderator',
        points_total: 220,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        username: 'city_admin',
        display_name: 'Civic Admin Council',
        role: 'admin',
        points_total: 500,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    demoProfiles.forEach((p) => this.profiles.set(p.id, p));

    // 3. Seed User Badges
    this.userBadges.push(
      { id: uuidv4(), user_id: 'a0000000-0000-0000-0000-000000000001', badge_id: 'first_verified_report', earned_at: new Date().toISOString(), badge: this.badges.get('first_verified_report') },
      { id: uuidv4(), user_id: 'a0000000-0000-0000-0000-000000000002', badge_id: 'first_verified_report', earned_at: new Date().toISOString(), badge: this.badges.get('first_verified_report') },
      { id: uuidv4(), user_id: 'a0000000-0000-0000-0000-000000000002', badge_id: 'evidence_hero', earned_at: new Date().toISOString(), badge: this.badges.get('evidence_hero') },
      { id: uuidv4(), user_id: 'a0000000-0000-0000-0000-000000000002', badge_id: 'neighborhood_guardian', earned_at: new Date().toISOString(), badge: this.badges.get('neighborhood_guardian') }
    );

    // 4. Seed Demo Reports
    const demoReports: Report[] = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        reporter_id: 'a0000000-0000-0000-0000-000000000001',
        reporter_name: 'Aarav Sharma',
        title: 'Deep Asphalt Pothole near Main Market Crossing',
        description: 'Large pothole expanding rapidly after monsoon showers. Vehicles swerving into oncoming traffic.',
        category: 'roads_potholes',
        severity: 'high',
        status: 'verified',
        latitude: 28.6448,
        longitude: 77.2167,
        address: 'Ajmal Khan Road, Karol Bagh, New Delhi',
        image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        ai_analysis: {
          category: 'roads_potholes',
          description: 'Severely degraded asphalt with visible aggregate breakdown spanning approximately 1.2 meters.',
          visible_evidence: ['loose gravel', 'cracked bitumen edges', 'standing puddle'],
          suggested_severity: 'high',
          severity_rationale: 'Active traffic artery with high hazard index for two-wheelers and braking vehicles.',
          confidence: 'high',
          missing_information: ['sub-base water saturation depth'],
          recommended_next_action: 'Deploy cold-mix asphalt patch team; erect temporary hazard pylon.',
          source: 'gemini',
        },
        supports_count: 14,
        evidence_count: 2,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        reporter_id: 'a0000000-0000-0000-0000-000000000002',
        reporter_name: 'Priya Patel',
        title: 'Broken Streetlight Fixture Dangling near School Gate',
        description: 'Luminaire housing is detached from bracket and dangling by wiring, posing an immediate electrical and impact hazard.',
        category: 'streetlights_electricity',
        severity: 'critical',
        status: 'in_progress',
        latitude: 28.6505,
        longitude: 77.2212,
        address: 'Near Government Boys Senior Secondary School, Jhandewalan, New Delhi',
        image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
        ai_analysis: {
          category: 'streetlights_electricity',
          description: 'Overhead street luminaire separated from mount, suspended solely by electrical cable.',
          visible_evidence: ['hanging fixture', 'exposed conduit', 'pedestrian sidewalk proximity'],
          suggested_severity: 'critical',
          severity_rationale: 'High foot-traffic school zone with danger of fixture detachment or electrocution.',
          confidence: 'high',
          missing_information: ['live voltage status'],
          recommended_next_action: 'Isolate electrical feed and dispatch emergency bucket truck.',
          source: 'gemini',
        },
        supports_count: 26,
        evidence_count: 1,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        reporter_id: 'a0000000-0000-0000-0000-000000000001',
        reporter_name: 'Aarav Sharma',
        title: 'Overflowing Dumpster and Plastic Waste Accumulation',
        description: 'Public municipal bin has not been cleared for over 4 days, resulting in waste scattering onto the pedestrian footpath.',
        category: 'sanitation_garbage',
        severity: 'medium',
        status: 'awaiting_resolution_verification',
        latitude: 28.6389,
        longitude: 77.2111,
        address: 'Pusa Road Junction, New Delhi',
        image_url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
        ai_analysis: {
          category: 'sanitation_garbage',
          description: 'Commercial refuse bin overflowing onto pedestrian right-of-way.',
          visible_evidence: ['scattered plastic bags', 'uncontained organic waste', 'sidewalk obstruction'],
          suggested_severity: 'medium',
          severity_rationale: 'Public health concern and pedestrian obstruction, but no immediate structural collapse risk.',
          confidence: 'high',
          missing_information: ['scheduled municipal pickup timing'],
          recommended_next_action: 'Dispatch compactor truck and sanitize pavement surface.',
          source: 'gemini',
        },
        supports_count: 8,
        evidence_count: 3,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    demoReports.forEach((r) => this.reports.set(r.id, r));

    // 5. Seed Demo Report Events (Audit Trail)
    this.reportEvents.push(
      {
        id: uuidv4(),
        report_id: 'b0000000-0000-0000-0000-000000000001',
        actor_id: 'a0000000-0000-0000-0000-000000000001',
        actor_name: 'Aarav Sharma',
        from_status: null,
        to_status: 'submitted',
        reason: 'Citizen filed initial photographic report',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: uuidv4(),
        report_id: 'b0000000-0000-0000-0000-000000000001',
        actor_id: 'a0000000-0000-0000-0000-000000000003',
        actor_name: 'Rohan Verma',
        from_status: 'submitted',
        to_status: 'verified',
        reason: 'Moderator verified location coordinates and severe traffic risk',
        created_at: new Date(Date.now() - 86400000 * 2.8).toISOString(),
      },
      {
        id: uuidv4(),
        report_id: 'b0000000-0000-0000-0000-000000000002',
        actor_id: 'a0000000-0000-0000-0000-000000000002',
        actor_name: 'Priya Patel',
        from_status: null,
        to_status: 'submitted',
        reason: 'Citizen filed electrical hazard report',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: uuidv4(),
        report_id: 'b0000000-0000-0000-0000-000000000002',
        actor_id: 'a0000000-0000-0000-0000-000000000003',
        actor_name: 'Rohan Verma',
        from_status: 'submitted',
        to_status: 'verified',
        reason: 'Fast-tracked due to critical school zone risk',
        created_at: new Date(Date.now() - 86400000 * 1.9).toISOString(),
      },
      {
        id: uuidv4(),
        report_id: 'b0000000-0000-0000-0000-000000000002',
        actor_id: 'a0000000-0000-0000-0000-000000000004',
        actor_name: 'Civic Admin Council',
        from_status: 'verified',
        to_status: 'in_progress',
        reason: 'Municipal electrical division dispatched crew',
        created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      }
    );

    // 6. Seed Demo Quests
    const demoQuests: Quest[] = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        report_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Mission: Karol Bagh Pothole Evidence Patrol',
        objective: 'Rally nearby residents to safely photograph repair progress and confirm municipal asphalt patch completion.',
        suggested_actions: [
          { action: 'Check repair perimeter', safe: true, note: 'Stand on pedestrian walkway only; do not step into traffic.' },
          { action: 'Submit after-fix photo', safe: true, note: 'Capture asphalt patch when road crew finishes.' },
        ],
        status: 'active',
        target_contributors: 3,
        current_contributors: 2,
        points_reward: 20,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 2.8).toISOString(),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        report_id: 'b0000000-0000-0000-0000-000000000003',
        title: 'Mission: Pusa Road Clean Footpath Verification',
        objective: 'Verify waste clearance and document that the pedestrian pathway is clear and accessible.',
        suggested_actions: [
          { action: 'Document bin clearance', safe: true, note: 'Take daytime photo showing cleared bin and sidewalk.' },
          { action: 'Check drainage grill', safe: true, note: 'Ensure storm runoff drain next to bin is unobstructed.' },
        ],
        status: 'active',
        target_contributors: 3,
        current_contributors: 3,
        points_reward: 20,
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 3.5).toISOString(),
      },
    ];
    demoQuests.forEach((q) => this.quests.set(q.id, q));

    // 7. Seed Demo Quest Members
    this.questMembers.set('c1:u1', { id: uuidv4(), quest_id: 'c0000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000001', user_name: 'Aarav Sharma', joined_at: new Date().toISOString(), contributed: true });
    this.questMembers.set('c1:u2', { id: uuidv4(), quest_id: 'c0000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000002', user_name: 'Priya Patel', joined_at: new Date().toISOString(), contributed: false });

    // 8. Seed Demo Evidence
    const demoEvidence: ReportEvidence[] = [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        report_id: 'b0000000-0000-0000-0000-000000000001',
        user_id: 'a0000000-0000-0000-0000-000000000002',
        user_name: 'Priya Patel',
        image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        notes: 'Municipal asphalt crew has arrived on site with steam roller and gravel bags.',
        status: 'accepted',
        reviewer_id: 'a0000000-0000-0000-0000-000000000003',
        reviewed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        is_demo: true,
        created_at: new Date(Date.now() - 86400000 * 1.2).toISOString(),
      },
    ];
    demoEvidence.forEach((e) => this.reportEvidence.set(e.id, e));

    // 9. Seed Demo Point Transactions
    const demoPoints: PointTransaction[] = [
      {
        id: uuidv4(),
        user_id: 'a0000000-0000-0000-0000-000000000001',
        points: 10,
        event_type: 'report_verified',
        source_id: 'b0000000-0000-0000-0000-000000000001',
        idempotency_key: 'report_verified:b0000000-0000-0000-0000-000000000001:a0000000-0000-0000-0000-000000000001',
        created_at: new Date(Date.now() - 86400000 * 2.8).toISOString(),
      },
      {
        id: uuidv4(),
        user_id: 'a0000000-0000-0000-0000-000000000002',
        points: 10,
        event_type: 'report_verified',
        source_id: 'b0000000-0000-0000-0000-000000000002',
        idempotency_key: 'report_verified:b0000000-0000-0000-0000-000000000002:a0000000-0000-0000-0000-000000000002',
        created_at: new Date(Date.now() - 86400000 * 1.9).toISOString(),
      },
      {
        id: uuidv4(),
        user_id: 'a0000000-0000-0000-0000-000000000002',
        points: 15,
        event_type: 'evidence_accepted',
        source_id: 'b0000000-0000-0000-0000-000000000001',
        idempotency_key: 'evidence_accepted:b0000000-0000-0000-0000-000000000001:a0000000-0000-0000-0000-000000000002',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];
    demoPoints.forEach((p) => this.pointTransactions.set(p.idempotency_key, p));
  }
}

export const store = new InMemoryStore();
