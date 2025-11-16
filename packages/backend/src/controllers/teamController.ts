import { Request, Response } from 'express';
import { z } from 'zod';
import * as teamService from '../services/teamService';
import { TeamMemberRole } from '@aizu/shared';

// Validation schemas
const addMemberSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(TeamMemberRole).optional(),
});

const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(TeamMemberRole),
});

const pinPromptSchema = z.object({
  promptId: z.string(),
});

/**
 * GET /api/teams
 * Get all teams the user has access to
 */
export const getTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const filters = {
      search: req.query.search as string | undefined,
      memberUserId: req.query.memberUserId as string | undefined,
    };

    const teams = await teamService.getTeams(userId, filters);

    res.json({
      success: true,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch teams',
    });
  }
};

/**
 * GET /api/teams/:id
 * Get a single team by ID (with members) - publicly accessible
 */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const team = await teamService.getTeamById(id, userId);

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch team',
      });
    }
  }
};

/**
 * GET /api/teams/:id/prompts
 * Get all prompts for a team
 */
export const getTeamPrompts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const filters = {
      search: req.query.search as string | undefined,
      platform: req.query.platform as string | undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      sortField: (req.query.sortField as any) || 'createdAt',
      sortOrder: (req.query.sortOrder as any) || 'desc',
      viewAsPublic: req.query.viewAsPublic === 'true',
    };

    const prompts = await teamService.getTeamPrompts(id, userId, filters);

    res.json({
      success: true,
      data: prompts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch team prompts',
    });
  }
};

/**
 * GET /api/teams/:id/pinned
 * Get pinned prompts for a team
 */
export const getPinnedPrompts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const viewAsPublic = req.query.viewAsPublic === 'true';

    const prompts = await teamService.getPinnedPrompts(id, userId, viewAsPublic);

    res.json({
      success: true,
      data: prompts,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch pinned prompts',
      });
    }
  }
};

/**
 * POST /api/teams/:id/members
 * Add a member to a team (Team Admin only)
 */
export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params;
    const validatedData = addMemberSchema.parse(req.body);

    const membership = await teamService.addTeamMember(
      id,
      adminUserId,
      validatedData.userId,
      validatedData.role
    );

    res.status(201).json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('already a member')) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('admin')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add team member',
      });
    }
  }
};

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a member from a team (Team Admin only)
 */
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.userId;
    const { id, userId } = req.params;

    await teamService.removeTeamMember(id, adminUserId, userId);

    res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('not a member')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('admin') || error.message.includes('last')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove team member',
      });
    }
  }
};

/**
 * PUT /api/teams/:id/members/:userId/role
 * Update a team member's role (Team Admin only)
 */
export const updateTeamMemberRole = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.userId;
    const { id, userId } = req.params;
    const validatedData = updateMemberRoleSchema.parse(req.body);

    const membership = await teamService.updateTeamMemberRole(
      id,
      adminUserId,
      userId,
      validatedData.role
    );

    res.json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else if (error.message.includes('not found') || error.message.includes('not a member')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('admin') || error.message.includes('last')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update team member role',
      });
    }
  }
};

/**
 * POST /api/teams/:id/pin
 * Pin a prompt to a team (Team Admin only)
 */
export const pinPrompt = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params;
    const validatedData = pinPromptSchema.parse(req.body);

    const team = await teamService.pinPrompt(id, adminUserId, validatedData.promptId);

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('already pinned')) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('admin') || error.message.includes('does not belong')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to pin prompt',
      });
    }
  }
};

/**
 * DELETE /api/teams/:id/pin/:promptId
 * Unpin a prompt from a team (Team Admin only)
 */
export const unpinPrompt = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.userId;
    const { id, promptId } = req.params;

    const team = await teamService.unpinPrompt(id, adminUserId, promptId);

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('not pinned')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('admin')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unpin prompt',
      });
    }
  }
};

