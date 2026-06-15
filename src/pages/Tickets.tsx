import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Tickets() {
  const [data, setData] = useState<any>({ counts: {}, items: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.supportTickets();
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

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Support Tickets</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Manage client issues and queries</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success("Create ticket modal opened")} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors">
            New Ticket
          </button>
          <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {['New', 'In Progress', 'Resolved', 'Escalated'].map(status => (
          <div key={status} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">{status}</p>
            <p className="text-3xl font-bold font-display text-primary">
              {status === 'New' ? data.counts?.new || 0 : 
               status === 'In Progress' ? data.counts?.inProgress || 0 :
               status === 'Resolved' ? data.counts?.resolved || 0 :
               data.counts?.escalated || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading tickets...</div>
        ) : data.items?.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Ticket</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Client</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {data.items?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-bold text-primary">{ticket.subject}</p>
                          <p className="text-[10px] text-secondary mt-0.5 line-clamp-1 max-w-xs">{ticket.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-primary">{ticket.clientEmail}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider",
                        ticket.status === 'Resolved' ? "bg-green-50 text-green-700" :
                        ticket.status === 'Escalated' ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      )}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => toast.success(`Viewing ticket ${ticket.id}...`)} className="px-3 py-1.5 border border-outline-variant text-primary text-xs font-bold rounded hover:bg-surface-container transition-colors">
                        View
                      </button>
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
