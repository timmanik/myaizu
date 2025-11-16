import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/auth';
import * as collectionController from '../controllers/collectionController';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// Collection CRUD
router.get('/', collectionController.getCollections);
router.post('/', collectionController.createCollection);
router.get('/:id', collectionController.getCollectionById);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

// Manage prompts in collection
router.post('/:id/prompts', collectionController.addPromptToCollection);
router.delete('/:id/prompts/:promptId', collectionController.removePromptFromCollection);

export default router;

