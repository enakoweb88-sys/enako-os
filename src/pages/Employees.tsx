import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Mail, Phone, Briefcase, X, Plus, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Employees() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', title: '',
    role: 'EMPLOYEE', department: 'Operations', password: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.employees({ search, page, limit: 20 });
      setEmployees(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createEmployee(form);
      setShowModal(false);
      setForm({ fullName: '', email: '', phone: '', title: '', role: 'EMPLOYEE', department: 'Operations', password: '' });
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async (id: string, status: string) => {
    try {
      if (status === 'ACTIVE') await api.suspendEmployee(id);
      else await api.activateEmployee(id);
      load();
    } catch (e: any) { alert(e.message); }
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <Users className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Access Restricted</h2>
        <p className="text-secondary max-w-sm">The organization directory is only accessible by management and executive nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Organization Directory</h1>
          <p className="text-secondary text-base">Manage global headcount and operative deployment. {total} total.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Deploy Operative
        </button>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Search name, email, role…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-container/20"
            />
          </div>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {error && <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Department</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Contact</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-sm text-secondary animate-pulse">Loading employees…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-sm text-secondary">No employees found.</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary-fixed flex items-center justify-center font-bold text-primary text-sm">
                        {emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{emp.fullName}</p>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{emp.title ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-surface-container-high px-3 py-1 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest">
                      {emp.department ?? '—'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{emp.role}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border w-fit',
                      emp.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    )}>{emp.status}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <a href={`mailto:${emp.email}`} className="p-2 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all"><Mail className="w-4 h-4" /></a>
                      {emp.phone && <a href={`tel:${emp.phone}`} className="p-2 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all"><Phone className="w-4 h-4" /></a>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {role === 'ceo' && (
                      <button
                        onClick={() => handleSuspend(emp.id, emp.status)}
                        className={cn(
                          'text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all',
                          emp.status === 'ACTIVE' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100',
                        )}
                      >
                        {emp.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
          <span>Showing {employees.length} of {total}</span>
          <div className="flex gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hover:text-primary transition-colors disabled:opacity-30">Previous</button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={employees.length < 20} className="hover:text-primary transition-colors disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="text-xl font-bold text-primary">Deploy New Operative</h3>
                  <p className="text-xs text-secondary uppercase tracking-widest font-bold mt-1">Create employee account</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-6 h-6 text-secondary" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Full Name *</label>
                    <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="name@company.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="+237 6XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Title</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Lead Engineer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Role *</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="CEO">CEO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Department</label>
                    <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      {['Operations', 'Engineering', 'Finance', 'Compliance', 'Management', 'HR'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Temporary Password *</label>
                    <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Min 8 characters" minLength={8} />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-60">
                    {submitting ? 'Creating…' : 'Deploy Operative'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
