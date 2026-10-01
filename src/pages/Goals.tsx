import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { OrganizationHeaderCard } from '../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../components/WorkplaceStatCards';
import { Target, Award, CheckCircle, TrendingUp, Plus, Activity } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [goals, setGoals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', objectiveType: 'Financial', targetValue: '', unit: '', dueDate: '', scope: 'COMPANY', departmentId: '', ownerId: '' });

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
      let targetVal = form.targetValue ? Number(form.targetValue) : undefined;
      let targetUnit = form.unit || undefined;

      if (form.objectiveType === 'Financial') {
        targetUnit = form.unit || 'XAF';
      } else if (form.objectiveType === 'Growth (%)') {
        targetUnit = '%';
      } else if (form.objectiveType === 'Milestone') {
        targetVal = 100;
        targetUnit = '%';
      }

      await api.createGoal({
        title: form.title,
        description: form.description || undefined,
        targetValue: targetVal,
        unit: targetUnit,
        dueDate: form.dueDate || undefined,
        scope: form.scope,
        departmentId: form.scope === 'DEPARTMENT' ? form.departmentId : undefined,
        ownerId: form.scope === 'PERSONAL' ? form.ownerId : undefined,
      });
      setShowModal(false);
      setForm({ title: '', description: '', objectiveType: 'Financial', targetValue: '', unit: '', dueDate: '', scope: 'COMPANY', departmentId: '', ownerId: '' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const getProgress = (goal: any) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min(100, Math.round((Number(goal.currentValue) / Number(goal.targetValue)) * 100));
  };

  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + getProgress(g), 0) / goals.length) : 0;
  const completedGoals = goals.filter(g => getProgress(g) >= 100);

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Executive Overview • Goals, Strategic Objectives & Enterprise KPIs" />

      <WorkplaceStatCards
        domainsCount={goals.length}
        usersCount={goals.filter(g => g.scope === 'COMPANY').length}
        groupsCount={completedGoals.length}
        licensesCount={`${avgProgress}%`}
        card1Label="TOTAL OBJECTIVES"
        card2Label="COMPANY-WIDE INITIATIVES"
        card3Label="COMPLETED TARGETS"
        card4Label="AVG COMPLETION RATE"
        card1Icon={<Target className="w-5 h-5" />}
        card2Icon={<TrendingUp className="w-5 h-5" />}
        card3Icon={<CheckCircle className="w-5 h-5" />}
        card4Icon={<Award className="w-5 h-5" />}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Strategic Objectives & Key Results (OKRs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational and financial KPIs aligned with executive company benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role !== 'employee' && (
            <Link
              to="/app/goals/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Set New Objective
            </Link>
          )}
          <Link
            to="/app/goals/track"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold tracking-wide transition-all shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            Track Goals
          </Link>
          <button 
            onClick={load} 
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold tracking-wide transition-all"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Goals List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center shadow-2xs">
            <p className="text-slate-500 text-xs">Loading objectives…</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center space-y-2 shadow-2xs">
            <p className="text-slate-900 font-semibold text-sm">No active objectives found</p>
            <p className="text-slate-500 text-xs">Initialize your first strategic KPI to begin tracking.</p>
          </div>
        ) : goals.map((goal) => {
          const progress = getProgress(goal);
          return (
            <div
              key={goal.id}
              className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3 hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-900">{goal.title}</h3>
                    {goal.scope === 'DEPARTMENT' && goal.department && (
                      <span className="bg-[#001f5b]/10 text-[#001f5b] px-2 py-0.5 rounded text-[10px] font-semibold">
                        {goal.department.name}
                      </span>
                    )}
                    {goal.scope === 'PERSONAL' && goal.owner && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                        {goal.owner.fullName}
                      </span>
                    )}
                    {goal.scope === 'COMPANY' && (
                      <span className="bg-[#001f5b]/10 text-[#001f5b] px-2 py-0.5 rounded text-[10px] font-semibold">
                        Enterprise
                      </span>
                    )}
                  </div>
                  {goal.description && <p className="text-xs text-slate-500 mt-1">{goal.description}</p>}
                  {goal.dueDate && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Due Date: {new Date(goal.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right sm:self-center shrink-0">
                  <p className="text-lg font-bold font-mono text-slate-900">{progress}%</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Accomplished</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', progress >= 100 ? 'bg-emerald-600' : 'bg-[#001f5b]')}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Current: <strong className="text-slate-800">{Number(goal.currentValue ?? 0).toLocaleString()} {goal.unit ?? ''}</strong></span>
                  <span>Target: <strong className="text-slate-800">{Number(goal.targetValue ?? 0).toLocaleString()} {goal.unit ?? ''}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Goal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-sm font-semibold text-slate-900">Set Strategic Objective</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form onSubmit={handleCreate} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Title *</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900" placeholder="e.g. Increase Market Share" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] resize-none text-slate-900" placeholder="Optional description…" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Objective Type *</label>
                    <select value={form.objectiveType} onChange={e => setForm({ ...form, objectiveType: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900">
                      <option value="Financial">Financial Target</option>
                      <option value="Quantitative">Quantitative Target</option>
                      <option value="Growth (%)">Growth Target (%)</option>
                      <option value="Milestone">Milestone / Basic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Scope *</label>
                    <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value, departmentId: '', ownerId: '' })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900">
                      <option value="COMPANY">Company</option>
                      <option value="DEPARTMENT">Department</option>
                      <option value="PERSONAL">Personal</option>
                    </select>
                  </div>
                  {form.scope === 'DEPARTMENT' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Target Department *</label>
                      <select required value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900">
                        <option value="">Select Department...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}
                  {form.scope === 'PERSONAL' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Target Employee *</label>
                      <select required value={form.ownerId} onChange={e => setForm({ ...form, ownerId: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900">
                        <option value="">Select Employee...</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                      </select>
                    </div>
                  )}
                  {form.objectiveType !== 'Milestone' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Target Value</label>
                        <input type="number" required value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900" placeholder="e.g. 1000000" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Unit</label>
                        <input value={form.objectiveType === 'Growth (%)' ? '%' : form.unit} disabled={form.objectiveType === 'Growth (%)'} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] disabled:bg-slate-50 text-slate-900" placeholder={form.objectiveType === 'Financial' ? 'e.g. XAF' : 'e.g. users'} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-[#001f5b] text-slate-900" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-2.5 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide mt-3 transition-colors shadow-2xs disabled:opacity-60">
                    {submitting ? 'Creating…' : 'Deploy Objective'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
