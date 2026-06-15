import { apiRequest } from './core';

export const announcementsApi = {
  announcements: () => apiRequest<any[]>('/announcements'),
  getAnnouncement: (id: string) => apiRequest<any>(`/announcements/${id}`),
  createAnnouncement: (body: { title: string; content: string; tag?: string }) =>
    apiRequest<any>('/announcements', { method: 'POST', body: JSON.stringify(body) }),
  updateAnnouncement: (id: string, body: unknown) =>
    apiRequest<any>(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAnnouncement: (id: string) =>
    apiRequest<any>(`/announcements/${id}`, { method: 'DELETE' }),
};
