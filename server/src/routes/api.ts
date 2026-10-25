import { Request, Response, Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { DashboardController } from '../controllers/dashboardController.js';
import { LeaderboardController } from '../controllers/leaderboardController.js';
import { QuestController } from '../controllers/questController.js';
import { ReportController } from '../controllers/reportController.js';
import { geminiService } from '../services/gemini.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'PatchMyCity API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    gemini_status: geminiService.isMock() ? 'mock_mode_active' : 'connected',
  });
});

// AI Endpoints
apiRouter.post('/ai/analyze-image', AIController.analyzeImage);
apiRouter.post('/ai/translate-report', AIController.translateReport);
apiRouter.post('/ai/generate-quest', AIController.generateQuest);

// Reports Endpoints
apiRouter.get('/reports', ReportController.getReports);
apiRouter.post('/reports', ReportController.createReport);
apiRouter.post('/reports/check-duplicates', ReportController.checkDuplicates);
apiRouter.get('/reports/:id', ReportController.getReportById);
apiRouter.post('/reports/:id/support', ReportController.supportReport);
apiRouter.post('/reports/:id/evidence', ReportController.submitEvidence);
apiRouter.post('/reports/:id/transition', ReportController.transitionStatus);

// City Quests Endpoints
apiRouter.get('/quests', QuestController.getQuests);
apiRouter.post('/quests', QuestController.createQuest);
apiRouter.get('/quests/:id', QuestController.getQuestById);
apiRouter.post('/quests/:id/join', QuestController.joinQuest);

// Dashboard & Analytics
apiRouter.get('/dashboard/impact', DashboardController.getImpactMetrics);

// Leaderboard & Badges
apiRouter.get('/leaderboard', LeaderboardController.getLeaderboard);
apiRouter.get('/badges', LeaderboardController.getBadges);
