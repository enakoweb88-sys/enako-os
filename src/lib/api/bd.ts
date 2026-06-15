import { apiRequest } from './core';

export const bdApi = {
  pipeline: () => apiRequest<any>('/bd/pipeline'),
  leads: () => apiRequest<any[]>('/bd/leads'),
  meetings: () => apiRequest<any[]>('/bd/meetings'),
  bdPerformance: () => apiRequest<any>('/bd/performance'),
  commission: () => apiRequest<any>('/bd/commission'),
};
