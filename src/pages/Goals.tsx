import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Target, Plus, Activity, TrendingUp, Flag, Zap, Trophy, X, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Goals() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [goals, setGoals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetValue: '', unit: '', dueDate: '', scope: 'COMPANY', departmentId: '', ownerId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.goals();
      setGoals(res);
      if (role !== 'employee') {
        const [emps, depts] = await Promise.all([api.employees({ limit: 1000 }), api.departments()]);
        setEmployees(emps.items || []);
        setDepartments(depts);
      }
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createGoal({
        title: form.title,
        description: form.description || undefined,
        targetValue: form.targetValue ? Number(form.targetValue) : undefined,
        unit: form.unit || undefined,
        dueDate: form.dueDate || undefined,
        scope: form.scope,
        departmentId: form.scope === 'DEPARTMENT' ? form.departmentId : undefined,
        ownerId: form.scope === 'PERSONAL' ? form.ownerId : undefined,
      });
      setShowModal(false);
      setForm({ title: '', description: '', targetValue: '', unit: '', dueDate: '', scope: 'COMPANY', departmentId: '', ownerId: '' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const getProgress = (goal: any) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min(100, Math.round((Number(goal.currentValue) / Number(goal.targetValue)) * 100));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Strategic Objectives</h1>
          <p className="text-secondary text-base">Long-term KPIs and operational targets for the current fiscal cycle.</p>
        </div>
        {role !== 'employee' && (
          <div className="flex gap-3">
            <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Set New Objective
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Active Goals', val: goals.length.toString(), icon: Target },
          { label: 'Avg Progress', val: goals.length > 0 ? `${Math.round(goals.reduce((a, g) => a + getProgress(g), 0) / goals.length)}%` : '0%', icon: Activity },
          { label: 'Completed', val: goals.filter(g => getProgress(g) >= 100).length.toString(), icon: TrendingUp },
          { label: 'Next Due', val: goals.filter(g => g.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate ? new Date(goals.filter(g => g.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate).toLocaleDateString() : 'None', icon: Flag },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-primary-container" />
            </div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-primary">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {loading ? (
            <div className="bg-white border border-outline-variant/30 p-12 rounded-3xl shadow-sm text-center">
              <p className="text-secondary text-sm animate-pulse">Loading goals…</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="bg-white border border-outline-variant/30 p-12 rounded-3xl shadow-sm text-center">
              <Target className="w-12 h-12 text-outline-variant mx-auto mb-4 opacity-50" />
              <p className="text-secondary font-bold uppercase tracking-widest text-[10px]">No active objectives found</p>
              <p className="text-xs text-outline mt-2">Initialize your first strategic KPI to begin tracking.</p>
            </div>
          ) : goals.map((goal, i) => {
            const progress = getProgress(goal);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-4">
                    <div className="size-12 rounded-2xl flex items-center justify-center text-white shadow-inner bg-primary">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-primary">{goal.title}</h3>
                        {goal.scope === 'DEPARTMENT' && goal.department && (
                          <span className="bg-surface-container px-3 py-0.5 rounded-full text-[9px] font-bold text-secondary uppercase tracking-widest">{goal.department.name}</span>
                        )}
                        {goal.scope === 'PERSONAL' && goal.owner && (
                          <span className="bg-surface-container px-3 py-0.5 rounded-full text-[9px] font-bold text-secondary uppercase tracking-widest">{goal.owner.fullName}</span>
                        )}
                        {goal.scope === 'COMPANY' && (
                          <span className="bg-surface-container px-3 py-0.5 rounded-full text-[9px] font-bold text-secondary uppercase tracking-widest">Company</span>
                        )}
                      </div>
                      {goal.description && <p className="text-xs text-secondary mt-1">{goal.description}</p>}
                      {goal.dueDate && (
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">
                          Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-primary">{progress}%</p>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Achieved</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={cn('h-full rounded-full', progress >= 100 ? 'bg-green-500' : 'bg-primary')}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                    <span>Current: <span className="text-primary">{Number(goal.currentValue ?? 0).toLocaleString()} {goal.unit ?? ''}</span></span>
                    <span>Target: <span className="text-primary">{Number(goal.targetValue ?? 0).toLocaleString()} {goal.unit ?? ''}</span></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-primary-container" />
              <h3 className="text-sm font-bold text-primary">Completed Goals</h3>
            </div>
            <div className="space-y-3">
              {goals.filter(g => getProgress(g) >= 100).length === 0 ? (
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-4">No completed goals yet</p>
              ) : goals.filter(g => getProgress(g) >= 100).map(g => (
                <div key={g.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="size-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-bold text-green-800 truncate">{g.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Create Strategic Goal</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Increase Market Share" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none" placeholder="Optional description…" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Scope *</label>
                  <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value, departmentId: '', ownerId: '' })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                    <option value="COMPANY">Company</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>
                {form.scope === 'DEPARTMENT' && (
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Target Department *</label>
                    <select required value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option value="">Select Department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                {form.scope === 'PERSONAL' && (
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Target Employee *</label>
                    <select required value={form.ownerId} onChange={e => setForm({ ...form, ownerId: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option value="">Select Employee...</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Target Value</label>
                    <input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. 1000000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Unit</label>
                    <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. XAF, %, users" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 disabled:opacity-60">
                  {submitting ? 'Creating…' : 'Deploy Objective'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
