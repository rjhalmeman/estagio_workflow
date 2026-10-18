import { apiFetch } from './httpClient';

export interface CourseOption {
  readonly id_curso: number;
  readonly nome: string;
}

export interface CityOption {
  readonly id_cidade: number;
  readonly nome: string;
  readonly uf: string;
}

export interface CompanyOption {
  readonly cnpj: string;
  readonly nome: string;
  readonly telefone: string | null;
  readonly cidade: CityOption;
}

export interface AdvisorOption {
  readonly cpf: string;
  readonly departamento: string | null;
  readonly pessoa: {
    readonly nome: string;
    readonly email: string;
    readonly telefone: string | null;
  };
}

export interface CatalogOptions {
  readonly courses: readonly CourseOption[];
  readonly cities: readonly CityOption[];
  readonly companies: readonly CompanyOption[];
  readonly advisors: readonly AdvisorOption[];
}

export interface UserProfileDetails {
  readonly cpf: string;
  readonly nome: string;
  readonly email: string;
  readonly telefone: string | null;
  readonly celular: string | null;
  readonly aluno?: {
    readonly ra: string;
    readonly id_curso: number;
    readonly periodo?: number | null;
    readonly ano?: number | null;
    readonly curso: CourseOption;
  } | null;
  readonly professor_prae?: {
    readonly id_curso: number;
    readonly curso: CourseOption;
  } | null;
  readonly supervisor?: {
    readonly cargo: string;
    readonly unidade_concedente: CompanyOption;
  } | null;
  readonly representante_uce?: {
    readonly cargo: string;
    readonly unidade_concedente: CompanyOption;
  } | null;
}

export async function getCurrentProfile(): Promise<UserProfileDetails> {
  const response = await apiFetch('/catalog/me');
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao carregar perfil do usuário.');
  }
  return data.data;
}

export async function getCatalogOptions(): Promise<CatalogOptions> {
  const response = await apiFetch('/catalog/options');
  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Erro ao carregar catálogos do sistema.');
  }
  return data.data;
}
