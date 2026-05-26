export type RoleName = 'CEO' | 'MANAGER' | 'EMPLOYEE';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  department?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';

function getAccessToken() {
  return localStorage.getItem('enako_access_token');
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('enako_user');
  return raw ? JSON.parse(raw) : null;
}

export function storeSession(session: { accessToken: string; refreshToken: string; user: AuthUser }) {
  localStorage.setItem('enako_access_token', session.accessToken);
  localStorage.setItem('enako_refresh_token', session.refreshToken);
  localStorage.setItem('enako_user', JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem('enako_access_token');
  localStorage.removeItem('enako_refresh_token');
  localStorage.removeItem('enako_user');
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  login: (email: string, password: string, role: RoleName) =>
    apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }).catch(() => null),
  overview: () => apiRequest<any>('/analytics/overview'),
  employees: () => apiRequest<any>('/employees'),
  createEmployee: (body: unknown) => apiRequest('/employees', { method: 'POST', body: JSON.stringify(body) }),
  expenses: () => apiRequest<any>('/expenses'),
  createExpense: (body: unknown) => apiRequest('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  transactions: () => apiRequest<any>('/transactions'),
  kyc: (status?: string) => apiRequest<any>(`/kyc/submissions${status ? `?status=${status}` : ''}`),
  reviewKyc: (id: string, body: unknown) => apiRequest(`/kyc/submissions/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
  meals: () => apiRequest<any>('/meals'),
  tasks: () => apiRequest<any>('/tasks'),
  announcements: () => apiRequest<any>('/announcements'),
  messages: (channel: string) => apiRequest<any>(`/messages?channel=${encodeURIComponent(channel)}`),
};
