import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Headphones, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function SupportDashboard() {
  const [tickets, setTickets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.supportTickets()
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Support Hub...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Reference Screenshot Top Header Card */}
      <OrganizationHeaderCard />

      {/* Reference Screenshot 4 Top Stat Cards */}
      <WorkplaceStatCards
        domainsCount={tickets?.counts?.new || 12}
        usersCount={tickets?.counts?.inProgress || 8}
        groupsCount={tickets?.counts?.resolved || 24}
        licensesCount={tickets?.counts?.escalated || 3}
        card1Label="NEW TICKETS"
        card2Label="IN PROGRESS"
        card3Label="RESOLVED TODAY"
        card4Label="ESCALATED (L2)"
        card1Icon={<Headphones className="w-5 h-5" />}
        card2Icon={<Clock className="w-5 h-5" />}
        card3Icon={<CheckCircle2 className="w-5 h-5" />}
        card4Icon={<AlertTriangle className="w-5 h-5" />}
      />

      {/* Action / Context Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Support Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time client tickets, response escalations, and resolution SLA tracking.
          </p>
        </div>
        <Link
          to="/app/tickets"
          className="px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
        >
          Open Ticket Queue
        </Link>
      </div>

      {/* Recent Tickets Table in Zoho Workplace card style */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Recent Support Inquiries
          </h3>
          <Link to="/app/tickets" className="text-xs font-semibold text-[#001f5b] hover:underline cursor-pointer">
            View All Tickets
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets?.items?.length > 0 ? (
                tickets.items.map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{t.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[240px]">{t.subject}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">No active tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
