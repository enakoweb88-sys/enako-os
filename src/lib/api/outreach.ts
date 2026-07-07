import { apiRequest } from './core';

export const outreachAPI = {
  getDonations: () => apiRequest<any>('/outreach/donations'),
  getStats: () => apiRequest<any>('/outreach/stats'),
};
