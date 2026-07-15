import { apiRequest } from './core';

export const outreachAPI = {
  getDonations: () => apiRequest<any>('/outreach/donations'),
  getStats: () => apiRequest<any>('/outreach/stats'),
  getApplications: () => apiRequest<any[]>('/outreach/applications'),
  getEvents: () => apiRequest<any>('/outreach/events'),
  createEvent: (data: any) => apiRequest<any>('/outreach/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEventStatus: (id: string, status: string) => apiRequest<any>(`/outreach/events/${id}/status`, { method: 'POST', body: JSON.stringify({ id, status }) }),
};
