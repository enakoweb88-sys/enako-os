import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  TrendingUp, CreditCard, Wallet, Repeat, ChevronRight,
  Users, Utensils, ClipboardCheck, Activity, Zap, Target,
  Megaphone, CircleAlert, Briefcase, Clock, BarChart3,
} from 'lucide-react';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
  return n.toLocaleString();
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary">
            {role === 'ceo' ? 'Enterprise Command Center' : role === 'manager' ? 'Department Operations' : 'My Workspace'}
          </h2>
          <p className="text-secondary text-base">
            Welcome back, <span className="text-primary font-bold">{user?.fullName}</span>. System status is nominal.
          </p>
        </div>
      </div>

      {role === 'ceo' && <CEODashboard />}
      {role === 'manager' && <ManagerDashboard />}
      {role === 'employee' && <EmployeeDashboard />}
    </div>
  );
}

function CEODashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.overview(), api.transactions({ limit: 5 }), api.announcements()])
      .then(([ov, tx, ann]) => {
        setOverview(ov);
        setTransactions(tx.items);
        setAnnouncements(ann.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Revenue (Settled)',
      value: fmt(overview?.revenue?._sum?.amount),
      sub: `${overview?.revenue?._count ?? 0} transactions`,
      icon: CreditCard,
    },
    {
      label: 'Approved Expenses',
      value: fmt(overview?.expenses?._sum?.amount),
      sub: `${overview?.expenses?._count ?? 0} claims`,
      icon: Wallet,
    },
    {
      label: 'Active Employees',
      value: fmt(overview?.employees?.active, false),
      sub: `${overview?.employees?.suspended ?? 0} suspended`,
      icon: Users,
    },
    {
      label: 'Pending Transactions',
      value: fmt(overview?.transactions?.pending?._sum?.amount),
      sub: `${overview?.transactions?.pending?._count ?? 0} awaiting`,
      icon: Repeat,
    },
  ];

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading dashboard data…</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-primary-fixed">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-mono text-primary">{stat.value}</p>
            <p className="text-[10px] text-secondary mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* KYC Summary */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-white rounded-xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <h3 className="font-display text-2xl font-bold mb-6">KYC Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">PENDING REVIEW</p>
                <p className="text-3xl font-mono font-bold">{overview?.kyc?.pending ?? 0}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">APPROVED</p>
                  <p className="text-xl font-bold">{overview?.kyc?.approved ?? 0}</p>
                </div>
                <ClipboardCheck className="w-10 h-10 text-white/20" />
              </div>
            </div>
          </div>
          <Link to="/app/kyc" className="relative z-10 mt-6 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1">
            Manage KYC <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Global Ledger */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-display text-xl font-bold text-primary">Recent Transactions</h3>
            <Link to="/app/transactions" className="text-on-primary-container text-[11px] font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Entity</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{t.entity}</p>
                        <p className="text-[11px] text-secondary uppercase tracking-wider mt-0.5">{t.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                        t.status === 'SETTLED' ? 'bg-green-50 text-green-700' : 'bg-primary-fixed text-primary',
                      )}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-primary">
                      {fmt(t.amount)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-secondary">No transactions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Link to="/app/announcements" className="block bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:border-primary transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary">
                <Megaphone className="w-5 h-5" />
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">Announcements</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="space-y-3">
              {announcements.length === 0
                ? <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-4">No active broadcasts</p>
                : announcements.map(a => (
                  <div key={a.id} className="border-l-2 border-primary pl-3">
                    <p className="text-sm font-bold text-primary truncate">{a.title}</p>
                    <p className="text-[10px] text-secondary">{a.author?.fullName} · {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
            </div>
          </Link>

          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <CircleAlert className="w-5 h-5" />
              <h3 className="font-display text-lg font-bold">Meal Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Total meals (ATE)</span>
                <span className="font-bold text-primary">{overview?.meals?._count ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Company contribution</span>
                <span className="font-bold text-primary">{fmt(overview?.meals?._sum?.companyAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Employee contribution</span>
                <span className="font-bold text-primary">{fmt(overview?.meals?._sum?.employeeAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Tasks */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-bold text-primary">Open Tasks</h3>
            <span className="text-2xl font-mono font-bold text-primary">{overview?.tasks?.open ?? 0}</span>
          </div>
          <p className="text-secondary text-sm">Tasks not yet completed across all departments.</p>
          <Link to="/app/goals" className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline">
            View Goals & KPIs <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.overview(), api.tasks()])
      .then(([ov, t]) => { setOverview(ov); setTasks(t.slice(0, 5)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const managerStats = [
    { label: 'Active Employees', value: fmt(overview?.employees?.active, false), icon: Users },
    { label: 'Pending Expenses', value: fmt(overview?.expenses?._count, false), icon: Wallet },
    { label: 'Open Tasks', value: fmt(overview?.tasks?.open, false), icon: ClipboardCheck },
    { label: 'KYC Pending', value: fmt(overview?.kyc?.pending, false), icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {managerStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-surface-container rounded-lg shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-display text-xl font-bold text-primary mb-6">Recent Tasks</h3>
        <div className="space-y-3">
          {tasks.length === 0
            ? <p className="text-secondary text-sm text-center py-4">No tasks found.</p>
            : tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                <div>
                  <p className="text-sm font-bold text-primary">{task.title}</p>
                  <p className="text-[10px] text-secondary uppercase tracking-widest mt-0.5">
                    {task.assignee?.fullName ?? 'Unassigned'} · {task.priority}
                  </p>
                </div>
                <span className={cn(
                  'text-[9px] font-black uppercase px-2 py-0.5 rounded',
                  task.status === 'DONE' ? 'bg-green-50 text-green-700' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                  'bg-primary-fixed text-primary',
                )}>{task.status}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meals, setMeals] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.expenses(), api.tasks(), api.meals(), api.announcements()])
      .then(([exp, t, m, ann]) => {
        setExpenses(exp);
        setTasks(t.slice(0, 5));
        setMeals(m);
        setAnnouncements(ann.slice(0, 1));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const pendingExpenses = expenses?.totals?.find((t: any) => t.status === 'PENDING')?._sum?.amount ?? 0;
  const myMeals = meals?.items?.filter((m: any) => m.employeeId === user?.id) ?? [];
  const myMealTotal = myMeals.filter((m: any) => m.status === 'ATE').length;

  const employeeStats = [
    { label: 'Meal Credits Used', value: `${myMealTotal} meals`, icon: Utensils },
    { label: 'Pending Reimbursements', value: fmt(pendingExpenses), icon: Wallet },
    { label: 'My Tasks', value: fmt(tasks.length, false), icon: ClipboardCheck },
    { label: 'Active Goals', value: '—', icon: Target },
  ];

  return (
    <div className="space-y-8">
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
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary mb-6">My Tasks</h3>
          <div className="space-y-3">
            {tasks.length === 0
              ? <p className="text-secondary text-sm text-center py-4">No tasks assigned.</p>
              : tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                  <div>
                    <p className="text-sm font-bold text-primary">{task.title}</p>
                    <p className="text-[10px] text-secondary uppercase tracking-widest mt-0.5">
                      {task.priority} · Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded',
                    task.status === 'DONE' ? 'bg-green-50 text-green-700' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                    'bg-primary-fixed text-primary',
                  )}>{task.status}</span>
                </div>
              ))}
          </div>
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
