import { prisma } from '../config/db';
import { LoginInput } from '../schemas/authSchema';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export interface AuthUser {
  cpf: string;
  nome: string;
  email: string;
  role: 'aluno' | 'professor_orientador' | 'professor_prae' | 'supervisor' | 'representante_uce' | 'visitante';
}

export interface AuthResult {
  token: string;
  user: AuthUser;
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

  let role: AuthUser['role'] = 'visitante';
  if (user.aluno) {
    role = 'aluno';
  } else if (user.professor_prae) {
    role = 'professor_prae';
  } else if (user.professor_orientador) {
    role = 'professor_orientador';
  } else if (user.supervisor) {
    role = 'supervisor';
  } else if (user.representante_uce) {
    role = 'representante_uce';
  }

  const authUser: AuthUser = {
    cpf: user.cpf.trim(),
    nome: user.nome,
    email: user.email,
    role,
  };

  return {
    token: signToken({ cpf: authUser.cpf, role: authUser.role }),
    user: authUser,
  };
}
