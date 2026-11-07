import { clearSession, getStoredUser, storeSession } from '../lib/api';
import { API_BASE_URL, getAccessToken as sessionAccessToken } from '../lib/api/core';

export type { AuthUser } from '../lib/api';

export async function login(
  email: string,
  password: string,
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE',
) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'same-origin',
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
  return sessionAccessToken();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!getStoredUser();
}
