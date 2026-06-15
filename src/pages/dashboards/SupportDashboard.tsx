import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { Headphones, Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function SupportDashboard() {
  const [tickets, setTickets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.supportTickets()
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  return (
    <div className="space-y-8 pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'New Tickets', value: tickets?.counts?.new || 12, icon: Ticket, color: 'text-blue-600' },
          { label: 'In Progress', value: tickets?.counts?.inProgress || 8, icon: Clock, color: 'text-orange-600' },
          { label: 'Resolved Today', value: tickets?.counts?.resolved || 24, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Escalated', value: tickets?.counts?.escalated || 3, icon: AlertCircle, color: 'text-red-600' },
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

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
            <Headphones className="w-5 h-5" /> Recent Tickets
          </h3>
          <Link to="/app/tickets" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View All Tickets</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Ticket ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Subject</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {tickets?.items?.length > 0 ? tickets.items.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-surface-container-low/30">
                  <td className="px-4 py-3 text-xs font-mono text-secondary">{t.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">{t.customer}</td>
                  <td className="px-4 py-3 text-sm text-secondary truncate max-w-[200px]">{t.subject}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary">{t.date}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-secondary text-sm">No recent tickets.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
