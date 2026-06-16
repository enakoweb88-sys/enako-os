import { apiRequest } from './core';

export const supportApi = {
  supportTickets: () => apiRequest<any>('/support/tickets'),
  createSupportTicket: (data: any) => apiRequest<any>('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
};
