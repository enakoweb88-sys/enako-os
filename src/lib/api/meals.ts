import { apiRequest } from './core';

export const mealsApi = {
  meals: () => apiRequest<{ items: any[]; totals: any }>('/meals'),
  recordMeal: (body: {
    employeeId: string;
    date: string;
    status: 'ATE' | 'DID_NOT_EAT';
    mealName?: string;
    mealTime?: string;
    vendor?: string;
    notes?: string;
    price?: number;
    companyAmount?: number;
    employeeAmount?: number;
  }) => apiRequest<any>('/meals', { method: 'POST', body: JSON.stringify(body) }),
  disputeMeal: (id: string, reason: string) =>
    apiRequest<any>(`/meals/${id}/dispute`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
};
