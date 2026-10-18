import { prisma } from '../config/db';
import { PESSOA_SAFE_SELECT } from '../utils/prismaSelects';

export async function getUserProfile(cpf: string): Promise<unknown> {
  return prisma.pessoa.findUnique({
    where: { cpf },
    select: {
      ...PESSOA_SAFE_SELECT,
      aluno: { include: { curso: true } },
      professor_orientador: true,
      professor_prae: { include: { curso: true } },
      supervisor: { include: { unidade_concedente: { include: { cidade: true } } } },
      representante_uce: { include: { unidade_concedente: { include: { cidade: true } } } },
    },
  });
}

export async function getCatalogOptions(): Promise<unknown> {
  const [courses, cities, companies, advisors] = await Promise.all([
    prisma.curso.findMany({ orderBy: { nome: 'asc' } }),
    prisma.cidade.findMany({ orderBy: { nome: 'asc' } }),
    prisma.unidade_concedente.findMany({
      include: { cidade: true },
      orderBy: { nome: 'asc' },
    }),
    prisma.professor_orientador.findMany({
      include: { pessoa: { select: PESSOA_SAFE_SELECT } },
    }),
  ]);

  return { courses, cities, companies, advisors };
}
