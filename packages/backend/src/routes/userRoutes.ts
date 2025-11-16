import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Current user routes (authenticated)
router.get('/profile', authenticate, userController.getProfileHandler);
router.put('/profile', authenticate, userController.updateProfileHandler);
router.post('/change-password', authenticate, userController.changePasswordHandler);

// Pinned prompts routes (authenticated)
router.get('/me/pinned', authenticate, userController.getPinnedPromptsHandler);
router.post('/me/pin', authenticate, userController.pinPromptHandler);
router.delete('/me/pin/:promptId', authenticate, userController.unpinPromptHandler);

// Public user routes
router.get('/:id', userController.getPublicProfileHandler);
router.get('/:id/prompts', userController.getUserPromptsHandler);
router.get('/:id/collections', userController.getUserCollectionsHandler);

export default router;

