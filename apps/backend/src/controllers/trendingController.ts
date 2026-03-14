import { Request, Response, NextFunction } from 'express';
import { trendingService } from '../services/trendingService';
import { sendData } from '../utils/apiResponse';

export class TrendingController {
  /**
   * Get most favorited prompts
   * GET /api/trending/most-favorited?days=7&limit=20
   */
  async getMostFavorited(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 20;

      const prompts = await trendingService.getMostFavorited(userId, days, limit);

      sendData(res, prompts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get fast rising prompts
   * GET /api/trending/fast-rising?days=7&limit=20
   */
  async getFastRising(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 20;

      const prompts = await trendingService.getFastRising(userId, days, limit);

      sendData(res, prompts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get new prompts
   * GET /api/trending/new?limit=20
   */
  async getNew(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      const prompts = await trendingService.getNew(userId, limit);

      sendData(res, prompts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending overview (all categories)
   * GET /api/trending/overview
   */
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const overview = await trendingService.getTrendingOverview(userId);

      sendData(res, overview);
    } catch (error) {
      next(error);
    }
  }
}

export const trendingController = new TrendingController();
