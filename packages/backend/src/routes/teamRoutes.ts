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
router.get('/:id/pinned', teamController.getPinnedPrompts);

// Team member management (Team Admin only)
router.post('/:id/members', teamController.addTeamMember);
router.delete('/:id/members/:userId', teamController.removeTeamMember);
router.put('/:id/members/:userId/role', teamController.updateTeamMemberRole);

// Pinned prompts management (Team Admin only)
router.post('/:id/pin', teamController.pinPrompt);
router.delete('/:id/pin/:promptId', teamController.unpinPrompt);

export default router;

