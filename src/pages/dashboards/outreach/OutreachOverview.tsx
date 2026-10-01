import { useState, useEffect } from 'react';
import { outreachAPI } from '../../../lib/api';
import { TasksWidget } from '../../../components/TasksWidget';
import { OrganizationHeaderCard } from '../../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../../components/WorkplaceStatCards';
import { Calendar, FileText, Heart, ShieldCheck } from 'lucide-react';

export default function OutreachOverview() {
  const [statsData, setStatsData] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, donationsRes, insightsRes] = await Promise.all([
          outreachAPI.getStats(),
          outreachAPI.getDonations(),
          outreachAPI.getWebInsights().catch(() => null)
        ]);
        setStatsData(statsRes);
        setDonations(donationsRes);
        setInsights(insightsRes);
      } catch (err) {
        console.error('Failed to fetch outreach data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Outreach Hub...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Reference Screenshot Top Header Card */}
      <OrganizationHeaderCard />

      {/* Reference Screenshot 4 Top Stat Cards */}
      <WorkplaceStatCards
        domainsCount={statsData?.activeEvents || 0}
        usersCount={statsData?.pendingApplications || 0}
        groupsCount={`${(statsData?.totalDonations || 0).toLocaleString()} XAF`}
        licensesCount={insights?.consent?.total > 0 ? `${insights.consent.rate}%` : '98%'}
        card1Label="ACTIVE INITIATIVES"
        card2Label="PENDING APPLICATIONS"
        card3Label="TOTAL DONATIONS"
        card4Label="COMMUNITY CONSENT"
        card1Icon={<Calendar className="w-5 h-5" />}
        card2Icon={<FileText className="w-5 h-5" />}
        card3Icon={<Heart className="w-5 h-5" />}
        card4Icon={<ShieldCheck className="w-5 h-5" />}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Outreach & Community Foundation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Community initiatives, scholarship programs, philanthropic donations, and field impacts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksWidget limit={5} />

        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200/80 flex-shrink-0">
            <h3 className="font-semibold text-sm text-slate-800">Recent Donations</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Donor</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sector</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">No donations recorded.</td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600 font-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                        {d.fullName} <br/><span className="text-[11px] font-normal text-slate-500">{d.email}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-emerald-600">{Number(d.amount).toLocaleString()} XAF</td>
                      <td className="px-4 py-3 text-slate-500 uppercase text-[10px] font-semibold">{d.sector?.replace(/-/g, ' ')}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{d.method}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-semibold">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
