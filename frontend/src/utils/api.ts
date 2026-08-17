import { API_BASE_URL } from './constants';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from './auth';

async function refreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    const data = await res.json();
    if (data.success && data.data?.access) {
      setTokens(data.data.access, refresh);
      return data.data.access;
    }
    clearTokens();
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  if (token && isTokenExpired(token)) {
    token = await refreshToken();
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    token = await refreshToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    }
  }
  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  return res.json();
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  return res.json();
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  let token = getAccessToken();
  if (token && isTokenExpired(token)) token = await refreshToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: formData });
  return res.json();
}
