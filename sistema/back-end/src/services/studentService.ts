import { prisma } from '../config/db';
import { PESSOA_SAFE_SELECT } from '../utils/prismaSelects';

export async function getUnassignedStudents(): Promise<any> {
  return prisma.aluno.findMany({
    where: { cpf_orientador: null },
    include: { pessoa: { select: PESSOA_SAFE_SELECT }, curso: true },
  });
}

export async function setStudentAdvisor(cpfAluno: string, cpfOrientador: string | null): Promise<any> {
  return prisma.aluno.update({
    where: { cpf: cpfAluno },
    data: { cpf_orientador: cpfOrientador },
    select: { cpf: true, cpf_orientador: true },
  });
}
