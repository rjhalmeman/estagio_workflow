import { z } from 'zod';

const scheduleDaySchema = z.object({
  start1: z.string().default(''),
  end1: z.string().default(''),
  start2: z.string().default(''),
  end2: z.string().default(''),
});

export const scheduleSchema = z.object({
  segunda: scheduleDaySchema,
  terca: scheduleDaySchema,
  quarta: scheduleDaySchema,
  quinta: scheduleDaySchema,
  sexta: scheduleDaySchema,
  sabado: scheduleDaySchema,
});

export const createInternshipSchema = z.object({
  stageType: z.enum(['obrigatorio', 'nao_obrigatorio']),
  studentName: z.string().min(1, 'Nome do aluno é obrigatório.'),
  matricula: z.string().min(1, 'Matrícula é obrigatória.'),
  courseName: z.string().min(1, 'Nome do curso é obrigatório.'),
  periodo: z.string().min(1, 'Período é obrigatório.'),
  ano: z.string().optional(),
  email: z.string().email('E-mail do aluno inválido.').min(1, 'E-mail do aluno é obrigatório.'),
  phone: z.string().min(1, 'Telefone do aluno é obrigatório.'),
  cellphone: z.string().optional(),

  schedule: scheduleSchema,

  companyName: z.string().min(1, 'Nome da empresa é obrigatório.'),
  city: z.string().min(1, 'Cidade é obrigatória.'),
  role: z.string().min(1, 'Cargo é obrigatório.'),
  sector: z.string().optional(),
  supervisorName: z.string().min(1, 'Nome do supervisor é obrigatório.'),
  startDate: z.string().min(1, 'Data de início é obrigatória.'),
  endDate: z.string().optional(),
  companyPhone: z.string().min(1, 'Telefone da empresa é obrigatório.'),
  companyCellphone: z.string().optional(),
  companyEmail: z.string().email('E-mail da empresa inválido.').min(1, 'E-mail da empresa é obrigatório.'),
  weeklyHours: z.string().min(1, 'Carga horária semanal é obrigatória.'),
  totalHours: z.string().min(1, 'Carga horária total é obrigatória.'),

  professorName: z.string().min(1, 'Nome do professor é obrigatório.'),
  department: z.string().optional(),
  professorEmail: z.string().email('E-mail do professor inválido.').min(1, 'E-mail do professor é obrigatório.'),
  ramal: z.string().optional(),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;

export const updateInternshipSchema = z
  .object({
    aprovado: z.boolean().optional(),
    nota_apresentacao: z.number().min(0).max(10).optional(),
    processo_sei: z.string().max(50).optional(),
    valor_bolsa: z.number().min(0).optional(),
    seguro_apolice: z.string().max(50).optional(),
    seguradora: z.string().max(100).optional(),
    beneficios: z.string().max(200).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
