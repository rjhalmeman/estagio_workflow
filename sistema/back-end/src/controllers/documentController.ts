import { Request, Response, NextFunction } from 'express';
import { uploadDocument, downloadDocument, updateDocumentStatus } from '../services/documentService';
import { documentTypeSchema } from '../schemas/documentSchema';
import {
  canUserDownloadDocument,
  canUserEvaluateDocument,
  canUserUploadDocument,
} from '../services/authorizationService';

export async function uploadDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.internshipId;
    const internshipId = parseInt((Array.isArray(rawId) ? rawId[0] : rawId) || '', 10);
    if (isNaN(internshipId)) {
      res.status(400).json({ status: 'error', message: 'ID de estágio inválido.' });
      return;
    }

    const docTypeParsed = documentTypeSchema.safeParse(req.body.documentType);
    if (!docTypeParsed.success) {
      res.status(400).json({ status: 'error', message: 'Tipo de documento inválido.' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'Nenhum arquivo enviado.' });
      return;
    }

    const allowed = await canUserUploadDocument(
      internshipId,
      docTypeParsed.data,
      req.user?.cpf || '',
      req.user?.role || ''
    );
    if (!allowed) {
      res.status(403).json({
        status: 'error',
        message: 'Sem permissão para enviar este documento neste estágio.',
      });
      return;
    }

    await uploadDocument(
      internshipId,
      docTypeParsed.data,
      req.file.originalname,
      new Uint8Array(req.file.buffer)
    );
    res.status(200).json({ status: 'success', message: 'Documento enviado com sucesso!' });
  } catch (error) {
    next(error);
  }
}

export async function downloadDoc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.documentId;
    const documentId = parseInt((Array.isArray(rawId) ? rawId[0] : rawId) || '', 10);
    if (isNaN(documentId)) {
      res.status(400).json({ status: 'error', message: 'ID de documento inválido.' });
      return;
    }

    const allowed = await canUserDownloadDocument(
      documentId,
      req.user?.cpf || '',
      req.user?.role || ''
    );
    if (!allowed) {
      res.status(403).json({
        status: 'error',
        message: 'Sem permissão para baixar este documento.',
      });
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
    const documentId = parseInt((Array.isArray(rawId) ? rawId[0] : rawId) || '', 10);
    if (isNaN(documentId)) {
      res.status(400).json({ status: 'error', message: 'ID de documento inválido.' });
      return;
    }

    const allowed = await canUserEvaluateDocument(
      documentId,
      req.user?.cpf || '',
      req.user?.role || ''
    );
    if (!allowed) {
      res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para avaliar documentos deste estágio.',
      });
      return;
    }

    const result = await updateDocumentStatus(documentId, req.body);
    res.status(200).json({ status: 'success', message: 'Status do documento atualizado.', data: result });
  } catch (error) {
    next(error);
  }
}
