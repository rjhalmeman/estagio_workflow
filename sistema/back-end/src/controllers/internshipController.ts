import { Request, Response, NextFunction } from 'express';
import {
  registerInternship,
  getStudentInternshipTracking,
  updateInternship,
  listAllInternships,
  listInternshipsForExternalRole,
} from '../services/internshipService';
import {
  canStudentRegisterWithEmail,
  canUserEditInternship,
  canUserViewStudentTracking,
} from '../services/authorizationService';

export async function createInternship(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userCpf = req.user?.cpf || '';
    const userRole = req.user?.role || '';
    const allowed = await canStudentRegisterWithEmail(userCpf, userRole, String(req.body?.email || ''));
    if (!allowed) {
      res.status(403).json({
        status: 'error',
        message: 'Você só tem permissão para cadastrar estágio para sua própria conta.',
      });
      return;
    }

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

export async function listInternshipsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawCurso = req.query.idCurso;
    const parsedCurso = typeof rawCurso === 'string' ? parseInt(rawCurso, 10) : NaN;
    const idCurso = Number.isNaN(parsedCurso) ? undefined : parsedCurso;
    const data = await listAllInternships(idCurso);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function listExternalInternshipsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cpf = req.user?.cpf || '';
    const role = req.user?.role || '';
    const data = await listInternshipsForExternalRole(cpf, role);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function getTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawCpf = req.params.cpf;
    const cleanCpf = (Array.isArray(rawCpf) ? rawCpf[0] : rawCpf) || '';
    if (cleanCpf.length !== 11) {
      res.status(400).json({ status: 'error', message: 'CPF inválido.' });
      return;
    }

    const allowed = await canUserViewStudentTracking(
      req.user?.cpf || '',
      req.user?.role || '',
      cleanCpf
    );
    if (!allowed) {
      res.status(403).json({
        status: 'error',
        message: 'Sem permissão para visualizar o acompanhamento deste estágio.',
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
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function updateInternshipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = parseInt((Array.isArray(rawId) ? rawId[0] : rawId) || '', 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'ID de estágio inválido.' });
      return;
    }

    const allowed = await canUserEditInternship(id, req.user?.cpf || '', req.user?.role || '');
    if (!allowed) {
      res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para editar este estágio.',
      });
      return;
    }

    const data = await updateInternship(id, req.body);
    res.status(200).json({ status: 'success', message: 'Estágio atualizado com sucesso!', data });
  } catch (error) {
    next(error);
  }
}
