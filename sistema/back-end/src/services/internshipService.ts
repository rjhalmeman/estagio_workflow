import { prisma } from '../config/db';
import { CreateInternshipInput, UpdateInternshipInput } from '../schemas/internshipSchema';
import { PESSOA_SAFE_SELECT } from '../utils/prismaSelects';
import {
  generateNumericHash,
  parseTimeString,
  resolveCidade,
  resolveCompany,
  resolveCurso,
  resolveProfessor,
  resolveStudent,
  resolveSupervisor,
} from './internshipResolvers';

const DOCUMENT_SUMMARY_SELECT = {
  id_documento: true,
  id_estagio: true,
  tipo_documento: true,
  nome_arquivo: true,
  status: true,
  comentario: true,
  data_upload: true,
} as const;

const DIA_SEMANA_MAP: Record<keyof CreateInternshipInput['schedule'], string> = {
  segunda: 'SEGUNDA',
  terca: 'TERCA',
  quarta: 'QUARTA',
  quinta: 'QUINTA',
  sexta: 'SEXTA',
  sabado: 'SABADO',
};

const SCHEDULE_DAYS: ReadonlyArray<keyof CreateInternshipInput['schedule']> = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
];

function resolveEndDate(startDateStr: string, endDateStr?: string): Date {
  if (endDateStr && endDateStr.trim() !== '') return new Date(endDateStr);
  const fallback = new Date(startDateStr);
  fallback.setMonth(fallback.getMonth() + 6);
  return fallback;
}

function buildScheduleRows(
  idPlano: number,
  schedule: CreateInternshipInput['schedule']
): Array<{ id_plano: number; dia_semana: string; turno: number; hora_inicio: Date; hora_fim: Date }> {
  const rows: Array<{ id_plano: number; dia_semana: string; turno: number; hora_inicio: Date; hora_fim: Date }> = [];
  for (const day of SCHEDULE_DAYS) {
    const d = schedule[day];
    const dia = DIA_SEMANA_MAP[day];
    if (d.start1 && d.end1) {
      rows.push({ id_plano: idPlano, dia_semana: dia, turno: 1, hora_inicio: parseTimeString(d.start1), hora_fim: parseTimeString(d.end1) });
    }
    if (d.start2 && d.end2) {
      rows.push({ id_plano: idPlano, dia_semana: dia, turno: 2, hora_inicio: parseTimeString(d.start2), hora_fim: parseTimeString(d.end2) });
    }
  }
  return rows;
}

async function createEstagioTransaction(
  input: CreateInternshipInput,
  cpfAluno: string,
  cnpjUce: string,
  cpfSup: string,
  cpfOri: string
): Promise<{ idEstagio: number }> {
  const numeroTermo = generateNumericHash(input.studentName + input.startDate + Date.now(), 10);
  const startDate = new Date(input.startDate);
  const endDate = resolveEndDate(input.startDate, input.endDate);

  return prisma.$transaction(async (tx) => {
    const estagio = await tx.estagio.create({
      data: {
        numero_termo: numeroTermo,
        tipo: input.stageType === 'obrigatorio' ? 'OBRIGATORIO' : 'NAO_OBRIGATORIO',
        cpf_aluno: cpfAluno,
        cnpj_uce: cnpjUce,
        cpf_supervisor: cpfSup,
        cpf_orientador: cpfOri,
        data_inicio: startDate,
        data_termino: endDate,
        valor_bolsa: 0.0,
        aprovado: false,
      },
    });
    const plano = await tx.plano_estagio.create({
      data: {
        id_estagio: estagio.id_estagio,
        data_inicio: startDate,
        data_fim: input.endDate ? new Date(input.endDate) : null,
        carga_horaria_semanal: parseInt(input.weeklyHours, 10) || 20,
        carga_horaria_total: parseInt(input.totalHours, 10) || 400,
        atividades: input.sector || 'Desenvolvimento',
      },
    });
    const rows = buildScheduleRows(plano.id_plano, input.schedule);
    if (rows.length > 0) await tx.plano_horario.createMany({ data: rows });
    return { idEstagio: estagio.id_estagio };
  });
}

export async function registerInternship(
  input: CreateInternshipInput
): Promise<{ idEstagio: number }> {
  const idCidade = await resolveCidade(input.city);
  const idCurso = await resolveCurso(input.courseName);
  const cpfAluno = await resolveStudent(input, idCurso);
  const cpfOri = await resolveProfessor(
    input.professorName,
    input.professorEmail,
    input.department,
    input.ramal
  );
  const cnpjUce = await resolveCompany(input.companyName, idCidade, input.companyPhone);
  const cpfSup = await resolveSupervisor(
    input.supervisorName,
    input.companyEmail,
    input.role,
    cnpjUce,
    input.companyPhone,
    input.companyCellphone
  );

  return createEstagioTransaction(input, cpfAluno, cnpjUce, cpfSup, cpfOri);
}

export async function updateInternship(id: number, input: UpdateInternshipInput): Promise<unknown> {
  return prisma.estagio.update({
    where: { id_estagio: id },
    data: input,
  });
}

export async function getStudentInternshipTracking(cpf: string): Promise<unknown> {
  return prisma.estagio.findFirst({
    where: { cpf_aluno: cpf },
    include: {
      aluno: { include: { pessoa: { select: PESSOA_SAFE_SELECT }, curso: true } },
      unidade_concedente: true,
      supervisor: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
      professor_orientador: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
      documento_estagio: { select: DOCUMENT_SUMMARY_SELECT },
      plano_estagio: { include: { plano_horario: true } },
    },
    orderBy: { id_estagio: 'desc' },
  });
}

export async function listAllInternships(idCurso?: number): Promise<unknown> {
  return prisma.estagio.findMany({
    where: idCurso ? { aluno: { id_curso: idCurso } } : undefined,
    include: {
      aluno: { include: { pessoa: { select: PESSOA_SAFE_SELECT }, curso: true } },
      unidade_concedente: true,
      professor_orientador: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
      documento_estagio: { select: DOCUMENT_SUMMARY_SELECT },
    },
    orderBy: { id_estagio: 'desc' },
  });
}

export async function listInternshipsForExternalRole(cpf: string, role: string): Promise<unknown> {
  if (role === 'supervisor') {
    return prisma.estagio.findMany({
      where: { cpf_supervisor: cpf },
      include: {
        aluno: { include: { pessoa: { select: PESSOA_SAFE_SELECT }, curso: true } },
        unidade_concedente: true,
        professor_orientador: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
        documento_estagio: { select: DOCUMENT_SUMMARY_SELECT },
      },
      orderBy: { id_estagio: 'desc' },
    });
  }

  const rep = await prisma.representante_uce.findUnique({ where: { cpf } });
  if (!rep) return [];

  return prisma.estagio.findMany({
    where: { cnpj_uce: rep.cnpj_uce },
    include: {
      aluno: { include: { pessoa: { select: PESSOA_SAFE_SELECT }, curso: true } },
      unidade_concedente: true,
      professor_orientador: { include: { pessoa: { select: PESSOA_SAFE_SELECT } } },
      documento_estagio: { select: DOCUMENT_SUMMARY_SELECT },
    },
    orderBy: { id_estagio: 'desc' },
  });
}
