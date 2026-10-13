import { apiRequest } from './core';

export const kpisApi = {
  myKpiScore: (period?: string) =>
    apiRequest<any>(`/kpis/me${period ? `?period=${encodeURIComponent(period)}` : ''}`),
  submitMyKpiScore: (body: { score: number; notes?: string }) =>
    apiRequest<any>('/kpis/me', { method: 'PUT', body: JSON.stringify(body) }),
  employeeKpiScores: (employeeId: string, period?: string) =>
    apiRequest<any>(`/kpis/employees/${employeeId}${period ? `?period=${encodeURIComponent(period)}` : ''}`),
  updateEmployeeKpiScore: (employeeId: string, body: { score: number; notes?: string; period?: string }) =>
    apiRequest<any>(`/kpis/employees/${employeeId}`, { method: 'PUT', body: JSON.stringify(body) }),
};
