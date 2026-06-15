import { apiRequest } from './core';

export const notificationsApi = {
  notifications: () => apiRequest<any[]>('/notifications'),
  unreadNotificationCount: () => apiRequest<{ count: number }>('/notifications/unread-count'),
  markNotificationRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    apiRequest<any>('/notifications/read-all', { method: 'PATCH' }),
  clearReadNotifications: () =>
    apiRequest<any>('/notifications/clear-read', { method: 'DELETE' }),
};
