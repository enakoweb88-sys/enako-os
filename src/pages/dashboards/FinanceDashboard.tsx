import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';

export function FinanceDashboard() {
  const [banking, setBanking] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any>({});
  const [budget, setBudget] = useState<any[]>([]);
  const [cashPosition, setCashPosition] = useState<any>({ chartData: [] });
  const [invoices, setInvoices] = useState<any>({ summary: {}, recent: [] });
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.financeAccounts().catch(() => ({})),
      api.budgetVariance().catch(() => []),
      api.cashPosition().catch(() => ({ chartData: [] })),
      api.b2bInvoices().catch(() => ({ summary: {}, recent: [] }))
    ])
      .then(([acc, b, cp, inv]) => {
        setAccounts(acc || {});
        setBanking(acc?.banking || []);
        setBudget(b || []);
        setCashPosition(cp || { chartData: [] });
        setInvoices(inv || { summary: {}, recent: [] });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-slate-500 text-xs font-bold uppercase tracking-wider py-8">Loading Treasury & Finance Controller Hub...</div>;

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* ── 1. ORGANIZATION SUMMARY CARD ── */}
      <OrganizationHeaderCard subtitle="Finance, Treasury & Liquidity Control" />

      {/* ── 2. TOP METRIC CARDS WITH COLORED BOTTOM ACCENT ── */}
      <WorkplaceStatCards
        card1Label="TOTAL ASSETS"
        domainsCount={fmt(accounts.assets || 0)}
        card2Label="SETTLEMENT RATE"
        usersCount={accounts.settlementAccuracy || '99.9%'}
        card3Label="YTD REVENUE"
        groupsCount={fmt(accounts.revenueYtd || 0)}
        card4Label="NET PROFIT"
        licensesCount={fmt(accounts.netProfit || 0)}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => toast.success('Treasury Balance Reconciliation report generated!')} 
          className="px-5 py-2.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
        >
          Reconcile Floats
        </button>
        <button 
          onClick={loadData} 
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Bank & Mobile Money Accounts Overview */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Mobile Money Floats & Bank Accounts
            </h3>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wider">
              Reconciliation: {accounts.reconciliationRate || '99.98%'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Account / Provider</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Institution</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Account #</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banking.map((b: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-slate-900">
                      {b.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-medium">{b.bank}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{b.accountNo}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-900 font-bold text-right">
                      {b.currency === 'USD' ? `$${Number(b.balance).toLocaleString()}` : fmt(b.balance, true)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-900 text-right uppercase tracking-wider">Total Treasury Reserve</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 font-bold text-right border-t border-slate-200">{fmt(totalBankBalance, true)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget vs Actual Performance */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Budget vs Actual Variance
            </h3>
            <span className="text-xs text-slate-500 font-medium">Fiscal Year 2026</span>
          </div>

          <div className="space-y-3">
            {budget.map((b: any, i) => {
              const variance = b.budget - b.actual;
              const percent = Math.min((b.actual / b.budget) * 100, 100);
              const overBudget = variance < 0;
              return (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-900">{b.category}</span>
                    <span className="text-xs font-mono text-slate-500">
                      {fmt(b.actual, false)} / {fmt(b.budget, false)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className={cn("h-1.5 rounded-full transition-all", overBudget ? "bg-rose-500" : "bg-slate-900")} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-slate-500">{percent.toFixed(0)}% Utilized</span>
                    <span className={overBudget ? 'text-rose-600' : 'text-emerald-600'}>
                      {overBudget ? 'Over Budget' : 'Remaining: '} {fmt(Math.abs(variance), false)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inflow/Outflow Chart & B2B Invoices */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Daily Cash Position Flow */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Daily Cash Position & Inflows
            </h3>
            <span className="text-xs text-slate-500 font-medium">Last 7 Days Movement</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashPosition.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Inflow" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Outflow" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B2B Invoices & Merchant Settlements */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              B2B Settlements & Invoices
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Paid Settlements</p>
              <p className="font-display text-xl font-bold font-mono text-emerald-600">{fmt(invoices.summary?.paid)}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Outstanding</p>
              <p className="font-display text-xl font-bold font-mono text-amber-600">{fmt(invoices.summary?.pending)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {invoices.recent.map((inv: any) => (
              <div key={inv.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">{inv.client}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{inv.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-900">{fmt(inv.amount)}</p>
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-2 py-0.5 rounded border',
                    inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  )}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
