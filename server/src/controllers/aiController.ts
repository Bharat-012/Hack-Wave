import { Request, Response } from 'express';
import { z } from 'zod';
import { geminiService } from '../services/gemini.js';
import { store } from '../services/store.js';

const analyzeImageSchema = z.object({
  image: z.string().min(10, 'Image data is required'),
  mimeType: z.string().optional().default('image/jpeg'),
  userContext: z.string().optional(),
});

const translateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  target_language: z.enum(['en', 'hi']),
});

const generateQuestSchema = z.object({
  report_id: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export class AIController {
  /**
   * POST /api/v1/ai/analyze-image
   */
  public static async analyzeImage(req: Request, res: Response): Promise<void> {
    try {
      const validated = analyzeImageSchema.parse(req.body);

      const analysis = await geminiService.analyzeImage(
        validated.image,
        validated.mimeType,
        validated.userContext
      );

      res.json({
        success: true,
        data: analysis,
        mock_mode: geminiService.isMock(),
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
   * POST /api/v1/ai/translate-report
   */
  public static async translateReport(req: Request, res: Response): Promise<void> {
    try {
      const validated = translateSchema.parse(req.body);

      const translation = await geminiService.translateReport(
        validated.title,
        validated.description,
        validated.target_language
      );

      res.json({
        success: true,
        data: translation,
        mock_mode: geminiService.isMock(),
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
   * POST /api/v1/ai/generate-quest
   */
  public static async generateQuest(req: Request, res: Response): Promise<void> {
    try {
      const validated = generateQuestSchema.parse(req.body);

      let title = validated.title || '';
      let category = validated.category || '';
      let description = validated.description || '';

      if (validated.report_id) {
        const report = store.reports.get(validated.report_id);
        if (report) {
          title = report.title;
          category = report.category;
          description = report.description;
        }
      }

      if (!title) {
        res.status(400).json({ success: false, error: { message: 'Report title is required to draft a quest', code: 'BAD_REQUEST' } });
        return;
      }

      const questDraft = await geminiService.draftQuest(title, category, description);

      res.json({
        success: true,
        data: questDraft,
        mock_mode: geminiService.isMock(),
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { message: 'Validation failed', details: err.format(), code: 'VALIDATION_ERROR' } });
        return;
      }
      res.status(500).json({ success: false, error: { message: err.message, code: 'SERVER_ERROR' } });
    }
  }
}
