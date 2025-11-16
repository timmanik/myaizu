import { Request, Response } from 'express';
import { searchService } from '../services/searchService';

export class SearchController {
  /**
   * Search across all entity types
   * GET /api/search?q=query&limit=10
   */
  async searchAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      if (query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const results = await searchService.searchAll(query, userId, limit);

      return res.json(results);
    } catch (error) {
      console.error('Error in searchAll:', error);
      return res.status(500).json({ error: 'Failed to perform search' });
    }
  }

  /**
   * Search prompts only
   * GET /api/search/prompts?q=query&limit=20
   */
  async searchPrompts(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const prompts = await searchService.searchPrompts(query, userId, limit);

      return res.json({ prompts });
    } catch (error) {
      console.error('Error in searchPrompts:', error);
      return res.status(500).json({ error: 'Failed to search prompts' });
    }
  }

  /**
   * Search collections only
   * GET /api/search/collections?q=query&limit=20
   */
  async searchCollections(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const collections = await searchService.searchCollections(query, userId, limit);

      return res.json({ collections });
    } catch (error) {
      console.error('Error in searchCollections:', error);
      return res.status(500).json({ error: 'Failed to search collections' });
    }
  }

  /**
   * Search teams only
   * GET /api/search/teams?q=query&limit=20
   */
  async searchTeams(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const teams = await searchService.searchTeams(query, userId, limit);

      return res.json({ teams });
    } catch (error) {
      console.error('Error in searchTeams:', error);
      return res.status(500).json({ error: 'Failed to search teams' });
    }
  }

  /**
   * Search users only
   * GET /api/search/users?q=query&limit=20
   */
  async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const users = await searchService.searchUsers(query, limit);

      return res.json({ users });
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return res.status(500).json({ error: 'Failed to search users' });
    }
  }
}

export const searchController = new SearchController();

