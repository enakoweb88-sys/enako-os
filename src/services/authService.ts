const API_BASE = 'http://localhost:5000/api/v1';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE';
  department: string | null;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(
  email: string,
  password: string,
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE',
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
    credentials: 'include',
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

  const data: AuthResponse = await res.json();

  /* Persist session */
  localStorage.setItem('enako_access_token', data.accessToken);
  localStorage.setItem('enako_refresh_token', data.refreshToken);
  localStorage.setItem('enako_user', JSON.stringify(data.user));

  /* Keep legacy keys that DashboardLayout reads */
  localStorage.setItem('enako_user_role', data.user.role.toLowerCase());
  localStorage.setItem('enako_user_name', data.user.fullName);
  localStorage.setItem('enako_user_email', data.user.email);

  return data;
}

export function logout(): void {
  localStorage.removeItem('enako_access_token');
  localStorage.removeItem('enako_refresh_token');
  localStorage.removeItem('enako_user');
  localStorage.removeItem('enako_user_role');
  localStorage.removeItem('enako_user_name');
  localStorage.removeItem('enako_user_email');
  localStorage.removeItem('enako_selected_role');
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('enako_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem('enako_access_token');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!getStoredUser();
}
