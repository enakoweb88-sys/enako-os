import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  CalendarDays, CheckSquare, ThumbsUp, BarChart2,
  Globe, LayoutTemplate, Activity, ArrowUpRight, PieChart as PieChartIcon,
  TrendingUp, Target, Megaphone, Share2, RefreshCw, DollarSign, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

function fmt(val: string | number | null | undefined, currency = false) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
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

  const loadData = () => {
    setLoading(true);
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
        setCalendar(cal || { summary: { scheduled: 0, inProgress: 0, pending: 0, overdue: 0 }, dailyCounts: [] });
        setTasks(t || { todo: 0, inProgress: 0, forReview: 0, approved: 0, published: 0, rejected: 0 });
        setApprovals(app || []);
        setSocial(soc || []);
        setPosts(p || []);
        setAds(ad || { chartData: [] });
        setContentTypes(type || []);
        setWebsite(web || { sessions: 0, users: 0, pageViews: 0, bounceRate: '24.2%', cpa: '1,420 FCFA', roi: '342%' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse p-8">Loading Digital Marketing Command Center…</div>;

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-primary">Digital Marketing & Growth Hub</h3>
            <p className="text-xs text-secondary font-medium">Social Media, Ad Campaigns, SEO Traffic, and Financial Product Promotions.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/app/content" className="px-5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all">
            <Sparkles className="w-4 h-4" /> Create Content Post
          </Link>
          <button onClick={loadData} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Marketing KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Campaign ROI', value: website.roi || '342%', sub: 'Target: >300%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cost Per Acquisition (CPA)', value: website.cpa || '1,420 FCFA', sub: 'Per converted lead', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Monthly Website Traffic', value: fmt(website.sessions), sub: `${website.pageViews} Pageviews`, icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Content In Pipeline', value: calendar.summary?.scheduled || 12, sub: `${tasks.forReview || 2} Pending Approval`, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.label}</span>
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-secondary font-medium">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Financial Product Promotion Focus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Remittance & MoMo', tag: 'Active Ad Campaign', status: 'High Engagement', desc: 'Promoting MTN & Orange Money instant transfers across Cameroon & Diaspora.' },
          { title: 'B2B Payment Gateway', tag: 'LinkedIn / Meta', status: 'Merchant Lead Gen', desc: 'Targeting corporate merchants for ENAKO automated invoice settlements.' },
          { title: 'High-Yield Savings', tag: 'Educational Reels', status: 'TikTok Viral', desc: 'Financial literacy content on automated monthly savings and interest growth.' },
          { title: 'Land Banking & Land', tag: 'Investment Promo', status: 'High Converting', desc: 'Promoting verified real estate investment opportunities with guaranteed returns.' },
        ].map((promo, idx) => (
          <div key={idx} className="p-5 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold uppercase tracking-wider">{promo.tag}</span>
              <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{promo.status}</span>
            </div>
            <h4 className="text-sm font-bold text-primary">{promo.title}</h4>
            <p className="text-xs text-secondary leading-relaxed">{promo.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Content Calendar & Pipeline */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Weekly Content Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Weekly Content Schedule & Multi-Channel Posts
            </h3>
            <Link to="/app/content" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">Full Calendar</Link>
          </div>

          <div className="flex gap-3 min-w-[640px]">
            {calendar.dailyCounts.map((day: any) => (
              <div key={day.day} className={`flex-1 border rounded-2xl p-4 transition-all ${day.day === 'Wed' ? 'border-primary bg-primary-fixed/30 shadow-xs' : 'border-outline-variant/30 bg-surface-container-low/40'}`}>
                <p className="text-xs font-bold text-center uppercase tracking-widest text-primary mb-3">{day.day}</p>
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-outline-variant/20 shadow-xs text-center">
                    <p className="text-sm font-bold text-primary">{day.posts}</p>
                    <p className="text-[9px] text-secondary uppercase tracking-wider font-bold">Posts</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-outline-variant/20 shadow-xs text-center">
                    <p className="text-sm font-bold text-primary">{day.reels}</p>
                    <p className="text-[9px] text-secondary uppercase tracking-wider font-bold">Reels</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Pipeline Status */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" /> Content Pipeline
          </h3>
          
          <div className="space-y-3">
            {[
              { label: 'To Do', count: tasks.todo || 4, color: 'border-slate-200 text-slate-700' },
              { label: 'In Progress', count: tasks.inProgress || 6, color: 'border-blue-200 text-blue-700 bg-blue-50' },
              { label: 'For Review', count: tasks.forReview || 3, color: 'border-purple-200 text-purple-700 bg-purple-50' },
              { label: 'Approved', count: tasks.approved || 8, color: 'border-green-200 text-green-700 bg-green-50' },
              { label: 'Published', count: tasks.published || 24, color: 'border-primary/20 text-primary bg-primary-fixed' },
            ].map((stage) => (
              <div key={stage.label} className={cn("flex justify-between items-center p-3.5 rounded-2xl border transition-all", stage.color)}>
                <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                <span className="font-mono font-bold text-sm">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ads Performance Dual Chart & Social Media Channels */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Ads Performance Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Paid Ad Campaigns: Spend vs Converted Leads
            </h3>
            <span className="text-xs text-secondary font-medium">Meta & TikTok Ads</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ads.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="spend" name="Ad Spend (FCFA)" stroke="#dc2626" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="conversions" name="Converted Leads" stroke="#16a34a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Types Pie Breakdown */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-between">
          <h3 className="font-display text-xl font-bold text-primary w-full text-left flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" /> Content Format Mix
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={contentTypes} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                  {contentTypes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 w-full pt-4 border-t border-outline-variant/20">
            {contentTypes.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media Channels Performance Table */}
      <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Social Media Accounts & Reach (Facebook, IG, TikTok, LinkedIn, X)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Social Channel</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Total Followers</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Avg. Engagement</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Monthly Impressions</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {social.map((s: any) => (
                <tr key={s.platform} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-bold text-primary flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary shrink-0" />
                    {s.platform}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-secondary font-mono">{fmt(s.followers, false)}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-primary">{s.engagement}</td>
                  <td className="px-4 py-3.5 text-sm text-secondary font-mono">{fmt(s.impressions, false)}</td>
                  <td className={`px-4 py-3.5 text-xs font-bold text-right ${s.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center justify-end gap-1 font-mono">
                      {s.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
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

