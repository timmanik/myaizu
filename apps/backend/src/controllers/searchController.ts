import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/searchService';
import { BadRequestError } from '../middleware/errorHandler';
import { sendData } from '../utils/apiResponse';

export class SearchController {
  /**
   * Search across all entity types
   * GET /api/search?q=query&limit=10
   */
  async searchAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length === 0) {
        throw new BadRequestError('Search query is required');
      }

      if (query.length < 2) {
        throw new BadRequestError('Search query must be at least 2 characters');
      }

      const results = await searchService.searchAll(query, userId, limit);

      return sendData(res, results);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search prompts only
   * GET /api/search/prompts?q=query&limit=20
   */
  async searchPrompts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        throw new BadRequestError('Search query is required');
      }

      const prompts = await searchService.searchPrompts(query, userId, limit);

      return sendData(res, { prompts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search collections only
   * GET /api/search/collections?q=query&limit=20
   */
  async searchCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        throw new BadRequestError('Search query is required');
      }

      const collections = await searchService.searchCollections(query, userId, limit);

      return sendData(res, { collections });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search teams only
   * GET /api/search/teams?q=query&limit=20
   */
  async searchTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        throw new BadRequestError('Search query is required');
      }

      const teams = await searchService.searchTeams(query, userId, limit);

      return sendData(res, { teams });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search users only
   * GET /api/search/users?q=query&limit=20
   */
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        throw new BadRequestError('Search query is required');
      }

      const users = await searchService.searchUsers(query, limit);

      return sendData(res, { users });
    } catch (error) {
      return next(error);
    }
  }
}

export const searchController = new SearchController();
