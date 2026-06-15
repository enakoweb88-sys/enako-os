import { apiRequest } from './core';

export const financeApi = {
  banking: () => apiRequest<any[]>('/finance/banking'),
  budget: () => apiRequest<any[]>('/finance/budget'),
  cashPosition: () => apiRequest<any>('/finance/cash-position'),
  invoicesOverview: () => apiRequest<any>('/finance/invoices'),
  accountsSummary: () => apiRequest<any>('/finance/accounts-summary'),
};
