import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api, outreachAPI } from '../../lib/api';
import {
  Users, Wallet, ClipboardCheck, Activity, Calendar, User, ArrowRight,
  Bell, FileText, Settings, ShieldCheck, CheckCircle2, Megaphone,
  Briefcase, Globe
} from 'lucide-react';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
  return n.toLocaleString();
}

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [outreachStats, setOutreachStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.overview(),
      api.tasks(),
      api.notifications(),
      api.employees({ limit: 5 }),
      api.auditLogs().catch(() => []),
      outreachAPI.getStats().catch(() => null),
      outreachAPI.getApplications().catch(() => [])
    ])
      .then(([ov, t, notif, emp, logs, outStats, outApps]) => {
        setOverview(ov);
        setTasks(t.slice(0, 5));
        setNotifications(notif.slice(0, 5));
        setStaff(emp.items || []);
        
        const mappedLogs = Array.isArray(logs) ? logs.slice(0, 4).map((log: any) => ({
          id: log.id,
          action: log.action,
          user: log.employee?.fullName || 'System',
          time: new Date(log.createdAt).toLocaleTimeString(),
          icon: Activity,
          color: 'text-slate-600'
        })) : [];
        setActivities(mappedLogs);
        
        setOutreachStats(outStats);
        setApplications(Array.isArray(outApps) ? outApps.slice(0, 5) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const managerStats = [
    { label: 'Active Employees', value: fmt(overview?.employees?.active, false), icon: Users },
    { label: 'Pending Expenses', value: fmt(overview?.expenses?.pending?._count, false), icon: Wallet },
    { label: 'Open Tasks', value: fmt(overview?.tasks?.open, false), icon: ClipboardCheck },
    { label: 'KYC Pending', value: fmt(overview?.kyc?.pending, false), icon: Activity },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Date Range Picker (Operations Manager Specific Header Tool) */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-primary">Operations Overview</h3>
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 cursor-pointer hover:border-primary transition-colors">
          <Calendar className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold text-primary">10 June – 16 June 2026</span>
        </div>
      </div>

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

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Top Performing Staff */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-primary">Top Performing Staff</h3>
              <Link to="/app/employees" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Staff</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Role</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Department</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Hire Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {staff.length > 0 ? staff.map((emp: any, i) => (
                    <tr key={emp.id} className="hover:bg-surface-container-low/30">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {emp.fullName?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-bold text-primary">{emp.fullName}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary">{emp.role || 'Employee'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-primary">{emp.department || '—'}</td>
                      <td className="px-4 py-3 text-sm text-secondary text-right">{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-secondary text-sm">No staff data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Tasks (Existing Component) */}
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

        {/* Right Column (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Alerts & Notifications */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" /> Live Alerts
            </h3>
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map((n: any, i) => (
                <div key={n.id || i} className="flex gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-primary">{n.title || 'System Notification'}</p>
                    <p className="text-xs text-secondary mt-0.5">{n.content || 'Please check the system.'}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now'}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-secondary text-center py-4">No recent alerts</p>
              )}
            </div>
          </div>

          {/* Recent Activities Feed */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Audit Log
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
              {activities.map((act) => (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-surface-container-low ${act.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                    <act.icon className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-outline-variant/30 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-primary text-xs">{act.user}</div>
                      <time className="font-mono text-[9px] text-secondary">{act.time}</time>
                    </div>
                    <div className="text-xs text-slate-600">{act.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Outreach Monitoring & Application Review ── */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Globe className="w-5 h-5" /> Outreach Monitoring & Manager Review
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
                    <button onClick={() => toast.success('Application Approved.')} className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 mr-2">Approve</button>
                    <button onClick={() => toast.error('Application Rejected.')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Bar (Sticky Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-2 hidden md:flex items-center gap-2">
        <button onClick={() => navigate('/app/expenses')} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors w-24">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">Approve<br/>Request</span>
        </button>
        <button onClick={() => navigate('/app/tasks')} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors w-24">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">Create<br/>Task</span>
        </button>
        <div className="w-px h-8 bg-outline-variant/30 mx-1" />
        <button onClick={() => navigate('/app/employees')} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors w-24">
          <User className="w-5 h-5 text-purple-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">Add New<br/>Agent</span>
        </button>
        <button onClick={() => toast.success('Njangi Group creation opened')} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors w-24">
          <Users className="w-5 h-5 text-orange-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">Create<br/>Njangi</span>
        </button>
        <div className="w-px h-8 bg-outline-variant/30 mx-1" />
        <button onClick={() => navigate('/app/reports')} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors w-24">
          <FileText className="w-5 h-5 text-teal-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">Generate<br/>Report</span>
        </button>
        <button onClick={() => navigate('/app/announcements')} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-surface-container-low transition-colors w-24">
          <Megaphone className="w-5 h-5 text-red-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">System<br/>Broadcast</span>
        </button>
      </div>

    </div>
  );
}
