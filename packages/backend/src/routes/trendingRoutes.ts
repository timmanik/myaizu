import { Router, type Router as RouterType } from 'express';
import { trendingController } from '../controllers/trendingController';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All trending routes require authentication
router.use(authenticate);

// Get most favorited prompts
router.get('/most-favorited', (req, res) =>
  trendingController.getMostFavorited(req, res)
);

// Get fast rising prompts
router.get('/fast-rising', (req, res) =>
  trendingController.getFastRising(req, res)
);

// Get new prompts
router.get('/new', (req, res) => trendingController.getNew(req, res));

// Get trending overview (all categories)
router.get('/overview', (req, res) => trendingController.getOverview(req, res));

export default router;

