import crypto from 'crypto';
import { prisma } from '../config/db';
import { CreateInternshipInput } from '../schemas/internshipSchema';
import { hashPassword } from '../utils/password';

export function generateNumericHash(input: string, length: number): string {
  const digest = crypto.createHash('sha256').update(input).digest('hex');
  const numeric = BigInt(`0x${digest}`).toString().padEnd(length, '0');
  return numeric.slice(0, length);
}

export function parseTimeString(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':');
  return new Date(1970, 0, 1, parseInt(hours || '0', 10), parseInt(minutes || '0', 10), 0);
}

export async function resolveCidade(nome: string): Promise<number> {
  const existing = await prisma.cidade.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existing) return existing.id_cidade;

  const created = await prisma.cidade.create({
    data: { nome, uf: 'PR' },
  });
  return created.id_cidade;
}

export async function resolveCurso(nome: string): Promise<number> {
  const existing = await prisma.curso.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existing) return existing.id_curso;

  const created = await prisma.curso.create({
    data: { nome },
  });
  return created.id_curso;
}

export async function resolveStudent(input: CreateInternshipInput, idCurso: number): Promise<string> {
  const rawPeriodo = parseInt(input.periodo, 10);
  const periodo = Number.isNaN(rawPeriodo) ? null : rawPeriodo;
  const rawAno = input.ano ? parseInt(input.ano, 10) : NaN;
  const ano = Number.isNaN(rawAno) ? null : rawAno;

  const existing = await prisma.pessoa.findFirst({
    where: { email: input.email },
    include: { aluno: true },
  });

  if (existing?.aluno) {
    await prisma.aluno.update({
      where: { cpf: existing.cpf },
      data: { periodo, ano },
    });
    return existing.cpf;
  }

  const cpf = existing?.cpf || generateNumericHash(input.email, 11);
  if (!existing) {
    await prisma.pessoa.create({
      data: {
        cpf,
        nome: input.studentName,
        email: input.email,
        telefone: input.phone,
        celular: input.cellphone,
        senha: await hashPassword(input.matricula),
        aluno: { create: { ra: input.matricula, id_curso: idCurso, periodo, ano } },
      },
    });
  } else {
    await prisma.aluno.create({
      data: { cpf, ra: input.matricula, id_curso: idCurso, periodo, ano },
    });
  }
  return cpf;
}

export async function resolveProfessor(
  nome: string,
  email: string,
  dept?: string,
  ramal?: string
): Promise<string> {
  const existing = await prisma.pessoa.findFirst({
    where: { email },
    include: { professor_orientador: true },
  });

  if (existing?.professor_orientador) return existing.cpf;

  const cpf = existing?.cpf || generateNumericHash(email, 11);
  if (!existing) {
    await prisma.pessoa.create({
      data: {
        cpf,
        nome,
        email,
        telefone: ramal || undefined,
        professor_orientador: { create: { departamento: dept || 'DAINF' } },
      },
    });
  } else {
    await prisma.professor_orientador.create({
      data: { cpf, departamento: dept || 'DAINF' },
    });
  }
  return cpf;
}

export async function resolveCompany(nome: string, idCidade: number, phone: string): Promise<string> {
  const existingByName = await prisma.unidade_concedente.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existingByName) return existingByName.cnpj;

  const cnpj = generateNumericHash(nome, 14);
  const existing = await prisma.unidade_concedente.findUnique({ where: { cnpj } });
  if (existing) return cnpj;

  await prisma.unidade_concedente.create({
    data: { cnpj, nome, telefone: phone, id_cidade: idCidade },
  });
  return cnpj;
}

export async function resolveSupervisor(
  nome: string,
  email: string,
  cargo: string,
  cnpj: string,
  phone?: string,
  cellphone?: string
): Promise<string> {
  const existing = await prisma.pessoa.findFirst({
    where: { email },
    include: { supervisor: true },
  });

  if (existing?.supervisor) return existing.cpf;

  const cpf = existing?.cpf || generateNumericHash(email, 11);
  if (!existing) {
    await prisma.pessoa.create({
      data: {
        cpf,
        nome,
        email,
        telefone: phone,
        celular: cellphone,
        supervisor: { create: { cargo, cnpj_uce: cnpj } },
      },
    });
  } else {
    await prisma.supervisor.create({
      data: { cpf, cargo, cnpj_uce: cnpj },
    });
  }
  return cpf;
}
