import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import {
  Utensils, Wallet, ClipboardCheck, Target, Megaphone, BarChart3,
  Activity, FileText, User, CheckCircle2, Clock, Calendar, Briefcase,
  Mail, Phone, ShieldCheck, TrendingUp, AlertCircle
} from 'lucide-react';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

export function EmployeeDashboard({ targetUser }: { targetUser?: any }) {
  const { user: authUser } = useAuth();
  const user = targetUser || authUser;
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.expenses({ limit: 100 }).catch(() => ({ items: [] })),
      api.tasks().catch(() => []),
      api.meals().catch(() => ({ items: [] })),
      api.announcements().catch(() => []),
      api.goals().catch(() => [])
    ])
      .then(([expRes, tRes, mRes, annRes, gRes]) => {
        const allExp = expRes?.items || (Array.isArray(expRes) ? expRes : []);
        const myExp = user?.id 
          ? allExp.filter((e: any) => e.submittedById === user.id || e.submittedBy?.email === user.email)
          : allExp;
        setExpenses(myExp);

        const allTasks = Array.isArray(tRes) ? tRes : [];
        const myTasks = user?.id 
          ? allTasks.filter((t: any) => t.assigneeId === user.id || t.assignee?.id === user.id)
          : allTasks;
        setTasks(myTasks);

        const allMeals = mRes?.items || (Array.isArray(mRes) ? mRes : []);
        const myMealsList = user?.id 
          ? allMeals.filter((m: any) => m.employeeId === user.id)
          : allMeals;
        setMeals(myMealsList);

        setAnnouncements(Array.isArray(annRes) ? annRes.slice(0, 3) : []);

        const allGoals = Array.isArray(gRes) ? gRes : [];
        const myGoalsList = user?.id 
          ? allGoals.filter((g: any) => g.ownerId === user.id || g.departmentId === user.departmentId)
          : allGoals;
        setGoals(myGoalsList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, user?.email]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-secondary text-sm font-medium animate-pulse">Loading employee workspace records...</p>
      </div>
    );
  }

  // Derived metrics for this specific employee
  const pendingExpTotal = expenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + Number(e.amount || 0), 0);
  const approvedExpTotal = expenses.filter(e => e.status === 'APPROVED').reduce((s, e) => s + Number(e.amount || 0), 0);
  
  const eatenMeals = meals.filter(m => m.status === 'ATE');
  const eatenMealsCount = eatenMeals.length;
  const mealCostTotal = eatenMealsCount * 500;

  const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;

  const activeGoalsCount = goals.filter(g => g.status === 'ACTIVE' || !g.status).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Operative Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 border border-primary/20 rounded-3xl p-6 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="size-16 rounded-2xl object-cover border-2 border-white/20 shadow-md" />
          ) : (
            <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white text-2xl shadow-inner border border-white/20">
              {(user?.fullName || 'EP').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold">{user?.fullName || 'Operative Workspace'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                {user?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-white/80 font-medium mt-0.5">
              {user?.title || 'Operative'} &bull; <span className="text-amber-300 font-bold">{user?.department?.name || user?.department || 'General Operations'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-white/60 font-mono">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-white/40" /> {user?.email}</span>
              {user?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-white/40" /> {user.phone}</span>}
              {user?.hireDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-white/40" /> Hired: {new Date(user.hireDate).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Total Claims</p>
            <p className="font-mono text-lg font-bold text-white">{fmt(approvedExpTotal + pendingExpTotal)}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Tasks Done</p>
            <p className="font-mono text-lg font-bold text-emerald-400">{completedTasks} / {tasks.length}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">My Tasks</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl"><ClipboardCheck className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-primary">{tasks.length}</div>
            <p className="text-xs text-secondary mt-1">
              <span className="text-emerald-600 font-bold">{completedTasks} completed</span> &bull; <span className="text-amber-600 font-bold">{pendingTasks} pending</span>
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Pending Expenses</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl"><Wallet className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-primary">{fmt(pendingExpTotal)}</div>
            <p className="text-xs text-secondary mt-1">
              {expenses.filter(e => e.status === 'PENDING').length} claim(s) awaiting review
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Staff Meal Credits</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Utensils className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-primary">{eatenMealsCount} <span className="text-xs font-normal text-secondary">meals</span></div>
            <p className="text-xs text-secondary mt-1">
              Cost share: <span className="font-mono font-bold text-primary">{fmt(mealCostTotal)}</span>
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Active Goals</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl"><Target className="w-5 h-5" /></div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-primary">{activeGoalsCount}</div>
            <p className="text-xs text-secondary mt-1">
              Tracking performance targets
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Tasks & Expense Claims */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Assigned Tasks List */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-2.5">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-primary">Assigned Tasks ({tasks.length})</h3>
            </div>
            <span className="text-xs font-bold text-secondary">{completedTasks} of {tasks.length} Completed</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {tasks.length > 0 ? (
              tasks.map(t => (
                <div key={t.id} className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{t.title}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
                        t.priority === 'HIGH' || t.priority === 'URGENT' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}>
                        {t.priority || 'NORMAL'}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-secondary line-clamp-1">{t.description}</p>}
                    {t.dueDate && <p className="text-[10px] text-slate-400 font-mono">Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
                  </div>

                  <span className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shrink-0',
                    t.status === 'DONE' || t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  )}>
                    {t.status || 'PENDING'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-secondary italic">No tasks currently assigned to this operative.</div>
            )}
          </div>
        </div>

        {/* Expense Reimbursements List */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-primary">Expense Claims ({expenses.length})</h3>
            </div>
            <span className="text-xs font-mono font-bold text-primary">{fmt(approvedExpTotal + pendingExpTotal)}</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {expenses.length > 0 ? (
              expenses.map(e => (
                <div key={e.id} className="p-3.5 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-xs text-primary">{e.description}</p>
                    <p className="text-[10px] text-secondary font-medium mt-0.5">{e.category} &bull; {new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-primary">{fmt(e.amount)}</p>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border inline-block mt-1',
                      e.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      e.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-secondary italic">No expense reimbursement claims recorded for this employee.</div>
            )}
          </div>
        </div>

      </div>

      {/* Secondary Grid: Staff Meals Log & Goals Tracking */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Goals & Performance Targets */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-outline-variant/20 pb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-display text-lg font-bold text-primary">Assigned Performance Goals ({goals.length})</h3>
          </div>

          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map(g => {
                const current = Number(g.currentValue || 0);
                const target = Number(g.targetValue || 100);
                const pct = Math.min(100, Math.round((current / target) * 100));

                return (
                  <div key={g.id} className="p-4 bg-slate-50 rounded-xl border border-outline-variant/30 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-primary">{g.title}</p>
                        {g.description && <p className="text-xs text-secondary mt-0.5">{g.description}</p>}
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">{current} / {target} {g.unit || ''}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex justify-between text-[10px] text-secondary font-medium">
                      <span>Progress: {pct}%</span>
                      {g.dueDate && <span>Target Date: {new Date(g.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-secondary italic">No active performance goals assigned to this operative.</div>
            )}
          </div>
        </div>

        {/* Staff Meal Usage Log */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-2.5">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display text-lg font-bold text-primary">Staff Meal Log</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700">{eatenMealsCount} Meals Recorded</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {meals.length > 0 ? (
              meals.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-outline-variant/30 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-primary">{m.mealName || 'Standard Staff Meal'}</p>
                    <p className="text-[10px] text-secondary">{new Date(m.date).toLocaleDateString()} &bull; {m.mealTime || 'Lunch'}</p>
                  </div>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border',
                    m.status === 'ATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {m.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-secondary italic">No staff meal logs found for this employee.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
