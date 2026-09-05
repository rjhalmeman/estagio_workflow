import { Request, Response, NextFunction } from 'express';
import { getUnassignedStudents, setStudentAdvisor } from '../services/studentService';

export async function listUnassignedStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getUnassignedStudents();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function updateStudentAdvisor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawCpf = req.params.cpf;
    const cpf = Array.isArray(rawCpf) ? rawCpf[0] : rawCpf;
    const cleanCpf = cpf || '';

    if (cleanCpf.length !== 11) {
      res.status(400).json({ status: 'error', message: 'CPF inválido.' });
      return;
    }

    const data = await setStudentAdvisor(cleanCpf, req.body.cpf_orientador);
    res.status(200).json({ status: 'success', message: 'Vínculo atualizado com sucesso!', data });
  } catch (error) {
    next(error);
  }
}
