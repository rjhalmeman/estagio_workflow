import type { InternshipFormData, InternshipSchedule } from '../types/internship';
import { isValidTime } from './masks';

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateStudent = (data: InternshipFormData) => {
  const errors: Record<string, string> = {};
  if (!data.stageType) errors.stageType = 'Selecione o tipo de estágio.';
  if (!data.studentName.trim()) errors.studentName = 'Nome do aluno é obrigatório.';
  if (!data.matricula.trim()) errors.matricula = 'Matrícula é obrigatória.';
  if (!data.courseName.trim()) errors.courseName = 'Nome do curso é obrigatório.';
  if (!data.periodo) errors.periodo = 'Período é obrigatório.';
  
  if (!data.email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'E-mail inválido.';
  }
  
  if (!data.phone.trim()) {
    errors.phone = 'Telefone é obrigatório.';
  } else if (data.phone.length < 14) {
    errors.phone = 'Telefone incompleto (mínimo 10 dígitos com DDD).';
  }
  return errors;
};

export const validateProfessor = (data: InternshipFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.professorName?.trim()) {
    errors.professorName = 'Nome do professor é obrigatório.';
  }
  if (!data.professorEmail?.trim()) {
    errors.professorEmail = 'E-mail do professor é obrigatório.';
  } else if (!validateEmail(data.professorEmail)) {
    errors.professorEmail = 'E-mail do professor inválido.';
  }
  return errors;
};

export const validateCompany = (data: InternshipFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.companyName.trim()) errors.companyName = 'Nome da empresa é obrigatório.';
  if (!data.city.trim()) errors.city = 'Cidade é obrigatória.';
  if (!data.role.trim()) errors.role = 'Cargo é obrigatório.';
  if (!data.supervisorName.trim()) errors.supervisorName = 'Nome do supervisor é obrigatório.';
  if (!data.startDate) errors.startDate = 'Data de início é obrigatória.';
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.endDate = 'A data de término deve ser posterior à data de início.';
  }

  if (!data.companyPhone.trim()) {
    errors.companyPhone = 'Telefone é obrigatório.';
  } else if (data.companyPhone.length < 14) {
    errors.companyPhone = 'Telefone incompleto.';
  }

  if (!data.companyEmail.trim()) {
    errors.companyEmail = 'E-mail é obrigatório.';
  } else if (!validateEmail(data.companyEmail)) {
    errors.companyEmail = 'E-mail inválido.';
  }

  if (!data.weeklyHours.trim()) errors.weeklyHours = 'Carga horária é obrigatória.';
  if (!data.totalHours.trim()) errors.totalHours = 'Carga horária total é obrigatória.';

  if ('professorName' in data || 'professorEmail' in data) {
    Object.assign(errors, validateProfessor(data));
  }
  return errors;
};

function validateShiftPair(
  day: string,
  startKey: string,
  endKey: string,
  startVal: string,
  endVal: string,
  errors: Record<string, string>
): void {
  if (startVal && !isValidTime(startVal)) errors[`${day}.${startKey}`] = 'Horário inválido.';
  if (endVal && !isValidTime(endVal)) errors[`${day}.${endKey}`] = 'Horário inválido.';
  if (startVal && !endVal) errors[`${day}.${endKey}`] = 'Informe o horário de saída.';
  if (!startVal && endVal) errors[`${day}.${startKey}`] = 'Informe o horário de entrada.';
  if (startVal && endVal && isValidTime(startVal) && isValidTime(endVal) && endVal <= startVal) {
    errors[`${day}.${endKey}`] = 'Saída deve ser após a entrada.';
  }
}

export const validateSchedule = (schedule: InternshipSchedule): Record<string, string> => {
  const errors: Record<string, string> = {};
  const days: ReadonlyArray<keyof InternshipSchedule> = [
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
  ];

  days.forEach((day) => {
    const d = schedule[day];
    validateShiftPair(day, 'start1', 'end1', d.start1, d.end1, errors);
    validateShiftPair(day, 'start2', 'end2', d.start2, d.end2, errors);
  });

  return errors;
};
