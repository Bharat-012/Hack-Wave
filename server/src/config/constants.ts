import { ReportStatus } from '../types/index.js';

export const DOMAIN_RULES = {
  // Report state machine allowed transitions (Section 5.1)
  LIFECYCLE_TRANSITIONS: {
    submitted: ['under_review', 'rejected'],
    under_review: ['verified', 'rejected'],
    verified: ['in_progress', 'rejected'],
    in_progress: ['awaiting_resolution_verification'],
    awaiting_resolution_verification: ['resolved', 'reopened'],
    resolved: ['reopened'],
    reopened: ['under_review'],
    rejected: [] as ReportStatus[],
  } as Record<ReportStatus, ReportStatus[]>,

  // Resolution rules
  RESOLUTION: {
    MIN_ACCEPTED_EVIDENCE: 1,
    COMMUNITY_CONFIRMATION_MIN_COUNT: 3, // 3 distinct non-reporter accounts
  },

  // Duplicate detection weights & thresholds (Section 5.2)
  DUPLICATES: {
    MAX_DISTANCE_METERS: 100, // 100 meters
    MAX_AGE_DAYS: 30, // within 30 days
    WEIGHT_DISTANCE: 0.5,
    WEIGHT_TIME: 0.2,
    WEIGHT_CATEGORY: 0.3,
    MATCH_SCORE_THRESHOLD: 0.6, // Score >= 0.6 suggested as duplicate
  },

  // Deterministic points awards (Section 5.3)
  POINTS: {
    REPORT_VERIFIED: 10,
    REPORT_SUPPORTED: 2,
    MAX_DAILY_SUPPORTS: 3, // cap at 3 supports per day (max +6)
    EVIDENCE_ACCEPTED: 15,
    QUEST_COMPLETED: 20,
    DAILY_POINT_CAP: 60, // resists farming
  },

  // Default coordinates (e.g. New Delhi civic center for initial viewport)
  DEFAULT_LOCATION: {
    LATITUDE: 28.6448,
    LONGITUDE: 77.2167,
    CITY: 'New Delhi',
  },
};
