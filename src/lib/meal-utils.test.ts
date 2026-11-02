import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mealDay, monthlyMealSummary, reconcileMealCache } from './meal-utils';

test('monthly totals exclude prior months and uneaten meals, preserving zero amounts', () => {
  const items = [
    { employeeId: 'a', date: '2026-11-02', status: 'ATE', companyAmount: '500', employeeAmount: '500' },
    { employeeId: 'b', date: '2026-11-03', status: 'ATE', companyAmount: 0, employeeAmount: 1000 },
    { employeeId: 'c', date: '2026-10-31', status: 'ATE', companyAmount: 500, employeeAmount: 500 },
    { employeeId: 'd', date: '2026-11-02', status: 'DID_NOT_EAT', companyAmount: 500, employeeAmount: 500 },
  ];
  assert.deepEqual(monthlyMealSummary(items, '2026-11'), {
    count: 2, companyAmount: 500, employeeAmount: 1500, beneficiaries: 2,
  });
  assert.deepEqual(monthlyMealSummary(items, '2026-12'), {
    count: 0, companyAmount: 0, employeeAmount: 0, beneficiaries: 0,
  });
});

test('legacy browser copies are removed while unrelated unsaved records survive', () => {
  const saved = { id: 'server', employeeId: 'joseph', date: '2026-11-02T00:00:00Z', status: 'ATE', mealName: 'Ndole' };
  const copy = { ...saved, id: 'MEAL-1', date: '2026-11-02' };
  const unrelated = { ...copy, id: 'MEAL-2', employeeId: 'other' };
  assert.deepEqual(reconcileMealCache([saved], [copy, unrelated]), [unrelated]);
  assert.deepEqual(reconcileMealCache([], [copy]), [copy]);
});

test('legitimate manager repeat meals are both counted', () => {
  const meal = { employeeId: 'a', date: '2026-11-02', status: 'ATE' };
  assert.equal(monthlyMealSummary([{ ...meal, id: '1' }, { ...meal, id: '2' }], '2026-11').count, 2);
});

test('company date follows Douala at month boundaries', () => {
  assert.equal(mealDay(new Date('2026-10-31T23:30:00Z')), '2026-11-01');
});
