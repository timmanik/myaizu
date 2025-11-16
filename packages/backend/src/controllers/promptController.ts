import { Request, Response, NextFunction } from 'express';
import { promptService } from '../services/promptService';
import type {
  CreatePromptDto,
  UpdatePromptDto,
  PromptFilters,
  PromptSort,
} from '@aizu/shared';
import { z } from 'zod';

// Validation schemas
const createPromptSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  description: z.string().max(500).optional(),
  variables: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        defaultValue: z.string().optional(),
      })
    )
    .optional(),
  platform: z.enum([
    'CHATGPT',
    'CLAUDE',
    'GEMINI',
    'COPILOT',
    'MIDJOURNEY',
    'STABLE_DIFFUSION',
    'OTHER',
  ]),
  visibility: z.enum(['PUBLIC', 'TEAM', 'PRIVATE']),
  tags: z.array(z.string()).max(10).optional(),
  teamId: z.string().optional(),
  promptType: z.enum([
    'STANDARD_PROMPT',
    'CUSTOM_GPT',
    'CLAUDE_PROJECT',
    'GEMINI_GEM',
    'CUSTOM_APP',
    'OTHER',
  ]).optional(),
  additionalInstructions: z.string().max(500).optional(),
  config: z.object({
    useWebSearch: z.boolean().optional(),
    useDeepResearch: z.boolean().optional(),
  }).optional(),
});

const updatePromptSchema = createPromptSchema.partial();

export class PromptController {
  /**
   * Create a new prompt
   * POST /api/prompts
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      // Validate input
      const validatedData = createPromptSchema.parse(req.body);

      const prompt = await promptService.createPrompt(
        userId,
        validatedData as CreatePromptDto
      );

      res.status(201).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single prompt by ID
   * GET /api/prompts/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const prompt = await promptService.getPrompt(id, userId);

      if (!prompt) {
        res.status(404).json({
          success: false,
          error: 'Prompt not found or you do not have permission to view it',
        });
        return;
      }

      res.json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List prompts with filters
   * GET /api/prompts
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      // Parse query parameters
      const filters: PromptFilters = {};
      if (req.query.platform) filters.platform = req.query.platform as any;
      if (req.query.visibility) filters.visibility = req.query.visibility as any;
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [req.query.tags as string];
      }
      if (req.query.authorId) filters.authorId = req.query.authorId as string;
      if (req.query.teamId) filters.teamId = req.query.teamId as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.isFavorited === 'true') filters.isFavorited = true;

      // Parse sort parameters
      const sort: PromptSort = {
        field: (req.query.sortField as any) || 'createdAt',
        order: (req.query.sortOrder as any) || 'desc',
      };

      // Parse pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await promptService.listPrompts(
        userId,
        filters,
        sort,
        page,
        limit
      );

      res.json({
        success: true,
        data: result.prompts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a prompt
   * PUT /api/prompts/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Validate input
      const validatedData = updatePromptSchema.parse(req.body);

      const prompt = await promptService.updatePrompt(
        id,
        userId,
        validatedData as UpdatePromptDto
      );

      res.json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a prompt
   * DELETE /api/prompts/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await promptService.deletePrompt(id, userId);

      res.json({
        success: true,
        message: 'Prompt deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle favorite status
   * POST /api/prompts/:id/favorite
   */
  async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const result = await promptService.toggleFavorite(id, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Increment copy count
   * POST /api/prompts/:id/copy
   */
  async copy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await promptService.incrementCopyCount(id);

      res.json({
        success: true,
        message: 'Copy count incremented',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fork/remix a prompt
   * POST /api/prompts/:id/fork
   */
  async fork(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const forkedPrompt = await promptService.forkPrompt(id, userId);

      res.status(201).json({
        success: true,
        data: forkedPrompt,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const promptController = new PromptController();

