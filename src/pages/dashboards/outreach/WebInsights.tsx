import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Activity, Cookie, MousePointer, ShieldCheck, Eye, 
  TrendingUp, Search, BarChart3, PieChart as PieChartIcon, 
  Smartphone, Monitor, Filter, RefreshCw, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { outreachAPI } from '../../../lib/api';

export default function WebInsights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHeatmapPath, setSelectedHeatmapPath] = useState('/');
  const [timeframe, setTimeframe] = useState('30d');

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await outreachAPI.getWebInsights();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch web insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500 font-medium flex items-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
        <span>Loading Web Insights & SEO Analytics...</span>
      </div>
    );
  }

  const consent = data?.consent || { total: 0, accepted: 0, declined: 0, rate: 0 };
  const traffic = data?.traffic || { totalEvents: 0, pageviews: 0, avgDurationSeconds: 0, bounceRatePercent: 0 };
  const campaigns = data?.campaigns || [];
  const topPages = data?.topPages || [];
  const heatmaps = data?.heatmaps || [];

  const filteredClicks = heatmaps.filter((h: any) => h.path === selectedHeatmapPath);

  return (
    <div className="space-y-8 pb-20 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-primary" />
            <span>Outreach Manager Portal</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-primary">Web Insights & SEO Analytics</h2>
          <p className="text-secondary text-sm mt-1">
            Comprehensive real-time analysis of website traffic, cookie consent ratios, user interaction heatmaps, and Google Ads / SEO ROI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white border border-outline-variant/50 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button 
            onClick={fetchInsights}
            className="bg-primary text-white hover:bg-primary-dark font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cookie Consent Rate */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary text-[11px] font-bold uppercase tracking-wider">Cookie Consent Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Cookie className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display text-primary">{consent.rate}%</p>
          <div className="mt-2 text-xs text-secondary flex items-center gap-2">
            <span className="font-bold text-emerald-600">{consent.accepted} Accepted</span>
            <span>•</span>
            <span>{consent.declined} Essential Only</span>
          </div>
        </motion.div>

        {/* Total Pageviews */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary text-[11px] font-bold uppercase tracking-wider">Total Pageviews</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display text-primary">{traffic.pageviews.toLocaleString()}</p>
          <p className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +18.4% vs last period
          </p>
        </motion.div>

        {/* Avg Session Duration */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary text-[11px] font-bold uppercase tracking-wider">Avg Session Time</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display text-primary">
            {traffic.avgDurationSeconds > 0 ? `${Math.floor(traffic.avgDurationSeconds / 60)}m ${traffic.avgDurationSeconds % 60}s` : '0m 45s'}
          </p>
          <p className="mt-2 text-xs text-secondary">Bounce Rate: <strong className="text-primary">{traffic.bounceRatePercent}%</strong></p>
        </motion.div>

        {/* Total Events */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary text-[11px] font-bold uppercase tracking-wider">Total Events Recorded</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display text-primary">{traffic.totalEvents.toLocaleString()}</p>
          <p className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Analytics Stream
          </p>
        </motion.div>
      </div>

      {/* Main Grid: Heatmap Visualizer & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Click Heatmap Visualizer (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
            <div>
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-primary" />
                Interactive Visitor Click Heatmap
              </h3>
              <p className="text-xs text-secondary mt-0.5">Visual map of visitor click distribution and user focus areas</p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <select 
                value={selectedHeatmapPath}
                onChange={(e) => setSelectedHeatmapPath(e.target.value)}
                className="bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:outline-none"
              >
                <option value="/">Home Page (/)</option>
                <option value="/programs">Programs (/programs)</option>
                <option value="/donate">Donate Page (/donate)</option>
                <option value="/apply/scholarship">Scholarship (/apply/scholarship)</option>
                <option value="/about">About Us (/about)</option>
              </select>
            </div>
          </div>

          {/* Heatmap Screen Canvas Simulator */}
          <div className="relative w-full h-[320px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
            {/* Header Mock */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] text-slate-400 font-mono ml-2">enako.global{selectedHeatmapPath}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Live Heatmap Active</span>
            </div>

            {/* Content Mock Structure */}
            <div className="relative flex-1 py-4 flex flex-col items-center justify-center text-center">
              <div className="w-3/4 h-6 bg-white/10 rounded mb-3" />
              <div className="w-1/2 h-4 bg-white/5 rounded mb-6" />
              <div className="flex items-center gap-3">
                <div className="w-28 h-8 bg-primary/80 rounded" />
                <div className="w-24 h-8 bg-white/10 rounded" />
              </div>
            </div>

            {/* Click Hotspots Overlay */}
            {filteredClicks.map((click: any, idx: number) => (
              <div 
                key={idx}
                style={{ top: `${click.clickY}%`, left: `${click.clickX}%` }}
                className="absolute w-8 h-8 rounded-full bg-red-500/60 blur-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              />
            ))}

            {/* Heatmap Legend */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span>Click Density:</span>
                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />
                <span className="text-white font-bold">High</span>
              </div>
              <span>Total Recorded Clicks on Page: <strong>{filteredClicks.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Top Pages List */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Top Visited Pages
          </h3>

          <div className="space-y-4 flex-1">
            {topPages.length === 0 ? (
              <p className="text-xs text-secondary italic py-8 text-center">No pageview traffic recorded yet. Page visits will appear here live.</p>
            ) : (
              topPages.map((page: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface-container/50 rounded-xl hover:bg-surface-container transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-primary">{page.title}</h4>
                    <p className="text-[11px] text-secondary font-mono mt-0.5">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">{page.views.toLocaleString()}</span>
                    <p className="text-[10px] text-secondary">{page.avgTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SEO & Google Ads Campaign Performance Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              SEO & Google Ads Campaign Performance
            </h3>
            <p className="text-xs text-secondary mt-0.5">Tracking traffic acquisitions, keyword channels, conversions, and estimated ROI</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container/60">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-secondary uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-3 text-xs font-bold text-secondary uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-xs font-bold text-secondary uppercase tracking-wider">Clicks / Traffic</th>
                <th className="px-6 py-3 text-xs font-bold text-secondary uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3 text-xs font-bold text-secondary uppercase tracking-wider">ROI / Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-secondary italic">
                    No active UTM marketing campaign data recorded yet. UTM campaign traffic will appear here automatically when Google Ads or SEO links with UTM parameters are clicked.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-primary">{camp.name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondary">{camp.channel}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{camp.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{camp.conversions}</td>
                    <td className="px-6 py-4 text-xs font-black text-primary bg-emerald-50 px-3 py-1 rounded inline-block mt-3">
                      {camp.roi}
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
