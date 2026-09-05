import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function isHashed(password: string): boolean {
  return /^\$2[aby]\$/.test(password);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
