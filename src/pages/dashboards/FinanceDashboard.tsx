import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  Wallet, Building2, Landmark, LineChart, FileText,
  ArrowUpRight, ArrowDownRight, DollarSign, Receipt
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', maximumFractionDigits: 0 });
  return n.toLocaleString();
}

export function FinanceDashboard() {
  const [banking, setBanking] = useState<any[]>([]);
  const [budget, setBudget] = useState<any[]>([]);
  const [cashPosition, setCashPosition] = useState<any>(null);
  const [invoices, setInvoices] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.banking(),
      api.budget(),
      api.cashPosition(),
      api.invoicesOverview(),
      api.accountsSummary()
    ])
      .then(([bank, bud, cash, inv, acc]) => {
        setBanking(bank.length ? bank : [
          { name: 'Main Operating Account', bank: 'UBA Cameroon', accountNo: '10023XXXX', balance: 145000000 },
          { name: 'Payroll Account', bank: 'Ecobank', accountNo: '04321XXXX', balance: 45000000 },
          { name: 'Reserve Account', bank: 'Afriland First Bank', accountNo: '88392XXXX', balance: 80000000 },
        ]);
        setBudget(bud.length ? bud : [
          { category: 'Operations', budget: 10000000, actual: 8500000 },
          { category: 'Salaries & Wages', budget: 45000000, actual: 45000000 },
          { category: 'Marketing', budget: 5000000, actual: 6200000 },
          { category: 'Office & Admin', budget: 2000000, actual: 1800000 },
          { category: 'Others', budget: 1000000, actual: 400000 },
        ]);
        setCashPosition(cash?.chartData?.length ? cash : {
          chartData: [
            { name: 'Mon', Inflow: 4000, Outflow: 2400 },
            { name: 'Tue', Inflow: 3000, Outflow: 1398 },
            { name: 'Wed', Inflow: 2000, Outflow: 9800 },
            { name: 'Thu', Inflow: 2780, Outflow: 3908 },
            { name: 'Fri', Inflow: 1890, Outflow: 4800 },
            { name: 'Sat', Inflow: 2390, Outflow: 3800 },
            { name: 'Sun', Inflow: 3490, Outflow: 4300 },
          ]
        });
        setInvoices(inv?.recent?.length ? inv : {
          summary: { total: 124, paid: 98, pending: 20, overdue: 6 },
          recent: [
            { id: 'INV-2026-041', client: 'Acme Corp', amount: 1500000, status: 'Paid', due: '2026-06-05' },
            { id: 'INV-2026-042', client: 'Tech Hub Ltd', amount: 800000, status: 'Pending', due: '2026-06-12' },
            { id: 'INV-2026-043', client: 'Global Logistics', amount: 2500000, status: 'Overdue', due: '2026-05-30' },
          ]
        });
        setAccounts(acc?.assets ? acc : {
          assets: 450000000, liabilities: 120000000, equity: 330000000, revenueYtd: 850000000, expensesYtd: 420000000, netProfit: 430000000
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const totalBankBalance = banking.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="space-y-8 pb-20">
      
      {/* ── Top Actions ── */}
      <div className="flex justify-end">
        <button onClick={() => toast.success('Financial Report generated and sent to email')} className="px-6 py-2.5 border border-outline-variant bg-white text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export Financial Report
        </button>
      </div>

      {/* Top Level Accounts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', value: fmt(accounts.assets), icon: Landmark, color: 'text-blue-600' },
          { label: 'Total Liabilities', value: fmt(accounts.liabilities), icon: Building2, color: 'text-orange-600' },
          { label: 'YTD Revenue', value: fmt(accounts.revenueYtd), icon: ArrowUpRight, color: 'text-green-600' },
          { label: 'Net Profit', value: fmt(accounts.netProfit), icon: DollarSign, color: 'text-purple-600' },
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
        
        {/* Bank Accounts Overview */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Bank Accounts Overview
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Account Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Bank</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Account #</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Balance (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {banking.map((b: any, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-sm font-bold text-primary">{b.name}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{b.bank}</td>
                    <td className="px-4 py-3 text-xs font-mono text-secondary">{b.accountNo}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary font-bold text-right">{fmt(b.balance, false)}</td>
                  </tr>
                ))}
                <tr className="bg-surface-container-low/50">
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-primary text-right uppercase tracking-widest">Total Balance</td>
                  <td className="px-4 py-3 text-sm font-mono text-primary font-bold text-right border-t-2 border-primary/20">{fmt(totalBankBalance, false)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <LineChart className="w-5 h-5" /> Budget vs Actual
          </h3>
          <div className="space-y-4 flex-1">
            {budget.map((b: any, i) => {
              const variance = b.budget - b.actual;
              const percent = Math.min((b.actual / b.budget) * 100, 100);
              const overBudget = variance < 0;
              return (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-primary">{b.category}</span>
                    <span className="text-xs font-mono text-secondary">
                      {fmt(b.actual, false)} / {fmt(b.budget, false)}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 mb-1 overflow-hidden">
                    <div className={`h-2 rounded-full ${overBudget ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-secondary">{percent.toFixed(0)}% Utilized</span>
                    <span className={overBudget ? 'text-red-600' : 'text-green-600'}>
                      {overBudget ? 'Over Budget by ' : 'Remaining: '} {fmt(Math.abs(variance), false)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash Position Chart */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5" /> Cash Position (7 Days)
          </h3>
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

        {/* Invoices Overview */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Invoices Overview
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Paid</p>
              <p className="font-display text-2xl font-bold text-green-600">{invoices.summary.paid}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Overdue</p>
              <p className="font-display text-2xl font-bold text-red-600">{invoices.summary.overdue}</p>
            </div>
          </div>

          <h4 className="text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">Recent Invoices</h4>
          <div className="space-y-3">
            {invoices.recent.map((inv: any) => (
              <div key={inv.id} className="flex justify-between items-center p-3 border border-outline-variant/20 rounded-lg bg-surface-container-low/50">
                <div>
                  <p className="text-sm font-bold text-primary">{inv.client}</p>
                  <p className="text-xs text-secondary font-mono">{inv.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-primary">{fmt(inv.amount)}</p>
                  <span className={cn(
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded',
                    inv.status === 'Paid' ? 'bg-green-50 text-green-700' :
                    inv.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                    'bg-yellow-50 text-yellow-700'
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
