import { Request, Response, NextFunction } from 'express';
import { registerInternship, getStudentInternshipTracking, updateInternship } from '../services/internshipService';

export async function createInternship(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerInternship(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Estágio cadastrado com sucesso!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawCpf = req.params.cpf;
    const cpf = Array.isArray(rawCpf) ? rawCpf[0] : rawCpf;
    const cleanCpf = cpf || '';

    if (cleanCpf.length !== 11) {
      res.status(400).json({
        status: 'error',
        message: 'CPF inválido.',
      });
      return;
    }

    if (req.user?.role === 'aluno' && req.user.cpf !== cleanCpf) {
      res.status(403).json({
        status: 'error',
        message: 'Você só pode acompanhar o próprio estágio.',
      });
      return;
    }

    const data = await getStudentInternshipTracking(cleanCpf);
    if (!data) {
      res.status(404).json({
        status: 'error',
        message: 'Nenhum estágio encontrado para o aluno informado.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateInternshipController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
    const id = parseInt(cleanId || '', 10);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'ID de estágio inválido.' });
      return;
    }

    const data = await updateInternship(id, req.body);
    res.status(200).json({ status: 'success', message: 'Estágio atualizado com sucesso!', data });
  } catch (error) {
    next(error);
  }
}
