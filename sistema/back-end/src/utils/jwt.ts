import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const rawSecret = process.env.JWT_SECRET;

if (!rawSecret) {
  throw new Error('A variável de ambiente JWT_SECRET não foi definida.');
}

const JWT_SECRET: string = rawSecret;
const ACCESS_EXPIRES_SECONDS = 8 * 60 * 60;
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60;

export interface JwtPayload {
  readonly cpf: string;
  readonly role: string;
  readonly type?: string;
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'cpf' in value &&
    typeof value.cpf === 'string' &&
    'role' in value &&
    typeof value.role === 'string'
  );
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign({ cpf: payload.cpf, role: payload.role, type: 'access' }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_SECONDS,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign({ cpf: payload.cpf, role: payload.role, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_SECONDS,
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded: unknown = jwt.verify(token, JWT_SECRET);
  if (!isJwtPayload(decoded) || decoded.type === 'refresh') {
    throw new Error('Payload do token inválido.');
  }
  return { cpf: decoded.cpf, role: decoded.role };
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded: unknown = jwt.verify(token, JWT_SECRET);
  if (!isJwtPayload(decoded) || decoded.type !== 'refresh') {
    throw new Error('Payload do refresh token inválido.');
  }
  return { cpf: decoded.cpf, role: decoded.role };
}
