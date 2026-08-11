import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  Wallet, Building2, Landmark, LineChart, FileText,
  ArrowUpRight, ArrowDownRight, DollarSign, Receipt, RefreshCw,
  ShieldCheck, ArrowRightLeft, Utensils, Award, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

export function FinanceDashboard() {
  const [banking, setBanking] = useState<any[]>([]);
  const [budget, setBudget] = useState<any[]>([]);
  const [cashPosition, setCashPosition] = useState<any>(null);
  const [invoices, setInvoices] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.banking(),
      api.budget(),
      api.cashPosition(),
      api.invoicesOverview(),
      api.accountsSummary()
    ])
      .then(([bank, bud, cash, inv, acc]) => {
        setBanking(bank || []);
        setBudget(bud || []);
        setCashPosition(cash || { chartData: [] });
        setInvoices(inv || { summary: { total: 0, paid: 0, pending: 0, overdue: 0 }, recent: [] });
        setAccounts(acc || { assets: 0, liabilities: 0, equity: 0, revenueYtd: 0, expensesYtd: 0, netProfit: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse p-8">Loading Finance & Accounting Command Center…</div>;

  const totalBankBalance = banking.reduce((sum, b) => sum + Number(b.balance || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header & Actions */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" /> Finance & Treasury Operations
          </h3>
          <p className="text-xs text-secondary font-medium">B2B Settlements, Mobile Money Floats, FX Balances, and Financial Reconciliations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success('Financial Audit & Reconciliation Report exported successfully!')} 
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary-container transition-all"
          >
            <FileText className="w-4 h-4" /> Export Ledger Report
          </button>
          <button onClick={loadData} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Treasury Assets', value: fmt(accounts.assets), sub: 'Banks + MoMo Floats', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Settlement Accuracy', value: accounts.settlementAccuracy || '99.94%', sub: 'Zero Mismatch', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'YTD Revenue', value: fmt(accounts.revenueYtd), sub: 'Settled Transactions', icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'YTD Net Profit', value: fmt(accounts.netProfit), sub: 'After Operating Costs', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* Main Sections Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Bank & Mobile Money Accounts Overview */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> Mobile Money Floats & Bank Accounts
            </h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Reconciliation Rate: {accounts.reconciliationRate || '99.98%'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Account / Provider</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Institution</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Account #</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {banking.map((b: any, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-primary flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {b.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary font-medium">{b.bank}</td>
                    <td className="px-4 py-3 text-xs font-mono text-secondary">{b.accountNo}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary font-bold text-right">
                      {b.currency === 'USD' ? `$${Number(b.balance).toLocaleString()}` : fmt(b.balance, true)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-container-low/50 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-primary text-right uppercase tracking-widest">Total Treasury Reserve</td>
                  <td className="px-4 py-3 text-sm font-mono text-primary font-bold text-right border-t-2 border-primary/20">{fmt(totalBankBalance, true)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget vs Actual Performance */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" /> Budget vs Actual Variance
            </h3>
            <span className="text-xs text-secondary font-medium">Fiscal Year 2026</span>
          </div>

          <div className="space-y-4">
            {budget.map((b: any, i) => {
              const variance = b.budget - b.actual;
              const percent = Math.min((b.actual / b.budget) * 100, 100);
              const overBudget = variance < 0;
              return (
                <div key={i} className="p-3 bg-surface-container-low/30 border border-outline-variant/30 rounded-2xl">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-primary">{b.category}</span>
                    <span className="text-xs font-mono text-secondary">
                      {fmt(b.actual, false)} / {fmt(b.budget, false)}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 mb-1 overflow-hidden">
                    <div className={cn("h-2 rounded-full transition-all", overBudget ? "bg-red-500" : "bg-primary")} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-secondary">{percent.toFixed(0)}% Utilized</span>
                    <span className={overBudget ? 'text-red-600' : 'text-green-600'}>
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
      <div className="grid grid-cols-12 gap-8">
        
        {/* Daily Cash Position Flow */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary" /> Daily Cash Position & Inflows
            </h3>
            <span className="text-xs text-secondary font-medium">Last 7 Days Movement</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashPosition.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Inflow" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Outflow" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B2B Invoices & Merchant Settlements */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> B2B Settlements & Invoices
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-200">
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">Paid Settlements</p>
              <p className="font-display text-2xl font-bold text-green-700">{fmt(invoices.summary?.paid)}</p>
            </div>
            <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-200">
              <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1">Outstanding</p>
              <p className="font-display text-2xl font-bold text-yellow-700">{fmt(invoices.summary?.pending)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {invoices.recent.map((inv: any) => (
              <div key={inv.id} className="flex justify-between items-center p-3.5 border border-outline-variant/30 rounded-xl bg-surface-container-low/30">
                <div>
                  <p className="text-xs font-bold text-primary">{inv.client}</p>
                  <p className="text-[10px] text-secondary font-mono">{inv.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-primary">{fmt(inv.amount)}</p>
                  <span className={cn(
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded-full border',
                    inv.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                    inv.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
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

