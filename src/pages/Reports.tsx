import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { exportTablePdf } from '../lib/pdf-export';
import { workReportTitle, workReportPdfRows } from '../lib/work-report';
import WorkReportViewer from '../components/WorkReportViewer';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export default function Reports() {
  const { user } = useAuth();
  const canReview = ['CEO', 'MANAGER', 'OUTREACH_MANAGER'].includes(user?.role || '');
  const [params, setParams] = useSearchParams();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('DAILY');
  const [files, setFiles] = useState<File[]>([]);
  const [retained, setRetained] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [canSaveDraft, setCanSaveDraft] = useState(true);
  const [viewed, setViewed] = useState<any>(null);
  const [busyDocument, setBusyDocument] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [preview, setPreview] = useState<{
    url: string;
    mime: string;
    name: string;
    document: any;
    report: any;
    text?: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const previewRequest = useRef(0);

  const load = async () => {
    setLoading(true);
    try {
      setReports(await api.dailyReports());
    } catch (error: any) {
      toast.error(error.message || 'Could not load reports');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [user?.id]);
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview?.url],
  );

  const showDocument = async (report: any, document: any) => {
    const request = ++previewRequest.current;
    setBusyDocument(document.id);
    try {
      const blob = await api.reportDocument(report.id, document.id, true);
      const text = blob.type.startsWith('text/plain') ? await blob.text() : undefined;
      if (request !== previewRequest.current) return;
      setPreview({
        url: URL.createObjectURL(blob),
        mime: blob.type,
        name: document.originalName,
        report,
        document,
        text,
      });
    } catch (error: any) {
      toast.error(error.message || 'Could not open document');
    } finally {
      if (request === previewRequest.current) setBusyDocument(null);
    }
  };

  const openReport = async (id: string, previewSingle = true) => {
    setOpeningId(id);
    try {
      const report = await api.getDailyReport(id);
      setViewed(report);
      if (previewSingle && report.documents?.length === 1)
        await showDocument(report, report.documents[0]);
    } catch (error: any) {
      toast.error(error.message || 'Could not open report');
    } finally {
      setOpeningId(null);
    }
  };
  const linkedReport = params.get('reportId');
  useEffect(() => {
    if (linkedReport) void openReport(linkedReport);
  }, [linkedReport]);

  const downloadDocument = async (report: any, document: any) => {
    if (busyDocument) return;
    setBusyDocument(document.id);
    try {
      const blob = await api.reportDocument(report.id, document.id);
      const url = URL.createObjectURL(blob);
      const link = documentElement(url, document.originalName);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success('Original document downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Could not download document');
    } finally {
      setBusyDocument(null);
    }
  };

  const downloadReport = async (id: string) => {
    try {
      const report = await api.getDailyReport(id);
      if (report.documents?.length === 1) return downloadDocument(report, report.documents[0]);
      if (report.documents?.length > 1) {
        setViewed(report);
        toast.info('Choose the document to download below.');
        return;
      }
      // Keep historical text reports readable and exportable.
      const saved = exportTablePdf({
        title: workReportTitle(report),
        headers: ['Section', 'Report Details'],
        rows: workReportPdfRows(report),
        fileName: `ENAKO_Report_${report.id}.pdf`,
      });
      if (!saved) throw new Error('Could not download report');
    } catch (error: any) {
      toast.error(error.message || 'Could not download report');
    }
  };

  const clearNew = () => {
    if (params.has('new')) {
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    }
  };
  const startNew = () => {
    setEditingId(null);
    setTitle('');
    setNote('');
    setType('DAILY');
    setFiles([]);
    setRetained([]);
    setCanSaveDraft(true);
    setCreating(true);
  };
  const revise = async (id: string) => {
    try {
      const report = await api.getDailyReport(id);
      setEditingId(report.id);
      setTitle(workReportTitle(report));
      setCanSaveDraft(report.status === 'DRAFT');
      setNote((report.content || '').replace(/^Title:.*\r?\n*/m, '').trim());
      setType(report.type);
      setFiles([]);
      setRetained(report.documents || []);
      setCreating(true);
    } catch (error: any) {
      toast.error(error.message || 'Could not load report');
    }
  };
  const selectFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)];
    if (next.length + retained.length > MAX_FILES) {
      toast.error('You can attach up to 5 documents per report.');
      return;
    }
    if (next.some((file) => file.size === 0 || file.size > MAX_FILE_BYTES)) {
      toast.error('Each document must be non-empty and no larger than 20 MB.');
      return;
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = '';
  };
  const submit = async (event: FormEvent, status = 'SUBMITTED') => {
    event.preventDefault();
    if (saving) return;
    if (!title.trim() || files.length + retained.length === 0) {
      toast.error('Add a title and at least one document.');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append('title', title.trim());
      body.append('note', note.trim());
      body.append('type', type);
      body.append('status', status);
      body.append('retainedDocumentIds', JSON.stringify(retained.map((document) => document.id)));
      files.forEach((file) => body.append('documents', file));
      const saved = await api.uploadReport(body, editingId || undefined);
      setFiles([]);
      setRetained(saved.documents || []);
      setEditingId(saved.id);
      if (fileInput.current) fileInput.current.value = '';
      if (status === 'SUBMITTED') {
        setCreating(false);
        clearNew();
      }
      toast.success(
        status === 'DRAFT'
          ? 'Draft and documents saved'
          : 'Report and documents submitted to management',
      );
      await load();
    } catch (error: any) {
      toast.error(
        error.message || 'Upload failed. Your selected documents are still available to retry.',
      );
    } finally {
      setSaving(false);
    }
  };
  const review = async (status: 'VERIFIED' | 'RETURNED', comments: string) => {
    if (!viewed || reviewing) return;
    if (status === 'RETURNED' && !comments.trim()) {
      toast.error('Add a short note explaining the correction needed.');
      return;
    }
    setReviewing(true);
    try {
      await api.reviewDailyReport(viewed.id, { status, reviewerComments: comments });
      setViewed(await api.getDailyReport(viewed.id));
      await load();
      toast.success(status === 'VERIFIED' ? 'Report verified' : 'Report returned for correction');
    } catch (error: any) {
      toast.error(error.message || 'Could not save review');
    } finally {
      setReviewing(false);
    }
  };

  const displayed = reports.filter(
    (report) =>
      (statusFilter === 'ALL' || report.status === statusFilter) &&
      `${workReportTitle(report)} ${report.user?.fullName || ''} ${report.type}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {creating
              ? 'Submit Work Report'
              : canReview
                ? 'Staff Reports Inbox'
                : 'My Work Reports'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {creating
              ? 'Add a title, attach your documents, and submit.'
              : 'View original documents, download files, and track report feedback.'}
          </p>
        </div>
        {!creating && (
          <div className="flex gap-2">
            <button
              onClick={startNew}
              className="rounded-lg bg-[#001f5b] px-4 py-2 text-xs font-semibold text-white"
            >
              Submit Work Report
            </button>
            <button onClick={load} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
              Refresh
            </button>
          </div>
        )}
      </div>
      {creating ? (
        <form
          onSubmit={submit}
          className="max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-5"
        >
          <label className="block text-sm font-semibold text-slate-700">
            Report title
            <input
              required
              maxLength={200}
              disabled={saving}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Engineering weekly report"
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Report period
            <select
              disabled={saving}
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm"
            >
              <option value="DAILY">Daily Work Report</option>
              <option value="WEEKLY">Weekly Work Report</option>
              <option value="MONTHLY">Monthly Work Report</option>
              <option value="GENERAL">General Work Report</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Short note (optional)
            <textarea
              maxLength={4000}
              disabled={saving}
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anything management should know about these documents"
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm"
            />
          </label>
          <div className="space-y-3 rounded-lg border-2 border-dashed border-slate-300 p-4">
            <label
              className="block text-sm font-semibold text-slate-700"
              htmlFor="report-documents"
            >
              Upload documents
            </label>
            <input
              ref={fileInput}
              id="report-documents"
              type="file"
              multiple
              disabled={saving}
              onChange={(event) => selectFiles(event.target.files)}
              className="w-full text-sm"
            />
            <p className="text-xs text-slate-500">
              All file types accepted: PDF, Word, Excel, images, presentations, ZIP and more. Up to
              5 documents, 20 MB each.
            </p>
            {retained.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="break-all">{document.originalName} · Saved</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setRetained((current) => current.filter((item) => item.id !== document.id))
                  }
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="break-all">
                  {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setCreating(false);
                clearNew();
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            {canSaveDraft && (
              <button
                type="button"
                disabled={saving}
                onClick={(event) => submit(event, 'DRAFT')}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Save Draft
              </button>
            )}
            <button
              disabled={saving}
              type="submit"
              className="rounded-lg bg-[#001f5b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Uploading documents...' : 'Submit to Management'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <input
              aria-label="Search reports"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, author or period"
              className="min-w-60 flex-1 rounded-lg border border-slate-200 p-2 text-sm"
            />
            <select
              aria-label="Report status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 p-2 text-sm"
            >
              <option value="ALL">All statuses</option>
              {['DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading reports...</p>
          ) : displayed.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No reports found. Submit a report to get started.
            </p>
          ) : (
            displayed.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <h2 className="break-words text-sm font-bold text-slate-900">
                    {workReportTitle(report)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.user?.fullName} · {report.type} · {report.status} ·{' '}
                    {report.documents?.length || 0} documents
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(report.date).toLocaleDateString('en-GB', {
                      timeZone: 'Africa/Douala',
                    })}
                  </p>
                  {report.reviewerComments && (
                    <p className="mt-2 text-xs text-amber-800">
                      Feedback: {report.reviewerComments}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={!!openingId}
                    onClick={() => openReport(report.id)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {openingId === report.id ? 'Opening...' : 'View'}
                  </button>
                  <button
                    disabled={!!busyDocument}
                    onClick={() => downloadReport(report.id)}
                    className="rounded-lg bg-[#001f5b] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Download
                  </button>
                  {canReview && report.userId !== user?.id && report.status !== 'DRAFT' && (
                    <button
                      onClick={() => openReport(report.id, false)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    >
                      Review
                    </button>
                  )}
                  {report.userId === user?.id &&
                    report.status !== 'VERIFIED' &&
                    (report.type === 'FIELD' ? (
                      <Link to="/app/marketer/daily-report" className="px-3 py-2 text-xs">
                        Revise field report
                      </Link>
                    ) : (
                      <button
                        onClick={() => revise(report.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        {report.status === 'DRAFT' ? 'Edit Draft' : 'Revise & Resubmit'}
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
      {viewed && (
        <WorkReportViewer
          report={viewed}
          onClose={() => {
            ++previewRequest.current;
            setViewed(null);
            setBusyDocument(null);
            if (params.has('reportId')) {
              const next = new URLSearchParams(params);
              next.delete('reportId');
              setParams(next, { replace: true });
            }
          }}
          onDownload={() => downloadReport(viewed.id)}
          downloading={!!busyDocument}
          onViewDocument={(document) => showDocument(viewed, document)}
          onDownloadDocument={(document) => downloadDocument(viewed, document)}
          busyDocument={busyDocument}
          canReview={canReview && viewed.userId !== user?.id && viewed.status !== 'DRAFT'}
          onReview={review}
          reviewing={reviewing}
        />
      )}
      {preview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 p-3">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={preview.name}
            className="flex h-[92vh] w-full max-w-6xl flex-col rounded-xl bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-3">
              <h2 className="break-all text-sm font-semibold">{preview.name}</h2>
              <div className="flex gap-3">
                <button
                  disabled={!!busyDocument}
                  onClick={() => downloadDocument(preview.report, preview.document)}
                  className="text-sm font-semibold text-[#001f5b]"
                >
                  Download original
                </button>
                <button onClick={() => setPreview(null)} className="text-sm">
                  Close preview
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-2">
              {preview.mime === 'application/pdf' ? (
                <iframe title={preview.name} src={preview.url} className="h-full w-full" />
              ) : preview.mime.startsWith('image/') ? (
                <img
                  alt={preview.name}
                  src={preview.url}
                  className="mx-auto max-h-full max-w-full object-contain"
                />
              ) : preview.text !== undefined ? (
                <pre className="whitespace-pre-wrap break-words p-4 text-sm">{preview.text}</pre>
              ) : (
                <div className="p-8 text-center text-sm text-slate-600">
                  <p>This file type cannot be previewed in your browser.</p>
                  <p className="mt-2">
                    Download the original document to open it in its application.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function documentElement(url: string, name: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  return link;
}
