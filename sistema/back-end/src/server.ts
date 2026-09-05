import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json());

app.use('/api', apiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Servidor] Ativo na porta http://localhost:${PORT}`);
});
