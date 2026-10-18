import { Router } from 'express';
import { getCatalogOptionsController, getMeController } from '../controllers/catalogController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/me', getMeController);
router.get('/options', getCatalogOptionsController);

export default router;
