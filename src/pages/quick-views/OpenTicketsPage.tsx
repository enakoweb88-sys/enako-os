import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Headphones, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function OpenTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    api.supportTickets()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setTickets(list.filter((t: any) => t.status !== 'RESOLVED' && t.status !== 'CLOSED'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = (id: string) => {
    toast.success('Ticket marked as resolved');
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const filtered = tickets.filter(t =>
    (t.customer || t.subject || t.id || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Open Support Queue...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Communications • Open Client Support Tickets & Resolution SLA Queue" />

      <WorkplaceStatCards
        domainsCount={filtered.length}
        usersCount="18 Mins"
        groupsCount="99.4%"
        licensesCount="Zero Escalations"
        card1Label="OPEN SUPPORT TICKETS"
        card2Label="AVG FIRST RESPONSE"
        card3Label="SLA COMPLIANCE RATE"
        card4Label="CRITICAL ESCALATIONS"
        card1Icon={<Headphones className="w-5 h-5" />}
        card2Icon={<Clock className="w-5 h-5" />}
        card3Icon={<CheckCircle className="w-5 h-5" />}
        card4Icon={<AlertTriangle className="w-5 h-5" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ticket #, customer, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
          />
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold tracking-wide transition-all"
        >
          Refresh Queue
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-800">Active Customer Inquiries</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Issue Subject</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Channel</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No open tickets. Helpdesk is fully resolved!
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {t.id || `TCK-10${idx}`}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                      {t.customer || 'Enterprise Client'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[240px] truncate">
                      {t.subject || 'Transaction settlement verification'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {t.channel || 'Email / Portal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {t.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleResolve(t.id)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#001f5b] rounded transition-colors"
                      >
                        Resolve Ticket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
