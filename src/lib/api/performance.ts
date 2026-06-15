import { apiRequest } from './core';

export const performanceApi = {
  performanceList: (params?: { userId?: string; period?: string }) => {
    const q = new URLSearchParams();
    if (params?.userId) q.set('userId', params.userId);
    if (params?.period) q.set('period', params.period);
    return apiRequest<any[]>(`/performance?${q}`);
  },
  performanceForUser: (userId: string) => apiRequest<any>(`/performance/${userId}`),
  createPerformanceMetric: (body: unknown) => apiRequest<any>('/performance', { method: 'POST', body: JSON.stringify(body) }),
  deletePerformanceMetric: (id: string) => apiRequest<any>(`/performance/${id}`, { method: 'DELETE' }),
};
