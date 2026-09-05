import { Router } from 'express';
import { listAdvisors, listAdvisorStudents } from '../controllers/advisorController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.use(authenticate, authorize('professor_orientador', 'professor_prae'));

router.get('/', listAdvisors);
router.get('/:cpf/students', listAdvisorStudents);

export default router;
