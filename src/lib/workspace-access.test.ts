import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canAccessSidebarCategory, isAccountantWorkspace } from './workspace-access';

const accountant = { role: 'EMPLOYEE', title: 'Accountant', department: 'Finance' };
test('accountants do not see HR, Websites or Security sidebar categories', () => {
  for (const category of ['team', 'websites', 'security']) assert.equal(canAccessSidebarCategory(accountant, category), false);
  for (const category of ['dashboard', 'finance', 'operations', 'comms', 'docs']) assert.equal(canAccessSidebarCategory(accountant, category), true);
});
test('accountant and bookkeeper titles resolve their workspace even without a department in an older session', () => {
  assert.equal(isAccountantWorkspace({ role: 'EMPLOYEE', title: 'Accountant', department: null }), true);
  assert.equal(isAccountantWorkspace({ role: 'EMPLOYEE', title: 'Accountant / Bookkeeper' }), true);
  assert.equal(isAccountantWorkspace({ role: 'EMPLOYEE', title: 'Senior Cash Officer' }), false);
});
test('CEO and manager navigation remains available, including when their title mentions accounting', () => {
  for (const role of ['CEO', 'MANAGER']) for (const category of ['team', 'websites', 'security']) assert.equal(canAccessSidebarCategory({ ...accountant, role }, category), true);
});
test('engineer HR restriction and other finance job titles are preserved', () => {
  assert.equal(canAccessSidebarCategory({ role: 'EMPLOYEE', department: 'Engineering' }, 'team'), false);
  assert.equal(canAccessSidebarCategory({ role: 'EMPLOYEE', title: 'Financial Analyst', department: 'Finance' }, 'websites'), true);
});
