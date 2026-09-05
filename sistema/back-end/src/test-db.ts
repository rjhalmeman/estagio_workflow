import { prisma, testDbConnection } from './config/db';

async function main() {
  console.log('Testando conexão...');
  const connected = await testDbConnection();
  console.log('Conectado:', connected);

  if (!connected) return;

  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    console.log('Tabelas encontradas:', tables.map(t => t.tablename));

    const people = await prisma.pessoa.findMany({ take: 5 });
    console.log('Pessoas no banco:', people);
    
    const courses = await prisma.curso.findMany({ take: 5 });
    console.log('Cursos no banco:', courses);
  } catch (err) {
    console.error('Erro ao executar query:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
