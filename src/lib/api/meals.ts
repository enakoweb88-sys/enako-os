import { apiRequest } from './core';

export const mealsApi = {
  meals: () => apiRequest<{ items: any[]; totals: any }>('/meals'),
  recordMeal: (body: { employeeId: string; date: string; status: 'ATE' | 'DID_NOT_EAT' }) =>
    apiRequest<any>('/meals', { method: 'POST', body: JSON.stringify(body) }),
  disputeMeal: (id: string, reason: string) =>
    apiRequest<any>(`/meals/${id}/dispute`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
};
