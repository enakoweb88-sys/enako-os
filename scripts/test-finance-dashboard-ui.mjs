import { build } from 'esbuild';
import Module from 'node:module';
import path from 'node:path';

// Render the loaded page, not just its loading spinner: the original crash
// happened only after the finance requests finished.
const source = `
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FinanceDashboardView } from './src/pages/dashboards/FinanceDashboard';
import { emptyFinanceDashboard } from './src/lib/finance-dashboard';
import { WorkspaceErrorBoundary } from './src/components/WorkspaceErrorBoundary';
import { AuthProvider } from './src/lib/auth';
import Dashboard from './src/pages/Dashboard';
import DashboardLayout from './src/layouts/DashboardLayout';

const data = emptyFinanceDashboard();
data.banking = [{ name: 'Company bank', bank: 'Bank', accountNo: '123', balance: '1500', currency: 'XAF' }, { name: 'USD bank', balance: '50', currency: 'USD' }];
data.budget = [{ category: 'Operations', budget: 0, actual: 0 }];
data.invoices = { summary: { paid: 250 }, recent: [{ id: 'invoice', client: 'Client', amount: 250, status: 'Paid' }] };
for (const scenario of [
  { data }, { data: emptyFinanceDashboard() },
  { data, error: 'Bank accounts could not be loaded' }, { data, loading: true },
]) {
  const html = renderToString(<FinanceDashboardView {...scenario} onRefresh={() => {}} />);
  assert.ok(html.includes('Mobile Money Floats &amp; Bank Accounts'));
  assert.ok(html.includes('Refresh'));
  assert.ok(!html.includes('NaN')); assert.ok(!html.includes('Infinity'));
  if (scenario.error) assert.ok(html.includes('role="alert"'));
}
const loaded = renderToString(<FinanceDashboardView data={data} onRefresh={() => {}} />);
assert.ok(loaded.includes('1,500 FCFA / 50 USD'));
assert.ok(loaded.includes('Client'));
console.log('PASS: loaded, empty, loading and failed-section finance screens render; currency totals remain separate.');

globalThis.window = { location: { hash: '' }, addEventListener: () => {}, removeEventListener: () => {} };
for (const department of ['Finance', { name: 'Finance' }, null]) {
  const user = { id: 'accountant', email: 'accountant@example.test', fullName: 'Accountant', role: 'EMPLOYEE', title: 'Accountant', department };
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: key => key === 'enako_user' ? JSON.stringify(user) : null } });
  const html = renderToString(<AuthProvider><MemoryRouter initialEntries={['/app/dashboard']}>
    <Routes><Route path="/app" element={<DashboardLayout />}><Route path="dashboard" element={<Dashboard />} /></Route></Routes>
  </MemoryRouter></AuthProvider>);
  assert.ok(html.includes('Finance, Treasury &amp; Liquidity Control'));
  assert.ok(html.includes('Loading finance dashboard'));
  assert.ok(!html.includes('Human Resource'));
}
console.log('PASS: accountant login profiles route through the actual dashboard and sidebar for current and older sessions.');

const boundary = new WorkspaceErrorBoundary({ children: <p>Dashboard content</p> });
assert.equal(renderToString(boundary.render()), '<p>Dashboard content</p>');
boundary.state = WorkspaceErrorBoundary.getDerivedStateFromError();
const fallback = renderToString(boundary.render());
assert.ok(fallback.includes('Reload page')); assert.ok(fallback.includes('role="alert"'));
console.log('PASS: unexpected render errors have a visible recovery screen.');
`;
const result = await build({ stdin: { contents: source, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', define: { 'import.meta.env': '{}' } });
const filename = path.join(process.cwd(), 'finance-dashboard-test.cjs');
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(result.outputFiles[0].text, filename);
