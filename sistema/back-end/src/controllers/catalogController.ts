import { Request, Response, NextFunction } from 'express';
import { getCatalogOptions, getUserProfile } from '../services/catalogService';

export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cpf = req.user?.cpf || '';
    const data = await getUserProfile(cpf);
    if (!data) {
      res.status(404).json({ status: 'error', message: 'Perfil não encontrado.' });
      return;
    }
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function getCatalogOptionsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getCatalogOptions();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}
