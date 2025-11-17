import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/auth';
import * as teamController from '../controllers/teamController';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// Team routes
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamById);
router.get('/:id/prompts', teamController.getTeamPrompts);

// Team member management (Team Admin only)
router.post('/:id/members', teamController.addTeamMember);
router.delete('/:id/members/:userId', teamController.removeTeamMember);
router.put('/:id/members/:userId/role', teamController.updateTeamMemberRole);

export default router;

