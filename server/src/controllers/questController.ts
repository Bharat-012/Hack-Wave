import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { PointsService } from '../services/pointsService.js';
import { store } from '../services/store.js';
import { Quest, QuestMember } from '../types/index.js';

const joinQuestSchema = z.object({
  user_id: z.string().optional(),
});

const createQuestSchema = z.object({
  report_id: z.string().uuid(),
  title: z.string().min(5),
  objective: z.string().min(10),
  suggested_actions: z.array(
    z.object({
      action: z.string().min(3),
      safe: z.boolean(),
      note: z.string(),
    })
  ),
  target_contributors: z.number().int().min(1).default(3),
  points_reward: z.number().int().min(5).default(20),
});

export class QuestController {
  /**
   * GET /api/v1/quests
   */
  public static async getQuests(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;

      let quests = Array.from(store.quests.values());
      if (status) {
        quests = quests.filter((q) => q.status === status);
      }

      // Enrich with linked report data and member list
      const enriched = quests.map((q) => {
        const report = store.reports.get(q.report_id);
        const members = Array.from(store.questMembers.values()).filter((m) => m.quest_id === q.id);
        return {
          ...q,
          report,
          members,
        };
      });

      res.json({ success: true, count: enriched.length, data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * GET /api/v1/quests/:id
   */
  public static async getQuestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quest = store.quests.get(id);

      if (!quest) {
        res.status(404).json({ success: false, error: { message: 'Quest not found', code: 'NOT_FOUND' } });
        return;
      }

      const report = store.reports.get(quest.report_id);
      const members = Array.from(store.questMembers.values()).filter((m) => m.quest_id === quest.id);

      res.json({
        success: true,
        data: {
          ...quest,
          report,
          members,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * POST /api/v1/quests/:id/join
   */
  public static async joinQuest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = joinQuestSchema.parse(req.body);
      const userId = validated.user_id || 'a0000000-0000-0000-0000-000000000001';

      const quest = store.quests.get(id);
      if (!quest) {
        res.status(404).json({ success: false, error: { message: 'Quest not found', code: 'NOT_FOUND' } });
        return;
      }

      const memberKey = `${id}:${userId}`;
      if (store.questMembers.has(memberKey)) {
        res.status(409).json({ success: false, error: { message: 'You have already joined this quest squad.', code: 'ALREADY_JOINED' } });
        return;
      }

      const user = store.profiles.get(userId) || { id: userId, display_name: 'Squad Volunteer' };

      const newMember: QuestMember = {
        id: uuidv4(),
        quest_id: id,
        user_id: userId,
        user_name: user.display_name,
        joined_at: new Date().toISOString(),
        contributed: false,
      };

      store.questMembers.set(memberKey, newMember);
      quest.current_contributors += 1;

      res.status(201).json({
        success: true,
        data: {
          quest,
          member: newMember,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { message: 'Validation failed', details: err.format(), code: 'VALIDATION_ERROR' } });
        return;
      }
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * POST /api/v1/quests
   */
  public static async createQuest(req: Request, res: Response): Promise<void> {
    try {
      const validated = createQuestSchema.parse(req.body);

      const report = store.reports.get(validated.report_id);
      if (!report) {
        res.status(404).json({ success: false, error: { message: 'Linked report not found', code: 'REPORT_NOT_FOUND' } });
        return;
      }

      const newQuest: Quest = {
        id: uuidv4(),
        report_id: validated.report_id,
        title: validated.title,
        objective: validated.objective,
        suggested_actions: validated.suggested_actions,
        status: 'active',
        target_contributors: validated.target_contributors,
        current_contributors: 0,
        points_reward: validated.points_reward,
        is_demo: false,
        created_at: new Date().toISOString(),
      };

      store.quests.set(newQuest.id, newQuest);

      res.status(201).json({ success: true, data: newQuest });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { message: 'Validation failed', details: err.format(), code: 'VALIDATION_ERROR' } });
        return;
      }
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }
}
