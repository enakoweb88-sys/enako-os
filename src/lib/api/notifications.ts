import { apiRequest } from './core';

let readVersion = 0;
function changed() { readVersion++; window.dispatchEvent(new Event('enako:notifications-read')); }

export const notificationsApi = {
  notificationReadVersion: () => readVersion,
  notifications: () => apiRequest<any[]>('/notifications'),
  unreadNotificationCount: () => apiRequest<{ count: number }>('/notifications/unread-count'),
  markNotificationRead: async (id: string) => {
    const result = await apiRequest<any>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }); changed(); return result;
  },
  markAllNotificationsRead: async () => {
    const result = await apiRequest<any>('/notifications/read-all', { method: 'PATCH' }); changed(); return result;
  },
  clearReadNotifications: () =>
    apiRequest<any>('/notifications/clear-read', { method: 'DELETE' }),
};
