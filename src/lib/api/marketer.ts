import { apiRequest } from './core';

export interface MarketerLead {
  id: string;
  marketerId: string;
  prospectName: string;
  phone?: string | null;
  zone?: string | null;
  product?: string | null;
  status: string;
  notes?: string | null;
  nextAction?: string | null;
  contactPermission: boolean;
  followUpDate?: string | null;
  outcome?: string | null;
  evidenceRef?: string | null;
  createdAt: string;
  updatedAt: string;
  marketer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
}

export interface MarketerTerritoryZone {
  id: string;
  marketerId: string;
  zoneName: string;
  region: string;
  targetAudience?: string | null;
  schedule?: string | null;
  isActive: boolean;
}

export interface ScorecardMeasure {
  label: string;
  actual: number;
  target: number;
}

export interface MarketerScorecard {
  weekRange: {
    start: string;
    end: string;
  };
  reportsSubmitted: number;
  measures: ScorecardMeasure[];
}

export interface MarketerDailyPlan {
  date: string;
  generatedFrom: 'ASSIGNED_KPIS_AND_ACTIVITY';
  actions: { id: string; source: 'KPI' | 'FOLLOW_UP' | 'REPORT'; title: string; description: string; href: string }[];
}

export const marketerApi = {
  marketerLeads: (params?: { status?: string; zone?: string; marketerId?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.zone) q.set('zone', params.zone);
    if (params?.marketerId) q.set('marketerId', params.marketerId);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<MarketerLead[]>(`/marketer/leads${qs}`);
  },
  createMarketerLead: (body: Partial<MarketerLead>) =>
    apiRequest<MarketerLead>('/marketer/leads', { method: 'POST', body: JSON.stringify(body) }),
  updateMarketerLead: (id: string, body: Partial<MarketerLead>) =>
    apiRequest<MarketerLead>(`/marketer/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMarketerLead: (id: string) =>
    apiRequest<{ id: string }>(`/marketer/leads/${id}`, { method: 'DELETE' }),
  marketerTerritory: (marketerId?: string) => {
    const qs = marketerId ? `?marketerId=${encodeURIComponent(marketerId)}` : '';
    return apiRequest<MarketerTerritoryZone[]>(`/marketer/territory${qs}`);
  },
  assignMarketerTerritory: (body: { marketerId: string; zones: any[] }) =>
    apiRequest<MarketerTerritoryZone[]>('/marketer/territory/assign', { method: 'POST', body: JSON.stringify(body) }),
  marketerScorecard: (marketerId?: string) => {
    const qs = marketerId ? `?marketerId=${encodeURIComponent(marketerId)}` : '';
    return apiRequest<MarketerScorecard>(`/marketer/scorecard${qs}`);
  },
  marketerDailyPlan: (marketerId?: string) => {
    const qs = marketerId ? `?marketerId=${encodeURIComponent(marketerId)}` : '';
    return apiRequest<MarketerDailyPlan>(`/marketer/daily-plan${qs}`);
  },
  marketerDailyLeaderboard: () => apiRequest<any[]>('/marketer/leaderboard/daily'),
};
