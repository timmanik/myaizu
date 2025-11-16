import { Router, type Router as RouterType } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// Public routes
router.post('/login', authController.loginHandler);
router.post('/register', authController.registerHandler);
router.post('/logout', authController.logoutHandler);

// Protected routes
router.get('/me', authenticate, authController.meHandler);

export default router;

