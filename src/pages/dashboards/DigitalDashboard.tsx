import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  CalendarDays, CheckSquare, ThumbsUp, BarChart2,
  Globe, LayoutTemplate, Activity, ArrowUpRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function fmt(val: string | number | null | undefined, currency = false) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', maximumFractionDigits: 0 });
  return n.toLocaleString();
}

export function DigitalDashboard() {
  const [calendar, setCalendar] = useState<any>(null);
  const [tasks, setTasks] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [social, setSocial] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [ads, setAds] = useState<any>(null);
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.contentCalendar(),
      api.contentTasks(),
      api.contentApprovals(),
      api.socialPerformance(),
      api.topPosts(),
      api.adsPerformance(),
      api.contentTypes(),
      api.websiteOverview()
    ])
      .then(([cal, t, app, soc, p, ad, type, web]) => {
        setCalendar(cal?.dailyCounts?.length ? cal : {
          summary: { scheduled: 12, inProgress: 8, pending: 5, overdue: 2 },
          dailyCounts: [
            { day: 'Mon', posts: 3, reels: 1 },
            { day: 'Tue', posts: 2, reels: 2 },
            { day: 'Wed', posts: 4, reels: 0 },
            { day: 'Thu', posts: 1, reels: 1 },
            { day: 'Fri', posts: 5, reels: 2 },
            { day: 'Sat', posts: 2, reels: 1 },
            { day: 'Sun', posts: 1, reels: 0 },
          ]
        });
        setTasks(t?.todo ? t : { todo: 14, inProgress: 8, forReview: 5, approved: 12, published: 45, rejected: 3 });
        setApprovals(app.length ? app : [
          { id: 1, title: 'Summer Campaign Reel', platform: 'Instagram', status: 'Pending', author: 'Jane D.' },
          { id: 2, title: 'Feature Update Thread', platform: 'Twitter', status: 'Approved', author: 'Mark T.' },
        ]);
        setSocial(soc.length ? soc : [
          { platform: 'Facebook', followers: 45200, engagement: '4.2%', impressions: 125000, growth: 5.2 },
          { platform: 'Instagram', followers: 32100, engagement: '6.8%', impressions: 98000, growth: 8.4 },
          { platform: 'TikTok', followers: 15400, engagement: '12.4%', impressions: 250000, growth: 15.2 },
          { platform: 'Twitter', followers: 12500, engagement: '3.1%', impressions: 45000, growth: 1.2 },
        ]);
        setPosts(p.length ? p : [
          { id: 1, title: 'How to use ENAKO OS', platform: 'Facebook', date: '2026-06-10', reach: 15400, engagement: 1200 },
          { id: 2, title: 'New Feature Alert', platform: 'Instagram', date: '2026-06-09', reach: 12100, engagement: 1500 },
        ]);
        setAds(ad?.chartData?.length ? ad : {
          chartData: [
            { date: '1 Jun', spend: 50000, conversions: 12 },
            { date: '2 Jun', spend: 60000, conversions: 15 },
            { date: '3 Jun', spend: 45000, conversions: 10 },
            { date: '4 Jun', spend: 75000, conversions: 22 },
            { date: '5 Jun', spend: 55000, conversions: 14 },
            { date: '6 Jun', spend: 80000, conversions: 28 },
          ]
        });
        setContentTypes(type.length ? type : [
          { name: 'Image Posts', value: 45 },
          { name: 'Reels', value: 25 },
          { name: 'Videos', value: 15 },
          { name: 'Stories', value: 10 },
          { name: 'Others', value: 5 }
        ]);
        setWebsite(web?.sessions ? web : {
          sessions: 45200, users: 38100, pageViews: 125000, bounceRate: 42.5
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#64748b'];

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Scheduled Content', value: calendar.summary.scheduled, icon: CalendarDays, color: 'text-blue-600' },
          { label: 'In Progress Tasks', value: tasks.inProgress, icon: CheckSquare, color: 'text-orange-600' },
          { label: 'Pending Approvals', value: tasks.forReview, icon: ThumbsUp, color: 'text-purple-600' },
          { label: 'Website Sessions', value: fmt(website.sessions), icon: Globe, color: 'text-green-600' },
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
            <p className="text-2xl font-bold font-mono text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Content Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Weekly Content Calendar
            </h3>
            <Link to="/app/content" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View Calendar</Link>
          </div>
          <div className="flex gap-2 min-w-[600px]">
            {calendar.dailyCounts.map((day: any) => (
              <div key={day.day} className={`flex-1 border rounded-xl p-3 ${day.day === 'Wed' ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/30 bg-surface-container-low'}`}>
                <p className="text-[11px] font-bold text-center uppercase tracking-widest text-primary mb-3">{day.day}</p>
                <div className="space-y-2">
                  <div className="bg-white p-2 rounded border border-outline-variant/20 shadow-sm text-center">
                    <p className="text-sm font-bold text-primary">{day.posts}</p>
                    <p className="text-[9px] text-secondary uppercase tracking-wider">Posts</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-outline-variant/20 shadow-sm text-center">
                    <p className="text-sm font-bold text-primary">{day.reels}</p>
                    <p className="text-[9px] text-secondary uppercase tracking-wider">Reels</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Tasks & Pipeline */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5" /> Content Pipeline
          </h3>
          <div className="space-y-3">
            {[
              { label: 'To Do', count: tasks.todo, color: 'border-slate-200 text-slate-700' },
              { label: 'In Progress', count: tasks.inProgress, color: 'border-blue-200 text-blue-700 bg-blue-50' },
              { label: 'For Review', count: tasks.forReview, color: 'border-purple-200 text-purple-700 bg-purple-50' },
              { label: 'Approved', count: tasks.approved, color: 'border-green-200 text-green-700 bg-green-50' },
              { label: 'Published', count: tasks.published, color: 'border-primary/20 text-primary bg-primary-fixed' },
            ].map((stage, i, arr) => (
              <div key={stage.label} className="flex items-center gap-3">
                <div className={`flex-1 flex justify-between items-center p-3 rounded-lg border ${stage.color}`}>
                  <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                  <span className="font-mono font-bold">{stage.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ads Performance (Dual Axis) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5" /> Ads Performance
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ads.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="spend" name="Spend (FCFA)" stroke="#dc2626" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke="#16a34a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Types Donut */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center">
          <h3 className="font-display text-lg font-bold text-primary w-full text-left mb-2 flex items-center gap-2">
            <PieChart className="w-5 h-5" /> Content by Type
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={contentTypes} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {contentTypes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {contentTypes.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Performance */}
        <div className="col-span-12 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Activity className="w-5 h-5" /> Social Media Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Platform</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Followers</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Engagement Rate</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Impressions</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {social.map((s: any) => (
                  <tr key={s.platform} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-sm font-bold text-primary">{s.platform}</td>
                    <td className="px-4 py-3 text-sm text-secondary font-mono">{fmt(s.followers, false)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">{s.engagement}</td>
                    <td className="px-4 py-3 text-sm text-secondary font-mono">{fmt(s.impressions, false)}</td>
                    <td className={`px-4 py-3 text-xs font-bold text-right ${s.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {s.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : null}
                        {s.growth}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
