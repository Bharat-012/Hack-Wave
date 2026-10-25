import { Request, Response } from 'express';
import { store } from '../services/store.js';

export class LeaderboardController {
  /**
   * GET /api/v1/leaderboard
   */
  public static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const profiles = Array.from(store.profiles.values());

      // Sort by points descending
      profiles.sort((a, b) => b.points_total - a.points_total);

      const enriched = profiles.map((p, index) => {
        const badges = store.userBadges
          .filter((ub) => ub.user_id === p.id)
          .map((ub) => ub.badge || store.badges.get(ub.badge_id))
          .filter(Boolean);

        return {
          rank: index + 1,
          ...p,
          badges,
        };
      });

      res.json({
        success: true,
        count: enriched.length,
        data: enriched,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * GET /api/v1/badges
   */
  public static async getBadges(req: Request, res: Response): Promise<void> {
    try {
      const badges = Array.from(store.badges.values());
      res.json({
        success: true,
        count: badges.length,
        data: badges,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }
}
