import { apiRequest } from './core';

export const auditLogsApi = {
  auditLogs: () => apiRequest<any[]>('/audit-logs'),
  auditActivity: () => apiRequest<any>('/audit-logs/activity'),
};
