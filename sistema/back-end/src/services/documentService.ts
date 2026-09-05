import { prisma } from '../config/db';
import { DocumentStatusInput } from '../schemas/documentSchema';

export async function uploadDocument(
  internshipId: number,
  documentType: string,
  filename: string,
  content: Uint8Array
): Promise<void> {
  const arrayBuffer = new ArrayBuffer(content.byteLength);
  const prismaContent = new Uint8Array(arrayBuffer);
  prismaContent.set(content);

  await prisma.documento_estagio.upsert({
    where: {
      id_estagio_tipo_documento: {
        id_estagio: internshipId,
        tipo_documento: documentType,
      },
    },
    update: {
      nome_arquivo: filename,
      conteudo: prismaContent,
      data_upload: new Date(),
      status: 'PENDENTE',
      comentario: null,
    },
    create: {
      id_estagio: internshipId,
      tipo_documento: documentType,
      nome_arquivo: filename,
      conteudo: prismaContent,
    },
  });
}

export async function updateDocumentStatus(
  documentId: number,
  input: DocumentStatusInput
): Promise<{ id_documento: number; status: string; comentario: string | null }> {
  return prisma.documento_estagio.update({
    where: { id_documento: documentId },
    data: {
      status: input.status,
      comentario: input.comentario ?? null,
    },
    select: { id_documento: true, status: true, comentario: true },
  });
}

export async function downloadDocument(
  documentId: number
): Promise<{ filename: string; content: Uint8Array } | null> {
  const doc = await prisma.documento_estagio.findUnique({
    where: { id_documento: documentId },
  });

  if (!doc) {
    return null;
  }

  const arrayBuffer = new ArrayBuffer(doc.conteudo.byteLength);
  const outContent = new Uint8Array(arrayBuffer);
  outContent.set(doc.conteudo);

  return {
    filename: doc.nome_arquivo,
    content: outContent,
  };
}
