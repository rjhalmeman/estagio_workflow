import { prisma } from '../config/db';

export async function canStudentRegisterWithEmail(
  userCpf: string,
  userRole: string,
  targetEmail: string
): Promise<boolean> {
  if (userRole === 'professor_prae') return true;
  if (userRole !== 'aluno') return false;

  const person = await prisma.pessoa.findUnique({ where: { cpf: userCpf } });
  if (!person) return false;

  return person.email.trim().toLowerCase() === targetEmail.trim().toLowerCase();
}

export async function canUserEditInternship(
  idEstagio: number,
  userCpf: string,
  userRole: string
): Promise<boolean> {
  if (userRole === 'professor_prae') return true;
  if (userRole !== 'professor_orientador') return false;

  const estagio = await prisma.estagio.findUnique({
    where: { id_estagio: idEstagio },
    include: { aluno: true },
  });
  if (!estagio) return false;

  const cleanUser = userCpf.trim();
  return (
    estagio.cpf_orientador?.trim() === cleanUser ||
    estagio.aluno.cpf_orientador?.trim() === cleanUser
  );
}

export async function canUserViewStudentTracking(
  userCpf: string,
  userRole: string,
  targetCpf: string
): Promise<boolean> {
  const cleanUser = userCpf.trim();
  const cleanTarget = targetCpf.trim();

  if (userRole === 'professor_prae') return true;
  if (userRole === 'aluno') return cleanUser === cleanTarget;

  const estagio = await prisma.estagio.findFirst({
    where: { cpf_aluno: cleanTarget },
    include: { aluno: true },
    orderBy: { id_estagio: 'desc' },
  });
  if (!estagio) return false;

  if (userRole === 'professor_orientador') {
    return (
      estagio.cpf_orientador?.trim() === cleanUser ||
      estagio.aluno.cpf_orientador?.trim() === cleanUser
    );
  }
  if (userRole === 'supervisor') {
    return estagio.cpf_supervisor.trim() === cleanUser;
  }
  if (userRole === 'representante_uce') {
    const rep = await prisma.representante_uce.findUnique({ where: { cpf: cleanUser } });
    return Boolean(rep && rep.cnpj_uce.trim() === estagio.cnpj_uce.trim());
  }
  return false;
}

export async function canUserUploadDocument(
  idEstagio: number,
  documentType: string,
  userCpf: string,
  userRole: string
): Promise<boolean> {
  const estagio = await prisma.estagio.findUnique({ where: { id_estagio: idEstagio } });
  if (!estagio) return false;
  if (userRole === 'professor_prae') return true;

  const cleanUser = userCpf.trim();
  if (userRole === 'aluno') {
    return estagio.cpf_aluno.trim() === cleanUser && documentType !== 'RELATORIO_SUPERVISOR';
  }
  if (userRole === 'supervisor') {
    return estagio.cpf_supervisor.trim() === cleanUser && documentType === 'RELATORIO_SUPERVISOR';
  }
  return false;
}

export async function canUserDownloadDocument(
  documentId: number,
  userCpf: string,
  userRole: string
): Promise<boolean> {
  const doc = await prisma.documento_estagio.findUnique({
    where: { id_documento: documentId },
    include: { estagio: true },
  });
  if (!doc) return true;
  return canUserViewStudentTracking(userCpf, userRole, doc.estagio.cpf_aluno);
}

export async function canUserEvaluateDocument(
  documentId: number,
  userCpf: string,
  userRole: string
): Promise<boolean> {
  const doc = await prisma.documento_estagio.findUnique({
    where: { id_documento: documentId },
  });
  if (!doc) return false;
  return canUserEditInternship(doc.id_estagio, userCpf, userRole);
}
