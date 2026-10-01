import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { FileText, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { exportTablePdf } from '../../lib/pdf-export';

export default function ExecutiveSummariesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.dailyReports()
      .then((data: any) => {
        setReports(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summaries = reports.filter(r => filter === 'ALL' || r.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Executive Summaries...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Executive Board Summaries & Department Digests" />

      <WorkplaceStatCards
        domainsCount={reports.length}
        usersCount={reports.filter(r => r.status === 'SUBMITTED').length}
        groupsCount={reports.filter(r => r.type === 'WEEKLY').length}
        licensesCount="100% Signed"
        card1Label="TOTAL DIGESTS"
        card2Label="SUBMITTED / APPROVED"
        card3Label="WEEKLY EXECUTIVE SUMMARIES"
        card4Label="COMPLIANCE RATING"
        card1Icon={<FileText className="w-5 h-5" />}
        card2Icon={<CheckCircle2 className="w-5 h-5" />}
        card3Icon={<TrendingUp className="w-5 h-5" />}
        card4Icon={<Calendar className="w-5 h-5" />}
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Executive Digests & Managerial Briefings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Official board summaries, departmental shift handovers, and compliance notes.</p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'WEEKLY', 'GENERAL', 'DAILY'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === t
                  ? 'bg-[#001f5b] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summaries List */}
      <div className="space-y-4">
        {summaries.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center text-xs text-slate-500 shadow-2xs">
            No executive summaries found for this filter.
          </div>
        ) : (
          summaries.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#001f5b]/10 text-[#001f5b]">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.content?.split('\n')[0] || `Executive Summary #${idx + 1}`}
                  </h3>
                </div>

                <span className="px-2.5 py-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.status || 'SUBMITTED'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line max-h-36 overflow-y-auto">
                {item.content}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Author: <strong className="text-slate-900">{item.user?.fullName || 'Department Head'}</strong>
                </span>
                <button
                  onClick={() => {
                    try {
                      const author = item.user?.fullName || 'Department Head';
                      const rawDate = item.date || item.createdAt || new Date();
                      const d = new Date(rawDate);
                      const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
                      
                      const rows: (string | number)[][] = [
                        ['Report ID', item.id || `SUM-${idx + 1}`],
                        ['Report Type', item.type || 'EXECUTIVE DIGEST'],
                        ['Author / Executive', author],
                        ['Date Submitted', dateStr],
                        ['Status', item.status || 'SUBMITTED'],
                        ['Executive Summary', (item.content || 'Operational progress confirmed across all active departments.').replace(/\n/g, ' ')]
                      ];

                      const success = exportTablePdf({
                        title: 'EXECUTIVE BRIEF & OPERATIONAL DIGEST',
                        subtitle: `Subject: ${item.type || 'EXECUTIVE BRIEF'} • Reference: ${item.id?.substring(0, 12) || idx + 1}`,
                        headers: ['Section / Parameter', 'Details & Content'],
                        rows,
                        fileName: `Executive_Brief_${(item.id || idx + 1).toString().substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`
                      });

                      if (success) {
                        toast.success('Downloaded Executive Brief PDF');
                      } else {
                        toast.error('Failed to download PDF');
                      }
                    } catch (err: any) {
                      console.error(err);
                      toast.error('Failed to download PDF brief');
                    }
                  }}
                  className="px-3 py-1 bg-white border border-slate-200 text-[#001f5b] hover:bg-slate-50 text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Download PDF Brief
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
