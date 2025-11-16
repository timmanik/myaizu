import { Router, type Router as RouterType } from 'express';
import { promptController } from '../controllers/promptController';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All prompt routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', promptController.create.bind(promptController));
router.get('/', promptController.list.bind(promptController));
router.get('/:id', promptController.getById.bind(promptController));
router.put('/:id', promptController.update.bind(promptController));
router.delete('/:id', promptController.delete.bind(promptController));

// Actions
router.post('/:id/favorite', promptController.toggleFavorite.bind(promptController));
router.post('/:id/copy', promptController.copy.bind(promptController));
router.post('/:id/fork', promptController.fork.bind(promptController));

export default router;

