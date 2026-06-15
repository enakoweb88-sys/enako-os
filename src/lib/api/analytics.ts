import { apiRequest } from './core';

export const analyticsApi = {
  overview: () => apiRequest<{
    employees: { active: number; suspended: number };
    revenue: { _sum: { amount: string | null }; _count: number };
    transactions: { pending: { _sum: { amount: string | null }; _count: number }, failed: number };
    expenses: { _sum: { amount: string | null }; _count: number };
    kyc: { pending: number; approved: number };
    meals: { _sum: { totalAmount: string | null; companyAmount: string | null; employeeAmount: string | null }; _count: number };
    tasks: { open: number };
    support: { unassignedTickets: number };
  }>('/analytics/overview'),
  healthScore: () => apiRequest<any>('/analytics/health'),
  marketingPerformance: () => apiRequest<any>('/analytics/marketing'),
  njangiAnalysis: () => apiRequest<any>('/analytics/njangi'),
  appActivity: () => apiRequest<any>('/analytics/app'),
};
