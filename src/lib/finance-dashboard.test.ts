import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadFinanceDashboard, treasuryBalances } from './finance-dashboard';

const source = () => ({
  accountsSummary: async () => ({ assets: 1500 }),
  banking: async () => [{ name: 'Bank', balance: '1500', currency: 'XAF' }],
  budget: async () => [{ category: 'Operations', budget: '500', actual: '250' }],
  cashPosition: async () => ({ chartData: [{ name: 'Mon', Inflow: 200 }] }),
  invoicesOverview: async () => ({ summary: { paid: 100 }, recent: [{ id: 'invoice' }] }),
});

test('all five finance sections load, including serialized decimal balances', async () => {
  const { data, failed } = await loadFinanceDashboard(source());
  assert.deepEqual(failed, []);
  assert.equal(data.accounts.assets, 1500);
  assert.equal(data.banking.length, 1);
  assert.equal(data.budget.length, 1);
  assert.equal(data.cashPosition.chartData.length, 1);
  assert.equal(data.invoices.recent.length, 1);
});

test('a failed section preserves the other four and refresh recovers', async () => {
  const api = source();
  api.banking = async () => { throw new Error('Service unavailable'); };
  const { data, failed } = await loadFinanceDashboard(api);
  assert.deepEqual(failed, ['banking']);
  assert.equal(data.accounts.assets, 1500);
  assert.equal(data.budget.length, 1);
  assert.equal(data.invoices.recent.length, 1);
  assert.equal((await loadFinanceDashboard(source())).failed.length, 0);
});

test('every section may fail without rejecting the whole dashboard', async () => {
  const unavailable = async () => { throw new Error('Unavailable'); };
  const api = { accountsSummary: unavailable, banking: unavailable, budget: unavailable, cashPosition: unavailable, invoicesOverview: unavailable };
  const result = await loadFinanceDashboard(api);
  assert.equal(result.failed.length, 5);
  assert.deepEqual(result.data.banking, []);
  assert.deepEqual(result.data.invoices.recent, []);
});

test('treasury totals keep currencies separate and ignore invalid balances', () => {
  assert.deepEqual(treasuryBalances([
    { balance: '1000', currency: 'XAF' }, { balance: '200', currency: 'XAF' },
    { balance: '50', currency: 'USD' }, { balance: 'invalid', currency: 'XAF' },
  ]), [['XAF', 1200], ['USD', 50]]);
  assert.deepEqual(treasuryBalances([]), []);
});
