import { Router } from 'express';
import {
  listAllStudents,
  listUnassignedStudents,
  updateStudentAdvisor,
} from '../controllers/studentController';
import { validateBody } from '../middlewares/validation';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { setAdvisorSchema } from '../schemas/studentSchema';

const router = Router();

router.use(authenticate, authorize('professor_prae'));

router.get('/', listAllStudents);
router.get('/unassigned', listUnassignedStudents);
router.patch('/:cpf/advisor', validateBody(setAdvisorSchema), updateStudentAdvisor);

export default router;
