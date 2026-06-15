import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { Users, UserCheck, CalendarOff, ClipboardList, Settings, CheckCircle2 } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  return (
    <div className="space-y-8 pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Staff', value: overview?.totalStaff || 142, icon: Users, color: 'text-blue-600' },
          { label: 'Present Today', value: overview?.presentToday || 128, icon: UserCheck, color: 'text-green-600' },
          { label: 'On Leave', value: overview?.onLeave || 14, icon: CalendarOff, color: 'text-orange-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-surface-container rounded-lg shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold font-mono text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Recent Leave Requests
            </h3>
            <Link to="/app/leaves" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View All Leaves</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Employee</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Duration</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {overview?.leaveRequests?.length > 0 ? overview.leaveRequests.map((req: any, i: number) => (
                  <tr key={i} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-sm font-bold text-primary">{req.employee}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{req.type}</td>
                    <td className="px-4 py-3 text-xs font-mono text-secondary">{req.duration}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700">Pending</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-secondary text-sm">No pending leave requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/app/employees')} className="w-full py-2.5 bg-surface-container-low text-primary text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Add New Employee
              </button>
              <button onClick={() => toast.success('Payroll verification initiated')} className="w-full py-2.5 bg-surface-container-low text-primary text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Run Payroll Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
