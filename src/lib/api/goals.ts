import { apiRequest } from './core';

export const goalsApi = {
  goals: () => apiRequest<any[]>('/goals'),
  getGoal: (id: string) => apiRequest<any>(`/goals/${id}`),
  createGoal: (body: unknown) =>
    apiRequest<any>('/goals', { method: 'POST', body: JSON.stringify(body) }),
  updateGoal: (id: string, body: unknown) =>
    apiRequest<any>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateProgress: (id: string, body: unknown) =>
    apiRequest<any>(`/goals/${id}/progress`, { method: 'PATCH', body: JSON.stringify(body) }),
  completeGoal: (id: string) =>
    apiRequest<any>(`/goals/${id}/complete`, { method: 'PATCH' }),
  deleteGoal: (id: string) => apiRequest<any>(`/goals/${id}`, { method: 'DELETE' }),
};
