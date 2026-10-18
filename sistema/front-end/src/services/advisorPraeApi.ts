import { apiFetch } from './httpClient';
import type { DocumentStatus } from './internshipApi';

export interface AdvisorStudentSummary {
  readonly cpf: string;
  readonly ra: string;
  readonly id_curso?: number;
  readonly cpf_orientador?: string | null;
  readonly pessoa: { readonly nome: string; readonly email: string };
  readonly curso: { readonly id_curso?: number; readonly nome: string };
  readonly professor_orientador?: {
    readonly cpf: string;
    readonly pessoa: { readonly nome: string; readonly email: string };
  } | null;
  readonly estagio: ReadonlyArray<{
    readonly id_estagio: number;
    readonly unidade_concedente: { readonly nome: string };
    readonly documento_estagio: ReadonlyArray<{ readonly status: DocumentStatus }>;
  }>;
}

export interface AdvisorSummary {
  readonly cpf: string;
  readonly departamento: string;
  readonly pessoa: { readonly nome: string; readonly email: string };
  readonly _count: { readonly aluno: number };
}

export interface UnassignedStudent {
  readonly cpf: string;
  readonly ra: string;
  readonly id_curso?: number;
  readonly pessoa: { readonly nome: string; readonly email: string };
  readonly curso: { readonly id_curso?: number; readonly nome: string };
  readonly estagio?: ReadonlyArray<{
    readonly id_estagio: number;
    readonly unidade_concedente: { readonly nome: string };
    readonly documento_estagio: ReadonlyArray<{ readonly status: DocumentStatus }>;
  }>;
}

export async function getAdvisorStudents(cpfOrientador: string): Promise<AdvisorStudentSummary[]> {
  const response = await apiFetch(`/advisors/${cpfOrientador}/students`);
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar alunos orientados.');
  }
  return data.data;
}

export async function getAdvisors(): Promise<AdvisorSummary[]> {
  const response = await apiFetch('/advisors');
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar orientadores.');
  }
  return data.data;
}

export async function getAllPraeStudents(idCurso?: number): Promise<AdvisorStudentSummary[]> {
  const query = idCurso ? `?idCurso=${idCurso}` : '';
  const response = await apiFetch(`/students${query}`);
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar estagiários.');
  }
  return data.data;
}

export async function getUnassignedStudents(idCurso?: number): Promise<UnassignedStudent[]> {
  const query = idCurso ? `?idCurso=${idCurso}` : '';
  const response = await apiFetch(`/students/unassigned${query}`);
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar alunos sem orientador.');
  }
  return data.data;
}

export async function setStudentAdvisor(
  cpfAluno: string,
  cpfOrientador: string | null
): Promise<void> {
  const response = await apiFetch(`/students/${cpfAluno}/advisor`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf_orientador: cpfOrientador }),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao atualizar vínculo do aluno.');
  }
}
