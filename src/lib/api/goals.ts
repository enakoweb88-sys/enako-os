import { apiRequest } from './core';

export const goalsApi = {
  goals: (params?: { limit?: number; page?: number; search?: string; scope?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
    return apiRequest<any[]>(`/goals${query.size ? `?${query}` : ''}`);
  },
  goalReport: (params: { period: string; date: string; ownerId?: string }) => {
    const query = new URLSearchParams({ period: params.period, date: params.date });
    if (params.ownerId) query.set('ownerId', params.ownerId);
    return apiRequest<{ start: string; end: string; items: any[] }>(`/goals/report?${query}`);
  },
  getGoal: (id: string) => apiRequest<any>(`/goals/${id}`),
  createGoal: (body: unknown) =>
    apiRequest<any>('/goals', { method: 'POST', body: JSON.stringify(body) }),
  updateGoal: (id: string, body: unknown) =>
    apiRequest<any>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateProgress: (id: string, currentValue: number) =>
    apiRequest<any>(`/goals/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ currentValue }) }),
  completeGoal: (id: string) =>
    apiRequest<any>(`/goals/${id}/complete`, { method: 'PATCH' }),
  deleteGoal: (id: string) => apiRequest<any>(`/goals/${id}`, { method: 'DELETE' }),
};
