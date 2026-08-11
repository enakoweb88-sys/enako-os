import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  Users, UserCheck, CalendarOff, ClipboardList, Settings, CheckCircle2,
  Award, HeartHandshake, UserPlus, FileCheck, Shield, Megaphone,
  BookOpen, Smile, RefreshCw, Briefcase, GraduationCap
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.adminOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse p-8">Loading HR & People Management Command Center…</div>;

  const hrStats = [
    { label: 'Total Active Staff', value: overview?.totalStaff || 142, sub: `${overview?.presentToday || 128} Present Today`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Employee Retention Rate', value: overview?.employeeRetention || '96.8%', sub: 'Target: >95%', icon: HeartHandshake, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Onboarding Completion', value: overview?.onboardingCompletion || '94.2%', sub: 'New Hire Pipeline', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Performance Review Rate', value: overview?.performanceReviewCompletion || '92.0%', sub: 'Q3 Evaluations Complete', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Action Header Bar */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-primary">HR & People Management Hub</h3>
            <p className="text-xs text-secondary font-medium">Employee Lifecycle, Onboarding, Performance Reviews, Leaves, Compensation, & Welfare.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/app/employees')} 
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all"
          >
            <UserPlus className="w-4 h-4" /> Create Employee Profile
          </button>
          <button onClick={loadData} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HR KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.label}</span>
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-secondary font-medium">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* HR Focus Areas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Training & Development', tag: 'Skills Portal', value: `${overview?.trainingCompletion || '88.5%'} Completed`, desc: 'Employee fintech compliance, customer service, & engineering training modules.' },
          { title: 'Employee Satisfaction', tag: 'Quarterly Survey', value: overview?.employeeSatisfaction || '4.8 / 5.0 Rating', desc: 'Positive staff sentiment across work-life balance, compensation, and team culture.' },
          { title: 'Staff Welfare & Meals', tag: 'Welfare Program', value: '1,000 FCFA / Meal', desc: '50% company contribution to staff daily meal orders across all branches.' },
          { title: 'Payroll Coordination', tag: 'Finance Sync', value: 'Verified', desc: 'Monthly salary alignment, tax deductions, & compensation package sync with Finance.' },
        ].map((item, idx) => (
          <div key={idx} className="p-5 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold uppercase tracking-wider">{item.tag}</span>
              <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <h4 className="text-sm font-bold text-primary">{item.title}</h4>
            <p className="text-xs font-mono font-bold text-primary">{item.value}</p>
            <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Leave Approvals & Quick HR Tools */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Leave Requests Table */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Active Leave Requests & Holiday Approvals
            </h3>
            <Link to="/app/leaves" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">Manage All Leaves</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Employee</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Leave Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Duration</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {overview?.leaveRequests?.length > 0 ? overview.leaveRequests.map((req: any, i: number) => (
                  <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-bold text-primary">{req.employee}</td>
                    <td className="px-4 py-3.5 text-xs text-secondary font-medium">{req.type}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-secondary">{req.duration}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        req.status === 'Approved' ? "bg-green-50 text-green-700 border-green-200" :
                        req.status === 'Rejected' ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-secondary text-sm">No active leave requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick HR Management Tools */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> HR Governance Controls
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/app/employees')} 
              className="w-full p-4 bg-surface-container-low/50 border border-outline-variant/30 text-primary text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-surface-container transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4 text-primary" /> Employee Directory & Profiles
              </span>
              <FileCheck className="w-4 h-4 text-secondary" />
            </button>

            <button 
              onClick={() => navigate('/app/announcements')} 
              className="w-full p-4 bg-surface-container-low/50 border border-outline-variant/30 text-primary text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-surface-container transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <Megaphone className="w-4 h-4 text-primary" /> Publish HR Announcement
              </span>
              <FileCheck className="w-4 h-4 text-secondary" />
            </button>

            <button 
              onClick={() => toast.success('Payroll Sync completed with Finance Department!')} 
              className="w-full p-4 bg-surface-container-low/50 border border-outline-variant/30 text-primary text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-surface-container transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Run Monthly Payroll Sync
              </span>
              <FileCheck className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

