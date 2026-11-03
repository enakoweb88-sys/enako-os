export function workReportTitle(report: { type?: string; content?: string }) {
  return (
    report.content?.match(/^Title:\s*(.+)$/m)?.[1]?.trim() ||
    `${report.type || 'DAILY'} work report`
  );
}

function ownerRole(report: any): string {
  return typeof report.user?.role === 'string'
    ? report.user.role
    : report.user?.role?.name || 'EMPLOYEE';
}

export function canReviewWorkReport(
  viewer: { id: string; role: string } | null | undefined,
  report: any,
) {
  if (
    !viewer ||
    report.userId === viewer.id ||
    report.status !== 'SUBMITTED' ||
    report.ceoCompletedAt
  )
    return false;
  if (viewer.role === 'CEO') return false;
  return ['MANAGER', 'OUTREACH_MANAGER'].includes(viewer.role);
}

export function canCeoReviewReport(
  viewer: { id: string; role: string } | null | undefined,
  report: any,
) {
  return (
    viewer?.role === 'CEO' &&
    viewer.id !== report.userId &&
    !report.ceoCompletedAt &&
    (report.status === 'VERIFIED' ||
      (report.status === 'SUBMITTED' &&
        ['MANAGER', 'OUTREACH_MANAGER'].includes(ownerRole(report))))
  );
}

export function workReportStatus(report: any) {
  if (report.ceoCompletedAt) return 'Completed - Reviewed by CEO';
  if (report.status === 'DRAFT') return 'Private draft';
  if (report.status === 'RETURNED') return 'Returned for correction';
  const managementReport = ['MANAGER', 'OUTREACH_MANAGER'].includes(ownerRole(report));
  if (report.status === 'VERIFIED')
    return managementReport ? 'Accepted by CEO' : 'Accepted · Forwarded to CEO';
  if (report.status === 'SUBMITTED')
    return managementReport ? 'Awaiting CEO comment' : 'Awaiting manager review';
  return report.status || 'Submitted';
}

export function workReportContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
  } catch {
    /* Plain text report. */
  }
  return content || 'No report content';
}

export function workReportPdfRows(report: any): string[][] {
  const rows = [
    ['Author', `${report.user?.fullName || 'Staff member'} (${report.user?.email || ''})`],
    ['Report type', report.type || 'DAILY'],
    ['Status', report.status || 'SUBMITTED'],
    [
      'Recorded at',
      new Date(report.date || report.createdAt).toLocaleString('en-GB', {
        timeZone: 'Africa/Douala',
      }),
    ],
    ['Report reference', report.id],
    ['Report content', workReportContent(report.content)],
  ];
  if (report.reviewer?.fullName) rows.push(['Reviewed by', report.reviewer.fullName]);
  if (report.reviewerComments) rows.push(['Reviewer feedback', report.reviewerComments]);
  if (report.reviewedAt)
    rows.push([
      'Reviewed at',
      new Date(report.reviewedAt).toLocaleString('en-GB', { timeZone: 'Africa/Douala' }),
    ]);
  return rows;
}

export function workReportNeedsAttention(
  viewer: { id: string; role: string } | null | undefined,
  report: any,
) {
  return (
    canCeoReviewReport(viewer, report) ||
    canReviewWorkReport(viewer, report) ||
    (!!viewer && report.userId === viewer.id && ['DRAFT', 'RETURNED'].includes(report.status))
  );
}
