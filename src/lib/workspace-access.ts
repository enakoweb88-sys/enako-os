type WorkspaceUser = {
  role?: string;
  title?: string | null;
  department?: string | { name?: string } | null;
};

export function isAccountantWorkspace(user: WorkspaceUser | null | undefined) {
  const role = (user?.role || '').toUpperCase();
  return !['CEO', 'MANAGER', 'OUTREACH_MANAGER'].includes(role) && /\b(accountant|bookkeeper)\b/i.test(user?.title || '');
}

export function canAccessSidebarCategory(user: WorkspaceUser | null | undefined, category: string) {
  if (isAccountantWorkspace(user) && ['team', 'websites', 'security'].includes(category)) return false;
  const role = (user?.role || '').toUpperCase();
  const department = typeof user?.department === 'string' ? user.department : user?.department?.name || '';
  const engineer = role === 'ENGINEERING' || /engineering|software|tech|developer|dev/i.test(department);
  if (category === 'team' && engineer && !['CEO', 'MANAGER'].includes(role)) return false;
  return true;
}
