import { apiRequest } from './core';

export const investmentsApi = {
  getInvestments: () => apiRequest<any[]>('/investments'),
  createInvestment: (data: any) => apiRequest<any>('/investments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateInvestment: (id: string, data: any) => apiRequest<any>(`/investments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deleteInvestment: (id: string) => apiRequest<any>(`/investments/${id}`, {
    method: 'DELETE'
  })
};
