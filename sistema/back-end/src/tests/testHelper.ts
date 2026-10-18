import { Server } from 'http';
import { AddressInfo } from 'net';
import { app } from '../app';
import { prisma } from '../config/db';
import { hashPassword } from '../utils/password';

export interface TestContext {
  readonly baseUrl: string;
  readonly server: Server;
  readonly idCurso: number;
  readonly idCidade: number;
  readonly cnpjUce: string;
}

export const TEST_CPFS = {
  student: '90000000001',
  otherStudent: '90000000002',
  advisor: '90000000003',
  otherAdvisor: '90000000004',
  prae: '90000000005',
  supervisor: '90000000006',
} as const;

export async function setupTestEnvironment(): Promise<TestContext> {
  const pwd = await hashPassword('Senha123!');
  const cidade =
    (await prisma.cidade.findFirst({ where: { nome: 'CidadeTeste' } })) ??
    (await prisma.cidade.create({ data: { nome: 'CidadeTeste', uf: 'PR' } }));

  const curso = await prisma.curso.upsert({
    where: { nome: 'Curso Engenharia de Software Teste' },
    update: {},
    create: { nome: 'Curso Engenharia de Software Teste' },
  });

  const cnpjUce = '99887766000155';
  await prisma.unidade_concedente.upsert({
    where: { cnpj: cnpjUce },
    update: {},
    create: {
      cnpj: cnpjUce,
      nome: 'Empresa Teste QA',
      telefone: '4133334444',
      id_cidade: cidade.id_cidade,
    },
  });

  await seedTestUsers(pwd, curso.id_curso, cnpjUce);

  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const addr = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${addr.port}/api`,
    server,
    idCurso: curso.id_curso,
    idCidade: cidade.id_cidade,
    cnpjUce,
  };
}

async function seedTestUsers(pwd: string, idCurso: number, cnpjUce: string): Promise<void> {
  await prisma.pessoa.upsert({
    where: { cpf: TEST_CPFS.student },
    update: { senha: pwd },
    create: {
      cpf: TEST_CPFS.student,
      nome: 'Aluno QA 1',
      email: 'aluno.qa1@utfpr.edu.br',
      telefone: '(41) 3333-1111',
      senha: pwd,
      aluno: { create: { ra: 'QA90001', id_curso: idCurso, periodo: 5, ano: 2026 } },
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: TEST_CPFS.otherStudent },
    update: { senha: pwd },
    create: {
      cpf: TEST_CPFS.otherStudent,
      nome: 'Aluno QA 2',
      email: 'aluno.qa2@utfpr.edu.br',
      senha: pwd,
      aluno: { create: { ra: 'QA90002', id_curso: idCurso } },
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: TEST_CPFS.advisor },
    update: { senha: pwd },
    create: {
      cpf: TEST_CPFS.advisor,
      nome: 'Orientador QA 1',
      email: 'orientador.qa1@utfpr.edu.br',
      senha: pwd,
      professor_orientador: { create: { departamento: 'DAINF' } },
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: TEST_CPFS.otherAdvisor },
    update: { senha: pwd },
    create: {
      cpf: TEST_CPFS.otherAdvisor,
      nome: 'Orientador QA 2',
      email: 'orientador.qa2@utfpr.edu.br',
      senha: pwd,
      professor_orientador: { create: { departamento: 'DAINF' } },
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: TEST_CPFS.prae },
    update: { senha: pwd },
    create: {
      cpf: TEST_CPFS.prae,
      nome: 'PRAE QA',
      email: 'prae.qa@utfpr.edu.br',
      senha: pwd,
      professor_prae: { create: { id_curso: idCurso } },
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: TEST_CPFS.supervisor },
    update: { senha: pwd },
    create: {
      cpf: TEST_CPFS.supervisor,
      nome: 'Supervisor QA',
      email: 'supervisor.qa@empresa.com',
      senha: pwd,
      supervisor: { create: { cargo: 'Tech Lead', cnpj_uce: cnpjUce } },
    },
  });
}

export async function loginAs(
  baseUrl: string,
  email: string,
  password = 'Senha123!'
): Promise<{ token: string; cookie: string; status: number }> {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get('set-cookie') || '';
  const body = await res.json();
  return { token: body.token || '', cookie, status: res.status };
}
