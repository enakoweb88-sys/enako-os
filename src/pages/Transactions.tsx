import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight, ArrowDownLeft, Search, Download, Filter,
  CheckCircle2, Clock, AlertCircle, CreditCard, X, Plus, RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

function fmt(val: string | number | null | undefined) {
  return Number(val ?? 0).toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
}

export default function Transactions() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ entity: '', type: 'Operational', amount: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.transactions({ search, limit: 50 });
      setItems(res.items);
      setTotals(res.totals);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTransaction({ ...form, amount: Number(form.amount) });
      setShowModal(false);
      setForm({ entity: '', type: 'Operational', amount: '', description: '' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleSettle = async (id: string) => {
    try { await api.setTransactionStatus(id, 'SETTLED'); load(); }
    catch (e: any) { alert(e.message); }
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <CreditCard className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Financial Ledger Locked</h2>
        <p className="text-secondary max-w-sm">Global ledger access is restricted to financial controllers and executive members.</p>
      </div>
    );
  }

  const settled = totals.find(t => t.status === 'SETTLED')?._sum?.amount ?? 0;
  const pending = totals.find(t => t.status === 'PENDING')?._sum?.amount ?? 0;
  const flagged = totals.find(t => t.status === 'FLAGGED')?._sum?.amount ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Ledger & Settlements</h1>
          <p className="text-secondary text-base">Real-time monitoring of capital movement and settlement logs.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 border border-outline-variant bg-white text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">
            <Download className="w-4 h-4 inline mr-2" />Export CSV
          </button>
          {role === 'ceo' && (
            <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all">
              <Plus className="w-4 h-4 inline mr-2" />New Transaction
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Settled', val: fmt(settled), icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Pending Auth', val: fmt(pending), icon: Clock, color: 'text-primary-container' },
          { label: 'Risk Flagged', val: fmt(flagged), icon: AlertCircle, color: 'text-error' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <stat.icon className={cn('w-5 h-5', stat.color)} />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <p className="text-3xl font-display font-bold text-primary">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between gap-4">
          <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">Transaction History</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container/20 w-56"
                placeholder="Search entity, reference…"
              />
            </div>
            <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Reference & Entity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary animate-pulse">Loading transactions…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary">No transactions recorded.</td></tr>
              ) : items.map(tx => (
                <tr key={tx.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{tx.entity}</p>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{tx.reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-medium text-primary">{tx.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border',
                      tx.status === 'SETTLED' ? 'bg-green-50 text-green-700 border-green-100' :
                      tx.status === 'FLAGGED' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-yellow-50 text-yellow-700 border-yellow-100',
                    )}>{tx.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="font-mono font-bold text-sm text-primary">{fmt(tx.amount)}</p>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter mt-1">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {tx.status === 'PENDING' && role === 'ceo' && (
                      <button onClick={() => handleSettle(tx.id)} className="text-[9px] font-black uppercase px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all opacity-0 group-hover:opacity-100">
                        Settle
                      </button>
                    )}
                  </td>
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
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary">New Settlement Log</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Entity / Customer *</label>
                  <input required value={form.entity} onChange={e => setForm({ ...form, entity: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Description *</label>
                  <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Transaction description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount (XAF) *</label>
                    <input required type="number" step="1" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      {['Operational', 'Corporate', 'Investment', 'Payroll', 'Other'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 disabled:opacity-60">
                  {submitting ? 'Committing…' : 'Commit Transaction'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
