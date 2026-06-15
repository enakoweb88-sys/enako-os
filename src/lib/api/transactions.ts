import { apiRequest } from './core';

export const transactionsApi = {
  transactions: (params?: { search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<{ items: any[]; totals: any[] }>(`/transactions?${q}`);
  },
  createTransaction: (body: unknown) =>
    apiRequest<any>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  setTransactionStatus: (id: string, status: string) =>
    apiRequest<any>(`/transactions/${id}/status/${status}`, { method: 'PATCH' }),
  settleTransaction: (id: string) =>
    apiRequest<any>(`/transactions/${id}/settle`, { method: 'PATCH' }),
  flagTransaction: (id: string, reason?: string) =>
    apiRequest<any>(`/transactions/${id}/flag`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
};
