import { build } from 'esbuild';
import Module from 'node:module';
import path from 'node:path';

// Bundle local TSX to CommonJS so the installed router's CommonJS entry works
// with React's server renderer. Effects never run, so no network requests occur.
const source = `
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './src/lib/auth';
import Reports from './src/pages/Reports';
import WorkReportViewer from './src/components/WorkReportViewer';
import { canReviewWorkReport } from './src/lib/work-report';
for (const role of ['EMPLOYEE', 'MANAGER', 'CEO']) {
  const user = { id: 'self', role, fullName: 'Test Engineer', email: 'test@example.test' };
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: key => key === 'enako_user' ? JSON.stringify(user) : null } });
  const html = renderToString(React.createElement(AuthProvider, null,
    React.createElement(MemoryRouter, { initialEntries: ['/app/reports?new=1'] }, React.createElement(Reports))));
  for (const label of ['Daily Work Report', 'Weekly Work Report', 'Monthly Work Report', 'Save Draft', 'Submit to Management']) {
    assert.ok(html.includes(label), role + ': missing ' + label);
  }
  assert.ok(html.includes('type="file"'));
  assert.ok(html.includes('Upload documents'));
  assert.ok(html.includes('Short note (optional)'));
  assert.ok(!html.includes('Impact Level'));
  assert.ok(!html.includes('Recommendations / Next Steps'));
  console.log(role + ': simplified document upload form renders without the old reporting fields');
}
const viewed = renderToString(React.createElement(WorkReportViewer, {
  report: { id: 'report', type: 'DAILY', status: 'SUBMITTED', date: '2026-11-02T13:00:00Z', content: 'Title: Release report\\nDetails:\\nRelease deployed', user: { fullName: 'Engineer' } },
  onClose: () => {}, onDownload: () => {}, downloading: false,
}));
assert.ok(viewed.includes('Release deployed'));
assert.ok(viewed.includes('Download PDF'));
console.log('Report viewer renders saved content and the download action');
const uploaded = renderToString(React.createElement(WorkReportViewer, {
  report: { id: 'report', type: 'MONTHLY', status: 'SUBMITTED', date: '2026-11-02T13:00:00Z', content: 'Title: Monthly report', documents: [{ id: 'doc', originalName: 'Engineering.docx', sizeBytes: 1024 }] },
  onClose: () => {}, onDownload: () => {}, onViewDocument: () => {}, onDownloadDocument: () => {}, downloading: false,
}));
assert.ok(uploaded.includes('Engineering.docx'));
assert.ok(uploaded.includes('Download original'));
assert.ok(uploaded.includes('View'));
console.log('Uploaded documents have per-file View and Download original actions');
const employeeReport = { id: 'employee-report', userId: 'staff', type: 'DAILY', status: 'VERIFIED', content: 'Title: Employee work', date: '2026-11-02T13:00:00Z', user: { role: { name: 'EMPLOYEE' } } };
for (const role of ['MANAGER', 'CEO']) {
  const html = renderToString(React.createElement(WorkReportViewer, {
    report: employeeReport, onClose: () => {}, onDownload: () => {}, downloading: false,
    canReview: canReviewWorkReport({ id: 'viewer', role }, employeeReport), onReview: () => {},
  }));
  assert.equal(html.includes('Accept &amp; Forward to CEO'), role === 'MANAGER');
}
console.log('Manager acceptance forwards to CEO; CEO staff-report view is read-only');
`;
const result = await build({ stdin: { contents: source, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', define: { 'import.meta.env': '{}' } });
const filename = path.join(process.cwd(), 'report-ui-test.cjs');
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(result.outputFiles[0].text, filename);
