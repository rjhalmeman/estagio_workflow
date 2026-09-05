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

export const validateCompany = (data: InternshipFormData) => {
  const errors: Record<string, string> = {};
  if (!data.companyName.trim()) errors.companyName = 'Nome da empresa é obrigatório.';
  if (!data.city.trim()) errors.city = 'Cidade é obrigatória.';
  if (!data.role.trim()) errors.role = 'Cargo é obrigatório.';
  if (!data.supervisorName.trim()) errors.supervisorName = 'Nome do supervisor é obrigatório.';
  if (!data.startDate) errors.startDate = 'Data de início é obrigatória.';
  
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
  return errors;
};

export const validateSchedule = (schedule: InternshipSchedule) => {
  const errors: Record<string, string> = {};
  const days: (keyof InternshipSchedule)[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  
  days.forEach((day) => {
    const d = schedule[day];
    if (d.start1 && !isValidTime(d.start1)) errors[`${day}.start1`] = 'Horário inválido.';
    if (d.end1 && !isValidTime(d.end1)) errors[`${day}.end1`] = 'Horário inválido.';
    if (d.start2 && !isValidTime(d.start2)) errors[`${day}.start2`] = 'Horário inválido.';
    if (d.end2 && !isValidTime(d.end2)) errors[`${day}.end2`] = 'Horário inválido.';
  });
  
  return errors;
};
