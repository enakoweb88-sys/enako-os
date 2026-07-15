import { apiRequest } from './core';

export const outreachAPI = {
  getDonations: () => apiRequest<any>('/outreach/donations'),
  getStats: () => apiRequest<any>('/outreach/stats'),
  getApplications: () => apiRequest<any[]>('/outreach/applications'),
  getEvents: () => apiRequest<any>('/outreach/events'),
  createEvent: (data: any) => apiRequest<any>('/outreach/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEventStatus: (id: string, status: string) => apiRequest<any>(`/outreach/events/${id}/status`, { method: 'POST', body: JSON.stringify({ id, status }) }),
  getPosts: () => apiRequest<any[]>('/outreach/posts'),
  createPost: (data: any) => apiRequest<any>('/outreach/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePostStatus: (id: string, status: string) => apiRequest<any>(`/outreach/posts/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
};
