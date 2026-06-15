import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, UserMinus, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Leaves() {
  const [data, setData] = useState<any>({ totalStaff: 0, presentToday: 0, onLeave: 0, leaveRequests: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminOverview();
      setData(res);
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
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Dates</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Reason</th>
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
                        <span className="text-sm font-bold text-primary">Employee #{req.userId.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-secondary">
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-xs text-secondary">{req.reason}</td>
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
