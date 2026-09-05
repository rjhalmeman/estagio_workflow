import { prisma } from './config/db';

async function seedLocationAndCourse(): Promise<{ idCidade: number; idCurso: number }> {
  const cidade = await prisma.cidade.create({
    data: { nome: 'Curitiba', uf: 'PR' },
  });

  const curso = await prisma.curso.create({
    data: { nome: 'Tecnologia em Análise e Desenvolvimento de Sistemas' },
  });

  return { idCidade: cidade.id_cidade, idCurso: curso.id_curso };
}

async function seedStudent(idCurso: number): Promise<void> {
  await prisma.pessoa.create({
    data: {
      cpf: '11111111111',
      nome: 'Aluno de Teste',
      email: 'aluno@alunos.utfpr.edu.br',
      telefone: '4133333333',
      celular: '41999999999',
      senha: 'senha',
      aluno: {
        create: {
          ra: '1234567',
          id_curso: idCurso,
        },
      },
    },
  });
}

async function seedProfessors(idCurso: number): Promise<void> {
  await prisma.pessoa.create({
    data: {
      cpf: '22222222222',
      nome: 'Professor Orientador Teste',
      email: 'orientador@utfpr.edu.br',
      senha: 'senha',
      professor_orientador: {
        create: {
          departamento: 'DAINF',
        },
      },
    },
  });

  await prisma.pessoa.create({
    data: {
      cpf: '33333333333',
      nome: 'Professor PRAE Teste',
      email: 'prae@utfpr.edu.br',
      senha: 'senha',
      professor_prae: {
        create: {
          id_curso: idCurso,
        },
      },
    },
  });
}

async function seedCompany(idCidade: number): Promise<void> {
  const cnpj = '12345678000199';
  await prisma.unidade_concedente.create({
    data: {
      cnpj,
      nome: 'Empresa Tecnologia Ltda',
      telefone: '4132222222',
      endereco: 'Rua das Flores, 123',
      id_cidade: idCidade,
    },
  });

  await prisma.pessoa.create({
    data: {
      cpf: '44444444444',
      nome: 'Supervisor Teste',
      email: 'supervisor@empresa.com',
      senha: 'senha',
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
    const { idCidade, idCurso } = await seedLocationAndCourse();
    await seedStudent(idCurso);
    await seedProfessors(idCurso);
    await seedCompany(idCidade);
    console.log('Seeding concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
