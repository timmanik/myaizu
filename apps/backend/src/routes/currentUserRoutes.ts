import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router: Router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfileHandler);
router.put('/profile', userController.updateProfileHandler);
router.post('/change-password', userController.changePasswordHandler);

router.get('/me/pinned', userController.getPinnedPromptsHandler);
router.post('/me/pin', userController.pinPromptHandler);
router.delete('/me/pin/:promptId', userController.unpinPromptHandler);

export default router;
