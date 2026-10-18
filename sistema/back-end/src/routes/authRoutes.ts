import { Router } from 'express';
import { login, logout, refresh } from '../controllers/authController';
import { validateBody } from '../middlewares/validation';
import { loginRateLimiter } from '../middlewares/rateLimiter';
import { loginSchema } from '../schemas/authSchema';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
