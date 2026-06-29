import { get, patch, post, del } from './fetcher';

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

export const getPreferences = () => get<UserPreferences>('/users/preferences');
export const updatePreferences = (data: Partial<UserPreferences>) => patch<UserPreferences>('/users/preferences', data);

export const getSessions = () => get<Session[]>('/auth/sessions');
export const revokeSession = (id: string) => del<{ ok: boolean }>(`/auth/sessions/${id}`);

export const changePassword = (currentPassword: string, newPassword: string) => post<{ ok: boolean }>('/users/change-password', { currentPassword, newPassword });

export const exportData = () => post<any>('/users/export', {});

export const deleteAccount = () => del<{ ok: boolean; message: string }>('/users/me');
