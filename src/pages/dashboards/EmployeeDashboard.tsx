import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

interface EmployeeDashboardProps {
  targetUser?: any;
}

import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';

export function EmployeeDashboard({ targetUser }: EmployeeDashboardProps) {
  const { user: authUser } = useAuth();
  const user = targetUser || authUser;

  const [tasks, setTasks] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    Promise.all([
      api.tasks().catch(() => []),
      api.expenses().catch(() => ({ items: [], totals: [] })),
      api.goals().catch(() => []),
      api.staffMeals().catch(() => []),
    ])
      .then(([allTasks, allExpenses, allGoals, allMeals]) => {
        const myTasks = Array.isArray(allTasks) ? allTasks.filter((t: any) => t.assignedToId === user.id || t.assignedTo?.id === user.id) : [];
        const expItems = allExpenses?.items || (Array.isArray(allExpenses) ? allExpenses : []);
        const myExpenses = expItems.filter((e: any) => e.submittedById === user.id || e.submittedBy?.id === user.id);
        const myGoals = Array.isArray(allGoals) ? allGoals.filter((g: any) => g.employeeId === user.id || g.employee?.id === user.id) : [];
        const myMeals = Array.isArray(allMeals) ? allMeals.filter((m: any) => m.employeeId === user.id || m.employee?.id === user.id) : [];

        setTasks(myTasks);
        setExpenses(myExpenses);
        setGoals(myGoals);
        setMeals(myMeals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <div className="text-slate-500 text-xs font-bold uppercase tracking-wider py-8">Loading Operative Workspace...</div>;

  const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const pendingTasks = tasks.length - completedTasks;

  const approvedExpTotal = expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const pendingExpTotal = expenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const activeGoalsCount = goals.filter(g => g.status !== 'COMPLETED').length;
  const eatenMealsCount = meals.filter(m => m.status === 'ATE').length;
  const mealCostTotal = eatenMealsCount * 1500;

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. ORGANIZATION SUMMARY CARD ── */}
      <OrganizationHeaderCard subtitle={`${user?.fullName || 'Staff Member'} • ${user?.department?.name || user?.department || 'Operations'}`} />

      {/* ── 2. TOP METRIC CARDS WITH COLORED BOTTOM ACCENT ── */}
      <WorkplaceStatCards
        card1Label="ASSIGNED TASKS"
        domainsCount={tasks.length}
        card2Label="COMPLETED TASKS"
        usersCount={completedTasks}
        card3Label="PENDING CLAIMS"
        groupsCount={fmt(pendingExpTotal)}
        card4Label="STAFF MEALS"
        licensesCount={eatenMealsCount}
      />

      {/* Main Grid: Tasks & Expense Claims */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Assigned Tasks List */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Assigned Tasks ({tasks.length})
            </h3>
            <span className="text-xs font-bold text-slate-500">{completedTasks} of {tasks.length} Completed</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {tasks.length > 0 ? (
              tasks.map(t => (
                <div key={t.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4 hover:bg-slate-100 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{t.title}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
                        t.priority === 'HIGH' || t.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}>
                        {t.priority || 'NORMAL'}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>}
                    {t.dueDate && <p className="text-[10px] text-slate-400 font-mono">Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
                  </div>

                  <span className={cn(
                    'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0',
                    t.status === 'DONE' || t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  )}>
                    {t.status || 'PENDING'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">No tasks currently assigned to this operative.</div>
            )}
          </div>
        </div>

        {/* Expense Reimbursements List */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Expense Claims ({expenses.length})
            </h3>
            <span className="text-xs font-mono font-bold text-slate-900">{fmt(approvedExpTotal + pendingExpTotal)}</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {expenses.length > 0 ? (
              expenses.map(e => (
                <div key={e.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{e.description}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{e.category} &bull; {new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-slate-900">{fmt(e.amount)}</p>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border inline-block mt-1',
                      e.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      e.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">No expense reimbursement claims recorded.</div>
            )}
          </div>
        </div>

      </div>

      {/* Secondary Grid: Staff Meals Log & Goals Tracking */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Goals & Performance Targets */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Assigned Performance Goals ({goals.length})
            </h3>
          </div>

          <div className="space-y-3">
            {goals.length > 0 ? (
              goals.map(g => {
                const current = Number(g.currentValue || 0);
                const target = Number(g.targetValue || 100);
                const pct = Math.min(100, Math.round((current / target) * 100));

                return (
                  <div key={g.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{g.title}</p>
                        {g.description && <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>}
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900">{current} / {target} {g.unit || ''}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Progress: {pct}%</span>
                      {g.dueDate && <span>Target Date: {new Date(g.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No active performance goals assigned to this operative.</div>
            )}
          </div>
        </div>

        {/* Staff Meal Usage Log */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Staff Meal Log
            </h3>
            <span className="text-xs font-bold text-slate-900">{eatenMealsCount} Meals Recorded</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {meals.length > 0 ? (
              meals.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{m.mealName || 'Standard Staff Meal'}</p>
                    <p className="text-[10px] text-slate-500">{new Date(m.date).toLocaleDateString()} &bull; {m.mealTime || 'Lunch'}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[9px] font-bold uppercase border',
                    m.status === 'ATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {m.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No staff meal logs found.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
