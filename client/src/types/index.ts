export type ReportCategory =
  | 'roads_potholes'
  | 'streetlights_electricity'
  | 'sanitation_garbage'
  | 'water_drainage'
  | 'parks_public_spaces'
  | 'other';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'in_progress'
  | 'awaiting_resolution_verification'
  | 'resolved'
  | 'reopened'
  | 'rejected';

export interface GeminiAnalysisResult {
  category: ReportCategory;
  description: string;
  visible_evidence: string[];
  suggested_severity: ReportSeverity;
  severity_rationale: string;
  confidence: 'low' | 'medium' | 'high';
  missing_information: string[];
  recommended_next_action: string;
  source: 'gemini' | 'mock';
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  address: string;
  image_url: string;
  ai_analysis?: GeminiAnalysisResult;
  supports_count: number;
  evidence_count: number;
  resolution_type?: 'admin_verified' | 'community_verified' | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportEvent {
  id: string;
  report_id: string;
  actor_id: string;
  actor_name?: string;
  from_status: ReportStatus | null;
  to_status: ReportStatus;
  reason: string;
  created_at: string;
}

export interface ReportEvidence {
  id: string;
  report_id: string;
  user_id: string;
  user_name?: string;
  image_url: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'disputed';
  reviewer_id?: string;
  reviewed_at?: string;
  is_demo: boolean;
  created_at: string;
}

export interface QuestAction {
  action: string;
  safe: boolean;
  note: string;
}

export interface Quest {
  id: string;
  report_id: string;
  title: string;
  objective: string;
  suggested_actions: QuestAction[];
  status: 'active' | 'completed' | 'cancelled';
  target_contributors: number;
  current_contributors: number;
  points_reward: number;
  is_demo: boolean;
  created_at: string;
  completed_at?: string;
  report?: Report;
  members?: QuestMember[];
}

export interface QuestMember {
  id: string;
  quest_id: string;
  user_id: string;
  user_name?: string;
  joined_at: string;
  contributed: boolean;
}

export interface DuplicateCandidate {
  report: Report;
  distanceMeters: number;
  daysDifference: number;
  categoryMatch: boolean;
  score: number;
}

export interface Badge {
  id: string;
  name: string;
  name_hi: string;
  description: string;
  description_hi: string;
  icon_name: string;
  criteria: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: 'citizen' | 'moderator' | 'admin';
  points_total: number;
  is_demo: boolean;
  rank?: number;
  badges?: Badge[];
}

export interface DashboardImpactMetrics {
  metrics: {
    total_reports: { combined: number; live: number; demo: number };
    resolved_reports: { combined: number; live: number; demo: number };
    active_quests: { combined: number; live: number; demo: number };
    community_points: { combined: number };
    active_citizens: number;
  };
  status_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  demo_separation_notice: string;
}
