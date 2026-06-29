import { apiRequest } from './core';

export const subscriptionsApi = {
  subscriptions: () => apiRequest<any[]>('/subscriptions'),
  createSubscription: (body: unknown) =>
    apiRequest<any>('/subscriptions', { method: 'POST', body: JSON.stringify(body) }),
  updateSubscription: (id: string, body: unknown) =>
    apiRequest<any>(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};
