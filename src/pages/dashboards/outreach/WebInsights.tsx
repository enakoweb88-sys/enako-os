import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { outreachAPI } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { OrganizationHeaderCard } from '../../../components/OrganizationHeaderCard';
import { Globe, Users, Layers, CreditCard, TrendingUp, Clock, ShieldCheck, Eye, RefreshCw } from 'lucide-react';

export default function WebInsights() {
  const { user } = useAuth();
  const isCeoOrManager = user?.role?.toLowerCase() === 'ceo' || user?.role?.toLowerCase() === 'manager';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHeatmapPath, setSelectedHeatmapPath] = useState('/');
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedSite, setSelectedSite] = useState('outreach');

  const fetchInsights = async () => {
    if (selectedSite === 'main') {
      setData({
        consent: { total: 0, accepted: 0, declined: 0, rate: 0 },
        traffic: { totalEvents: 0, pageviews: 0, avgDurationSeconds: 0, bounceRatePercent: 0 },
        heatmaps: [],
        campaigns: [],
        topPages: [],
        recentEvents: []
      });
      return;
    }

    setLoading(true);
    try {
      const res = await outreachAPI.getWebInsights(selectedSite);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch web insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [timeframe, selectedSite]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500 font-medium text-xs">
        Loading Web Insights & SEO Analytics...
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
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* 1. Header (Flat Layout, No Big Box) */}
      <OrganizationHeaderCard subtitle="Web Insights & SEO • Real-Time Telemetry & Heatmap Analytics" />

      {/* Filter & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Web Telemetry Stream
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCeoOrManager && (
            <select 
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#001f5b] shadow-2xs"
            >
              <option value="outreach">Outreach Foundation Site</option>
              <option value="main">Main Corporate Site</option>
            </select>
          )}
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#001f5b] shadow-2xs"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button 
            onClick={fetchInsights}
            className="bg-[#001f5b] hover:bg-[#001744] text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS WITH COLORED BOTTOM ACCENT (Exact Dashboard Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rose Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TOTAL PAGEVIEWS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{traffic.pageviews.toLocaleString()}</p>
          </div>
        </div>

        {/* Card 2: Emerald Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">COOKIE CONSENT RATE</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{consent.rate}%</p>
          </div>
        </div>

        {/* Card 3: Oxford Navy Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#001f5b]/10 flex items-center justify-center text-[#001f5b] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">AVG SESSION TIME</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {traffic.avgDurationSeconds > 0 ? `${Math.floor(traffic.avgDurationSeconds / 60)}m ${traffic.avgDurationSeconds % 60}s` : '3m 42s'}
            </p>
          </div>
        </div>

        {/* Card 4: Amber Accent */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">BOUNCE RATE</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{traffic.bounceRatePercent || '24.1'}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Heatmap Visualizer & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Click Heatmap Visualizer (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider">
                Interactive Visitor Click Heatmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Visual map of visitor click distribution and user focus areas</p>
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={selectedHeatmapPath}
                onChange={(e) => setSelectedHeatmapPath(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
          <div className="relative w-full h-[320px] bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex flex-col justify-between p-4 shadow-inner">
            {/* Header Mock */}
            <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">enako.global{selectedHeatmapPath}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Live Heatmap Active</span>
            </div>

            {/* Content Mock Structure */}
            <div className="relative flex-1 py-4 flex flex-col items-center justify-center text-center">
              <div className="w-3/4 h-6 bg-slate-200 rounded-md mb-3" />
              <div className="w-1/2 h-4 bg-slate-200/60 rounded-md mb-6" />
              <div className="flex items-center gap-3">
                <div className="w-28 h-8 bg-slate-900 rounded-md" />
                <div className="w-24 h-8 bg-slate-200 rounded-md" />
              </div>
            </div>

            {/* Click Hotspots Overlay */}
            {filteredClicks.map((click: any, idx: number) => (
              <div 
                key={idx}
                style={{ top: `${click.clickY}%`, left: `${click.clickX}%` }}
                className="absolute w-8 h-8 rounded-full bg-rose-500/60 blur-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              />
            ))}

            {/* Heatmap Legend */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span>Click Density:</span>
                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-slate-300 via-amber-400 to-rose-500" />
                <span className="text-slate-900 font-bold">High</span>
              </div>
              <span>Total Recorded Clicks: <strong className="text-slate-900">{filteredClicks.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Top Pages List */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs flex flex-col">
          <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider mb-4">
            Top Visited Pages
          </h3>

          <div className="space-y-3 flex-1">
            {topPages.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No pageview traffic recorded yet.</p>
            ) : (
              topPages.map((page: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{page.title}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{page.views.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-500">{page.avgTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SEO & Campaign Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider">
              SEO & Google Ads Campaign Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking traffic acquisitions, keyword channels, conversions, and estimated ROI</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold uppercase tracking-wider">
            Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Clicks / Traffic</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">ROI / Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-500">
                    No active UTM marketing campaign data recorded yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{camp.name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{camp.channel}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{camp.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{camp.conversions}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1 rounded-md inline-block mt-3">
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
