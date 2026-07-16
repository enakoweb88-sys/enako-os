import { apiRequest } from './core';

export interface UserPreferences {
  analytics: boolean;
  mfa: boolean;
  aiWorkspace: boolean;
  emailNotif: boolean;
  pushNotif: boolean;
  smsNotif: boolean;
  slackConnected: boolean;
  awsConnected: boolean;
}

export interface Session {
  id: string;
  device: string | null;
  ipAddress: string | null;
  location: string | null;
  createdAt: string;
  expiresAt: string;
}

export const settingsApi = {
  getPreferences: () => apiRequest<UserPreferences>('/users/preferences'),
  updatePreferences: (data: Partial<UserPreferences>) => apiRequest<UserPreferences>('/users/preferences', { method: 'PATCH', body: JSON.stringify(data) }),
  getSessions: () => apiRequest<Session[]>('/auth/sessions'),
  revokeSession: (id: string) => apiRequest<{ ok: boolean }>(`/auth/sessions/${id}`, { method: 'DELETE' }),
  changePassword: (currentPassword: string, newPassword: string) => apiRequest<{ ok: boolean }>('/users/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  exportData: () => apiRequest<any>('/users/export', { method: 'POST', body: JSON.stringify({}) }),
  deleteAccount: () => apiRequest<{ ok: boolean; message: string }>('/users/me', { method: 'DELETE' })
};
