import type { InternshipFormData } from '../types/internship';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface HealthCheckResponse {
  status: string;
  database: string;
  timestamp: string;
}

export interface AuthUser {
  cpf: string;
  nome: string;
  email: string;
  role: 'aluno' | 'professor_orientador' | 'professor_prae' | 'supervisor' | 'representante_uce' | 'visitante';
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  data?: AuthUser;
  token?: string;
}

let authToken: string | null = null;

export function logoutUser(): void {
  authToken = null;
}

function authHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

export async function fetchHealthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Falha ao conectar com o servidor back-end.');
  }
  return response.json();
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();
  if (!response.ok || data.status === 'error' || !data.data || !data.token) {
    throw new Error(data.message || 'Email ou senha inválidos.');
  }
  authToken = data.token;
  return data.data;
}

export async function registerInternship(formData: InternshipFormData): Promise<{ idEstagio: number }> {
  const response = await fetch(`${API_BASE_URL}/internships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(formData),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao cadastrar estágio.');
  }
  return data.data;
}

export type DocumentType =
  | 'PLANO_ESTAGIO'
  | 'RELATORIO_PARCIAL_1'
  | 'RELATORIO_PARCIAL_2'
  | 'RELATORIO_PARCIAL_3'
  | 'RELATORIO_PARCIAL_4'
  | 'RELATORIO_SUPERVISOR'
  | 'RELATORIO_VISITA'
  | 'RELATORIO_FINAL'
  | 'SINTESE_AVALIACOES';

export type DocumentStatus = 'PENDENTE' | 'APROVADO' | 'REPROVADO';

export interface InternshipDocument {
  id_documento: number;
  id_estagio: number;
  tipo_documento: DocumentType;
  nome_arquivo: string;
  status: DocumentStatus;
  comentario: string | null;
  data_upload: string;
}

export interface InternshipTracking {
  id_estagio: number;
  numero_termo: string;
  tipo: string;
  data_inicio: string;
  data_termino: string;
  aprovado: boolean;
  aluno: { pessoa: { nome: string; email: string }; curso: { nome: string } };
  unidade_concedente: { nome: string };
  documento_estagio: InternshipDocument[];
}

export async function getInternshipTracking(cpf: string): Promise<InternshipTracking | null> {
  const response = await fetch(`${API_BASE_URL}/internships/student/${cpf}`, {
    headers: authHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar acompanhamento do estágio.');
  }
  return data.data;
}

export interface AdvisorStudentSummary {
  cpf: string;
  ra: string;
  pessoa: { nome: string; email: string };
  curso: { nome: string };
  estagio: Array<{
    id_estagio: number;
    unidade_concedente: { nome: string };
    documento_estagio: Array<{ status: DocumentStatus }>;
  }>;
}

export async function getAdvisorStudents(cpfOrientador: string): Promise<AdvisorStudentSummary[]> {
  const response = await fetch(`${API_BASE_URL}/advisors/${cpfOrientador}/students`, {
    headers: authHeaders(),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar alunos orientados.');
  }
  return data.data;
}

export async function uploadDocument(
  internshipId: number,
  documentType: DocumentType,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/documents/${internshipId}/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao enviar documento.');
  }
}
