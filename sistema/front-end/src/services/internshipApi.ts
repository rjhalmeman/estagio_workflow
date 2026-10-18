import type { InternshipFormData } from '../types/internship';
import { apiFetch } from './httpClient';

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
  readonly id_documento: number;
  readonly id_estagio: number;
  readonly tipo_documento: DocumentType;
  readonly nome_arquivo: string;
  readonly status: DocumentStatus;
  readonly comentario: string | null;
  readonly data_upload: string;
}

export interface InternshipTracking {
  readonly id_estagio: number;
  readonly numero_termo: string;
  readonly tipo: string;
  readonly data_inicio: string;
  readonly data_termino: string;
  readonly aprovado: boolean;
  readonly valor_bolsa?: number | string;
  readonly beneficios?: string | null;
  readonly seguro_apolice?: string | null;
  readonly seguradora?: string | null;
  readonly processo_sei?: string | null;
  readonly nota_apresentacao?: number | string | null;
  readonly aluno: {
    readonly cpf?: string;
    readonly pessoa: { readonly nome: string; readonly email: string };
    readonly curso: { readonly nome: string };
  };
  readonly unidade_concedente: { readonly nome: string };
  readonly professor_orientador?: {
    readonly pessoa: { readonly nome: string; readonly email: string };
  };
  readonly documento_estagio: readonly InternshipDocument[];
}

export interface UpdateInternshipPayload {
  readonly aprovado?: boolean;
  readonly nota_apresentacao?: number;
  readonly processo_sei?: string;
  readonly valor_bolsa?: number;
  readonly seguro_apolice?: string;
  readonly seguradora?: string;
  readonly beneficios?: string;
}

export async function registerInternship(
  formData: InternshipFormData
): Promise<{ idEstagio: number }> {
  const response = await apiFetch('/internships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao cadastrar estágio.');
  }
  return data.data;
}

export async function getInternshipTracking(cpf: string): Promise<InternshipTracking | null> {
  const response = await apiFetch(`/internships/student/${cpf}`);
  if (response.status === 404) return null;

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar acompanhamento do estágio.');
  }
  return data.data;
}

export async function updateInternshipDetails(
  idEstagio: number,
  payload: UpdateInternshipPayload
): Promise<void> {
  const response = await apiFetch(`/internships/${idEstagio}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao atualizar dados do estágio.');
  }
}

export async function getInternships(idCurso?: number): Promise<InternshipTracking[]> {
  const query = idCurso ? `?idCurso=${idCurso}` : '';
  const response = await apiFetch(`/internships${query}`);
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao listar estágios.');
  }
  return data.data;
}

export async function getExternalRoleInternships(): Promise<InternshipTracking[]> {
  const response = await apiFetch('/internships/external/my-list');
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao buscar estágios vinculados.');
  }
  return data.data;
}

export async function updateDocumentStatus(
  documentId: number,
  status: Exclude<DocumentStatus, 'PENDENTE'>,
  comentario?: string
): Promise<InternshipDocument> {
  const response = await apiFetch(`/documents/${documentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, comentario }),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao atualizar status do documento.');
  }
  return data.data;
}

export async function downloadDocument(documentId: number): Promise<Blob> {
  const response = await apiFetch(`/documents/${documentId}/download`);
  if (!response.ok) {
    throw new Error('Erro ao baixar documento.');
  }
  return response.blob();
}

export async function uploadDocument(
  internshipId: number,
  documentType: DocumentType,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);

  const response = await apiFetch(`/documents/${internshipId}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao enviar documento.');
  }
}
