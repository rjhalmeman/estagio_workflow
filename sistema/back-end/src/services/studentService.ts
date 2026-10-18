import { prisma } from '../config/db';
import { PESSOA_SAFE_SELECT } from '../utils/prismaSelects';

const STUDENT_WITH_INTERNSHIP_INCLUDE = {
  pessoa: { select: PESSOA_SAFE_SELECT },
  curso: true,
  professor_orientador: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
  estagio: {
    orderBy: { id_estagio: 'desc' as const },
    take: 1,
    include: {
      unidade_concedente: true,
      documento_estagio: { select: { status: true } },
    },
  },
};

export async function getAllStudents(idCurso?: number): Promise<unknown> {
  return prisma.aluno.findMany({
    where: idCurso ? { id_curso: idCurso } : undefined,
    include: STUDENT_WITH_INTERNSHIP_INCLUDE,
    orderBy: { ra: 'asc' },
  });
}

export async function getUnassignedStudents(idCurso?: number): Promise<unknown> {
  return prisma.aluno.findMany({
    where: {
      cpf_orientador: null,
      ...(idCurso ? { id_curso: idCurso } : {}),
    },
    include: STUDENT_WITH_INTERNSHIP_INCLUDE,
    orderBy: { ra: 'asc' },
  });
}

export async function setStudentAdvisor(
  cpfAluno: string,
  cpfOrientador: string | null
): Promise<unknown> {
  return prisma.aluno.update({
    where: { cpf: cpfAluno },
    data: { cpf_orientador: cpfOrientador },
    select: { cpf: true, cpf_orientador: true },
  });
}
