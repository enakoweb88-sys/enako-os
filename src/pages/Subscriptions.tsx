import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RefreshCw, 
  FileSpreadsheet, 
  CreditCard, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

type Subscription = {
  id: string;
  name: string;
  cost: string | number;
  currency?: string;
  costInXaf?: string | number;
  exchangeRate?: string | number;
  cycle: 'Monthly' | 'Yearly';
  status: 'Active' | 'Paused' | 'Cancelled';
  startDate: string;
  nextBilling: string;
  department?: string;
  receiptUrl?: string;
};

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:8000';
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
};

export default function Subscriptions() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';
  
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let remoteSubs: Subscription[] = [];
      try {
        remoteSubs = await api.subscriptions();
      } catch (err) {
        console.warn('Backend subscriptions API deferred:', err);
      }

      // Merge local storage cached subscriptions
      const localRaw = localStorage.getItem('enako_subscriptions');
      const localSubs: Subscription[] = localRaw ? JSON.parse(localRaw) : [];

      const combinedMap = new Map<string, Subscription>();
      (remoteSubs || []).forEach((s: any) => combinedMap.set(s.id, s));
      localSubs.forEach(s => combinedMap.set(s.id, s));

      const merged = Array.from(combinedMap.values());
      setSubs(merged);
    } catch (e: any) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to mark ${name} as cancelled?`)) return;
    try {
      try {
        await api.updateSubscription(id, { status: 'Cancelled' });
      } catch (e) {}

      // Update local storage
      const localRaw = localStorage.getItem('enako_subscriptions');
      if (localRaw) {
        const localSubs: Subscription[] = JSON.parse(localRaw);
        const updated = localSubs.map(s => s.id === id ? { ...s, status: 'Cancelled' as const } : s);
        localStorage.setItem('enako_subscriptions', JSON.stringify(updated));
      }

      setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'Cancelled' as const } : s));
      toast.info(`${name} subscription status updated to Cancelled.`);
    } catch (e: any) {
      toast.error('Failed to cancel subscription');
    }
  };

  const exportCSV = () => {
    if (subs.length === 0) {
      toast.info('No subscriptions to export');
      return;
    }
    const headers = ['ID', 'Service Name', 'Cost (FCFA)', 'Original Cost', 'Currency', 'Cycle', 'Status', 'Start Date', 'Next Billing'];
    const rows = subs.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.costInXaf || (s.currency === 'XAF' ? s.cost : Number(s.cost) * 600),
      s.cost,
      s.currency || 'XAF',
      s.cycle,
      s.status,
      s.startDate,
      s.nextBilling
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enako_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriptions report exported as CSV');
  };

  const filteredSubs = subs.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.status.toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const monthlyTotal = subs.reduce((acc, sub) => {
    if (sub.status !== 'Active') return acc;
    const cost = sub.costInXaf 
      ? Number(sub.costInXaf) 
      : (sub.currency === 'XAF' ? Number(sub.cost) : Number(sub.cost) * 600);
    return acc + (sub.cycle === 'Yearly' ? cost / 12 : cost);
  }, 0);

  const activeCount = subs.filter(s => s.status === 'Active').length;
  const upcomingRenewalsCount = subs.filter(s => s.status === 'Active' && new Date(s.nextBilling).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000).length;
  const annualizedSpend = monthlyTotal * 12;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* Top Header & Breadcrumb (Clean normal text per guidelines) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Finance & Accounts</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Subscriptions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Enterprise Subscriptions & Licenses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company software licenses, recurring infrastructure commitments, and SaaS billing renewals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/subscriptions/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subscription
          </Link>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Metric Cards: Hero Card (Monthly Rate) + 3 Side Cards (Matching Cash Collections layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Large Main Featured Hero Card: Monthly Run Rate */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Financial Commitment • Monthly Run Rate
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#001f5b]/10 text-[#001f5b] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Monthly Recurring Run Rate</p>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA
            </h3>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span className="font-medium">Active Corporate Commitments</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {activeCount} active subscriptions
            </span>
          </div>
        </div>

        {/* The other three cards placed at the side */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 sm:gap-3.5 justify-between">
          {/* Card 2: Active Services */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Services
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeCount}
              </h4>
              <span className="text-xs text-slate-500">Operational licenses</span>
            </div>
          </div>

          {/* Card 3: Upcoming Renewals */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Renewals
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
                {upcomingRenewalsCount}
              </h4>
              <span className="text-xs text-slate-500">Due within 30 days</span>
            </div>
          </div>

          {/* Card 4: Annualized Run Rate */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Annualized Spend
              </span>
              <TrendingUp className="w-4 h-4 text-[#001f5b]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {annualizedSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA
              </h4>
              <span className="text-xs text-slate-500">12-month projection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Billing Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Subscription Registry & Ledger
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comprehensive list of active software contracts and billing schedules
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search subscriptions or dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-xs text-slate-500">
              Loading subscriptions...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service Name</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost (FCFA)</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cycle</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice / Receipt</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Next Billing</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-xs text-slate-500">
                      No subscriptions found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub) => (
                    <tr 
                      key={sub.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 text-xs">{sub.name}</span>
                        {sub.department && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {sub.department}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-slate-900">
                          {sub.costInXaf 
                            ? parseFloat(sub.costInXaf as string).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) 
                            : (sub.currency === 'XAF' 
                                ? parseFloat(sub.cost as string) 
                                : parseFloat(sub.cost as string) * 600
                              ).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          } FCFA
                        </span>
                        {sub.currency && sub.currency !== 'XAF' && (
                          <span className="block text-[10px] text-slate-400">
                            {sub.cost} {sub.currency}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-600 font-medium">{sub.cycle}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block",
                          sub.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          sub.status === 'Paused' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {sub.receiptUrl ? (
                          <a 
                            href={getFileUrl(sub.receiptUrl)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 text-[#001f5b] font-bold hover:underline text-xs"
                          >
                            <span>Receipt</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-600">
                          {new Date(sub.startDate || sub.nextBilling).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-slate-800">
                          {new Date(sub.nextBilling).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {sub.status === 'Active' ? (
                          <button
                            onClick={() => handleCancel(sub.id, sub.name)}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Terminated</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
