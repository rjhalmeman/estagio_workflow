import { API_BASE_URL, setAuthToken } from './httpClient';

export interface HealthCheckResponse {
  readonly status: string;
  readonly database: string;
  readonly timestamp: string;
}

export interface AuthUser {
  readonly cpf: string;
  readonly nome: string;
  readonly email: string;
  readonly role:
    | 'aluno'
    | 'professor_orientador'
    | 'professor_prae'
    | 'supervisor'
    | 'representante_uce'
    | 'visitante';
  readonly idCurso?: number;
}

export interface LoginResponse {
  readonly status: 'success' | 'error';
  readonly message: string;
  readonly data?: AuthUser;
  readonly token?: string;
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
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();
  if (!response.ok || data.status === 'error' || !data.data || !data.token) {
    throw new Error(data.message || 'Email ou senha inválidos.');
  }
  setAuthToken(data.token);
  return data.data;
}

export async function restoreSession(): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data: LoginResponse = await response.json();
    if (data.status === 'success' && data.data && data.token) {
      setAuthToken(data.token);
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  setAuthToken(null);
  void fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => undefined);
}
