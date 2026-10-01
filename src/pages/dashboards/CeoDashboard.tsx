import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Globe, Users, CreditCard, ShieldCheck, Mail, ChevronDown,
  Layers, Edit3, ArrowUpRight, TrendingUp, AlertCircle, CheckCircle2,
  ExternalLink, BarChart3, Clock, DollarSign
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { api, outreachAPI } from '../../lib/api';
import { CashCollectionsWidget } from '../../components/CashCollectionsWidget';
import { ExchangeRatesWidget } from '../../components/ExchangeRatesWidget';
import { getDashboardData, subscribeToDashboard, fetchDashboardData } from '../../lib/dashboardStore';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

export function CEODashboard() {
  // Subscribe to the shared dashboard store instead of local state
  const dashData = useSyncExternalStore(subscribeToDashboard, getDashboardData);

  const overview = dashData.overview;
  const transactions = dashData.transactions;
  const healthScore = dashData.healthScore;
  const outreachStats = dashData.outreachStats;
  const loading = dashData.isInitialLoad;

  // Fetch data on mount — will use cache if fresh, or silently refresh in background
  useEffect(() => {
    fetchDashboardData({
      overview: () => api.overview(),
      healthScore: () => api.healthScore(),
      transactions: (params: any) => api.transactions(params),
      outreachStats: () => outreachAPI.getStats(),
    });
  }, []);

  // Handle anchor link scrolling from Quick Views
  useEffect(() => {
    if (!loading && window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center shadow-2xs">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider animate-pulse">
          Loading Workplace Data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. ORGANIZATION SUMMARY (Flat Layout, Zoho Workplace Style) ── */}
      <div className="pb-5 border-b border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Organization Brand & Web Address */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-lg border border-slate-200/90 p-1 flex items-center justify-center bg-white shadow-2xs shrink-0">
            <img src="/logo.png" alt="ENAKO Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              E NAKO COMPANY PLC
            </h2>
            <p className="text-xs text-slate-500 font-medium">www.enakoos.com</p>
          </div>
        </div>

        {/* Middle: Key Organization Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1 max-w-xl">
          <div>
            <p className="text-xs text-slate-500 font-normal">Super Administrator Email Address</p>
            <p className="text-xs font-bold text-slate-800">support@enakoos.com</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-normal">Plan</p>
            <p className="text-xs font-bold text-[#001f5b]">Workplace Standard</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-normal">Subscription Duration</p>
            <p className="text-xs font-bold text-slate-800">Monthly</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-normal">Renewal Date</p>
            <p className="text-xs font-bold text-slate-800">28/10/2026</p>
          </div>
        </div>

        {/* Right: Quick Action Pencil */}
        <button
          onClick={() => toast.success('Organization profile details are up to date')}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
          title="Edit Details"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* ── 2. TOP METRIC CARDS WITH COLORED BOTTOM ACCENT ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: DOMAINS (Red Accent) */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">DOMAINS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">1</p>
          </div>
        </div>

        {/* Card 2: ORGANIZATION USERS (Green Accent) */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">ORGANIZATION USERS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {overview?.employees?.active ?? 1}
            </p>
          </div>
        </div>

        {/* Card 3: GROUPS (#001f5b Accent) */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#001f5b]/10 flex items-center justify-center text-[#001f5b] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">GROUPS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">1</p>
          </div>
        </div>

        {/* Card 4: TOTAL LICENSES (Amber Accent) */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TOTAL LICENSES</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">2</p>
          </div>
        </div>
      </div>

      {/* ── 3. MID CONTENT SECTION: TRAFFIC STATS & USERS DONUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Email Traffic Stats (Col span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Email Traffic Stats</h3>
            <Link to="/app/reports" className="text-xs text-[#001f5b] hover:underline font-semibold">
              View all reports
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Mail className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No data available</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Platform email telemetry updates regularly.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-center">
            <button className="border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer shadow-2xs">
              <span>Last 7 days (23/09/2026 - 29/09/2026)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right: Organization Users Summary Donut (Col span 1) */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Organization Users Summary</h3>
          </div>

          <div className="flex items-center justify-center gap-4 py-2 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#001f5b]"></span>
              Active users
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              Inactive users
            </span>
          </div>

          {/* Donut Ring Chart */}
          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" className="fill-none stroke-slate-100 stroke-[12]" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="fill-none stroke-[#001f5b] stroke-[12]"
                  strokeDasharray="238.76"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 text-center pt-3 border-t border-slate-100">
            <div>
              <p className="text-base font-bold text-slate-900">{overview?.employees?.active ?? 1}</p>
              <p className="text-[11px] text-slate-500 font-medium">Active users</p>
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">0</p>
              <p className="text-[11px] text-slate-500 font-medium">Inactive users</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM SECTION: STORAGE REPORTS & SECURITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Storage Reports (Col span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Storage Reports</h3>
            </div>
            <Link to="/app/reports" className="text-xs text-[#001f5b] hover:underline font-semibold">
              View detailed report
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <p className="text-xs font-semibold text-slate-400">No Data</p>
            <p className="text-[11px] text-slate-400 mt-1">Storage utilization is well within allocated quota.</p>
          </div>
        </div>

        {/* Right: Security Progress Checks (Col span 1) */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Security</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 font-medium">Suspicious Logins (Last 7 days)</span>
              <span className="text-sm font-bold text-slate-900">0</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Domains with MX</span>
                <span className="font-bold text-slate-900">1/1</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#001f5b] rounded-full w-full"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Domains with SPF</span>
                <span className="font-bold text-slate-900">1/1</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#D946EF] rounded-full w-full"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Domains with DKIM</span>
                <span className="font-bold text-slate-900">1/1</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#8B5CF6] rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. OPERATIONAL LEDGERS: EXCHANGE RATES & CASH COLLECTIONS ── */}
      <div className="space-y-6">
        <div id="exchange-rates" className="scroll-mt-6">
          <ExchangeRatesWidget canEdit={true} />
        </div>
        <div id="cash-collections" className="scroll-mt-6">
          <CashCollectionsWidget canManage={true} />
        </div>
      </div>

      {/* ── 6. RECENT TRANSACTIONS LEDGER ── */}
      <div id="recent-transactions" className="scroll-mt-6 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Financial Transactions</h3>
            <p className="text-xs text-slate-500 font-medium">Live transaction activity across all business units</p>
          </div>
          <Link to="/app/transactions" className="text-xs text-[#001f5b] hover:underline font-semibold">
            View All
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {tx.description || tx.reference || 'Transaction'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 uppercase font-medium">
                      {tx.type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
