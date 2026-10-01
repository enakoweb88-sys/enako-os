import { apiRequest } from './core';

export const adminApi = {
  adminOverview: () => apiRequest<any>('/admin/overview'),
  createLeave: (data: any) => apiRequest<any>('/admin/leaves', { method: 'POST', body: JSON.stringify(data) }),
  leaves: () => apiRequest<any>('/admin/overview').then(r => r?.leaveRequests || []).catch(() => []),
  departments: () => apiRequest<any[]>('/departments').catch(() => []),
};
