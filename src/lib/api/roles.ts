import { apiRequest } from './core';

export const rolesApi = {
  roles: () => apiRequest<any[]>('/roles'),
};
