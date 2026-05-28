export type RoleName = 'CEO' | 'MANAGER' | 'EMPLOYEE';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  department?: string | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5000/api/v1';

export function getAccessToken() {
  return localStorage.getItem('enako_access_token');
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('enako_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function storeSession(session: { accessToken: string; refreshToken: string; user: AuthUser }) {
  localStorage.setItem('enako_access_token', session.accessToken);
  localStorage.setItem('enako_refresh_token', session.refreshToken);
  localStorage.setItem('enako_user', JSON.stringify(session.user));
  localStorage.setItem('enako_user_role', session.user.role.toLowerCase());
  localStorage.setItem('enako_user_name', session.user.fullName);
  localStorage.setItem('enako_user_email', session.user.email);
}

export function clearSession() {
  ['enako_access_token', 'enako_refresh_token', 'enako_user',
   'enako_user_role', 'enako_user_name', 'enako_user_email', 'enako_selected_role']
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

  if (response.status === 401) {
    // Try refresh
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
  return response.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const api = {
  login: (email: string, password: string, role: RoleName) =>
    apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }).catch(() => null),

  // ─── Analytics ─────────────────────────────────────────────────────────────
  overview: () => apiRequest<{
    employees: { active: number; suspended: number };
    revenue: { _sum: { amount: string | null }; _count: number };
    transactions: { pending: { _sum: { amount: string | null }; _count: number } };
    expenses: { _sum: { amount: string | null }; _count: number };
    kyc: { pending: number; approved: number };
    meals: { _sum: { totalAmount: string | null; companyAmount: string | null; employeeAmount: string | null }; _count: number };
    tasks: { open: number };
  }>('/analytics/overview'),

  // ─── Employees ─────────────────────────────────────────────────────────────
  employees: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<{ items: any[]; total: number; page: number; limit: number }>(`/employees?${q}`);
  },
  createEmployee: (body: unknown) =>
    apiRequest<any>('/employees', { method: 'POST', body: JSON.stringify(body) }),
  updateEmployee: (id: string, body: unknown) =>
    apiRequest<any>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  suspendEmployee: (id: string) =>
    apiRequest<any>(`/employees/${id}/suspend`, { method: 'PATCH' }),
  activateEmployee: (id: string) =>
    apiRequest<any>(`/employees/${id}/activate`, { method: 'PATCH' }),
  deleteEmployee: (id: string) =>
    apiRequest<any>(`/employees/${id}`, { method: 'DELETE' }),

  // ─── Transactions ──────────────────────────────────────────────────────────
  transactions: (params?: { search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<{ items: any[]; totals: any[] }>(`/transactions?${q}`);
  },
  createTransaction: (body: unknown) =>
    apiRequest<any>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  setTransactionStatus: (id: string, status: string) =>
    apiRequest<any>(`/transactions/${id}/status/${status}`, { method: 'PATCH' }),

  // ─── Expenses ──────────────────────────────────────────────────────────────
  expenses: (params?: { limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<{ items: any[]; totals: any[] }>(`/expenses?${q}`);
  },
  createExpense: (body: unknown) =>
    apiRequest<any>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  reviewExpense: (id: string, status: string) =>
    apiRequest<any>(`/expenses/${id}/review/${status}`, { method: 'PATCH' }),

  // ─── KYC ───────────────────────────────────────────────────────────────────
  kyc: (params?: { status?: string; search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<any[]>(`/kyc/submissions?${q}`);
  },
  reviewKyc: (id: string, body: { status: string; rejectionReason?: string }) =>
    apiRequest<any>(`/kyc/submissions/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),

  // ─── Meals ─────────────────────────────────────────────────────────────────
  meals: () => apiRequest<{ items: any[]; totals: any }>('/meals'),
  recordMeal: (body: { employeeId: string; date: string; status: 'ATE' | 'DID_NOT_EAT' }) =>
    apiRequest<any>('/meals', { method: 'POST', body: JSON.stringify(body) }),
  disputeMeal: (id: string, reason: string) =>
    apiRequest<any>(`/meals/${id}/dispute`, { method: 'PATCH', body: JSON.stringify({ reason }) }),

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  tasks: () => apiRequest<any[]>('/tasks'),
  createTask: (body: unknown) =>
    apiRequest<any>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  setTaskStatus: (id: string, status: string) =>
    apiRequest<any>(`/tasks/${id}/status/${status}`, { method: 'PATCH' }),

  // ─── Announcements ─────────────────────────────────────────────────────────
  announcements: () => apiRequest<any[]>('/announcements'),
  createAnnouncement: (body: { title: string; content: string; tag?: string }) =>
    apiRequest<any>('/announcements', { method: 'POST', body: JSON.stringify(body) }),

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: () => apiRequest<any[]>('/notifications'),
  markNotificationRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, { method: 'PATCH' }),

  // ─── Messages ──────────────────────────────────────────────────────────────
  messages: (channel = 'operations') =>
    apiRequest<any[]>(`/messages?channel=${encodeURIComponent(channel)}`),
  sendMessage: (channel: string, content: string) =>
    apiRequest<any>('/messages', { method: 'POST', body: JSON.stringify({ channel, content }) }),

  // ─── Goals ─────────────────────────────────────────────────────────────────
  goals: () => apiRequest<any[]>('/goals'),
  createGoal: (body: unknown) =>
    apiRequest<any>('/goals', { method: 'POST', body: JSON.stringify(body) }),
};
