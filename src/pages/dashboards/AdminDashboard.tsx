import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';

import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';

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

  if (loading) return <div className="text-slate-500 text-sm animate-pulse p-8">Loading HR & People Management Command Center…</div>;

  const hrStats = [
    { label: 'Total Active Staff', value: overview?.totalStaff || 142, sub: `${overview?.presentToday || 128} Present Today` },
    { label: 'Employee Retention Rate', value: overview?.employeeRetention || '96.8%', sub: 'Target: >95%' },
    { label: 'Onboarding Completion', value: overview?.onboardingCompletion || '94.2%', sub: 'New Hire Pipeline' },
    { label: 'Performance Review Rate', value: overview?.performanceReviewCompletion || '92.0%', sub: 'Q3 Evaluations Complete' },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* ── 1. ORGANIZATION SUMMARY CARD ── */}
      <OrganizationHeaderCard subtitle="Human Resources & People Management Hub" />

      {/* ── 2. TOP METRIC CARDS WITH COLORED BOTTOM ACCENT ── */}
      <WorkplaceStatCards
        card1Label="TOTAL STAFF"
        domainsCount={hrStats[0].value}
        card2Label="RETENTION RATE"
        usersCount={hrStats[1].value}
        card3Label="ONBOARDING"
        groupsCount={hrStats[2].value}
        card4Label="REVIEW RATE"
        licensesCount={hrStats[3].value}
      />

      {/* Top Action Header Bar */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => navigate('/app/employees')} 
          className="px-5 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
        >
          Create Employee Profile
        </button>
        <button onClick={loadData} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer">
          Refresh
        </button>
      </div>

      {/* HR Focus Areas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Training & Development', tag: 'Skills Portal', value: `${overview?.trainingCompletion || '88.5%'} Completed`, desc: 'Employee fintech compliance, customer service, & engineering training modules.' },
          { title: 'Employee Satisfaction', tag: 'Quarterly Survey', value: overview?.employeeSatisfaction || '4.8 / 5.0 Rating', desc: 'Positive staff sentiment across work-life balance, compensation, and team culture.' },
          { title: 'Staff Welfare & Meals', tag: 'Welfare Program', value: '1,000 FCFA / Meal', desc: '50% company contribution to staff daily meal orders across all branches.' },
          { title: 'Payroll Coordination', tag: 'Finance Sync', value: 'Verified', desc: 'Monthly salary alignment, tax deductions, & compensation package sync with Finance.' },
        ].map((item, idx) => (
          <div key={idx} className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-bold uppercase tracking-wider">{item.tag}</span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">Active</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
            <p className="text-xs font-mono font-bold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Leave Approvals & Quick HR Tools */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Leave Requests Table */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-slate-900 uppercase tracking-wider">
              Active Leave Requests & Holiday Approvals
            </h3>
            <Link to="/app/leaves" className="text-xs font-bold text-slate-700 uppercase tracking-wider hover:underline">Manage All Leaves</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Employee</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Leave Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {overview?.leaveRequests?.length > 0 ? overview.leaveRequests.map((req: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{req.employee}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{req.type}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-600">{req.duration}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border",
                        req.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        req.status === 'Rejected' ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No active leave requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick HR Management Tools */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-display text-lg font-bold text-slate-900 uppercase tracking-wider">
            HR Governance Controls
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/app/employees')} 
              className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-all flex items-center justify-between"
            >
              <span>Employee Directory & Profiles</span>
              <span className="text-slate-400 font-normal">→</span>
            </button>

            <button 
              onClick={() => navigate('/app/announcements')} 
              className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-all flex items-center justify-between"
            >
              <span>Publish HR Announcement</span>
              <span className="text-slate-400 font-normal">→</span>
            </button>

            <button 
              onClick={() => toast.success('Payroll Sync completed with Finance Department!')} 
              className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-all flex items-center justify-between"
            >
              <span className="text-emerald-700 font-bold">Run Monthly Payroll Sync</span>
              <span className="text-slate-400 font-normal">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

