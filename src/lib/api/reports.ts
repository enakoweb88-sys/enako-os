import { apiRequest } from './core';

export const reportsApi = {
  ceoReviewReport: (id: string, body: { comment?: string; complete?: boolean }) =>
    apiRequest<any>(`/reports/daily/${encodeURIComponent(id)}/ceo-review`, { method: 'POST', body: JSON.stringify(body) }),
  uploadReport: (body: FormData, id?: string) => apiRequest<any>(id ? `/reports/daily/${encodeURIComponent(id)}/upload` : '/reports/daily/upload', { method: 'POST', body }, 'json', 120_000),
  reportDocument: (reportId: string, documentId: string, preview = false) => apiRequest<Blob>(`/reports/daily/${encodeURIComponent(reportId)}/documents/${encodeURIComponent(documentId)}${preview ? '?preview=1' : ''}`, {}, 'blob', 60_000),
  getDailyReport: (id: string) => apiRequest<any>(`/reports/daily/${encodeURIComponent(id)}`),
  reports: () => apiRequest<any[]>('/reports'),
  generateReport: (body: { title: string; type: string }) =>
    apiRequest<any>('/reports', { method: 'POST', body: JSON.stringify(body) }),
  dailyReports: (params?: { type?: string }) => {
    const q = params?.type ? `?type=${encodeURIComponent(params.type)}` : '';
    return apiRequest<any[]>(`/reports/daily${q}`);
  },
  createDailyReport: (body: { content: string; type?: string; loginTime?: string; logoutTime?: string; pdfUrl?: string; status?: string; attachments?: any }) =>
    apiRequest<any>('/reports/daily', { method: 'POST', body: JSON.stringify(body) }),
  updateDailyReport: (id: string, body: { content?: string; type?: string; status?: string; attachments?: any }) =>
    apiRequest<any>(`/reports/daily/${id}`, { method: 'POST', body: JSON.stringify(body) }),
  reviewDailyReport: (id: string, body: { status: 'VERIFIED' | 'RETURNED'; reviewerComments?: string }) =>
    apiRequest<any>(`/reports/daily/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
};

