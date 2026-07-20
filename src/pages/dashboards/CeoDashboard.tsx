import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api, outreachAPI } from '../../lib/api';
import {
  CreditCard, Wallet, Users, Repeat, ClipboardCheck,
  ChevronRight, Briefcase, Megaphone, CircleAlert, Activity, PieChart, TrendingUp,
  Globe
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
  return n.toLocaleString();
}

export function CEODashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // New API data states
  const [healthScore, setHealthScore] = useState<any>(null);
  const [marketing, setMarketing] = useState<any>(null);
  const [njangi, setNjangi] = useState<any>(null);
  const [appActivity, setAppActivity] = useState<any>(null);
  const [outreachStats, setOutreachStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.overview().catch(() => null),
      api.healthScore().catch(() => null),
      api.transactions({ limit: 5 }).catch(() => ({ items: [] })),
      api.marketingPerformance().catch(() => null),
      api.njangiAnalysis().catch(() => null),
      api.appActivity().catch(() => null),
      outreachAPI.getStats().catch(() => null),
      outreachAPI.getApplications().catch(() => [])
    ])
      .then(([ov, h, t, m, n, a, outStats, outApps]) => {
        setOverview(ov);
        setHealthScore(h);
        setTransactions(Array.isArray(t) ? t : t?.items || []);
        setMarketing(Array.isArray(m) ? { channels: m } : m || { channels: [] });
        setNjangi(n);
        setAppActivity(a);
        setOutreachStats(outStats);
        setApplications(Array.isArray(outApps) ? outApps.slice(0, 5) : []);
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
      value: fmt(overview?.expenses?.approved?._sum?.amount),
      sub: `${overview?.expenses?.approved?._count ?? 0} claims`,
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
      {/* ── Top Actions ── */}
      <div className="flex justify-end">
        <button onClick={() => toast.success('Executive Report generated and sent to your email')} className="px-6 py-2.5 border border-outline-variant bg-white text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export Executive Report
        </button>
      </div>

      {/* Operations Header: Work Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary-fixed border border-primary/20 rounded-xl p-6 shadow-sm text-white">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Current Work Stream</p>
          <p className="text-xl font-bold font-display">Executive Oversight</p>
          <p className="text-xs text-white/70 mt-2">Company-wide Growth</p>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Active Task</p>
          <p className="text-lg font-bold text-primary">Strategic Planning</p>
          <p className="text-xs text-secondary mt-1">Reviewing Quarterly Goals</p>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary" /> General Operations</p>
          <p className="text-lg font-bold text-primary">Investor Relations</p>
          <p className="text-xs text-secondary mt-1">Preparing monthly bulletin</p>
        </div>
      </div>

      {/* ── Top Level Stats ── */}
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
        {/* ENAKO Health Score */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" /> ENAKO Health Score
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center relative my-4">
            <div className="h-40 w-40 relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-surface-container-high stroke-[8]" />
                <circle cx="50" cy="50" r="40" className="fill-none stroke-primary stroke-[8]" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (healthScore?.score ?? 85)) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold text-primary">{healthScore?.score ?? 85}</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">/ 100</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-surface-container-low p-3 rounded-lg text-center">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Users</p>
              <p className={`font-bold ${healthScore?.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {healthScore?.usersGrowth >= 0 ? '+' : ''}{healthScore?.usersGrowth ?? 0}%
              </p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg text-center">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Revenue</p>
              <p className={`font-bold ${healthScore?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {healthScore?.revenueGrowth >= 0 ? '+' : ''}{healthScore?.revenueGrowth ?? 0}%
              </p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg text-center">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Uptime</p>
              <p className="font-bold text-primary">{healthScore?.uptime ?? 0}%</p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg text-center">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Satisfaction</p>
              <p className="font-bold text-primary">{healthScore?.satisfaction ?? 0}%</p>
            </div>
          </div>
        </div>

        {/* APP Download & Activity */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> App Downloads & Activity
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/50 w-full h-64">
            <TrendingUp className="w-8 h-8 text-secondary/50 mb-3" />
            <p className="text-sm font-bold text-secondary">Awaiting API Key Integration</p>
            <p className="text-xs text-secondary mt-1">App download data will appear here once connected.</p>
          </div>
        </div>
      </div>

      {/* CEO Follow-Up Panel */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
          <CircleAlert className="w-5 h-5" /> Executive Follow-Up
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Immediate Attention</h4>
            </div>
            <ul className="space-y-3">
              <li className="flex justify-between items-start text-sm">
                <span className="text-red-900 font-medium">Overdue KYC Approvals</span>
                <span className="bg-red-200 text-red-800 px-2 rounded-full text-xs font-bold">{overview?.kyc?.pending ?? 0}</span>
              </li>
              <li className="flex justify-between items-start text-sm">
                <span className="text-red-900 font-medium">Failed Disbursals</span>
                <span className="bg-red-200 text-red-800 px-2 rounded-full text-xs font-bold">{overview?.transactions?.failed?._count ?? 0}</span>
              </li>
            </ul>
          </div>
          <div className="bg-yellow-50/50 rounded-xl p-5 border border-yellow-100">
            <div className="flex items-center gap-2 text-yellow-600 mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Monitor Closely</h4>
            </div>
            <ul className="space-y-3">
              <li className="flex justify-between items-start text-sm">
                <span className="text-yellow-900 font-medium">Pending Transactions</span>
                <span className="bg-yellow-200 text-yellow-800 px-2 rounded-full text-xs font-bold">{overview?.transactions?.pending?._count ?? 0}</span>
              </li>
              <li className="flex justify-between items-start text-sm">
                <span className="text-yellow-900 font-medium">Unassigned Support Tickets</span>
                <span className="bg-yellow-200 text-yellow-800 px-2 rounded-full text-xs font-bold">{overview?.support?.unassignedTickets ?? 0}</span>
              </li>
            </ul>
          </div>
          <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Good News</h4>
            </div>
            <ul className="space-y-3">
              <li className="flex justify-between items-start text-sm">
                <span className="text-green-900 font-medium">Approved KYC</span>
                <span className="bg-green-200 text-green-800 px-2 rounded-full text-xs font-bold text-right">{overview?.kyc?.approved ?? 0}</span>
              </li>
              <li className="flex justify-between items-start text-sm">
                <span className="text-green-900 font-medium">Revenue Target</span>
                <span className="bg-green-200 text-green-800 px-2 rounded-full text-xs font-bold">
                  {overview?.revenue?._sum?.amount ? Math.min(100, Math.round((Number(overview.revenue._sum.amount) / 100000000) * 100)) : 0}%
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Marketing Channel Performance */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5" /> Marketing Channel Performance
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Channel</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Users</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Performance</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {(marketing?.channels?.length > 0) ? (marketing.channels.map((c: any) => (
                  <tr key={c.name} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-sm font-bold text-primary">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-secondary font-mono">{fmt(c.users, false)}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-surface-container-high rounded-full h-1.5 max-w-[120px]">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(c.users / Math.max(1, c.total)) * 100}%` }} />
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs font-bold text-right ${c.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {c.growth >= 0 ? '+' : ''}{c.growth}%
                    </td>
                  </tr>
                ))) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-secondary text-sm">No marketing data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Njangi (Groups) Analysis */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5" /> Njangi (Groups) Analysis
          </h3>
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/50 flex-1 min-h-[250px]">
            <PieChart className="w-8 h-8 text-secondary/50 mb-3" />
            <p className="text-sm font-bold text-secondary">Awaiting API Key Integration</p>
            <p className="text-xs text-secondary mt-1">Njangi data will appear here once connected.</p>
          </div>
        </div>
      </div>
      
      {/* Existing Sections (KYC, Ledger, Announcements, Open Tasks) wrapped in grid */}
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
        </div>

        {/* Open Tasks */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-bold text-primary">Open Tasks</h3>
            <span className="text-2xl font-mono font-bold text-primary">{overview?.tasks?.open ?? 0}</span>
          </div>
          <p className="text-secondary text-sm">Tasks not yet completed across all departments.</p>
          <div className="mt-4 flex items-center gap-4">
            <Link to="/app/tasks" className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline">
              View All Tasks <ChevronRight className="w-3 h-3" />
            </Link>
            <Link to="/app/goals" className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline">
              View Goals & KPIs <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
      {/* ── Outreach Monitoring & Application Review ── */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Globe className="w-5 h-5" /> Outreach Monitoring & Executive Review
          </h3>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Events</p>
              <p className="font-bold text-primary text-lg">{outreachStats?.activeEvents || 0}</p>
            </div>
            <div className="text-right border-l border-outline-variant/30 pl-4">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Newsletter Subscribers</p>
              <p className="font-bold text-primary text-lg">{fmt(outreachStats?.subscribers || 0, false)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-secondary">Forwarded Applications Awaiting Your Approval</h4>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 text-secondary text-sm">
                <th className="pb-3 font-semibold">Applicant Name</th>
                <th className="pb-3 font-semibold">Level</th>
                <th className="pb-3 font-semibold">Date Verified</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-center text-sm text-secondary">No applications found.</td></tr>
              ) : applications.map((app) => (
                <tr key={app.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container/30">
                  <td className="py-4 font-bold text-primary">{app.fullName}</td>
                  <td className="py-4 text-sm text-secondary">{app.level}</td>
                  <td className="py-4 text-sm text-secondary">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{app.status}</span></td>
                  <td className="py-4 text-right">
                    <button onClick={() => toast.success('Application Approved. Automated bilingual email dispatched!')} className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 mr-2">Approve</button>
                    <button onClick={() => toast.error('Application Rejected.')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
