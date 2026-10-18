import { prisma } from './config/db';
import { hashPassword } from './utils/password';

async function seedLocationAndCourse(): Promise<{ idCidade: number; idCurso: number }> {
  const existingCidade = await prisma.cidade.findFirst({
    where: { nome: 'Curitiba', uf: 'PR' },
  });
  const cidade =
    existingCidade ??
    (await prisma.cidade.create({
      data: { nome: 'Curitiba', uf: 'PR' },
    }));

  const cursoNome = 'Tecnologia em Análise e Desenvolvimento de Sistemas';
  const existingCurso = await prisma.curso.findFirst({
    where: { nome: cursoNome },
  });
  const curso =
    existingCurso ??
    (await prisma.curso.create({
      data: { nome: cursoNome },
    }));

  return { idCidade: cidade.id_cidade, idCurso: curso.id_curso };
}

async function seedStudent(idCurso: number, passwordHash: string): Promise<void> {
  await prisma.pessoa.upsert({
    where: { cpf: '11111111111' },
    update: { senha: passwordHash },
    create: {
      cpf: '11111111111',
      nome: 'Aluno de Teste',
      email: 'aluno@alunos.utfpr.edu.br',
      telefone: '4133333333',
      celular: '41999999999',
      senha: passwordHash,
      aluno: {
        create: {
          ra: '1234567',
          id_curso: idCurso,
        },
      },
    },
  });
}

async function seedProfessors(idCurso: number, passwordHash: string): Promise<void> {
  await prisma.pessoa.upsert({
    where: { cpf: '22222222222' },
    update: { senha: passwordHash },
    create: {
      cpf: '22222222222',
      nome: 'Professor Orientador Teste',
      email: 'orientador@utfpr.edu.br',
      senha: passwordHash,
      professor_orientador: {
        create: {
          departamento: 'DAINF',
        },
      },
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: '33333333333' },
    update: { senha: passwordHash },
    create: {
      cpf: '33333333333',
      nome: 'Professor PRAE Teste',
      email: 'prae@utfpr.edu.br',
      senha: passwordHash,
      professor_prae: {
        create: {
          id_curso: idCurso,
        },
      },
    },
  });
}

async function seedCompany(idCidade: number, passwordHash: string): Promise<void> {
  const cnpj = '12345678000199';
  await prisma.unidade_concedente.upsert({
    where: { cnpj },
    update: {},
    create: {
      cnpj,
      nome: 'Empresa Tecnologia Ltda',
      telefone: '4132222222',
      endereco: 'Rua das Flores, 123',
      id_cidade: idCidade,
    },
  });

  await prisma.pessoa.upsert({
    where: { cpf: '44444444444' },
    update: { senha: passwordHash },
    create: {
      cpf: '44444444444',
      nome: 'Supervisor Teste',
      email: 'supervisor@empresa.com',
      senha: passwordHash,
      supervisor: {
        create: {
          cargo: 'Gerente de TI',
          cnpj_uce: cnpj,
        },
      },
    },
  });
}

async function main(): Promise<void> {
  console.log('Iniciando o seeding do banco de dados...');
  try {
    const passwordHash = await hashPassword('senha');
    const { idCidade, idCurso } = await seedLocationAndCourse();
    await seedStudent(idCurso, passwordHash);
    await seedProfessors(idCurso, passwordHash);
    await seedCompany(idCidade, passwordHash);
    console.log('Seeding concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
