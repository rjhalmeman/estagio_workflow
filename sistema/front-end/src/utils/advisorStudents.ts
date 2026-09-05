import type { AdvisorStudentSummary } from '../services/api';

export interface StudentListItem {
  id: string;
  cpf: string;
  name: string;
  company: string;
  pendingDocs?: number;
}

export function toStudentListItem(student: AdvisorStudentSummary): StudentListItem {
  const activeInternship = student.estagio[0];
  const pendingDocs = activeInternship?.documento_estagio.filter((doc) => doc.status === 'PENDENTE').length ?? 0;

  return {
    id: student.cpf,
    cpf: student.cpf,
    name: student.pessoa.nome,
    company: activeInternship?.unidade_concedente.nome || 'Sem estágio ativo',
    pendingDocs: pendingDocs > 0 ? pendingDocs : undefined,
  };
}
