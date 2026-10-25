import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { DuplicateService } from '../services/duplicateService.js';
import { PointsService } from '../services/pointsService.js';
import { StateMachine } from '../services/stateMachine.js';
import { store } from '../services/store.js';
import { Report, ReportCategory, ReportSeverity, ReportStatus } from '../types/index.js';

// Schemas
const createReportSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  category: z.enum([
    'roads_potholes',
    'streetlights_electricity',
    'sanitation_garbage',
    'water_drainage',
    'parks_public_spaces',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3),
  image_url: z.string().min(5),
  ai_analysis: z.any().optional(),
  reporter_id: z.string().optional(),
});

const transitionSchema = z.object({
  to_status: z.enum([
    'submitted',
    'under_review',
    'verified',
    'in_progress',
    'awaiting_resolution_verification',
    'resolved',
    'reopened',
    'rejected',
  ]),
  reason: z.string().min(3),
  resolution_type: z.enum(['admin_verified', 'community_verified']).optional(),
  actor_id: z.string().optional(),
});

const evidenceSchema = z.object({
  image_url: z.string().min(5),
  notes: z.string().optional(),
  user_id: z.string().optional(),
});

export class ReportController {
  /**
   * GET /api/v1/reports
   */
  public static async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { status, category, is_demo } = req.query;

      let reports = Array.from(store.reports.values());

      if (status) {
        reports = reports.filter((r) => r.status === status);
      }
      if (category) {
        reports = reports.filter((r) => r.category === category);
      }
      if (is_demo !== undefined) {
        const isDemoBool = is_demo === 'true';
        reports = reports.filter((r) => r.is_demo === isDemoBool);
      }

      // Sort newest first
      reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json({ success: true, count: reports.length, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * GET /api/v1/reports/:id
   */
  public static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = store.reports.get(id);

      if (!report) {
        res.status(404).json({ success: false, error: { message: 'Report not found', code: 'NOT_FOUND' } });
        return;
      }

      const events = store.reportEvents
        .filter((e) => e.report_id === id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const evidence = Array.from(store.reportEvidence.values())
        .filter((e) => e.report_id === id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Also check if any duplicate candidates exist nearby
      const duplicates = DuplicateService.findDuplicates(
        report.latitude,
        report.longitude,
        report.category,
        report.id
      );

      res.json({
        success: true,
        data: {
          ...report,
          events,
          evidence,
          duplicates,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * POST /api/v1/reports/check-duplicates
   */
  public static async checkDuplicates(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, category, exclude_id } = req.body;
      if (latitude === undefined || longitude === undefined || !category) {
        res.status(400).json({ success: false, error: { message: 'Missing latitude, longitude, or category', code: 'BAD_REQUEST' } });
        return;
      }

      const duplicates = DuplicateService.findDuplicates(
        Number(latitude),
        Number(longitude),
        category as ReportCategory,
        exclude_id
      );

      res.json({ success: true, count: duplicates.length, data: duplicates });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * POST /api/v1/reports
   */
  public static async createReport(req: Request, res: Response): Promise<void> {
    try {
      const validated = createReportSchema.parse(req.body);

      // Default reporter to demo user if not specified
      const reporterId = validated.reporter_id || 'a0000000-0000-0000-0000-000000000001';
      const reporter = store.profiles.get(reporterId) || {
        id: reporterId,
        display_name: 'Resident Reporter',
      };

      const newReport: Report = {
        id: uuidv4(),
        reporter_id: reporterId,
        reporter_name: reporter.display_name,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        severity: validated.severity,
        status: 'submitted',
        latitude: validated.latitude,
        longitude: validated.longitude,
        address: validated.address,
        image_url: validated.image_url,
        ai_analysis: validated.ai_analysis,
        supports_count: 0,
        evidence_count: 0,
        is_demo: false, // Live submitted report!
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.reports.set(newReport.id, newReport);

      // Append initial audit log
      store.reportEvents.push({
        id: uuidv4(),
        report_id: newReport.id,
        actor_id: reporterId,
        actor_name: reporter.display_name,
        from_status: null,
        to_status: 'submitted',
        reason: 'Citizen filed initial photographic report',
        created_at: new Date().toISOString(),
      });

      res.status(201).json({ success: true, data: newReport });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { message: 'Validation failed', details: err.format(), code: 'VALIDATION_ERROR' } });
        return;
      }
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * POST /api/v1/reports/:id/support
   */
  public static async supportReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.body.user_id as string) || 'a0000000-0000-0000-0000-000000000002';

      const report = store.reports.get(id);
      if (!report) {
        res.status(404).json({ success: false, error: { message: 'Report not found', code: 'NOT_FOUND' } });
        return;
      }

      const supportKey = `${id}:${userId}`;
      if (store.reportSupports.has(supportKey)) {
        res.status(409).json({ success: false, error: { message: 'You have already backed this report.', code: 'ALREADY_SUPPORTED' } });
        return;
      }

      // Record support
      store.reportSupports.set(supportKey, {
        id: uuidv4(),
        report_id: id,
        user_id: userId,
        created_at: new Date().toISOString(),
      });

      report.supports_count += 1;
      report.updated_at = new Date().toISOString();

      // Award points (+2 points, idempotent, max 3/day)
      const pointResult = PointsService.awardPoints(userId, 'report_supported', id);

      res.json({
        success: true,
        data: {
          supports_count: report.supports_count,
          points_awarded: pointResult.points,
          point_status: pointResult.reason || 'Points awarded successfully.',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }

  /**
   * POST /api/v1/reports/:id/evidence
   */
  public static async submitEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = evidenceSchema.parse(req.body);
      const userId = validated.user_id || 'a0000000-0000-0000-0000-000000000002';

      const report = store.reports.get(id);
      if (!report) {
        res.status(404).json({ success: false, error: { message: 'Report not found', code: 'NOT_FOUND' } });
        return;
      }

      const user = store.profiles.get(userId) || { id: userId, display_name: 'Volunteer Contributor' };

      const evidenceId = uuidv4();
      const evidenceItem = {
        id: evidenceId,
        report_id: id,
        user_id: userId,
        user_name: user.display_name,
        image_url: validated.image_url,
        notes: validated.notes || 'Follow-up verification photo submitted.',
        status: 'accepted' as const, // For demo convenience, automatically accept clean submission
        reviewer_id: 'a0000000-0000-0000-0000-000000000003',
        reviewed_at: new Date().toISOString(),
        is_demo: false,
        created_at: new Date().toISOString(),
      };

      store.reportEvidence.set(evidenceId, evidenceItem);
      report.evidence_count += 1;
      report.updated_at = new Date().toISOString();

      // Award points for accepted evidence (+15 points, idempotent)
      const pointResult = PointsService.awardPoints(userId, 'evidence_accepted', id);

      // Mark user contributed on linked quests
      for (const quest of store.quests.values()) {
        if (quest.report_id === id) {
          const memberKey = `${quest.id}:${userId}`;
          const member = store.questMembers.get(memberKey);
          if (member) {
            member.contributed = true;
          }
        }
      }

      res.status(201).json({
        success: true,
        data: evidenceItem,
        points: pointResult,
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
   * POST /api/v1/reports/:id/transition
   */
  public static async transitionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = transitionSchema.parse(req.body);

      // Default actor to moderator
      const actorId = validated.actor_id || 'a0000000-0000-0000-0000-000000000003';
      const actor = store.profiles.get(actorId) || {
        id: actorId,
        display_name: 'Moderator',
        role: 'moderator' as const,
        username: 'mod',
        points_total: 0,
        is_demo: true,
        created_at: '',
        updated_at: '',
      };

      const result = StateMachine.transitionReport(
        id,
        validated.to_status as ReportStatus,
        actor,
        validated.reason,
        validated.resolution_type
      );

      if (!result.success) {
        res.status(400).json({ success: false, error: { message: result.error, code: 'TRANSITION_FORBIDDEN' } });
        return;
      }

      // If report transitioned to 'verified', award reporter +10 points (idempotent)
      if (validated.to_status === 'verified' && result.report) {
        PointsService.awardPoints(result.report.reporter_id, 'report_verified', id);
      }

      res.json({ success: true, data: result.report });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { message: 'Validation failed', details: err.format(), code: 'VALIDATION_ERROR' } });
        return;
      }
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }
}
