import { apiRequest, AuthUser, RoleName } from './core';

export const authApi = {
  login: (email: string, password: string, role: RoleName) =>
    apiRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }).catch(() => null),
};
