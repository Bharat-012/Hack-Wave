import { DOMAIN_RULES } from '../config/constants.js';
import { DuplicateCandidate, Report, ReportCategory } from '../types/index.js';
import { store } from './store.js';

export class DuplicateService {
  /**
   * Calculate great-circle distance between two coordinates in meters (Haversine formula)
   */
  public static haversineDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Find candidate duplicate reports within 100m and 30 days, ranked by weighted score
   */
  public static findDuplicates(
    latitude: number,
    longitude: number,
    category: ReportCategory,
    excludeReportId?: string
  ): DuplicateCandidate[] {
    const now = Date.now();
    const candidates: DuplicateCandidate[] = [];

    for (const report of store.reports.values()) {
      if (excludeReportId && report.id === excludeReportId) continue;
      if (report.status === 'rejected') continue; // Don't match rejected reports

      const distance = this.haversineDistanceMeters(
        latitude,
        longitude,
        report.latitude,
        report.longitude
      );

      // Distance screening: within MAX_DISTANCE_METERS (100m)
      if (distance > DOMAIN_RULES.DUPLICATES.MAX_DISTANCE_METERS) {
        continue;
      }

      // Age screening: within MAX_AGE_DAYS (30 days)
      const reportAgeDays = (now - new Date(report.created_at).getTime()) / (1000 * 3600 * 24);
      if (reportAgeDays > DOMAIN_RULES.DUPLICATES.MAX_AGE_DAYS) {
        continue;
      }

      // Multi-factor weighted score calculation
      // 1. Distance score (1.0 at 0m, 0.0 at 100m)
      const distanceScore = Math.max(0, 1 - distance / DOMAIN_RULES.DUPLICATES.MAX_DISTANCE_METERS);

      // 2. Time score (1.0 at 0 days, 0.0 at 30 days)
      const timeScore = Math.max(0, 1 - reportAgeDays / DOMAIN_RULES.DUPLICATES.MAX_AGE_DAYS);

      // 3. Category match (1.0 if identical, 0.5 if same family, 0.0 otherwise)
      const categoryMatch = report.category === category;
      const categoryScore = categoryMatch ? 1.0 : 0.0;

      const totalScore =
        distanceScore * DOMAIN_RULES.DUPLICATES.WEIGHT_DISTANCE +
        timeScore * DOMAIN_RULES.DUPLICATES.WEIGHT_TIME +
        categoryScore * DOMAIN_RULES.DUPLICATES.WEIGHT_CATEGORY;

      if (totalScore >= DOMAIN_RULES.DUPLICATES.MATCH_SCORE_THRESHOLD) {
        candidates.push({
          report,
          distanceMeters: distance,
          daysDifference: Math.round(reportAgeDays),
          categoryMatch,
          score: Math.round(totalScore * 100) / 100,
        });
      }
    }

    // Rank highest score first
    return candidates.sort((a, b) => b.score - a.score);
  }
}
