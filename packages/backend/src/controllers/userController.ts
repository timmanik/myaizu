import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/userService';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatarUrl: z.string().url('Invalid URL').nullable().optional(),
  role: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const data = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(req.user.userId, data);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/user/change-password
 * Change current user's password
 */
export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const data = changePasswordSchema.parse(req.body);
    await userService.changePassword(req.user.userId, data);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/user/profile
 * Get current user's full profile
 */
export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const user = await userService.getUserProfile(req.user.userId);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id
 * Get public profile of any user
 */
export async function getPublicProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = await userService.getPublicProfile(id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id/prompts
 * Get user's public prompts
 */
export async function getUserPromptsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await userService.getUserPublicPrompts(id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id/collections
 * Get user's public collections
 */
export async function getUserCollectionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await userService.getUserPublicCollections(id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/me/pinned
 * Get current user's pinned prompts
 */
export async function getPinnedPromptsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const prompts = await userService.getUserPinnedPrompts(req.user.userId);

    res.json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    next(error);
  }
}

const pinPromptSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID is required'),
});

/**
 * POST /api/users/me/pin
 * Pin a prompt to user's home page
 */
export async function pinPromptHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const { promptId } = pinPromptSchema.parse(req.body);
    await userService.pinPrompt(req.user.userId, promptId);

    res.json({
      success: true,
      message: 'Prompt pinned successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/users/me/pin/:promptId
 * Unpin a prompt from user's home page
 */
export async function unpinPromptHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const { promptId } = req.params;
    await userService.unpinPrompt(req.user.userId, promptId);

    res.json({
      success: true,
      message: 'Prompt unpinned successfully',
    });
  } catch (error) {
    next(error);
  }
}

