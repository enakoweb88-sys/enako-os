import { apiRequest } from './core';

export const adminApi = {
  auditLogs: () => apiRequest<Array<{ id: string; action: string; entity: string; entityId?: string; createdAt: string; actor?: { fullName: string; role?: { name: string } } }>>('/admin/audit-logs'),
  adminOverview: () => apiRequest<any>('/admin/overview'),
  createLeave: (data: any) => apiRequest<any>('/admin/leaves', { method: 'POST', body: JSON.stringify(data) }),
  leaves: () => apiRequest<any[]>('/admin/leaves'),
  reviewLeave: (id: string, status: 'Approved' | 'Rejected') => apiRequest<any>('/admin/leaves/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ status }) }),
  departments: () => apiRequest<any[]>('/departments').catch(() => []),
};
