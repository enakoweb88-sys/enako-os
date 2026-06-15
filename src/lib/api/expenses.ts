import { apiRequest } from './core';

export const expensesApi = {
  expenses: (params?: { limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<{ items: any[]; totals: any[] }>(`/expenses?${q}`);
  },
  createExpense: (body: unknown) =>
    apiRequest<any>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  reviewExpense: (id: string, status: string) =>
    apiRequest<any>(`/expenses/${id}/review/${status}`, { method: 'PATCH' }),
  approveExpense: (id: string) =>
    apiRequest<any>(`/expenses/${id}/approve`, { method: 'PATCH' }),
  rejectExpense: (id: string, reason?: string) =>
    apiRequest<any>(`/expenses/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  deleteExpense: (id: string) =>
    apiRequest<any>(`/expenses/${id}`, { method: 'DELETE' }),
};
