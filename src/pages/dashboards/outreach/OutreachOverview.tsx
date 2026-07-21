import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, PenTool, FileText, Users, Heart } from 'lucide-react';
import { outreachAPI } from '../../../lib/api';
import { TasksWidget } from '../../../components/TasksWidget';

export default function OutreachOverview() {
  const [statsData, setStatsData] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          outreachAPI.getStats(),
          outreachAPI.getDonations()
        ]);
        setStatsData(statsRes);
        setDonations(donationsRes);
      } catch (err) {
        console.error('Failed to fetch outreach data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Active Events', value: statsData?.activeEvents || 0, icon: Globe },
    { label: 'Pending Applications', value: statsData?.pendingApplications || 0, icon: FileText },
    { label: 'Total Donations (XAF)', value: (statsData?.totalDonations || 0).toLocaleString(), icon: Heart },
    { label: 'Total Donors', value: statsData?.donationCount || 0, icon: Users },
  ];

  if (loading) {
    return <div className="p-6 text-slate-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-8 pb-20 p-6">
      <h2 className="text-2xl font-bold font-display text-primary">Outreach Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-surface-container rounded-lg shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksWidget limit={5} />

        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/30 flex-shrink-0">
            <h3 className="font-bold text-lg text-primary">Recent Donations</h3>
          </div>
          <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="bg-surface-container/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Donor</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Sector</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Method</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-secondary text-sm">No donations found.</td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-5 py-4 text-sm text-primary">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm font-bold text-primary">{d.fullName} <br/><span className="text-xs font-normal text-secondary">{d.email}</span></td>
                    <td className="px-5 py-4 text-sm font-bold text-green-600">{Number(d.amount).toLocaleString()} XAF</td>
                    <td className="px-5 py-4 text-sm text-secondary uppercase text-[10px] tracking-widest">{d.sector.replace(/-/g, ' ')}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{d.method}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
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
