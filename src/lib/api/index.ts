import { authApi } from './auth';
import { analyticsApi } from './analytics';
import { employeesApi } from './employees';
import { transactionsApi } from './transactions';
import { expensesApi } from './expenses';
import { kycApi } from './kyc';
import { mealsApi } from './meals';
import { tasksApi } from './tasks';
import { announcementsApi } from './announcements';
import { notificationsApi } from './notifications';
import { messagesApi } from './messages';
import { goalsApi } from './goals';
import { financeApi } from './finance';
import { bdApi } from './bd';
import { digitalApi } from './digital';
import { adminApi } from './admin';
import { supportApi } from './support';
import { usersApi } from './users';
import { filesApi } from './files';
import { rolesApi } from './roles';
import { performanceApi } from './performance';
import { dashboardApi } from './dashboard';
import { auditLogsApi } from './auditLogs';

export * from './core';

export const api = {
  ...authApi,
  ...analyticsApi,
  ...employeesApi,
  ...transactionsApi,
  ...expensesApi,
  ...kycApi,
  ...mealsApi,
  ...tasksApi,
  ...announcementsApi,
  ...notificationsApi,
  ...messagesApi,
  ...goalsApi,
  ...financeApi,
  ...bdApi,
  ...digitalApi,
  ...adminApi,
  ...supportApi,
  ...usersApi,
  ...filesApi,
  ...rolesApi,
  ...performanceApi,
  ...dashboardApi,
  ...auditLogsApi,
};
