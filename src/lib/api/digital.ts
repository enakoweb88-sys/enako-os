import { apiRequest } from './core';

export const digitalApi = {
  contentCalendar: () => apiRequest<any>('/digital/calendar'),
  contentTasks: () => apiRequest<any>('/digital/tasks'),
  contentApprovals: () => apiRequest<any[]>('/digital/approvals'),
  socialPerformance: () => apiRequest<any[]>('/digital/social'),
  topPosts: () => apiRequest<any[]>('/digital/top-posts'),
  adsPerformance: () => apiRequest<any>('/digital/ads'),
  contentTypes: () => apiRequest<any[]>('/digital/content-types'),
  websiteOverview: () => apiRequest<any>('/digital/website'),
};
