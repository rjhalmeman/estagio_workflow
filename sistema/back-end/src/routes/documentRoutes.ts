import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { uploadDoc, downloadDoc, updateStatus } from '../controllers/documentController';
import { validateBody } from '../middlewares/validation';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { documentStatusSchema } from '../schemas/documentSchema';

const router = Router();

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Tipo de arquivo não permitido. Envie PDF, DOC, DOCX, JPG ou PNG.'));
      return;
    }
    callback(null, true);
  },
});

router.post(
  '/:internshipId/upload',
  authenticate,
  authorize('aluno'),
  upload.single('file'),
  uploadDoc
);
router.get('/:documentId/download', authenticate, downloadDoc);
router.patch(
  '/:documentId/status',
  authenticate,
  authorize('professor_orientador', 'professor_prae'),
  validateBody(documentStatusSchema),
  updateStatus
);

export default router;
