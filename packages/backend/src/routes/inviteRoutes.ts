import { Router, type Router as RouterType } from 'express';
import * as inviteController from '../controllers/inviteController';
import { authenticate, requireRole } from '../middleware/auth';

const router: RouterType = Router();

// Public route - validate invite token
router.get('/:token/validate', inviteController.validateInviteHandler);

// Admin routes - require Super Admin role
router.post(
  '/admin',
  authenticate,
  requireRole('SUPER_ADMIN'),
  inviteController.createInviteHandler
);

router.get(
  '/admin',
  authenticate,
  requireRole('SUPER_ADMIN'),
  inviteController.getAllInvitesHandler
);

router.delete(
  '/admin/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  inviteController.revokeInviteHandler
);

export default router;

