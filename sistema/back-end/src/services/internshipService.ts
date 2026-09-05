import crypto from 'crypto';
import { prisma } from '../config/db';
import { CreateInternshipInput, UpdateInternshipInput } from '../schemas/internshipSchema';
import { hashPassword } from '../utils/password';
import { PESSOA_SAFE_SELECT } from '../utils/prismaSelects';

function generateNumericHash(input: string, length: number): string {
  const digest = crypto.createHash('sha256').update(input).digest('hex');
  const numeric = BigInt(`0x${digest}`).toString().padEnd(length, '0');
  return numeric.slice(0, length);
}

function parseTimeString(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':');
  return new Date(1970, 0, 1, parseInt(hours || '0', 10), parseInt(minutes || '0', 10), 0);
}

async function resolveCidade(nome: string): Promise<number> {
  const existing = await prisma.cidade.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existing) return existing.id_cidade;

  const created = await prisma.cidade.create({
    data: { nome, uf: 'PR' },
  });
  return created.id_cidade;
}

async function resolveCurso(nome: string): Promise<number> {
  const existing = await prisma.curso.findFirst({
    where: { nome: { equals: nome, mode: 'insensitive' } },
  });
  if (existing) return existing.id_curso;

  const created = await prisma.curso.create({
    data: { nome },
  });
  return created.id_curso;
}

async function resolveStudent(input: CreateInternshipInput, idCurso: number): Promise<string> {
  const existing = await prisma.pessoa.findFirst({
    where: { email: input.email },
    include: { aluno: true },
  });

  if (existing?.aluno) return existing.cpf;

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
        aluno: { create: { ra: input.matricula, id_curso: idCurso } },
      },
    });
  } else {
    await prisma.aluno.create({
      data: { cpf, ra: input.matricula, id_curso: idCurso },
    });
  }
  return cpf;
}

async function resolveProfessor(nome: string, email: string, dept?: string): Promise<string> {
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

async function resolveCompany(nome: string, idCidade: number, phone: string): Promise<string> {
  const cnpj = generateNumericHash(nome, 14);
  const existing = await prisma.unidade_concedente.findUnique({
    where: { cnpj },
  });

  if (existing) return cnpj;

  await prisma.unidade_concedente.create({
    data: {
      cnpj,
      nome,
      telefone: phone,
      id_cidade: idCidade,
    },
  });
  return cnpj;
}

async function resolveSupervisor(nome: string, email: string, cargo: string, cnpj: string): Promise<string> {
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

async function createEstagioPlano(
  input: CreateInternshipInput,
  cpfAluno: string,
  cnpjUce: string,
  cpfSup: string,
  cpfOri: string
): Promise<{ idEstagio: number; idPlano: number }> {
  const numeroTermo = generateNumericHash(input.studentName + input.startDate, 10);
  const estagio = await prisma.estagio.create({
    data: {
      numero_termo: numeroTermo,
      tipo: input.stageType === 'obrigatorio' ? 'OBRIGATORIO' : 'NAO_OBRIGATORIO',
      cpf_aluno: cpfAluno,
      cnpj_uce: cnpjUce,
      cpf_supervisor: cpfSup,
      cpf_orientador: cpfOri,
      data_inicio: new Date(input.startDate),
      data_termino: new Date(input.endDate || input.startDate),
      valor_bolsa: 0.00,
      aprovado: false,
    },
  });

  const plano = await prisma.plano_estagio.create({
    data: {
      id_estagio: estagio.id_estagio,
      data_inicio: new Date(input.startDate),
      carga_horaria_semanal: parseInt(input.weeklyHours, 10) || 20,
      carga_horaria_total: parseInt(input.totalHours, 10) || 400,
      atividades: input.sector || 'Desenvolvimento',
    },
  });

  return { idEstagio: estagio.id_estagio, idPlano: plano.id_plano };
}

async function saveSchedule(idPlano: number, schedule: CreateInternshipInput['schedule']): Promise<void> {
  const days: Array<keyof CreateInternshipInput['schedule']> = [
    'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'
  ];

  for (const day of days) {
    const d = schedule[day];
    const start = d.start1 || d.start2;
    const end = d.end2 || d.end1;

    if (start && end) {
      const diaSemanaMap: Record<string, string> = {
        segunda: 'SEGUNDA', terca: 'TERCA', quarta: 'QUARTA',
        quinta: 'QUINTA', sexta: 'SEXTA', sabado: 'SABADO'
      };

      await prisma.plano_horario.create({
        data: {
          id_plano: idPlano,
          dia_semana: diaSemanaMap[day],
          hora_inicio: parseTimeString(start),
          hora_fim: parseTimeString(end),
        },
      });
    }
  }
}

export async function registerInternship(input: CreateInternshipInput): Promise<{ idEstagio: number }> {
  const idCidade = await resolveCidade(input.city);
  const idCurso = await resolveCurso(input.courseName);
  const cpfAluno = await resolveStudent(input, idCurso);
  const cpfOri = await resolveProfessor(input.professorName, input.professorEmail, input.department);
  const cnpjUce = await resolveCompany(input.companyName, idCidade, input.companyPhone);
  const cpfSup = await resolveSupervisor(input.supervisorName, input.companyEmail, input.role, cnpjUce);

  const { idEstagio, idPlano } = await createEstagioPlano(input, cpfAluno, cnpjUce, cpfSup, cpfOri);
  await saveSchedule(idPlano, input.schedule);

  return { idEstagio };
}

export async function updateInternship(id: number, input: UpdateInternshipInput): Promise<any> {
  return prisma.estagio.update({
    where: { id_estagio: id },
    data: input,
  });
}

export async function getStudentInternshipTracking(cpf: string): Promise<any> {
  const estagio = await prisma.estagio.findFirst({
    where: { cpf_aluno: cpf },
    include: {
      aluno: { include: { pessoa: { select: PESSOA_SAFE_SELECT }, curso: true } },
      unidade_concedente: true,
      supervisor: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
      documento_estagio: {
        select: {
          id_documento: true,
          id_estagio: true,
          tipo_documento: true,
          nome_arquivo: true,
          status: true,
          comentario: true,
          data_upload: true,
        },
      },
      plano_estagio: { include: { plano_horario: true } },
    },
    orderBy: { id_estagio: 'desc' },
  });

  return estagio;
}
