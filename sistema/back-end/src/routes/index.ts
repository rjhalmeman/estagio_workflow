import { Router, Request, Response, NextFunction } from 'express';
import { testDbConnection } from '../config/db';
import authRoutes from './authRoutes';
import internshipRoutes from './internshipRoutes';
import documentRoutes from './documentRoutes';
import advisorRoutes from './advisorRoutes';
import studentRoutes from './studentRoutes';

const router = Router();

router.get('/health', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isDbConnected = await testDbConnection();
    res.status(200).json({
      status: 'OK',
      database: isDbConnected ? 'Conectado (PostgreSQL)' : 'Desconectado',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.use('/auth', authRoutes);
router.use('/internships', internshipRoutes);
router.use('/documents', documentRoutes);
router.use('/advisors', advisorRoutes);
router.use('/students', studentRoutes);

export default router;
