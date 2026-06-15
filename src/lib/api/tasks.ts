import { apiRequest } from './core';

export const tasksApi = {
  tasks: () => apiRequest<any[]>('/tasks'),
  getTask: (id: string) => apiRequest<any>(`/tasks/${id}`),
  createTask: (body: unknown) =>
    apiRequest<any>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, body: unknown) =>
    apiRequest<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  setTaskStatus: (id: string, status: string) =>
    apiRequest<any>(`/tasks/${id}/status/${status}`, { method: 'PATCH' }),
  deleteTask: (id: string) =>
    apiRequest<any>(`/tasks/${id}`, { method: 'DELETE' }),
  addTaskComment: (id: string, body: unknown) =>
    apiRequest<any>(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  getTaskComments: (id: string) => apiRequest<any[]>(`/tasks/${id}/comments`),
};
