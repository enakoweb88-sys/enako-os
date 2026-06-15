import { apiRequest } from './core';

export const usersApi = {
  getMe: () => apiRequest<any>('/users/me'),
  updateMe: (body: unknown) => apiRequest<any>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  listUsers: () => apiRequest<any[]>('/users'),
  getUser: (id: string) => apiRequest<any>(`/users/${id}`),
};
