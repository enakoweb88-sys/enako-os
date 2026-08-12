import { apiRequest } from './core';

export const digitalApi = {
  contentCalendar: () => apiRequest<any>('/digital/calendar'),
  contentTasks: () => apiRequest<any>('/digital/tasks'),
  contentApprovals: () => apiRequest<any[]>('/digital/approvals'),
  socialPerformance: () => apiRequest<any[]>('/digital/social'),
  getSocialAccounts: () => apiRequest<any[]>('/digital/accounts'),
  linkSocialAccount: (dto: any) => apiRequest<any>('/digital/accounts', { method: 'POST', body: JSON.stringify(dto) }),
  generateAiAsset: (dto: { prompt: string; topic: string; type: string }) => apiRequest<any>('/digital/generate-ai-asset', { method: 'POST', body: JSON.stringify(dto) }),
  topPosts: () => apiRequest<any[]>('/digital/top-posts'),
  adsPerformance: () => apiRequest<any>('/digital/ads'),
  contentTypes: () => apiRequest<any[]>('/digital/content-types'),
  websiteOverview: () => apiRequest<any>('/digital/website'),
  getPosts: () => apiRequest<any[]>('/digital/posts'),
  createPost: (dto: any) => apiRequest<any>('/digital/posts', { method: 'POST', body: JSON.stringify(dto) }),
  updatePostStatus: (id: string, status: string) => apiRequest<any>(`/digital/posts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getCampaigns: () => apiRequest<any[]>('/digital/campaigns'),
  createCampaign: (dto: any) => apiRequest<any>('/digital/campaigns', { method: 'POST', body: JSON.stringify(dto) }),
};
