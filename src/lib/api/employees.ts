import { apiRequest } from './core';

export const employeesApi = {
  employees: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<{ items: any[]; total: number; page: number; limit: number }>(`/employees?${q}`);
  },
  createEmployee: (body: unknown) =>
    apiRequest<any>('/employees', { method: 'POST', body: JSON.stringify(body) }),
  updateEmployee: (id: string, body: unknown) =>
    apiRequest<any>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  suspendEmployee: (id: string) =>
    apiRequest<any>(`/employees/${id}/suspend`, { method: 'PATCH' }),
  activateEmployee: (id: string) =>
    apiRequest<any>(`/employees/${id}/activate`, { method: 'PATCH' }),
  deleteEmployee: (id: string) =>
    apiRequest<any>(`/employees/${id}`, { method: 'DELETE' }),
  resetEmployeePassword: (id: string, password: string) =>
    apiRequest<any>(`/employees/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
};
