import { apiRequest } from './core';

export interface CreatePostDTO {
  title: string;
  content: string;
  coverImageBase64?: string;
  category?: string;
  images?: string[];
  video?: string;
  status?: string;
  author?: string;
}

export const outreachAPI = {
  getDonations: () => apiRequest<any>('/outreach/donations'),
  getStats: () => apiRequest<any>('/outreach/stats'),
  getApplications: () => apiRequest<any[]>('/outreach/applications'),
  getEvents: () => apiRequest<any[]>('/outreach/events'),
  createEvent: (data: any) => apiRequest<any>('/outreach/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEventStatus: (id: string, status: string) => apiRequest<any>(`/outreach/events/${id}/status`, { method: 'POST', body: JSON.stringify({ id, status }) }),
  getPosts: () => apiRequest<any[]>('/outreach/posts'),
  createPost: (data: CreatePostDTO) => apiRequest<any>('/outreach/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: string, data: Partial<CreatePostDTO>) => apiRequest<any>(`/outreach/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePostStatus: (id: string, status: string) => apiRequest<any>(`/outreach/posts/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  getWebInsights: () => apiRequest<any>('/outreach/analytics/insights'),
  
  // Community Projects
  getCommunityProjects: (communitySlug?: string) => apiRequest<any[]>(`/outreach/community-projects${communitySlug ? `?communitySlug=${communitySlug}` : ''}`),
  createCommunityProject: (data: any) => apiRequest<any>('/outreach/community-projects', { method: 'POST', body: JSON.stringify(data) }),
  updateCommunityProject: (id: string, data: any) => apiRequest<any>(`/outreach/community-projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCommunityProject: (id: string) => apiRequest<any>(`/outreach/community-projects/${id}`, { method: 'DELETE' }),
};
