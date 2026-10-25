import { Request, Response } from 'express';
import { store } from '../services/store.js';

export class DashboardController {
  /**
   * GET /api/v1/dashboard/impact
   */
  public static async getImpactMetrics(req: Request, res: Response): Promise<void> {
    try {
      const allReports = Array.from(store.reports.values());
      const liveReports = allReports.filter((r) => !r.is_demo);
      const demoReports = allReports.filter((r) => r.is_demo);

      const allQuests = Array.from(store.quests.values());
      const activeQuests = allQuests.filter((q) => q.status === 'active');

      const allPoints = Array.from(store.pointTransactions.values());
      const totalPointsAwarded = allPoints.reduce((sum, tx) => sum + (tx.points > 0 ? tx.points : 0), 0);

      // Status breakdown
      const statusCounts = {
        submitted: allReports.filter((r) => r.status === 'submitted').length,
        verified: allReports.filter((r) => r.status === 'verified').length,
        in_progress: allReports.filter((r) => r.status === 'in_progress').length,
        awaiting_resolution_verification: allReports.filter((r) => r.status === 'awaiting_resolution_verification').length,
        resolved: allReports.filter((r) => r.status === 'resolved').length,
        rejected: allReports.filter((r) => r.status === 'rejected').length,
      };

      // Category breakdown
      const categoryCounts: Record<string, number> = {};
      allReports.forEach((r) => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          metrics: {
            total_reports: {
              combined: allReports.length,
              live: liveReports.length,
              demo: demoReports.length,
            },
            resolved_reports: {
              combined: statusCounts.resolved,
              live: liveReports.filter((r) => r.status === 'resolved').length,
              demo: demoReports.filter((r) => r.status === 'resolved').length,
            },
            active_quests: {
              combined: activeQuests.length,
              live: activeQuests.filter((q) => !q.is_demo).length,
              demo: activeQuests.filter((q) => q.is_demo).length,
            },
            community_points: {
              combined: totalPointsAwarded,
            },
            active_citizens: store.profiles.size,
          },
          status_breakdown: statusCounts,
          category_breakdown: categoryCounts,
          demo_separation_notice: 'Metrics clearly separate live community submissions from pre-seeded demo records via is_demo flag.',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }
}
