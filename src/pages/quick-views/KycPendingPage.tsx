import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { API_BASE_URL } from '../../lib/api/core';
import { toast } from 'sonner';

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
};

const isImageUrl = (doc: any) => {
  if (doc?.mimeType && doc.mimeType.startsWith('image/')) return true;
  const url = (doc?.fileUrl || '').split('?')[0].toLowerCase();
  return /\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff?)$/.test(url);
};

const isPdfUrl = (doc: any) => {
  if (doc?.mimeType === 'application/pdf') return true;
  const url = (doc?.fileUrl || '').split('?')[0].toLowerCase();
  return /\.pdf$/.test(url);
};

const handleDownload = async (doc: any) => {
  if (!doc?.fileUrl) return;
  try {
    const url = getFileUrl(doc.fileUrl);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = doc.fileName || 'kyc-document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(getFileUrl(doc.fileUrl), '_blank');
  }
};

export default function KycPendingPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [activeDocument, setActiveDocument] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ status: '', rejectionReason: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.kyc({ limit: 100 });
      const pendingList = (res || []).filter(
        (k: any) => k.status === 'PENDING' || k.status === 'UNDER_REVIEW'
      );
      setSubmissions(pendingList);
      setErrorMsg('');

      // Auto-select first item or maintain selection
      if (pendingList.length > 0) {
        setSelected((prev: any) => {
          if (prev) {
            const existing = pendingList.find((k: any) => k.id === prev.id);
            if (existing) return existing;
          }
          return pendingList[0];
        });
      } else {
        setSelected(null);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update active document whenever selected applicant changes
  useEffect(() => {
    if (selected?.documents?.length > 0) {
      setActiveDocument(selected.documents[0]);
    } else {
      setActiveDocument(null);
    }
    setReviewForm({ status: '', rejectionReason: '' });
  }, [selected?.id]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reviewForm.status) return;

    if (reviewForm.status === 'REJECTED' && !reviewForm.rejectionReason.trim()) {
      toast.error('Please specify a rejection reason for compliance auditing.');
      return;
    }

    setSubmitting(true);
    try {
      await api.reviewKyc(selected.id, reviewForm);
      toast.success(`Submission marked as ${reviewForm.status}.`);
      setReviewForm({ status: '', rejectionReason: '' });
      await loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update review status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = submissions.filter((r) => {
    const term = search.toLowerCase();
    const name = (r.applicantName || '').toLowerCase();
    const email = (r.email || '').toLowerCase();
    const phone = (r.phone || '').toLowerCase();
    const type = (r.applicantType || '').toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term) || type.includes(term);
  });

  return (
    <div className="space-y-6 font-sans pb-24">
      {/* Top Header & Breadcrumb (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Compliance & Risk</span>
            <span>/</span>
            <Link to="/app/kyc" className="hover:underline text-slate-500 cursor-pointer">
              KYC
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Pending Submissions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pending Submissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active verification queue awaiting compliance inspection and risk assessment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/app/kyc"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            All KYC Directory
          </Link>
          <Link
            to="/app/kyc/approved"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Approved
          </Link>
          <Link
            to="/app/kyc/rejected"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Rejected
          </Link>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── NOTE: NO METRIC CARDS AS EXPLICITLY REQUESTED ── */}

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search pending applicants by name, email, phone, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>Queue Count:</span>
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
            {filtered.length} Awaiting Verification
          </span>
        </div>
      </div>

      {/* Pending Submissions Queue Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Pending Applicants Queue
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Select an applicant to review documentation below
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Applicant</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Details</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Entity Type</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted Date</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Documents</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs font-semibold text-slate-500">
                    Loading pending verification requests...
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-rose-600 bg-rose-50/50">
                    {errorMsg}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">
                    No pending submissions found. All applications have been reviewed.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isCurrent = selected?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isCurrent ? 'bg-slate-100/90 font-medium' : 'hover:bg-slate-50/80'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#001f5b] shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.applicantName}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <p>{item.email || '—'}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                          {item.applicantType || 'INDIVIDUAL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        <span className="font-semibold">{item.documents?.length || 0}</span> file(s)
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
                            item.status === 'UNDER_REVIEW'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item);
                          }}
                          className={cn(
                            'px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors',
                            isCurrent
                              ? 'bg-[#001f5b] text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          {isCurrent ? 'Reviewing' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INSPECTION & DOCUMENT VIEWER SECTION ── */}
      {selected && (
        <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden space-y-6">
          {/* Section Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#001f5b] text-white text-[10px] font-bold uppercase tracking-wider">
                  Active Review
                </span>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  {selected.applicantName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Type: <strong className="text-slate-800 uppercase">{selected.applicantType}</strong> · Submitted:{' '}
                <span className="font-mono text-slate-700">{new Date(selected.createdAt).toLocaleString()}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border',
                  selected.status === 'UNDER_REVIEW'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}
              >
                Current: {selected.status}
              </span>
            </div>
          </div>

          {/* Top Info & Decision Form */}
          <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Applicant Information & Payload */}
            <div className="lg:col-span-7 space-y-5">
              <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Application Credentials & Metadata
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate / Contact Email</p>
                  <p className="font-semibold text-slate-900">{selected.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Phone</p>
                  <p className="font-semibold text-slate-900">{selected.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Entity Classification</p>
                  <p className="font-semibold text-slate-900 uppercase">{selected.applicantType || 'INDIVIDUAL'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Record ID</p>
                  <p className="font-mono text-slate-700 text-[11px]">{selected.id}</p>
                </div>
              </div>

              {/* Grouped Application Payload */}
              {(() => {
                const payload = selected.payload || {};
                const entries = Object.entries(payload);
                if (entries.length === 0) {
                  return (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
                      No additional metadata provided in this submission.
                    </div>
                  );
                }

                return (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200">
                      Application Form Data
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                      {entries.map(([key, val]) => (
                        <div key={key}>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xs font-semibold text-slate-900 break-words">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: Decision Action Form */}
            <div className="lg:col-span-5 bg-slate-50 rounded-lg p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Compliance Officer Decision
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Inspect the identity credentials and documents at the bottom before submitting your audit verdict.
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, status: 'UNDER_REVIEW' }))}
                    className={cn(
                      'py-2.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-center',
                      reviewForm.status === 'UNDER_REVIEW'
                        ? 'bg-sky-50 text-sky-800 border-sky-300 ring-2 ring-sky-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    Reviewing
                  </button>

                  {(role === 'ceo' || role === 'manager' || role === 'outreach_manager') && (
                    <button
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, status: 'APPROVED' }))}
                      className={cn(
                        'py-2.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-center',
                        reviewForm.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      Approve
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, status: 'REJECTED' }))}
                    className={cn(
                      'py-2.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-center',
                      reviewForm.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    Reject
                  </button>
                </div>

                {reviewForm.status === 'REJECTED' && (
                  <div className="space-y-2 mb-4">
                    <label className="block text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                      Rejection Audit Reason *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewForm.rejectionReason}
                      onChange={(e) => setReviewForm((f) => ({ ...f, rejectionReason: e.target.value }))}
                      placeholder="Specify illegible documents, expiration, mismatch with national registry..."
                      className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-rose-400 font-medium resize-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleReview}
                disabled={!reviewForm.status || submitting}
                className="w-full py-3 bg-[#001f5b] hover:bg-[#001744] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {submitting ? 'Recording Audit...' : 'Submit Verification Verdict'}
              </button>
            </div>
          </div>

          {/* ── CRITICAL USER REQUIREMENT: IMAGE & DOCUMENT VIEWER AT THE BOTTOM, BIG & CLEAR ── */}
          <div className="border-t border-slate-200 pt-6 px-6 pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verification Credentials & Supporting Documents
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-resolution document viewer positioned at the bottom for maximum clarity and detail inspection.
                </p>
              </div>

              {activeDocument && (
                <button
                  type="button"
                  onClick={() => handleDownload(activeDocument)}
                  className="self-start sm:self-auto px-3.5 py-1.5 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-lg text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
                >
                  Download Original File
                </button>
              )}
            </div>

            {selected.documents?.length > 0 ? (
              <div className="space-y-4">
                {/* Horizontal Document Selection Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                  {selected.documents.map((doc: any, idx: number) => {
                    const isDocActive = activeDocument?.id === doc.id || (!activeDocument && idx === 0);
                    return (
                      <button
                        key={doc.id || idx}
                        type="button"
                        onClick={() => setActiveDocument(doc)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border',
                          isDocActive
                            ? 'bg-[#001f5b] text-white border-[#001f5b] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        <span>{doc.documentType || `Document ${idx + 1}`}</span>
                        {doc.fileName && (
                          <span className="text-[10px] opacity-75 font-normal ml-1.5">
                            ({doc.fileName.length > 20 ? doc.fileName.slice(0, 18) + '...' : doc.fileName})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Big and Clear Image / Document Viewer Box */}
                <div className="w-full bg-slate-900/5 border border-slate-200/90 rounded-lg overflow-hidden">
                  {/* Viewer Metadata Bar */}
                  <div className="px-5 py-3 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 uppercase">
                        {activeDocument?.documentType || 'Document'}
                      </span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-slate-600 font-mono">
                        {activeDocument?.fileName || 'Attached file'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Inspection Mode: High-Resolution</span>
                    </div>
                  </div>

                  {/* Viewer Body: Generous Size */}
                  <div className="w-full min-h-[550px] p-4 flex items-center justify-center bg-slate-100/90">
                    {activeDocument ? (
                      !activeDocument.fileUrl ? (
                        <div className="text-center p-8 bg-white rounded-lg border border-amber-200 max-w-md shadow-xs">
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                            Document Metadata Only
                          </p>
                          <p className="text-xs text-slate-600">
                            The document record <strong className="text-slate-900">{activeDocument.fileName}</strong> was registered, but the file binary was not uploaded. Request client re-submission if required.
                          </p>
                        </div>
                      ) : isImageUrl(activeDocument) ? (
                        <div className="w-full flex flex-col items-center justify-center">
                          <img
                            src={getFileUrl(activeDocument.fileUrl)}
                            alt={activeDocument.documentType || 'KYC Document'}
                            className="w-auto max-w-full max-h-[750px] object-contain rounded-lg shadow-md border border-slate-200/90 bg-white"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="hidden flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-slate-200 max-w-md">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                              Image Preview Unavailable
                            </p>
                            <p className="text-xs text-slate-500 mb-3">
                              This image could not be loaded directly. Use the download button above to inspect the file.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDownload(activeDocument)}
                              className="px-3.5 py-1.5 bg-[#001f5b] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                            >
                              Download File
                            </button>
                          </div>
                        </div>
                      ) : isPdfUrl(activeDocument) ? (
                        <iframe
                          src={getFileUrl(activeDocument.fileUrl)}
                          className="w-full h-[750px] rounded-lg border border-slate-200 bg-white shadow-sm"
                          title={activeDocument.fileName || 'KYC Document PDF'}
                        />
                      ) : (
                        <div className="text-center p-8 bg-white rounded-lg border border-slate-200 max-w-md shadow-xs space-y-3">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Direct Preview Not Available for this File Format
                          </p>
                          <p className="text-xs text-slate-500">
                            File: {activeDocument.fileName}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDownload(activeDocument)}
                            className="px-4 py-2 bg-[#001f5b] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                          >
                            Download Document
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="text-center text-xs text-slate-500">
                        Select a document tab above to preview.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
                No supporting documents were attached to this application.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
