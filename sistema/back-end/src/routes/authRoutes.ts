import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateBody } from '../middlewares/validation';
import { loginSchema } from '../schemas/authSchema';

const router = Router();

router.post('/login', validateBody(loginSchema), login);

export default router;
