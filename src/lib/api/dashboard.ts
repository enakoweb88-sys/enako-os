import { apiRequest } from './core';

export const dashboardApi = {
  dashboardOverview: () => apiRequest<any>('/dashboard/overview'),
  myStats: () => apiRequest<any>('/dashboard/my-stats'),
  transactionChart: () => apiRequest<any>('/dashboard/charts/transactions'),
  employeeBreakdown: () => apiRequest<any>('/dashboard/charts/employees'),
};
