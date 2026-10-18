import { prisma } from '../config/db';
import { LoginInput } from '../schemas/authSchema';
import { comparePassword } from '../utils/password';
import { signRefreshToken, signToken, verifyRefreshToken } from '../utils/jwt';

export type UserRole =
  | 'aluno'
  | 'professor_orientador'
  | 'professor_prae'
  | 'supervisor'
  | 'representante_uce'
  | 'visitante';

export interface AuthUser {
  readonly cpf: string;
  readonly nome: string;
  readonly email: string;
  readonly role: UserRole;
  readonly idCurso?: number;
}

export interface AuthResult {
  readonly token: string;
  readonly refreshToken: string;
  readonly user: AuthUser;
}

interface PersonWithRoles {
  cpf: string;
  nome: string;
  email: string;
  senha: string | null;
  aluno: { id_curso: number } | null;
  professor_orientador: { cpf: string } | null;
  professor_prae: { id_curso: number } | null;
  supervisor: { cpf: string } | null;
  representante_uce: { cpf: string } | null;
}

function resolveUserRole(user: PersonWithRoles): { role: UserRole; idCurso?: number } {
  if (user.aluno) return { role: 'aluno', idCurso: user.aluno.id_curso };
  if (user.professor_prae) return { role: 'professor_prae', idCurso: user.professor_prae.id_curso };
  if (user.professor_orientador) return { role: 'professor_orientador' };
  if (user.supervisor) return { role: 'supervisor' };
  if (user.representante_uce) return { role: 'representante_uce' };
  return { role: 'visitante' };
}

function buildAuthResult(person: PersonWithRoles): AuthResult {
  const { role, idCurso } = resolveUserRole(person);
  const authUser: AuthUser = {
    cpf: person.cpf.trim(),
    nome: person.nome,
    email: person.email,
    role,
    idCurso,
  };
  const payload = { cpf: authUser.cpf, role: authUser.role };
  return {
    token: signToken(payload),
    refreshToken: signRefreshToken(payload),
    user: authUser,
  };
}

export async function authenticateUser(input: LoginInput): Promise<AuthResult | null> {
  const user = await prisma.pessoa.findFirst({
    where: { email: input.email },
    include: {
      aluno: true,
      professor_orientador: true,
      professor_prae: true,
      supervisor: true,
      representante_uce: true,
    },
  });

  if (!user || !user.senha || !(await comparePassword(input.password, user.senha))) {
    return null;
  }

  return buildAuthResult(user);
}

export async function refreshUserSession(refreshToken: string): Promise<AuthResult | null> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.pessoa.findUnique({
      where: { cpf: payload.cpf },
      include: {
        aluno: true,
        professor_orientador: true,
        professor_prae: true,
        supervisor: true,
        representante_uce: true,
      },
    });
    if (!user) return null;
    return buildAuthResult(user);
  } catch {
    return null;
  }
}
