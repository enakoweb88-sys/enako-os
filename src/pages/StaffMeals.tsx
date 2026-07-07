import React, { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Search, TriangleAlert, TrendingUp, ClipboardPen, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

function fmt(val: string | number | null | undefined) {
  return Number(val ?? 0).toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
}

export default function StaffMeals() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ employeeId: '', date: new Date().toISOString().split('T')[0], status: 'ATE' as 'ATE' | 'DID_NOT_EAT' });
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsRes, empRes] = await Promise.all([api.meals(), api.employees({ limit: 100 })]);
      setItems(mealsRes.items);
      setTotals(mealsRes.totals);
      setEmployees(empRes.items);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return;
    setSubmitting(true);
    try {
      await api.recordMeal(form);
      setShowModal(false);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleSelfLog = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await api.recordMeal({ employeeId: user.id, date: new Date().toISOString().split('T')[0], status: 'ATE' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeId) return;
    setSubmitting(true);
    try {
      await api.disputeMeal(disputeId, disputeReason);
      setDisputeId(null);
      setDisputeReason('');
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const myItems = role === 'employee' ? items.filter(m => m.employeeId === user?.id) : items;
  const myAte = myItems.filter(m => m.status === 'ATE').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-5xl font-bold text-primary mb-2">Staff Meal Management</h1>
          <p className="text-secondary text-lg max-w-2xl">
            {role === 'employee' ? 'Track your daily welfare benefits and meal history.' : 'Enterprise welfare portal for tracking daily consumption.'}
          </p>
        </div>
        <div className="flex gap-3">
          {role !== 'employee' && (
            <>
              <button onClick={() => window.print()} className="bg-surface-container-high text-primary px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-outline-variant/30 transition-all print:hidden">
                Download PDF
              </button>
              <button onClick={() => setShowModal(true)} className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all print:hidden">
                <ClipboardPen className="w-4 h-4" /> Log Entry
              </button>
            </>
          )}
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all print:hidden">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Summary */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-8 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-8 block">
              {role === 'employee' ? 'MY CONTRIBUTION SUMMARY' : 'MONTHLY FINANCIAL SUMMARY'}
            </span>
            <div className="space-y-8">
              <div>
                <p className="text-secondary text-sm font-medium mb-1">
                  {role === 'employee' ? 'Total Meals Consumed' : 'Company Contribution'}
                </p>
                <p className="font-display text-3xl font-bold text-primary">
                  {role === 'employee' ? `${myAte} Meals` : fmt(totals?._sum?.companyAmount)}
                </p>
              </div>
              <div className="pt-6 border-t border-outline-variant/30">
                <p className="text-secondary text-sm font-medium mb-1">
                  {role === 'employee' ? 'My Deduction' : 'Employee Share'}
                </p>
                <p className="font-display text-3xl font-bold text-on-primary-container">
                  {role === 'employee' ? fmt(myAte * 500) : fmt(totals?._sum?.employeeAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-secondary text-[11px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{totals?._count ?? 0} total meal records</span>
          </div>
        </div>

        {/* Employee quick-log (employee role) */}
        {role === 'employee' && (
          <div className="col-span-12 lg:col-span-4 bg-primary-fixed border border-outline-variant p-8 rounded-2xl shadow-sm print:hidden">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-8 block">QUICK CHECK-IN</span>
            <div className="space-y-4 mb-8">
              <p className="text-secondary text-sm">Click below to log today's meal entry.</p>
              <div className="aspect-square bg-surface-container rounded-2xl flex items-center justify-center border-2 border-dashed border-outline-variant">
                <UtensilsCrossed className="w-12 h-12 text-outline-variant" />
              </div>
            </div>
            <button
              onClick={handleSelfLog}
              disabled={submitting}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ClipboardPen className="w-4 h-4" />
              {submitting ? 'Logging…' : 'LOG MEAL TODAY'}
            </button>
          </div>
        )}

        {/* Dispute panel */}
        <div className="col-span-12 lg:col-span-4 bg-primary-fixed text-primary p-8 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden print:hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><UtensilsCrossed size={140} /></div>
          <div className="relative z-10">
            <span className="text-[10px] font-bold opacity-70 block mb-6 uppercase tracking-[0.2em]">SYSTEM STATUS</span>
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs opacity-80 mb-1">Total Meals (ATE)</p>
                <p className="font-display text-3xl font-bold">{totals?._count ?? 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80 mb-1">Total Amount</p>
                <p className="font-display text-xl font-bold">{fmt(totals?._sum?.totalAmount)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const id = prompt('Enter meal record ID to dispute:');
                if (id) setDisputeId(id);
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-white/5"
            >
              <TriangleAlert className="w-4 h-4" />
              Report Discrepancy
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-8 border-b border-outline-variant flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-bold text-primary">
            {role === 'employee' ? 'My Consumption Log' : 'Enterprise Consumption Log'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Employee Share</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Company Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary animate-pulse">Loading records…</td></tr>
              ) : myItems.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary">No records found for the current period.</td></tr>
              ) : myItems.map(row => (
                <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold font-display text-sm">
                        {(row.employee?.fullName ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{row.employee?.fullName ?? '—'}</p>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{row.employee?.email ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono font-medium text-secondary">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border',
                      row.status === 'ATE' ? 'bg-green-50 text-green-700 border-green-100' :
                      row.status === 'DISPUTED' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-red-50 text-red-700 border-red-100',
                    )}>{row.status}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono font-bold text-primary">{fmt(row.employeeAmount)}</td>
                  <td className="px-8 py-5 text-sm font-mono font-bold text-primary">{fmt(row.companyAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Log Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Log Meal Entry</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleRecord} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Employee *</label>
                  <select required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                    <option value="">Select employee…</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Status *</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ATE' | 'DID_NOT_EAT' })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none">
                    <option value="ATE">Ate</option>
                    <option value="DID_NOT_EAT">Did Not Eat</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-60">
                  {submitting ? 'Logging…' : 'Log Entry'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {disputeId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDisputeId(null)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Report Discrepancy</h3>
                <button onClick={() => setDisputeId(null)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleDispute} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Reason *</label>
                  <textarea required value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none resize-none" placeholder="Describe the discrepancy…" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-error text-white rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Dispute'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
