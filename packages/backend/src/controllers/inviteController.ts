import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import * as inviteService from '../services/inviteService';

// Validation schemas
const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
  expiresInDays: z.number().min(1).max(30).optional(),
});

/**
 * POST /api/admin/invites
 * Create a new invite (Super Admin only)
 */
export async function createInviteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createInviteSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const invite = await inviteService.createInvite({
      ...data,
      createdBy: req.user.userId,
    });

    res.json({
      success: true,
      data: invite,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/invites/:token/validate
 * Validate an invite token (public)
 */
export async function validateInviteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const result = await inviteService.validateInvite(token);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/invites
 * Get all invites (Super Admin only)
 */
export async function getAllInvitesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const invites = await inviteService.getAllInvites();

    res.json({
      success: true,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/invites/:id
 * Revoke an invite (Super Admin only)
 */
export async function revokeInviteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await inviteService.revokeInvite(id);

    res.json({
      success: true,
      message: 'Invite revoked successfully',
    });
  } catch (error) {
    next(error);
  }
}

