import { apiRequest } from './core';

export const reportsApi = {
  reports: () => apiRequest<any[]>('/reports'),
  generateReport: (body: { title: string; type: string }) =>
    apiRequest<any>('/reports', { method: 'POST', body: JSON.stringify(body) }),
  dailyReports: () => apiRequest<any[]>('/reports/daily'),
  createDailyReport: (body: { content: string; loginTime?: string; logoutTime?: string; pdfUrl?: string }) =>
    apiRequest<any>('/reports/daily', { method: 'POST', body: JSON.stringify(body) }),
};
