import { apiRequest, AuthUser, RoleName } from './core';

export const authApi = {
  login: (email: string, password: string, role: RoleName) =>
    apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser; sessionId?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }).catch(() => null),
  endSession: (sessionId: string) => apiRequest('/auth/end-session', { method: 'POST', body: JSON.stringify({ sessionId }) }).catch(() => null),
};
