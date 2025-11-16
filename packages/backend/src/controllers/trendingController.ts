import { Request, Response } from 'express';
import { trendingService } from '../services/trendingService';

export class TrendingController {
  /**
   * Get most favorited prompts
   * GET /api/trending/most-favorited?days=7&limit=20
   */
  async getMostFavorited(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 20;

      const prompts = await trendingService.getMostFavorited(userId, days, limit);

      res.json(prompts);
    } catch (error) {
      console.error('Error getting most favorited prompts:', error);
      res.status(500).json({ error: 'Failed to get most favorited prompts' });
    }
  }

  /**
   * Get fast rising prompts
   * GET /api/trending/fast-rising?days=7&limit=20
   */
  async getFastRising(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 20;

      const prompts = await trendingService.getFastRising(userId, days, limit);

      res.json(prompts);
    } catch (error) {
      console.error('Error getting fast rising prompts:', error);
      res.status(500).json({ error: 'Failed to get fast rising prompts' });
    }
  }

  /**
   * Get new prompts
   * GET /api/trending/new?limit=20
   */
  async getNew(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      const prompts = await trendingService.getNew(userId, limit);

      res.json(prompts);
    } catch (error) {
      console.error('Error getting new prompts:', error);
      res.status(500).json({ error: 'Failed to get new prompts' });
    }
  }

  /**
   * Get trending overview (all categories)
   * GET /api/trending/overview
   */
  async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const overview = await trendingService.getTrendingOverview(userId);

      res.json(overview);
    } catch (error) {
      console.error('Error getting trending overview:', error);
      res.status(500).json({ error: 'Failed to get trending overview' });
    }
  }
}

export const trendingController = new TrendingController();

