import { Request, Response, NextFunction } from 'express';
import { authenticateUser, refreshUserSession } from '../services/authService';

const REFRESH_COOKIE_NAME = 'estagio_refresh_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SEVEN_DAYS_MS,
    path: '/api/auth',
  });
}

function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

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

    setRefreshCookie(res, result.refreshToken);
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

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = readCookie(req.headers.cookie, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      res.status(401).json({ status: 'error', message: 'Sessão não encontrada.' });
      return;
    }

    const result = await refreshUserSession(refreshToken);
    if (!result) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
      res.status(401).json({ status: 'error', message: 'Sessão expirada.' });
      return;
    }

    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      status: 'success',
      message: 'Sessão renovada.',
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(200).json({ status: 'success', message: 'Logout realizado com sucesso.' });
}
