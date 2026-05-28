import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, UserCheck, FileSearch, AlertTriangle, Search,
  CheckCircle2, XCircle, Clock, X, RefreshCw, Eye,
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
                      onClick={() => { setSelected(item); setReviewForm({ status: '', rejectionReason: '' }); }}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low sticky top-0">
                <div>
                  <h3 className="text-lg font-bold text-primary">{selected.applicantName}</h3>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mt-0.5">{selected.applicantType} · {selected.status}</p>
                </div>
                <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-secondary" /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Applicant Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Email</p><p className="font-bold text-primary">{selected.email ?? '—'}</p></div>
                  <div><p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Phone</p><p className="font-bold text-primary">{selected.phone ?? '—'}</p></div>
                  <div><p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Submitted</p><p className="font-bold text-primary">{new Date(selected.createdAt).toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Reviewed By</p><p className="font-bold text-primary">{selected.reviewedBy?.fullName ?? '—'}</p></div>
                </div>

                {/* Payload */}
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Form Data</p>
                  <div className="bg-surface-container-low rounded-xl p-4 text-xs font-mono overflow-auto max-h-48">
                    {Object.entries(selected.payload ?? {}).map(([k, v]) => (
                      <div key={k} className="flex gap-2 py-0.5">
                        <span className="text-secondary min-w-[140px]">{k}:</span>
                        <span className="text-primary font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                {selected.documents?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Documents</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selected.documents.map((doc: any) => (
                        <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-primary transition-all">
                          <FileSearch className="w-4 h-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-primary truncate">{doc.documentType}</p>
                            <p className="text-[10px] text-secondary truncate">{doc.fileName}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection reason if rejected */}
                {selected.rejectionReason && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{selected.rejectionReason}</p>
                  </div>
                )}

                {/* Review form — only for non-final statuses */}
                {(selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW') && (
                  <form onSubmit={handleReview} className="space-y-4 border-t border-outline-variant/20 pt-6">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Update Status</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: 'UNDER_REVIEW', label: 'Mark Under Review', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        ...(role === 'ceo' ? [{ val: 'APPROVED', label: 'Approve', color: 'bg-green-50 text-green-700 border-green-200' }] : []),
                        { val: 'REJECTED', label: 'Reject', color: 'bg-red-50 text-red-700 border-red-200' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setReviewForm(f => ({ ...f, status: opt.val }))}
                          className={cn(
                            'py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all',
                            reviewForm.status === opt.val ? opt.color + ' ring-2 ring-offset-1 ring-current' : 'bg-surface-container text-secondary border-outline-variant/30',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {reviewForm.status === 'REJECTED' && (
                      <div>
                        <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Rejection Reason *</label>
                        <textarea
                          required
                          value={reviewForm.rejectionReason}
                          onChange={e => setReviewForm(f => ({ ...f, rejectionReason: e.target.value }))}
                          rows={3}
                          className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none"
                          placeholder="Explain the reason for rejection…"
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={!reviewForm.status || submitting}
                      className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      {submitting ? 'Updating…' : 'Submit Decision'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
