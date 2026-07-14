import { apiRequest } from './core';

export const usersApi = {
  getMe: () => apiRequest<any>('/users/me'),
  getProfileStats: () => apiRequest<any>('/users/me/stats'),
  updateMe: (body: unknown) => apiRequest<any>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body: unknown) => apiRequest<any>('/users/change-password', { method: 'POST', body: JSON.stringify(body) }),
  listUsers: () => apiRequest<any[]>('/users'),
  getUser: (id: string) => apiRequest<any>(`/users/${id}`),
};
