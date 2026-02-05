import { Router } from 'express';
import { login, logout, refreshToken, getMe, register } from '../../controllers/auth/index.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router: Router = Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (admin only)
router.post('/register', authenticate, authorize('admin'), register);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

export default router;