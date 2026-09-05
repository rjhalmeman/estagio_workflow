import { prisma } from '../config/db';
import { hashPassword, isHashed } from '../utils/password';

async function main(): Promise<void> {
  const pessoas = await prisma.pessoa.findMany({
    where: { senha: { not: null } },
    select: { cpf: true, senha: true },
  });

  let updated = 0;
  for (const pessoa of pessoas) {
    if (!pessoa.senha || isHashed(pessoa.senha)) continue;

    const hashed = await hashPassword(pessoa.senha);
    await prisma.pessoa.update({
      where: { cpf: pessoa.cpf },
      data: { senha: hashed },
    });
    updated++;
  }

  console.log(`Senhas migradas: ${updated} de ${pessoas.length} pessoa(s) com senha cadastrada.`);
}

main()
  .catch((err) => {
    console.error('Falha ao migrar senhas:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
