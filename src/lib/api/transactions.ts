import { apiRequest } from './core';

export const transactionsApi = {
  transactions: (params?: { search?: string; limit?: number; page?: number; status?: string; type?: string; dateRange?: string; channel?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.page) q.set('page', String(params.page));
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.dateRange) q.set('dateRange', params.dateRange);
    if (params?.channel) q.set('channel', params.channel);
    return apiRequest<any>(`/transactions?${q}`);
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
