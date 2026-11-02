import { test } from 'node:test';
import assert from 'node:assert/strict';
import { workReportTitle, workReportContent, workReportPdfRows, canReviewWorkReport, workReportStatus } from './work-report';

test('download rows include full submitted contents, author and review feedback', () => {
  const content = 'Title: Engineering delivery\nDetails:\n' + 'Release details '.repeat(2000);
  const report = { id: 'id-1', type: 'MONTHLY', status: 'VERIFIED', date: '2026-11-02T13:00:00Z', content, user: { fullName: 'Joseph', email: 'joseph@example.test' }, reviewer: { fullName: 'Manager' }, reviewerComments: 'Approved' };
  assert.equal(workReportTitle(report), 'Engineering delivery');
  const rows = workReportPdfRows(report);
  assert.ok(rows.some(([label, value]) => label === 'Report content' && value === content));
  assert.ok(rows.some(([label, value]) => label === 'Report type' && value === 'MONTHLY'));
  assert.ok(rows.some(([label, value]) => label === 'Reviewer feedback' && value === 'Approved'));
  assert.ok(rows.some(([label, value]) => label === 'Author' && value.includes('Joseph')));
});
test('field reports show all stored metrics and work notes in view and download', () => {
  const content = JSON.stringify({ completed: 'Visited customers', people: 12, kpiResults: { target: 4 } });
  const rendered = workReportContent(content);
  assert.ok(rendered.includes('Visited customers')); assert.ok(rendered.includes('12')); assert.ok(rendered.includes('target'));
});

test('employee status explains manager review and automatic forwarding', () => {
  assert.equal(workReportStatus({ status: 'SUBMITTED' }), 'Awaiting manager review');
  assert.equal(workReportStatus({ status: 'VERIFIED' }), 'Accepted · Forwarded to CEO');
  assert.equal(workReportStatus({ status: 'RETURNED' }), 'Returned for correction');
});
test('only managers accept employee reports; CEO can review management submissions', () => {
  const report = { userId: 'employee', status: 'SUBMITTED', user: { role: { name: 'EMPLOYEE' } } };
  assert.equal(canReviewWorkReport({ id: 'manager', role: 'MANAGER' }, report), true);
  assert.equal(canReviewWorkReport({ id: 'ceo', role: 'CEO' }, report), false);
  assert.equal(canReviewWorkReport({ id: 'employee', role: 'EMPLOYEE' }, report), false);
  const management = { ...report, userId: 'manager', user: { role: { name: 'MANAGER' } } };
  assert.equal(canReviewWorkReport({ id: 'ceo', role: 'CEO' }, management), true);
  assert.equal(canReviewWorkReport({ id: 'manager', role: 'MANAGER' }, management), false);
  assert.equal(workReportStatus(management), 'Awaiting CEO review');
});
