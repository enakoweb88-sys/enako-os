import { apiRequest } from './core';

export interface CashCollection {
  id: string;
  collectorId: string;
  clientName: string;
  location: string;
  amountCollected: number;
  outstandingBalance: number;
  currency: string;
  collectionTime: string;
  status: 'COMPLETE' | 'PENDING' | 'CANCELLED';
  description: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  collector?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role?: { name: string };
  };
}

export interface CashCollectionStats {
  todayCollected: number;
  todayCount: number;
  pendingAmount: number;
  pendingCount: number;
  totalCollected: number;
  totalOutstanding: number;
  totalRecords: number;
}

export const cashCollectionsApi = {
  cashCollections: (params?: { search?: string; page?: number; limit?: number; status?: string; collectorId?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.status) q.append('status', params.status);
    if (params?.collectorId) q.append('collectorId', params.collectorId);
    return apiRequest<{ items: CashCollection[]; total: number; page: number; limit: number; totalPages: number }>(`/cash-collections?${q.toString()}`);
  },
  cashCollectionStats: () => apiRequest<CashCollectionStats>('/cash-collections/stats'),
  cashCollection: (id: string) => apiRequest<CashCollection>(`/cash-collections/${id}`),
  createCashCollection: (data: FormData | Record<string, any>) => {
    if (data instanceof FormData) {
      return apiRequest<CashCollection>('/cash-collections', { method: 'POST', body: data });
    }
    return apiRequest<CashCollection>('/cash-collections', { method: 'POST', body: JSON.stringify(data) });
  },
  updateCashCollectionStatus: (id: string, status: 'COMPLETE' | 'PENDING' | 'CANCELLED') =>
    apiRequest<CashCollection>(`/cash-collections/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
