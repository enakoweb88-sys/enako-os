import { apiRequest } from './core';

export const adminApi = {
  adminOverview: () => apiRequest<any>('/admin/overview'),
  departments: () => apiRequest<any[]>('/departments').catch(() => []),
};
