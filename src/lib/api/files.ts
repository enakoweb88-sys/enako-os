import { apiRequest } from './core';

export const filesApi = {
  uploadFile: (formData: FormData) => apiRequest<any>('/files/upload', { method: 'POST', body: formData }),
  listFiles: () => apiRequest<any[]>('/files'),
  deleteFile: (id: string) => apiRequest<any>(`/files/${id}`, { method: 'DELETE' }),
};
