import { Router } from 'express';
import * as organizationController from '../controllers/organizationController';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router: Router = Router();

/**
 * GET /api/organization
 * Get organization settings (all authenticated users)
 */
router.get('/', authenticate, organizationController.getOrganization);

/**
 * PUT /api/organization
 * Update organization settings (Super Admin only)
 */
router.put(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  organizationController.updateOrganization
);

export default router;

