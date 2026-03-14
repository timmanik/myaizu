import { Router, type Router as RouterType } from 'express';
import { trendingController } from '../controllers/trendingController';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All trending routes require authentication
router.use(authenticate);

// Get most favorited prompts
router.get('/most-favorited', (req, res, next) =>
  trendingController.getMostFavorited(req, res, next)
);

// Get fast rising prompts
router.get('/fast-rising', (req, res, next) =>
  trendingController.getFastRising(req, res, next)
);

// Get new prompts
router.get('/new', (req, res, next) => trendingController.getNew(req, res, next));

// Get trending overview (all categories)
router.get('/overview', (req, res, next) => trendingController.getOverview(req, res, next));

export default router;
