import { Router, type Router as RouterType } from 'express';
import { searchController } from '../controllers/searchController';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All search routes require authentication
router.use(authenticate);

// Unified search
router.get('/', searchController.searchAll.bind(searchController));

// Entity-specific searches
router.get('/prompts', searchController.searchPrompts.bind(searchController));
router.get('/collections', searchController.searchCollections.bind(searchController));
router.get('/teams', searchController.searchTeams.bind(searchController));
router.get('/users', searchController.searchUsers.bind(searchController));

export default router;

