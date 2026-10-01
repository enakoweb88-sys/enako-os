import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, RefreshCw, Download, Filter, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

function fmt(val: string | number | null | undefined, currency: string | boolean = 'XAF') {
  const n = Number(val ?? 0);
  if (currency === false) return n.toLocaleString('en-US');
  const currCode = typeof currency === 'string' ? currency : 'XAF';
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currCode}`;
}

export default function AllTransactionsPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state (Applied)
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('All Dates');
  const [txType, setTxType] = useState('All Types');
  const [txStatus, setTxStatus] = useState('All Status');
  const [txChannel, setTxChannel] = useState('All Channels');
  const [specificDate, setSpecificDate] = useState('');

  // Filters state (Temporary UI values)
  const [tempSearch, setTempSearch] = useState('');
  const [tempSpecificDate, setTempSpecificDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.transactions({
        search,
        limit: 100,
        dateRange,
        type: txType,
        status: txStatus,
        channel: txChannel,
        specificDate,
      });
      setItems(res?.items || []);
      setTotals(res?.totals || []);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to load transactions ledger');
    } finally {
      setLoading(false);
    }
  }, [search, dateRange, txType, txStatus, txChannel, specificDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(tempSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [tempSearch]);

  const handleSettle = async (id: string, type: string) => {
    try {
      await api.setTransactionStatus(id, 'SETTLED');
      toast.success('Transaction marked as SETTLED');
      load();
    } catch (e) {
      toast.error('Failed to settle transaction');
    }
  };

  const handleFail = async (id: string) => {
    try {
      await api.setTransactionStatus(id, 'FAILED');
      toast.error('Transaction marked as FAILED');
      load();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleExportExcel = () => {
    try {
      const wsData: any[][] = [
        ['Date', 'Reference', 'Entity', 'Type', 'Channel', 'Amount', 'Currency', 'Amount (XAF)', 'Status', 'Description']
      ];
      items.forEach((tx: any) => {
        wsData.push([
          new Date(tx.createdAt).toLocaleDateString(),
          tx.reference || tx.id,
          tx.entity || 'N/A',
          tx.type || 'N/A',
          tx.channel || 'N/A',
          tx.amount || 0,
          tx.currency || 'XAF',
          tx.amountInXaf || tx.amount || 0,
          tx.status || 'N/A',
          tx.description || ''
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'All Transactions');
      XLSX.writeFile(wb, `all_transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel export generated successfully');
    } catch (e) {
      toast.error('Failed to export Excel');
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Top Header - Clean, Flat, No card or box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            to="/app/transactions"
            className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">All Transactions</h1>
            <p className="text-xs text-slate-500 font-medium">Global ledger of capital movement, forex settlements, and channel activity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>

          {(role === 'ceo' || role === 'manager') && (
            <Link
              to="/app/transactions/new"
              className="px-3.5 py-1.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-md text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Transaction</span>
            </Link>
          )}
        </div>
      </div>

      {/* Flat Search & Filter Controls (No Card, No Box, Clean Row) */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-100">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tempSearch}
            onChange={e => setTempSearch(e.target.value)}
            placeholder="Search reference, client entity..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-xs text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white transition-colors"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Specific Date */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={tempSpecificDate}
              onChange={e => {
                setTempSpecificDate(e.target.value);
                setSpecificDate(e.target.value);
              }}
              className="px-2.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none"
            />
            {tempSpecificDate && (
              <button
                onClick={() => {
                  setTempSpecificDate('');
                  setSpecificDate('');
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={txType}
            onChange={e => setTxType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none"
          >
            <option value="All Types">All Types</option>
            <option value="Receive">Receive (Inflow)</option>
            <option value="Send">Send (Outflow)</option>
          </select>

          {/* Status Filter */}
          <select
            value={txStatus}
            onChange={e => setTxStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none"
          >
            <option value="All Status">All Status</option>
            <option value="SETTLED">Settled</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Channel Filter */}
          <select
            value={txChannel}
            onChange={e => setTxChannel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none"
          >
            <option value="All Channels">All Channels</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="MTN">MTN MoMo</option>
            <option value="Orange">Orange Money</option>
            <option value="Crypto">Crypto / USDT</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={load}
            className="p-1.5 border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Flat Table (No Card Box, Just Clean Rows) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-50/60">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Reference & Entity</th>
              <th className="py-2.5 px-3">Type / Channel</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              {(role === 'ceo' || role === 'manager') && (
                <th className="py-2.5 px-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-medium">
                  Loading transaction records...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-medium">
                  No transactions match the selected criteria.
                </td>
              </tr>
            ) : (
              items.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 leading-tight">{tx.entity || 'Client'}</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">{tx.reference || tx.id}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700 block">{tx.type}</span>
                    <span className="text-[10px] text-slate-400">{tx.channel || 'Standard'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        tx.status === 'SETTLED' && "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                        tx.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-200/60",
                        tx.status === 'FAILED' && "bg-rose-50 text-rose-700 border-rose-200/60",
                        tx.status === 'FLAGGED' && "bg-rose-50 text-rose-700 border-rose-200/60"
                      )}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <p className="font-bold text-slate-900 text-xs">{fmt(tx.amount, tx.currency)}</p>
                    {tx.amountInXaf && tx.currency !== 'XAF' && (
                      <p className="text-[10px] text-slate-400">{fmt(tx.amountInXaf, 'XAF')}</p>
                    )}
                  </td>
                  {(role === 'ceo' || role === 'manager') && (
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {tx.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSettle(tx.id, tx.type)}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Settle
                          </button>
                          <button
                            onClick={() => handleFail(tx.id)}
                            className="px-2 py-0.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Fail
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer Bar (Flat, No Card) */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
        <span>Showing {items.length} records</span>
        <div className="flex items-center gap-4">
          <span>Settled: {items.filter(i => i.status === 'SETTLED').length}</span>
          <span>Pending: {items.filter(i => i.status === 'PENDING').length}</span>
        </div>
      </div>
    </div>
  );
}
