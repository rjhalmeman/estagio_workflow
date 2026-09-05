import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';

export interface CustomError extends Error {
  statusCode?: number;
}

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): { status: number; message: string } {
  if (err.code === 'P2002') {
    const targets = err.meta?.target as string[] | undefined;
    const targetFields = targets ? targets.join(', ') : 'campo único';
    
    if (targetFields.includes('ra')) {
      return { status: 409, message: 'A matrícula (RA) informada já está cadastrada para outro aluno.' };
    }
    if (targetFields.includes('cpf')) {
      return { status: 409, message: 'O CPF gerado ou informado já está cadastrado no sistema.' };
    }
    if (targetFields.includes('cnpj')) {
      return { status: 409, message: 'O CNPJ/Empresa informado já está cadastrado no sistema.' };
    }
    return { status: 409, message: `Conflito de unicidade no campo: ${targetFields}` };
  }
  if (err.code === 'P2025') {
    return { status: 404, message: 'Registro não encontrado.' };
  }
  return { status: 500, message: err.message };
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let status = err.statusCode || 500;
  let message = err.message || 'Erro interno no servidor.';

  if (message.includes('datas_validas')) {
    status = 400;
    message = 'A data de término do estágio não pode ser anterior à data de início.';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaErr = handlePrismaError(err);
    status = prismaErr.status;
    message = prismaErr.message;
  } else if (err instanceof MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Arquivo excede o tamanho máximo permitido (15MB).'
      : err.message;
  } else if (message.includes('Tipo de arquivo não permitido')) {
    status = 400;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Erro] ${req.method} ${req.path} ->`, err);
  }

  res.status(status).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' && status === 500
      ? 'Ocorreu um erro interno no servidor.'
      : message,
  });
}
