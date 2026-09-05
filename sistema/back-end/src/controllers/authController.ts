import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authenticateUser(req.body);
    if (!result) {
      res.status(401).json({
        status: 'error',
        message: 'Email ou senha inválidos.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso.',
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}
