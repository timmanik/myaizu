import { Router } from 'express';
import * as userController from '../controllers/userController';

const router: Router = Router();

router.get('/:id', userController.getPublicProfileHandler);
router.get('/:id/prompts', userController.getUserPromptsHandler);
router.get('/:id/collections', userController.getUserCollectionsHandler);

export default router;
