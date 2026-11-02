export function workReportTitle(report: { type?: string; content?: string }) {
  return report.content?.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || `${report.type || 'DAILY'} work report`;
}

export function workReportContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
  } catch { /* Plain text report. */ }
  return content || 'No report content';
}

export function workReportPdfRows(report: any): string[][] {
  const rows = [
    ['Author', `${report.user?.fullName || 'Staff member'} (${report.user?.email || ''})`],
    ['Report type', report.type || 'DAILY'],
    ['Status', report.status || 'SUBMITTED'],
    ['Recorded at', new Date(report.date || report.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Douala' })],
    ['Report reference', report.id],
    ['Report content', workReportContent(report.content)],
  ];
  if (report.reviewer?.fullName) rows.push(['Reviewed by', report.reviewer.fullName]);
  if (report.reviewerComments) rows.push(['Reviewer feedback', report.reviewerComments]);
  if (report.reviewedAt) rows.push(['Reviewed at', new Date(report.reviewedAt).toLocaleString('en-GB', { timeZone: 'Africa/Douala' })]);
  return rows;
}
