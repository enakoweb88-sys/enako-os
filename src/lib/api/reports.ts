import { apiRequest } from './core';

export const reportsApi = {
  reports: () => apiRequest<any[]>('/reports'),
  generateReport: (body: { title: string; type: string }) =>
    apiRequest<any>('/reports', { method: 'POST', body: JSON.stringify(body) }),
};
