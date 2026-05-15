import { useAppStore } from '@/lib/store';

const API_BASE = '/api';

async function apiFetch(path: string, options?: RequestInit) {
  const token = useAppStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body: unknown) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string, body?: unknown) => apiFetch(path, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}) }),
};
