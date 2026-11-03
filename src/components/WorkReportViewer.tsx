import { useEffect, useState } from 'react';
import { workReportTitle, workReportContent, workReportStatus } from '../lib/work-report';

export default function WorkReportViewer({
  report,
  onClose,
  onDownload,
  downloading,
  onViewDocument,
  onDownloadDocument,
  busyDocument,
  canReview = false,
  canCeoReview = false,
  onCeoReview,
  onReview,
  reviewing = false,
  acceptLabel = 'Accept & Forward to CEO',
}: {
  report: any;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
  onViewDocument?: (document: any) => void;
  onDownloadDocument?: (document: any) => void;
  busyDocument?: string | null;
  canReview?: boolean;
  canCeoReview?: boolean;
  onCeoReview?: (comment: string, complete: boolean) => void;
  onReview?: (status: 'VERIFIED' | 'RETURNED', comments: string) => void;
  reviewing?: boolean;
  acceptLabel?: string;
}) {
  const [comments, setComments] = useState('');
  useEffect(() => setComments(''), [report.id, report.ceoComment, report.reviewerComments]);
  const documents = report.documents || [];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-report-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 id="work-report-title" className="font-bold text-slate-900">
              {workReportTitle(report)}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {report.user?.fullName} · {report.type} · {workReportStatus(report)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(report.date || report.createdAt).toLocaleString('en-GB', {
                timeZone: 'Africa/Douala',
              })}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close report" className="text-sm text-slate-600">
            Close
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-5">
          <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
            {workReportContent(report.content)}
          </p>
          {documents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Uploaded documents</h3>
              {documents.map((document: any) => (
                <div
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-slate-800">
                      {document.originalName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(document.sizeBytes / 1024).toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{' '}
                      KB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={!!busyDocument}
                      onClick={() => onViewDocument?.(document)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      View
                    </button>
                    <button
                      disabled={!!busyDocument}
                      onClick={() => onDownloadDocument?.(document)}
                      className="rounded-lg bg-[#001f5b] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busyDocument === document.id ? 'Loading...' : 'Download original'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {report.reviewerComments && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <b>Feedback from {report.reviewer?.fullName || 'your manager'}</b>
              <p className="mt-1 whitespace-pre-wrap">{report.reviewerComments}</p>
            </div>
          )}
          {report.ceoComment && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <b>CEO review</b>
              <p className="whitespace-pre-wrap">{report.ceoComment}</p>
            </div>
          )}
          {canCeoReview && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <label className="block text-sm font-semibold">
                Private review to {report.user?.fullName || 'the report author'}
                <textarea
                  aria-label="CEO private review"
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  maxLength={10000}
                  rows={3}
                  className="mt-2 w-full rounded-lg border p-3 text-sm"
                />
              </label>
              <p className="text-xs text-slate-500">
                Your review is sent as a private chat message with a link to this submitted report.
                The author can reply privately.
              </p>
              <div className="flex gap-2">
                <button
                  disabled={reviewing || !comments.trim()}
                  onClick={() => onCeoReview?.(comments, false)}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Send private review
                </button>
                <button
                  disabled={reviewing}
                  onClick={() => onCeoReview?.(comments, true)}
                  className="rounded-lg bg-[#001f5b] px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {reviewing ? 'Saving...' : 'Mark as complete'}
                </button>
              </div>
            </div>
          )}
          {(report.status === 'VERIFIED' || report.ceoCompletedAt) && !canCeoReview && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <button
                disabled
                className="rounded-lg bg-emerald-100 px-3 py-2 font-semibold text-emerald-800"
              >
                {report.ceoCompletedAt ? 'Completed - Read-only' : 'Accepted - Read-only'}
              </button>
              <p className="mt-2">
                You can view and download this report. Further approval and forwarding are disabled.
              </p>
            </div>
          )}
          {canReview && report.status === 'SUBMITTED' && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <label className="block text-sm font-semibold text-slate-700">
                Review note
                <textarea
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={reviewing}
                  onClick={() => onReview?.('RETURNED', comments)}
                  className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  Return for correction
                </button>
                <button
                  disabled={reviewing}
                  onClick={() => onReview?.('VERIFIED', comments)}
                  className="rounded-lg bg-[#001f5b] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {reviewing ? 'Saving...' : acceptLabel}
                </button>
              </div>
            </div>
          )}
        </div>
        {!documents.length && (
          <div className="flex justify-end border-t border-slate-200 p-4">
            <button
              onClick={onDownload}
              disabled={downloading}
              className="rounded-lg bg-[#001f5b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
