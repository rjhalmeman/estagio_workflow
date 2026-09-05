import { Router } from 'express';
import { createInternship, getTracking, updateInternshipController } from '../controllers/internshipController';
import { validateBody } from '../middlewares/validation';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { createInternshipSchema, updateInternshipSchema } from '../schemas/internshipSchema';

const router = Router();

router.post('/', authenticate, authorize('aluno'), validateBody(createInternshipSchema), createInternship);
router.get('/student/:cpf', authenticate, getTracking);
router.patch(
  '/:id',
  authenticate,
  authorize('professor_orientador', 'professor_prae'),
  validateBody(updateInternshipSchema),
  updateInternshipController
);

export default router;
