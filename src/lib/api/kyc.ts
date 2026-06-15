import { apiRequest } from './core';

export const kycApi = {
  kyc: (params?: { status?: string; search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    return apiRequest<any[]>(`/kyc/submissions?${q}`);
  },
  reviewKyc: (id: string, body: { status: string; rejectionReason?: string }) =>
    apiRequest<any>(`/kyc/submissions/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
};
