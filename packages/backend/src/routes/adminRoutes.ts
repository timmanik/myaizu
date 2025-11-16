import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router: Router = Router();

// All admin routes require Super Admin role
router.use(authenticate, requireRole(Role.SUPER_ADMIN));

/**
 * STATISTICS
 */
router.get('/stats', adminController.getAdminStats);

/**
 * TEAM MANAGEMENT
 */
router.post('/teams', adminController.createTeam);
router.get('/teams', adminController.getAllTeams);
router.put('/teams/:id', adminController.updateTeam);
router.delete('/teams/:id', adminController.deleteTeam);

// Team admin assignment
router.post('/teams/:id/admins', adminController.assignTeamAdmin);
router.delete('/teams/:id/admins/:userId', adminController.removeTeamAdmin);

/**
 * USER MANAGEMENT
 */
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

/**
 * INVITE MANAGEMENT
 * Note: Invite routes are already in inviteRoutes.ts with /api/invites/admin prefix
 * We're keeping them there for backward compatibility
 */

export default router;

