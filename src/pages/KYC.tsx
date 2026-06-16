import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, UserCheck, FileSearch, AlertTriangle, Search,
  CheckCircle2, XCircle, Clock, X, RefreshCw, Eye, Download, FileText, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function KYC() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (e: any) { console.error(e); }
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
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Compliance Access Required</h2>
        <p className="text-secondary max-w-sm">KYC data is restricted to compliance officers and executive nodes.</p>
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
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">KYC & Compliance</h1>
          <p className="text-secondary text-base">Entity verification and risk assessment workflows.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-outline-variant/30 px-6 py-2.5 rounded-xl flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn('size-2 bg-yellow-500 rounded-full', stats.pending > 0 && 'animate-pulse')} />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{stats.pending} Awaiting</span>
            </div>
            <div className="h-4 w-[1px] bg-outline-variant/30" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0.0'}% Approval
            </span>
          </div>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Submissions', val: stats.total, icon: FileSearch, color: 'text-primary' },
          { label: 'Approved', val: stats.approved, icon: UserCheck, color: 'text-green-600' },
          { label: 'Pending / Review', val: stats.pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Rejected', val: stats.rejected, icon: AlertTriangle, color: 'text-error' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
            <stat.icon className={cn('w-5 h-5 mb-3', stat.color)} />
            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-primary">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-sm font-bold text-primary">Verification Queue</h3>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container/20 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Applicant</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Submitted</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Documents</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-sm text-secondary animate-pulse">Loading submissions…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-sm text-secondary">No verification requests found.</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-bold text-primary">{item.applicantName}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{item.email ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-surface-container-high px-3 py-1 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest">
                      {item.applicantType}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[11px] text-secondary font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border w-fit',
                      item.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                      item.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                      item.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-yellow-50 text-yellow-700 border-yellow-100',
                    )}>
                      {item.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> :
                       item.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[11px] text-secondary">
                    {item.documents?.length ?? 0} file(s)
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => { setSelected(item); setActiveDocument(item.documents?.[0] || null); setReviewForm({ status: '', rejectionReason: '' }); }}
                      className="p-2 bg-primary-fixed text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-primary">{selected.applicantName}</h3>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mt-0.5">{selected.applicantType} · {selected.status}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-outline-variant/20 rounded-full transition-colors"><X className="w-5 h-5 text-secondary" /></button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Form Data & Review */}
                <div className="flex-1 border-r border-outline-variant/20 overflow-y-auto bg-white p-6 space-y-8">
                  {/* Applicant Info */}
                  <div className="grid grid-cols-2 gap-6 p-5 bg-primary-fixed/30 rounded-xl border border-primary-fixed/50">
                    <div><p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1">Email</p><p className="font-bold text-primary text-sm">{selected.email ?? '—'}</p></div>
                    <div><p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1">Phone</p><p className="font-bold text-primary text-sm">{selected.phone ?? '—'}</p></div>
                    <div><p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1">Submitted</p><p className="font-bold text-primary text-sm">{new Date(selected.createdAt).toLocaleString()}</p></div>
                    <div><p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1">Reviewed By</p><p className="font-bold text-primary text-sm">{selected.reviewedBy?.fullName ?? '—'}</p></div>
                  </div>

                  {/* Grouped Form Data */}
                  <div>
                    <h4 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Application Details</h4>
                    {(() => {
                      const payload = selected.payload || {};
                      const entityKeys = ['companyName', 'tradingName', 'registrationNumber', 'taxNumber', 'incorporationDate', 'companyType', 'industry', 'natureOfBusiness', 'annualRevenue'];
                      const contactKeys = ['primaryContactName', 'companyEmail', 'primaryPhone', 'city', 'state', 'country', 'businessAddress'];
                      const complianceKeys = ['hasAmlPolicy', 'hasComplianceOfficer', 'complianceOfficerName', 'conductsCdd', 'employeesTrained'];
                      
                      const groups = [
                        { title: 'Entity Details', keys: entityKeys, icon: ShieldCheck },
                        { title: 'Contact Information', keys: contactKeys, icon: UserCheck },
                        { title: 'Compliance & AML', keys: complianceKeys, icon: AlertTriangle },
                      ];

                      const mappedGroups = groups.map(g => ({ ...g, data: Object.entries(payload).filter(([k]) => g.keys.includes(k)) })).filter(g => g.data.length > 0);
                      const otherData = Object.entries(payload).filter(([k]) => !entityKeys.includes(k) && !contactKeys.includes(k) && !complianceKeys.includes(k));

                      return (
                        <div className="space-y-4">
                          {mappedGroups.map((g, i) => (
                            <div key={i} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30">
                              <h5 className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 pb-3 border-b border-outline-variant/30">
                                <g.icon className="w-4 h-4 text-primary" /> {g.title}
                              </h5>
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                {g.data.map(([k, v]) => (
                                  <div key={k}>
                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-sm font-medium text-primary">{String(v)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {otherData.length > 0 && (
                            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30">
                              <h5 className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 pb-3 border-b border-outline-variant/30">
                                <FileText className="w-4 h-4 text-primary" /> Additional Data
                              </h5>
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                {otherData.map(([k, v]) => (
                                  <div key={k}>
                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-sm font-medium text-primary truncate" title={String(v)}>{String(v)}</p>
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
                    <div className="p-5 bg-red-50 rounded-xl border border-red-200 shadow-sm">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Rejection Reason
                      </p>
                      <p className="text-sm text-red-800 font-medium">{selected.rejectionReason}</p>
                    </div>
                  )}

                  {/* Review form */}
                  {(selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW') && (
                    <form onSubmit={handleReview} className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-5">
                      <h4 className="text-[12px] font-bold text-primary uppercase tracking-[0.2em]">Update Decision</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 'UNDER_REVIEW', label: 'Reviewing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                          ...(role === 'ceo' ? [{ val: 'APPROVED', label: 'Approve', color: 'bg-green-50 text-green-700 border-green-200' }] : []),
                          { val: 'REJECTED', label: 'Reject', color: 'bg-red-50 text-red-700 border-red-200' },
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setReviewForm(f => ({ ...f, status: opt.val }))}
                            className={cn(
                              'py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all',
                              reviewForm.status === opt.val ? opt.color + ' ring-2 ring-offset-2 ring-current shadow-sm' : 'bg-white text-secondary border-outline-variant/30 hover:bg-surface-container',
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {reviewForm.status === 'REJECTED' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest mt-2">Reason for Rejection *</label>
                            <textarea
                              required
                              value={reviewForm.rejectionReason}
                              onChange={e => setReviewForm(f => ({ ...f, rejectionReason: e.target.value }))}
                              rows={3}
                              className="w-full bg-white border border-red-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-red-200 resize-none shadow-sm"
                              placeholder="Explain what is missing or invalid…"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        type="submit"
                        disabled={!reviewForm.status || submitting}
                        className="w-full py-3.5 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-md"
                      >
                        {submitting ? 'Updating…' : 'Submit Decision'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Right Side: Document Viewer */}
                <div className="flex-1 bg-surface-container-low flex flex-col min-w-0">
                  {selected.documents?.length > 0 ? (
                    <>
                      {/* Document Tabs */}
                      <div className="flex overflow-x-auto p-4 gap-2 bg-white border-b border-outline-variant/20 shrink-0">
                        {selected.documents.map((doc: any) => (
                          <button
                            key={doc.id}
                            onClick={() => setActiveDocument(doc)}
                            className={cn(
                              'px-4 py-2.5 flex items-center gap-2 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                              activeDocument?.id === doc.id
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface-container-low text-secondary border-outline-variant/30 hover:bg-surface-container hover:text-primary'
                            )}
                          >
                            <FileSearch className="w-4 h-4" />
                            {doc.documentType}
                          </button>
                        ))}
                      </div>
                      
                      {/* Inline Viewer */}
                      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-surface-container-low">
                        {activeDocument ? (
                          <div className="w-full h-full bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low shrink-0">
                              <p className="text-xs font-bold text-primary truncate max-w-[70%]">{activeDocument.fileName}</p>
                              <a href={activeDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary-fixed px-3 py-1.5 rounded-lg hover:bg-primary-fixed/80 transition-colors uppercase tracking-widest">
                                <Download className="w-3 h-3" /> Download
                              </a>
                            </div>
                            <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-4">
                              {/* Simple check if image, otherwise fallback to link/iframe */}
                              {activeDocument.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|blob)$/i) || activeDocument.fileUrl.startsWith('blob:') ? (
                                <img src={activeDocument.fileUrl} alt={activeDocument.documentType} className="max-w-full max-h-full object-contain rounded shadow-sm border border-outline-variant/20" />
                              ) : activeDocument.fileUrl.match(/\.(pdf)$/i) ? (
                                <iframe src={activeDocument.fileUrl} className="w-full h-full rounded border-none" title={activeDocument.fileName} />
                              ) : (
                                <div className="text-center space-y-4">
                                  <FileText className="w-16 h-16 text-outline-variant mx-auto" />
                                  <p className="text-sm font-medium text-secondary">Preview not available for this file type.</p>
                                  <a href={activeDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg">
                                    Open File
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-secondary">
                            <FileSearch className="w-16 h-16 opacity-20 mx-auto mb-4" />
                            <p className="text-sm font-medium">Select a document from the top bar to preview.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low">
                      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4 opacity-50" />
                      <p className="text-sm font-bold text-primary">No Documents Uploaded</p>
                      <p className="text-xs text-secondary mt-1 max-w-[200px]">This applicant did not provide any supporting files.</p>
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
