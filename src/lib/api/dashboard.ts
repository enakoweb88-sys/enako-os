import { apiRequest } from './core';

export const dashboardApi = {
  dashboardOverview: () => apiRequest<any>('/dashboard/overview'),
  myStats: () => apiRequest<any>('/dashboard/my-stats'),
  transactionChart: () => apiRequest<any>('/dashboard/charts/transactions'),
  employeeBreakdown: () => apiRequest<any>('/dashboard/charts/employees'),
  globalSearch: (query: string) => apiRequest<any>(`/dashboard/search?q=${encodeURIComponent(query)}`),
  engineeringOverview: () => apiRequest<any>('/dashboard/engineering'),
};
