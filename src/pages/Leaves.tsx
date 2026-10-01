import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth';

export default function Leaves() {
  const { user } = useAuth();
  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const isCeo = role === 'ceo';

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
    if (isCeo && !selectedEmployee) return toast.error("Please select an employee");
    setIsSubmitting(true);
    try {
      await (api as any).createLeave({
        employee: selectedEmployee || user?.fullName || 'Current User',
        type: leaveType,
        duration: leaveDuration
      });
      toast.success(isCeo ? "Leave assigned successfully" : "Leave requested successfully");
      load();
      if (isCeo) setSelectedEmployee('');
      setLeaveDuration('1 day');
    } catch (err) {
      toast.error("Failed to assign leave");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requests = data.leaveRequests || [];
  const pendingRequests = requests.filter((r: any) => r.status === 'Pending' || !r.status);
  const totalStaff = data.totalStaff || data.employees?.length || 0;
  const onLeave = data.onLeave || 0;
  const presentToday = Math.max(0, totalStaff - onLeave);

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Top Header & Breadcrumb (No Icons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Human Resources</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Leaves</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review staff attendance, manage holiday schedules, and approve leave requests.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={load}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── TOP METRIC CARDS WITH COLORED BOTTOM ACCENT (Matching Main Dashboard, No Icons) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Red Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TOTAL STAFF</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{totalStaff}</p>
        </div>

        {/* Card 2: Green Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">PRESENT TODAY</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{presentToday}</p>
        </div>

        {/* Card 3: Oxford Navy #001f5b Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">ON LEAVE</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{onLeave}</p>
        </div>

        {/* Card 4: Amber Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">PENDING REQUESTS</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{pendingRequests.length}</p>
        </div>
      </div>

      {/* Leave Application / Assignment Card */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-2xs">
        <div className="mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {isCeo ? 'Assign Staff Leave' : 'Submit Leave Request'}
          </h2>
        </div>

        <form onSubmit={handleCreateLeave} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {isCeo && (
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Select Operative *</label>
              <select 
                value={selectedEmployee} 
                onChange={e => setSelectedEmployee(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200/90 rounded-lg text-xs bg-slate-50/70 focus:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
                required
              >
                <option value="">-- Choose Employee --</option>
                {data.employees?.map((emp: any) => (
                  <option key={emp.id} value={emp.fullName || emp.id}>
                    {emp.fullName} ({emp.department || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={cn("space-y-1.5", isCeo ? "sm:col-span-3" : "sm:col-span-5")}>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Duration / Period *</label>
            <input 
              type="text" 
              value={leaveDuration}
              onChange={e => setLeaveDuration(e.target.value)}
              placeholder="e.g. 3 days, 1 week"
              className="w-full px-3.5 py-2.5 border border-slate-200/90 rounded-lg text-xs bg-slate-50/70 focus:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
              required
            />
          </div>

          <div className={cn("space-y-1.5", isCeo ? "sm:col-span-3" : "sm:col-span-4")}>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Leave Category *</label>
            <select 
              value={leaveType}
              onChange={e => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200/90 rounded-lg text-xs bg-slate-50/70 focus:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#001f5b] font-medium"
            >
              <option value="Annual">Annual Paid Leave</option>
              <option value="Sick">Sick / Medical Leave</option>
              <option value="Maternity/Paternity">Maternity / Paternity</option>
              <option value="Compassionate">Compassionate Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className={cn(isCeo ? "sm:col-span-2" : "sm:col-span-3")}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {isSubmitting ? (isCeo ? 'Assigning...' : 'Submitting...') : (isCeo ? 'Assign Leave' : 'Submit Request')}
            </button>
          </div>
        </form>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Leave Records & Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">Staff scheduled absences and leave approvals</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {requests.length} total entries
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">Loading leave records...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No leave requests or absences recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Employee</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Leave Type</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.employee || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-500 font-medium">Operative</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {req.duration || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        {req.type || 'Annual'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-block",
                        req.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        req.status === 'Rejected' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {req.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(req.status === 'Pending' || !req.status) && isCeo ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(req.id, 'approved')} 
                            className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition-colors shadow-2xs"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'rejected')} 
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer transition-colors shadow-2xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Logged</span>
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
