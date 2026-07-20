export type RoleName = 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  department?: string | null;
  ledDepartments?: string[];
  avatarUrl?: string;
  address?: string | null;
  personalEmail?: string | null;
  emergencyContact?: string | null;
  dateOfBirth?: string | null;
};

const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultHost = window.location.hostname.replace(/^(www\.|app\.|os\.|client\.|dashboard\.)/, '');
export const API_BASE_URL = (envApiUrl && envApiUrl !== 'undefined')
  ? envApiUrl
  : (isLocal 
      ? 'https://api.enakoos.com/api/v1' 
      : `https://api.${defaultHost}/api/v1`);

export function getAccessToken() {
  return localStorage.getItem('enako_access_token');
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('enako_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function storeSession(session: { accessToken: string; refreshToken: string; user: AuthUser; sessionId?: string }) {
  localStorage.setItem('enako_access_token', session.accessToken);
  localStorage.setItem('enako_refresh_token', session.refreshToken);
  localStorage.setItem('enako_user', JSON.stringify(session.user));
  localStorage.setItem('enako_user_role', session.user.role.toLowerCase());
  localStorage.setItem('enako_user_name', session.user.fullName);
  localStorage.setItem('enako_user_email', session.user.email);
  if (session.sessionId) localStorage.setItem('enako_session_id', session.sessionId);
}

export function clearSession() {
  ['enako_access_token', 'enako_refresh_token', 'enako_user',
   'enako_user_role', 'enako_user_name', 'enako_user_email', 'enako_selected_role', 'enako_session_id']
    .forEach(k => localStorage.removeItem(k));
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !path.includes('/auth/login')) {
    const refreshToken = localStorage.getItem('enako_refresh_token');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        storeSession(data);
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        const retry = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
        if (retry.ok) {
          if (retry.status === 204) return undefined as T;
          return retry.json();
        }
      }
    }
    clearSession();
    window.location.href = '/select-role';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const msg = error.message ?? error.error ?? 'Request failed';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    if (text.startsWith('<')) {
      throw new Error('API Configuration Error: Received HTML instead of JSON. Ensure VITE_API_URL is correctly set.');
    }
    throw new Error('Invalid JSON response from server');
  }
}
