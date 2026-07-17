import { clearSession, getStoredUser, storeSession } from '../lib/api';

export type { AuthUser } from '../lib/api';

export async function login(
  email: string,
  password: string,
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE',
) {
  const defaultHost = window.location.hostname.replace(/^(www\.|app\.|os\.|client\.|dashboard\.)/, '');
  const API_BASE = (import.meta.env.VITE_API_URL as string) ?? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api/v1' : `https://api.${defaultHost}/api/v1`);
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.message ??
      (res.status === 401
        ? 'Invalid email or password.'
        : res.status === 403
        ? 'This account is not registered for the selected role.'
        : `Login failed (${res.status}).`);
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  const data = await res.json();
  storeSession(data);
  return data;
}

export function logout(): void {
  clearSession();
}

export { getStoredUser } from '../lib/api';

export function getAccessToken(): string | null {
  return localStorage.getItem('enako_access_token');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!getStoredUser();
}
