import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Utensils, Wallet, ClipboardCheck, Target, Megaphone, BarChart3, Activity } from 'lucide-react';
import { TasksWidget } from '../../components/TasksWidget';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
  return n.toLocaleString();
}

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meals, setMeals] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.expenses().catch(() => null),
      api.tasks().catch(() => []),
      api.meals().catch(() => null),
      api.announcements().catch(() => []),
      api.goals().catch(() => [])
    ])
      .then(([exp, t, m, ann, g]) => {
        setExpenses(exp);
        setTasks(Array.isArray(t) ? t.slice(0, 5) : []);
        setMeals(m);
        setAnnouncements(Array.isArray(ann) ? ann.slice(0, 1) : []);
        setGoals(Array.isArray(g) ? g : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const pendingExpenses = expenses?.totals?.find((t: any) => t.status === 'PENDING')?._sum?.amount ?? 0;
  const myMeals = meals?.items?.filter((m: any) => m.employeeId === user?.id) ?? [];
  const myMealTotal = myMeals.filter((m: any) => m.status === 'ATE').length;

  const activeGoals = goals.filter((g: any) => g.status === 'ACTIVE').length;

  const employeeStats = [
    { label: 'Meal Credits Used', value: `${myMealTotal} meals`, icon: Utensils },
    { label: 'Pending Reimbursements', value: fmt(pendingExpenses), icon: Wallet },
    { label: 'My Tasks', value: fmt(tasks.length, false), icon: ClipboardCheck },
    { label: 'Active Goals', value: activeGoals.toString(), icon: Target },
  ];

  return (
    <div className="space-y-8">
      {/* Operations Header: Work Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary-fixed border border-primary/20 rounded-xl p-6 shadow-sm text-white">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Current Work Stream</p>
          <p className="text-xl font-bold font-display">Active Operations</p>
          <p className="text-xs text-white/70 mt-2">Check your tasks</p>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Active Goals</p>
          <p className="text-lg font-bold text-primary">{activeGoals} Goals Tracking</p>
          <p className="text-xs text-secondary mt-1">Keep up the momentum</p>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary" /> General Operations</p>
          <p className="text-lg font-bold text-primary">Routine Maintenance</p>
          <p className="text-xs text-secondary mt-1">System is healthy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employeeStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
            <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold font-display text-primary">{stat.value}</p>
              <div className="p-1.5 bg-surface-container rounded text-primary">
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TasksWidget limit={10} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 text-secondary mb-4">
              <Megaphone className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Latest Announcement</span>
            </div>
            {announcements.length > 0 ? (
              <>
                <p className="text-sm font-bold text-primary mb-2">{announcements[0].title}</p>
                <p className="text-[11px] text-secondary leading-relaxed">{announcements[0].content?.slice(0, 120)}…</p>
              </>
            ) : (
              <p className="text-sm font-bold text-primary">No active announcements</p>
            )}
            <Link to="/app/announcements" className="mt-4 block text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>

          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-primary">Meal Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Meals eaten</span>
                <span className="font-bold text-primary">{myMealTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">My contribution</span>
                <span className="font-bold text-primary">{fmt(myMealTotal * 500)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
