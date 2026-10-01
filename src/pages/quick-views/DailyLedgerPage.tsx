import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { BookOpen, ArrowDownLeft, ArrowUpRight, ShieldCheck, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

function fmt(val: string | number | null | undefined) {
  const n = Number(val ?? 0);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

export default function DailyLedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.transactions()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setTransactions(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t => 
    (t.customerName || t.description || t.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCredits = filtered.filter(t => t.type === 'DEPOSIT' || t.type === 'EXCHANGE' || Number(t.amount || 0) > 0)
    .reduce((sum, t) => sum + (Number(t.amountInXaf || t.amount || 0)), 0);

  const totalDebits = filtered.filter(t => t.type === 'WITHDRAWAL' || t.type === 'DISBURSEMENT')
    .reduce((sum, t) => sum + (Number(t.amountInXaf || t.amount || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Daily General Ledger...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Finance & Accounts • Daily General Ledger & Journal Entries" />

      <WorkplaceStatCards
        domainsCount={filtered.length}
        usersCount={fmt(totalCredits)}
        groupsCount={fmt(totalDebits)}
        licensesCount={fmt(totalCredits - totalDebits)}
        card1Label="TOTAL JOURNAL POSTINGS"
        card2Label="TOTAL CREDITS (CASH IN)"
        card3Label="TOTAL DEBITS (CASH OUT)"
        card4Label="NET DAILY RUNNING BALANCE"
        card1Icon={<BookOpen className="w-5 h-5" />}
        card2Icon={<ArrowDownLeft className="w-5 h-5" />}
        card3Icon={<ArrowUpRight className="w-5 h-5" />}
        card4Icon={<ShieldCheck className="w-5 h-5" />}
      />

      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, customer, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
          />
        </div>

        <button
          onClick={() => {
            try {
              const headers = ['Posting Date', 'Reference / Account', 'Counterparty', 'Channel', 'Type', 'Amount (FCFA)', 'Status'];
              const rows = filtered.map(t => [
                t.date ? new Date(t.date).toISOString().split('T')[0] : 'N/A',
                `"${(t.reference || t.id || '').replace(/"/g, '""')}"`,
                `"${(t.customerName || t.senderName || 'Anonymous').replace(/"/g, '""')}"`,
                `"${(t.channel || t.paymentMethod || 'CASH').replace(/"/g, '""')}"`,
                t.type || 'TX',
                Number(t.amountInXaf || t.amount || 0),
                t.status || 'COMPLETED'
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `enako_daily_ledger_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Downloaded Daily General Ledger CSV');
            } catch (e) {
              toast.error('Failed to export CSV');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-800">General Ledger Journal Entries</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Posting Date</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Reference / Account</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Counterparty</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Channel</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Debit</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Credit</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">No ledger entries recorded.</td>
                </tr>
              ) : (
                filtered.map((t, idx) => {
                  const isDebit = t.type === 'WITHDRAWAL' || t.type === 'DISBURSEMENT';
                  const amt = Number(t.amountInXaf || t.amount || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                        {new Date(t.createdAt || t.date || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900 font-mono">
                        {t.reference || `TXN-${1000 + idx}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {t.customerName || t.recipient || 'Internal Ledger'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 border border-slate-200">
                          {t.channel || 'MoMo / Cash'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-right font-bold text-rose-600">
                        {isDebit ? fmt(amt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-right font-bold text-emerald-600">
                        {!isDebit ? fmt(amt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.status || 'SETTLED'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
