import { apiRequest } from './core';

export const supportApi = {
  supportTickets: () => apiRequest<any>('/support/tickets'),
};
