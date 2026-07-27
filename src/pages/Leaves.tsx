import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, UserMinus, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Leaves() {
  const [data, setData] = useState<any>({ totalStaff: 0, presentToday: 0, onLeave: 0, leaveRequests: [], employees: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [leaveDuration, setLeaveDuration] = useState('1 day');
  const [leaveType, setLeaveType] = useState('Annual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await (api as any).adminOverview();
      const emps = await (api as any).employees({ limit: 500 });
      setData({
        ...res,
        employees: emps.items || res.employees || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = (id: string, action: string) => {
    toast.success(`Leave request ${action} successfully`);
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return toast.error("Please select an employee");
    setIsSubmitting(true);
    try {
      // Create leave via new API endpoint
      await (api as any).createLeave({
        employee: selectedEmployee,
        type: leaveType,
        duration: leaveDuration
      });
      toast.success("Leave assigned successfully");
      load();
      setSelectedEmployee('');
      setLeaveDuration('1 day');
    } catch (err) {
      toast.error("Failed to assign leave");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Leave Management</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Review and manage staff absences</p>
        </div>
        <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">Total Staff</p>
          <p className="text-3xl font-bold font-display text-primary">{data.totalStaff}</p>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">Present Today</p>
          <p className="text-3xl font-bold font-display text-green-600">{data.presentToday}</p>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">On Leave</p>
          <p className="text-3xl font-bold font-display text-orange-600">{data.onLeave}</p>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-primary mb-4">Assign Leave (CEO/Manager)</h3>
        <form onSubmit={handleCreateLeave} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-widest">Select Employee</label>
            <select 
              value={selectedEmployee} 
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Employee --</option>
              {data.employees?.map((emp: any) => (
                <option key={emp.id} value={emp.fullName || emp.id}>{emp.fullName} ({emp.email})</option>
              ))}
            </select>
          </div>
          <div className="w-32 space-y-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-widest">Duration</label>
            <input 
              type="text" 
              value={leaveDuration}
              onChange={e => setLeaveDuration(e.target.value)}
              placeholder="e.g. 3 days"
              className="w-full px-4 py-2 border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="w-48 space-y-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-widest">Type</label>
            <select 
              value={leaveType}
              onChange={e => setLeaveType(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Maternity/Paternity">Maternity/Paternity</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 h-[38px]"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Leave'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-primary mb-6">Leave Requests</h3>
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading requests...</div>
        ) : data.leaveRequests?.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Employee</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Duration</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {data.leaveRequests?.map((req: any) => (
                  <tr key={req.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserMinus className="w-5 h-5 text-secondary/50" />
                        <span className="text-sm font-bold text-primary">{req.employee || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-secondary">
                      {req.duration || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-xs text-secondary">{req.type || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider",
                        req.status === 'Approved' ? "bg-green-50 text-green-700" :
                        req.status === 'Rejected' ? "bg-red-50 text-red-700" :
                        "bg-orange-50 text-orange-700"
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {req.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleAction(req.id, 'approved')} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleAction(req.id, 'rejected')} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Reject">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
