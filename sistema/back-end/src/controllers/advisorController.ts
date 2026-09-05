import { Request, Response, NextFunction } from 'express';
import { getAdvisors, getStudentsByAdvisor } from '../services/advisorService';

export async function listAdvisors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAdvisors();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function listAdvisorStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawCpf = req.params.cpf;
    const cpf = Array.isArray(rawCpf) ? rawCpf[0] : rawCpf;
    const cleanCpf = cpf || '';

    if (cleanCpf.length !== 11) {
      res.status(400).json({ status: 'error', message: 'CPF inválido.' });
      return;
    }

    if (req.user?.role === 'professor_orientador' && req.user.cpf !== cleanCpf) {
      res.status(403).json({ status: 'error', message: 'Você só pode ver os próprios alunos.' });
      return;
    }

    const data = await getStudentsByAdvisor(cleanCpf);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}
