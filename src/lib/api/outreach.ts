import { api } from './core';

export const outreachAPI = {
  getDonations: async () => {
    const { data } = await api.get('/outreach/donations');
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/outreach/stats');
    return data;
  },
};
