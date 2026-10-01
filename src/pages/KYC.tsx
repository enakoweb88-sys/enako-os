import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { API_BASE_URL } from '../lib/api/core';

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
};

const isImageUrl = (doc: any) => {
  if (doc.mimeType && doc.mimeType.startsWith('image/')) return true;
  const url = (doc.fileUrl || '').split('?')[0].toLowerCase();
  return /\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff?)$/.test(url);
};

const isPdfUrl = (doc: any) => {
  if (doc.mimeType === 'application/pdf') return true;
  const url = (doc.fileUrl || '').split('?')[0].toLowerCase();
  return /\.pdf$/.test(url);
};

const handleDownload = async (doc: any) => {
  if (!doc.fileUrl) return;
  try {
    const url = getFileUrl(doc.fileUrl);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = doc.fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(getFileUrl(doc.fileUrl), '_blank');
  }
};

export default function KYC() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [activeDocument, setActiveDocument] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ status: '', rejectionReason: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.kyc({ status: statusFilter || undefined, search: search || undefined, limit: 50 });
      setItems(res);
      setErrorMsg('');
    } catch (e: any) { 
      console.error(e); 
      setErrorMsg(e.message || String(e));
    }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reviewForm.status) return;
    setSubmitting(true);
    try {
      await api.reviewKyc(selected.id, reviewForm);
      setSelected(null);
      setActiveDocument(null);
      setReviewForm({ status: '', rejectionReason: '' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 font-sans">
        <h2 className="text-2xl font-display font-bold text-slate-900 uppercase tracking-tight">Compliance Access Required</h2>
        <p className="text-slate-500 max-w-sm text-sm">KYC data is restricted to compliance officers and executive personnel.</p>
      </div>
    );
  }

  const stats = {
    total: items.length,
    approved: items.filter(v => v.status === 'APPROVED').length,
    pending: items.filter(v => v.status === 'PENDING' || v.status === 'UNDER_REVIEW').length,
    rejected: items.filter(v => v.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Top Header & Breadcrumb (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Compliance & Risk</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">KYC Verification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            KYC Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Entity verification, risk assessment, and identity document vault.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/app/kyc/pending"
            className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
          >
            Pending Submissions ({stats.pending})
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
            onClick={load}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── TOP METRIC CARDS: 1 BIG CARD (TOTAL SUBMISSIONS) + 3 SIDE CARDS (No Icons) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1: TOTAL SUBMISSIONS (Big Main Card with Red Bottom Accent) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TOTAL SUBMISSIONS</p>
            <p className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mt-2">{stats.total}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Compliance Verification Pipeline</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0.0'}% Approval Rate
            </span>
          </div>
        </div>

        {/* The other three placed at the side */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 justify-between">
          {/* Card 2: Green Accent (Approved) */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">APPROVED</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.approved}</p>
              <span className="text-xs text-slate-500">Tier-1 verified</span>
            </div>
          </div>

          {/* Card 3: Amber Accent (Pending) */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">PENDING SUBMISSIONS</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.pending}</p>
              <span className="text-xs text-slate-500">Awaiting inspection</span>
            </div>
          </div>

          {/* Card 4: Rose Accent (Rejected) */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">REJECTED</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.rejected}</p>
              <span className="text-xs text-slate-500">Action taken</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Verification Queue</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Applicant</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Submitted</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Documents</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Loading submissions…</td></tr>
              ) : errorMsg ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-rose-600 bg-rose-50">Error loading data: {errorMsg}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No verification requests found.</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.applicantName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.email ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                      {item.applicantType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border w-fit inline-block',
                      item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      item.status === 'UNDER_REVIEW' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      'bg-amber-50 text-amber-700 border-amber-200',
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500">
                    {item.documents?.length ?? 0} file(s)
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelected(item); setActiveDocument(item.documents?.[0] || null); setReviewForm({ status: '', rejectionReason: '' }); }}
                      className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Review Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{selected.applicantName}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{selected.applicantType} · {selected.status}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider">Close</button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Form Data & Review */}
                <div className="flex-1 border-r border-slate-200 overflow-y-auto bg-white p-6 space-y-8">
                  {/* Applicant Info */}
                  <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50 rounded-lg border border-slate-200">
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p><p className="font-bold text-slate-900 text-sm">{selected.email ?? '—'}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</p><p className="font-bold text-slate-900 text-sm">{selected.phone ?? '—'}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submitted</p><p className="font-bold text-slate-900 text-sm">{new Date(selected.createdAt).toLocaleString()}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reviewed By</p><p className="font-bold text-slate-900 text-sm">{selected.reviewedBy?.fullName ?? '—'}</p></div>
                  </div>

                  {/* Grouped Form Data */}
                  <div>
                    <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-4">Application Details</h4>
                    {(() => {
                      const payload = selected.payload || {};
                      const entityKeys = ['companyName', 'tradingName', 'registrationNumber', 'taxNumber', 'incorporationDate', 'companyType', 'industry', 'natureOfBusiness', 'annualRevenue'];
                      const contactKeys = ['primaryContactName', 'companyEmail', 'primaryPhone', 'city', 'state', 'country', 'businessAddress'];
                      const complianceKeys = ['hasAmlPolicy', 'hasComplianceOfficer', 'complianceOfficerName', 'conductsCdd', 'employeesTrained'];
                      
                      const groups = [
                        { title: 'Entity Details', keys: entityKeys },
                        { title: 'Contact Information', keys: contactKeys },
                        { title: 'Compliance & AML', keys: complianceKeys },
                      ];

                      const mappedGroups = groups.map(g => ({ ...g, data: Object.entries(payload).filter(([k]) => g.keys.includes(k)) })).filter(g => g.data.length > 0);
                      const otherData = Object.entries(payload).filter(([k]) => !entityKeys.includes(k) && !contactKeys.includes(k) && !complianceKeys.includes(k));

                      return (
                        <div className="space-y-4">
                          {mappedGroups.map((g, i) => (
                            <div key={i} className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-4 pb-3 border-b border-slate-200">
                                {g.title}
                              </h5>
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                {g.data.map(([k, v]) => (
                                  <div key={k}>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-sm font-medium text-slate-900">{String(v)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {otherData.length > 0 && (
                            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-4 pb-3 border-b border-slate-200">
                                Additional Data
                              </h5>
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                {otherData.map(([k, v]) => (
                                  <div key={k}>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-sm font-medium text-slate-900 truncate" title={String(v)}>{String(v)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Rejection reason if rejected */}
                  {selected.rejectionReason && (
                    <div className="p-5 bg-rose-50 rounded-lg border border-rose-200 shadow-sm">
                      <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-2">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-rose-800 font-medium">{selected.rejectionReason}</p>
                    </div>
                  )}

                  {/* Review form */}
                  {(selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW') && (
                    <form onSubmit={handleReview} className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-5">
                      <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-[0.2em]">Update Decision</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 'UNDER_REVIEW', label: 'Reviewing', color: 'bg-sky-50 text-sky-700 border-sky-200' },
                          ...((role === 'ceo' || role === 'manager' || role === 'outreach_manager') ? [{ val: 'APPROVED', label: 'Approve', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }] : []),
                          { val: 'REJECTED', label: 'Reject', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setReviewForm(f => ({ ...f, status: opt.val }))}
                            className={cn(
                              'py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
                              reviewForm.status === opt.val ? opt.color + ' ring-2 ring-offset-2 ring-current shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {reviewForm.status === 'REJECTED' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-widest mt-2">Reason for Rejection *</label>
                            <textarea
                              required
                              value={reviewForm.rejectionReason}
                              onChange={e => setReviewForm(f => ({ ...f, rejectionReason: e.target.value }))}
                              rows={3}
                              className="w-full bg-white border border-rose-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none shadow-sm"
                              placeholder="Explain what is missing or invalid…"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        type="submit"
                        disabled={!reviewForm.status || submitting}
                        className="w-full py-3.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        {submitting ? 'Updating…' : 'Submit Decision'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Right Side: Document Viewer */}
                <div className="flex-1 bg-slate-50 flex flex-col min-w-0">
                  {selected.documents?.length > 0 ? (
                    <>
                      {/* Document Tabs */}
                      <div className="flex overflow-x-auto p-4 gap-2 bg-white border-b border-slate-200 shrink-0">
                        {selected.documents.map((doc: any) => (
                          <button
                            key={doc.id}
                            onClick={() => setActiveDocument(doc)}
                            className={cn(
                              'px-4 py-2.5 flex items-center gap-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                              activeDocument?.id === doc.id
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900',
                              !doc.fileUrl && 'opacity-60'
                            )}
                          >
                            {doc.documentType}
                            {!doc.fileUrl && <span className="text-[8px] ml-1 opacity-70">[Missing]</span>}
                          </button>
                        ))}
                      </div>
                      
                      {/* Inline Viewer */}
                      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50">
                        {activeDocument ? (
                          !activeDocument.fileUrl ? (
                            /* No file URL — metadata-only record */
                            <div className="text-center space-y-4">
                              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 max-w-sm mx-auto">
                                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">File Not Found</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{activeDocument.fileName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{activeDocument.documentType}</p>
                              </div>
                              <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                                This document record was submitted but the file was not uploaded successfully. The applicant may need to re-submit this document.
                              </p>
                            </div>
                          ) : (
                            /* Has file URL — show viewer */
                            <div className="w-full h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[70%]">{activeDocument.fileName}</p>
                                <button onClick={() => handleDownload(activeDocument)} className="text-[10px] font-bold text-slate-900 bg-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors uppercase tracking-widest">
                                  Download
                                </button>
                              </div>
                              <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4">
                                {isImageUrl(activeDocument) ? (
                                  <>
                                  <img
                                    src={getFileUrl(activeDocument.fileUrl)}
                                    alt={activeDocument.documentType}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-slate-200"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden flex-col items-center text-center space-y-4">
                                    <p className="text-sm font-medium text-slate-500">This document could not be loaded.</p>
                                    <p className="text-[10px] text-slate-400 max-w-[240px]">The file may have been lost during a server update. The applicant may need to re-submit.</p>
                                  </div>
                                  </>
                                ) : isPdfUrl(activeDocument) ? (
                                  <iframe src={getFileUrl(activeDocument.fileUrl)} className="w-full h-full rounded-lg border-none" title={activeDocument.fileName} />
                                ) : (
                                  <div className="text-center space-y-4">
                                    <p className="text-sm font-medium text-slate-500">Preview not available for this file type.</p>
                                    <button onClick={() => handleDownload(activeDocument)} className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg">
                                      Download File
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="text-center text-slate-500">
                            <p className="text-sm font-medium">Select a document from the top bar to preview.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                      <p className="text-sm font-bold text-slate-900">No Documents Uploaded</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">This applicant did not provide any supporting files.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

