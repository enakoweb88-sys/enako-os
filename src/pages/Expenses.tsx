import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, TrendingUp, Search, FileText, ClipboardCheck, XCircle, X, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

function fmt(val: string | number | null | undefined) {
  return Number(val ?? 0).toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
}

export default function Expenses() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: 'Travel' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.expenses({ limit: 50 });
      setItems(res.items);
      setTotals(res.totals);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createExpense({ ...form, amount: Number(form.amount) });
      setShowModal(false);
      setForm({ description: '', amount: '', category: 'Travel' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (id: string, status: string) => {
    try { await api.reviewExpense(id, status); load(); }
    catch (e: any) { alert(e.message); }
  };

  const filtered = items.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    (e.submittedBy?.fullName ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const approvedTotal = totals.find(t => t.status === 'APPROVED')?._sum?.amount ?? 0;
  const pendingTotal = totals.find(t => t.status === 'PENDING')?._sum?.amount ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl font-bold text-primary mb-2">
            {role === 'employee' ? 'My Expenses' : 'Expense Management'}
          </h1>
          <p className="text-secondary text-base">
            {role === 'employee' ? 'Track your reimbursements and corporate spending.' : 'Review and reconcile corporate spending.'}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5" /> New Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Approved Total</span>
            <ClipboardCheck className="w-5 h-5 text-green-600" />
          </div>
          <div className="font-mono text-4xl text-primary tracking-tight font-bold">{fmt(approvedTotal)}</div>
          <div className="flex items-center gap-1 mt-2 text-primary font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{totals.find(t => t.status === 'APPROVED')?._count ?? 0} claims approved</span>
          </div>
        </div>
        <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Pending Review</span>
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="font-mono text-4xl text-primary tracking-tight font-bold">{fmt(pendingTotal)}</div>
          <div className="text-sm text-secondary mt-2">{totals.find(t => t.status === 'PENDING')?._count ?? 0} awaiting approval</div>
        </div>
        <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Total Submissions</span>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="font-mono text-4xl text-primary tracking-tight font-bold">
            {totals.reduce((a, t) => a + (t._count ?? 0), 0)}
          </div>
          <div className="text-sm text-secondary mt-2">All time</div>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-bold text-primary">Expense History</h3>
          <div className="flex gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search expenses…"
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-container transition-all outline-none"
              />
            </div>
            <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Date</th>
                {role !== 'employee' && <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Employee</th>}
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Description</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Category</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Amount</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Status</th>
                {role !== 'employee' && <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={7} className="px-8 py-12 text-center text-sm text-secondary animate-pulse">Loading expenses…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-12 text-center text-secondary text-sm">No expenses found.</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-4 font-mono text-sm text-secondary">{new Date(t.createdAt).toLocaleDateString()}</td>
                  {role !== 'employee' && <td className="px-8 py-4 font-bold text-primary text-sm">{t.submittedBy?.fullName ?? '—'}</td>}
                  <td className="px-8 py-4 font-bold text-primary">{t.description}</td>
                  <td className="px-8 py-4">
                    <span className="bg-surface-container-high px-2 py-1 rounded text-[11px] font-bold text-secondary uppercase tracking-wider">{t.category}</span>
                  </td>
                  <td className="px-8 py-4 font-mono font-bold text-primary">{fmt(t.amount)}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border w-fit',
                      t.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                      t.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200',
                    )}>{t.status}</span>
                  </td>
                  {role !== 'employee' && (
                    <td className="px-8 py-4">
                      {t.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleReview(t.id, 'APPROVED')} className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"><ClipboardCheck className="w-5 h-5" /></button>
                          <button onClick={() => handleReview(t.id, 'REJECTED')} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><XCircle className="w-5 h-5" /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">New Expense Claim</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Description *</label>
                  <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Flight to Douala" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount (XAF) *</label>
                    <input required type="number" step="1" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      {['Travel', 'Hardware', 'Software', 'Welfare', 'Office', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Claim'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
