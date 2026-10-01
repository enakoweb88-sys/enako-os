import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Globe, Users, TrendingUp, DollarSign } from 'lucide-react';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

export function DigitalDashboard() {
  const [calendar, setCalendar] = useState<any>({ dailyCounts: [], summary: {} });
  const [social, setSocial] = useState<any[]>([]);
  const [ads, setAds] = useState<any>({ chartData: [] });
  const [website, setWebsite] = useState<any>({});
  const [tasks, setTasks] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.digitalCalendar().catch(() => ({ dailyCounts: [], summary: {} })),
      api.socialPerformance().catch(() => []),
      api.adSpendChart().catch(() => ({ chartData: [] })),
      api.websiteTraffic().catch(() => ({})),
      api.contentPipelineTasks().catch(() => ({}))
    ])
      .then(([cal, soc, adData, web, pipe]) => {
        setCalendar(cal);
        setSocial(soc);
        setAds(adData);
        setWebsite(web);
        setTasks(pipe);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Digital Hub...
      </div>
    );
  }

  const contentTypes = [
    { name: 'Reels / Short Video', value: 45 },
    { name: 'Flyers / Carousels', value: 30 },
    { name: 'Articles / Educational', value: 15 },
    { name: 'Customer Stories', value: 10 },
  ];
  const COLORS = ['#001f5b', '#1e3a8a', '#3b82f6', '#94a3b8'];

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Reference Screenshot Top Header Card */}
      <OrganizationHeaderCard />

      {/* Reference Screenshot 4 Top Stat Cards */}
      <WorkplaceStatCards
        domainsCount={website?.sessions ? fmt(website.sessions, false) : '24,500'}
        usersCount={calendar?.summary?.scheduled ?? 12}
        groupsCount={website?.roi || '340%'}
        licensesCount={website?.cpa || '1,250 FCFA'}
        card1Label="MONTHLY SESSIONS"
        card2Label="CONTENT IN PIPELINE"
        card3Label="CAMPAIGN ROI"
        card4Label="COST PER ACQUISITION"
        card1Icon={<Globe className="w-5 h-5" />}
        card2Icon={<Users className="w-5 h-5" />}
        card3Icon={<TrendingUp className="w-5 h-5" />}
        card4Icon={<DollarSign className="w-5 h-5" />}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Digital Marketing & Social Command
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Omnichannel content calendar, performance ad spend & financial promotions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app/content"
            className="px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
          >
            Create Content Post
          </Link>
          <button
            onClick={loadData}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold tracking-wide transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Financial Product Promotion Focus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Remittance & MoMo', tag: 'Mobile Money Promo', status: 'Active', desc: 'Promoting instant transfers across Cameroon & Diaspora.' },
          { title: 'B2B Payment Gateway', tag: 'Corporate', status: 'Merchant Lead', desc: 'Targeting corporate merchants for ENAKO automated invoice settlements.' },
          { title: 'High-Yield Savings', tag: 'Education', status: 'Weekly Reel', desc: 'Content on automated monthly savings and interest growth.' },
          { title: 'Land Banking', tag: 'Real Estate', status: 'High Intent', desc: 'Promoting verified real estate investment opportunities with secured titles.' },
        ].map((promo, idx) => (
          <div key={idx} className="p-5 bg-white border border-slate-200/90 rounded-lg shadow-2xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">{promo.tag}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">{promo.status}</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-900">{promo.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{promo.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Content Calendar & Pipeline */}
      <div className="grid grid-cols-12 gap-6">
        {/* Weekly Content Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs overflow-x-auto">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Weekly Content Schedule
            </h3>
            <Link to="/app/content" className="text-xs font-semibold text-[#001f5b] hover:underline">Full Calendar</Link>
          </div>

          <div className="flex gap-3 min-w-[580px]">
            {(calendar?.dailyCounts || []).map((day: any) => (
              <div key={day.day} className={`flex-1 border rounded-lg p-3 transition-all ${day.day === 'Wed' ? 'border-[#001f5b] bg-[#001f5b]/5' : 'border-slate-200 bg-slate-50/50'}`}>
                <p className="text-xs font-bold text-center uppercase tracking-wider text-slate-800 mb-2">{day.day}</p>
                <div className="space-y-2">
                  <div className="bg-white p-2 rounded border border-slate-200/80 text-center">
                    <p className="text-xs font-bold text-slate-900">{day.posts || 0}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Posts</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/80 text-center">
                    <p className="text-xs font-bold text-slate-900">{day.reels || 0}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Reels</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Pipeline Status */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Content Pipeline
          </h3>
          
          <div className="space-y-2 pt-1">
            {[
              { label: 'To Do', count: tasks?.todo ?? 0, color: 'border-slate-200 text-slate-700 bg-slate-50' },
              { label: 'In Progress', count: tasks?.inProgress ?? 0, color: 'border-slate-300 text-slate-800 bg-slate-50' },
              { label: 'For Review', count: tasks?.forReview ?? 0, color: 'border-amber-200 text-amber-800 bg-amber-50' },
              { label: 'Approved', count: tasks?.approved ?? 0, color: 'border-emerald-200 text-emerald-800 bg-emerald-50' },
              { label: 'Published', count: tasks?.published ?? 0, color: 'border-[#001f5b]/30 text-[#001f5b] bg-[#001f5b]/5' },
            ].map((stage) => (
              <div key={stage.label} className={cn("flex justify-between items-center px-3 py-2.5 rounded-lg border transition-all", stage.color)}>
                <span className="text-xs font-semibold">{stage.label}</span>
                <span className="font-mono font-bold text-xs">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ads Performance Dual Chart & Social Media Channels */}
      <div className="grid grid-cols-12 gap-6">
        {/* Ads Performance Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Paid Ad Campaigns: Spend vs Converted Leads
            </h3>
            <span className="text-xs text-slate-500">Meta & TikTok Ads</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ads.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="spend" name="Ad Spend (FCFA)" stroke="#001f5b" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="conversions" name="Converted Leads" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Types Pie Breakdown */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 w-full text-left mb-2">
            Content Format Mix
          </h3>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={contentTypes} innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                  {contentTypes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 w-full pt-3 border-t border-slate-100">
            {contentTypes.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media Channels Performance Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Social Media Accounts & Reach
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Social Channel</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Followers</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg. Engagement</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Impressions</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {social.map((s: any) => (
                <tr key={s.platform} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                    {s.platform}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono">{fmt(s.followers, false)}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900">{s.engagement}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono">{fmt(s.impressions, false)}</td>
                  <td className={`px-4 py-3 text-xs font-semibold text-right ${s.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className="flex items-center justify-end gap-1 font-mono">
                      +{s.growth}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
