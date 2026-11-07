export type RoleName = 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  title?: string | null;
  phone?: string | null;
  role: RoleName;
  department?: string | null;
  ledDepartments?: string[];
  responsibilities?: string | null;
  permissions?: string[];
  avatarUrl?: string;
  address?: string | null;
  personalEmail?: string | null;
  emergencyContact?: string | null;
  dateOfBirth?: string | null;
};

const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
// The Access cookie belongs to the website, not the shared API domain.
// Its narrowly scoped edge proxy forwards the signed assertion to NestJS.
export function resolveApiBaseUrl(configured: string | undefined, location?: { hostname: string; origin: string }) {
  if (location?.hostname === 'enakoos.com') return location.origin + '/api/v1';
  return configured && configured !== 'undefined' ? configured.replace(/\/$/, '') : 'https://api.enakoos.com/api/v1';
}
export const API_BASE_URL = resolveApiBaseUrl(envApiUrl, typeof window !== 'undefined' ? window.location : undefined);
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function getAccessToken() {
  return sessionStorage.getItem('enako_access_token');
}

export function getStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem('enako_user');
  try { return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; }
}

export function storeSession(session: { accessToken: string; refreshToken: string; user: AuthUser; sessionId?: string }) {
  sessionStorage.setItem('enako_access_token', session.accessToken);
  sessionStorage.setItem('enako_refresh_token', session.refreshToken);
  sessionStorage.setItem('enako_user', JSON.stringify(session.user));
  sessionStorage.setItem('enako_user_role', session.user.role.toLowerCase());
  sessionStorage.setItem('enako_user_name', session.user.fullName);
  sessionStorage.setItem('enako_user_email', session.user.email);
  if (session.sessionId) sessionStorage.setItem('enako_session_id', session.sessionId);
  if (session.user.role) localStorage.setItem('enako_last_role', session.user.role.toUpperCase());
  if (session.user.email) localStorage.setItem('enako_last_email', session.user.email);
}

export function clearSession() {
  ['enako_access_token', 'enako_refresh_token', 'enako_user',
   'enako_user_role', 'enako_user_name', 'enako_user_email', 'enako_selected_role', 'enako_session_id']
    .forEach(k => sessionStorage.removeItem(k));
}

let refreshInFlight: Promise<void> | null = null;
export async function refreshSession() {
  if (!refreshInFlight) refreshInFlight = (async () => {
    const refreshToken = sessionStorage.getItem('enako_refresh_token');
    if (!refreshToken) throw new Error('Session expired');
    const response = await fetch(API_BASE_URL + '/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }), credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Session expired');
    storeSession(await response.json());
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function apiRequest<T>(path: string, options: RequestInit = {}, responseType: 'json' | 'blob' = 'json', timeoutMs = 15000): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const originalToken = getAccessToken();
  if (originalToken) headers.set('Authorization', 'Bearer ' + originalToken);
  const perform = () => fetch(API_BASE_URL + path, { ...options, headers, credentials: 'same-origin', cache: 'no-store', signal: options.signal ?? AbortSignal.timeout(timeoutMs) });
  let response: Response;
  try {
    response = await perform();
    if (response.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
      try { if (getAccessToken() === originalToken) await refreshSession(); }
      catch (error) { clearSession(); window.dispatchEvent(new Event('enako:session-expired')); throw error; }
      headers.set('Authorization', 'Bearer ' + getAccessToken()); response = await perform();
      if (response.status === 401) { clearSession(); window.dispatchEvent(new Event('enako:session-expired')); }
    }
  } catch (error) { if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) throw new Error('The request timed out. Check its saved state before retrying.'); throw error; }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.message || ({ 401: 'Please sign in again', 403: 'You do not have access', 404: 'Record not found', 409: 'The record changed. Refresh and try again', 422: 'Check the submitted details', 429: 'Too many requests. Please wait before retrying' } as Record<number, string>)[response.status] || 'The service could not complete the request';
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }
  if (response.status === 204) return undefined as T;
  if (responseType === 'blob') return await response.blob() as T;
  try { return await response.json() as T; } catch { throw new Error('The API returned an invalid response. Check the API address.'); }
}
