import { Request, Response, NextFunction } from 'express';
import { uploadDocument, downloadDocument, updateDocumentStatus } from '../services/documentService';
import { documentTypeSchema } from '../schemas/documentSchema';

export async function uploadDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.internshipId;
    const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
    const internshipId = parseInt(cleanId || '', 10);

    if (isNaN(internshipId)) {
      res.status(400).json({ status: 'error', message: 'ID de estágio inválido.' });
      return;
    }

    const { documentType } = req.body;
    const docTypeParsed = documentTypeSchema.safeParse(documentType);
    if (!docTypeParsed.success) {
      res.status(400).json({ status: 'error', message: 'Tipo de documento inválido.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'Nenhum arquivo enviado.' });
      return;
    }

    const fileContent = new Uint8Array(req.file.buffer);
    await uploadDocument(internshipId, docTypeParsed.data, req.file.originalname, fileContent);
    res.status(200).json({ status: 'success', message: 'Documento enviado com sucesso!' });
  } catch (error) {
    next(error);
  }
}

export async function downloadDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.documentId;
    const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
    const documentId = parseInt(cleanId || '', 10);

    if (isNaN(documentId)) {
      res.status(400).json({ status: 'error', message: 'ID de documento inválido.' });
      return;
    }

    const result = await downloadDocument(documentId);
    if (!result) {
      res.status(404).json({ status: 'error', message: 'Documento não encontrado.' });
      return;
    }

    const encodedFilename = encodeURIComponent(result.filename);
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(Buffer.from(result.content));
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.documentId;
    const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
    const documentId = parseInt(cleanId || '', 10);

    if (isNaN(documentId)) {
      res.status(400).json({ status: 'error', message: 'ID de documento inválido.' });
      return;
    }

    const result = await updateDocumentStatus(documentId, req.body);
    res.status(200).json({ status: 'success', message: 'Status do documento atualizado.', data: result });
  } catch (error) {
    next(error);
  }
}
