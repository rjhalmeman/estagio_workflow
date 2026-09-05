import { prisma } from '../config/db';
import { PESSOA_SAFE_SELECT } from '../utils/prismaSelects';

export async function getAdvisors(): Promise<any> {
  return prisma.professor_orientador.findMany({
    include: {
      pessoa: { select: PESSOA_SAFE_SELECT },
      _count: { select: { aluno: true } },
    },
  });
}

export async function getStudentsByAdvisor(cpfOrientador: string): Promise<any> {
  return prisma.aluno.findMany({
    where: { cpf_orientador: cpfOrientador },
    include: {
      pessoa: { select: PESSOA_SAFE_SELECT },
      curso: true,
      estagio: {
        orderBy: { id_estagio: 'desc' },
        take: 1,
        include: {
          unidade_concedente: true,
          documento_estagio: { select: { status: true } },
        },
      },
    },
  });
}
