import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight, Search, Download, Filter, CheckCircle2, Clock,
  AlertCircle, CreditCard, X, Plus, RefreshCw, BarChart3,
  PieChart, Activity, Building, Smartphone, FileText, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api, apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ENAKO_LOGO_BASE64 } from '../lib/logo-base64';

function fmt(val: string | number | null | undefined, currency: string | boolean = 'XAF') {
  const n = Number(val ?? 0);
  if (currency === false) return n.toLocaleString('en-US');
  const currCode = typeof currency === 'string' ? currency : 'XAF';
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currCode}`;
}

export default function Transactions() {
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

  // Filters state (Temporary UI values)
  const [tempSearch, setTempSearch] = useState('');
  const [tempDateRange, setTempDateRange] = useState('All Dates');
  const [tempTxType, setTempTxType] = useState('All Types');
  const [tempTxStatus, setTempTxStatus] = useState('All Status');
  const [tempTxChannel, setTempTxChannel] = useState('All Channels');

  const handleApply = () => {
    setSearch(tempSearch);
    setDateRange(tempDateRange);
    setTxType(tempTxType);
    setTxStatus(tempTxStatus);
    setTxChannel(tempTxChannel);
    setSpecificDate(tempSpecificDate);
  };

  const handleReset = () => {
    setTempSearch('');
    setTempDateRange('All Dates');
    setTempTxType('All Types');
    setTempTxStatus('All Status');
    setTempTxChannel('All Channels');

    setSearch('');
    setDateRange('All Dates');
    setTxType('All Types');
    setTxStatus('All Status');
    setTxChannel('All Channels');
    setSpecificDate('');
  };

  const [specificDate, setSpecificDate] = useState('');
  const [tempSpecificDate, setTempSpecificDate] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showFloatModal, setShowFloatModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ entity: '', type: 'Receive', channel: 'Bank Transfer', amount: '', amountInXaf: '', exchangeRate: '', currency: 'XAF', description: '' });
  const [floatForm, setFloatForm] = useState({ channel: 'MTN', balance: '' });
  const [chargesForm, setChargesForm] = useState({ id: '', charges: '' });
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (form.currency !== 'XAF' && form.amount && form.exchangeRate) {
      if (form.currency === 'NGN') {
        const rate = Number(form.exchangeRate);
        if (rate > 0) {
          setForm(f => ({ ...f, amountInXaf: ((Number(f.amount) / rate) * 1000).toString() }));
        }
      } else {
        setForm(f => ({ ...f, amountInXaf: (Number(f.amount) * Number(f.exchangeRate)).toString() }));
      }
    } else if (form.currency === 'XAF') {
      setForm(f => ({ ...f, amountInXaf: f.amount, exchangeRate: '1' }));
    }
  }, [form.amount, form.exchangeRate, form.currency]);

  const [dashboard, setDashboard] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.transactions({ 
        search, 
        limit: 50,
        dateRange,
        type: txType,
        status: txStatus,
        channel: txChannel,
        specificDate
      });
      setItems(res.items);
      setTotals(res.totals);
      setDashboard(res);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [search, dateRange, txType, txStatus, txChannel, specificDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(tempSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [tempSearch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTransaction({ 
        ...form, 
        amount: Number(form.amount),
        amountInXaf: form.amountInXaf ? Number(form.amountInXaf) : undefined,
        exchangeRate: form.exchangeRate ? Number(form.exchangeRate) : undefined,
      });
      setShowModal(false);
      setForm({ entity: '', type: 'Receive', channel: 'Bank Transfer', amount: '', amountInXaf: '', exchangeRate: '', currency: 'XAF', description: '' });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleSettle = async (id: string, type: string) => {
    if (type === 'Send') {
      setChargesForm({ id, charges: '' });
      setShowChargesModal(true);
    } else {
      try { await api.setTransactionStatus(id, 'SETTLED'); load(); }
      catch (e: any) { alert(e.message); }
    }
  };

  const submitCharges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(`/transactions/${chargesForm.id}/status/SETTLED`, { 
        method: 'PATCH', 
        body: JSON.stringify({ charges: Number(chargesForm.charges) }) 
      });
      setShowChargesModal(false);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleUpdateFloat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.setFloatBalance(floatForm.channel, Number(floatForm.balance));
      setShowFloatModal(false);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const downloadTransactionsPdf = async (period: 'Daily' | 'Weekly' | 'Monthly' | 'All') => {
    setDownloadingPdf(true);
    setShowExportMenu(false);
    try {
      let filterRange = dateRange;
      if (period === 'Daily') filterRange = 'Today';
      else if (period === 'Weekly') filterRange = 'This Week';
      else if (period === 'Monthly') filterRange = 'This Month';

      const res = await api.transactions({ 
        search, 
        limit: 1000,
        dateRange: filterRange,
        type: txType,
        status: txStatus,
        channel: txChannel,
        specificDate
      });
      const allTx = res.items || [];
      
      const doc = new jsPDF();
      let cy = 20;

      const brandBlue = [0, 31, 91] as [number, number, number];
      const darkText = [30, 41, 59] as [number, number, number];
      const mutedText = [100, 116, 139] as [number, number, number];
      const borderColor = [226, 232, 240] as [number, number, number];

      doc.addImage(ENAKO_LOGO_BASE64, 'PNG', 15, cy, 12, 12);
      doc.setFontSize(10);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text('ENAKO FINTECH', 150, cy + 5);
      doc.text(new Date().toLocaleDateString(), 150, cy + 10);
      cy += 20;

      doc.setFontSize(16);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setFont(undefined, 'bold');
      doc.text(`Transactions Report - ${period}`, 15, cy);
      cy += 15;

      // Filtered Transactions Table - Now drawn first
      doc.setFontSize(14);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.text('Filtered Transactions', 15, cy);
      cy += 5;

      const tableData = allTx.map((tx: any) => [
        new Date(tx.createdAt).toLocaleDateString(),
        (tx.entity || '').substring(0, 25),
        `${tx.type} / ${tx.channel || 'N/A'}`,
        fmt(tx.amount, tx.currency),
        tx.amountInXaf ? fmt(tx.amountInXaf, 'XAF') : '-',
        tx.exchangeRate ? tx.exchangeRate : '-',
        tx.status
      ]);

      autoTable(doc, {
        startY: cy,
        head: [['Date', 'Entity', 'Type/Channel', 'Amount', 'XAF Amount', 'Rate', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: brandBlue,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
      
      cy = (doc as any).lastAutoTable.finalY + 15;

      // Now draw Charts on next page
      doc.addPage();
      cy = 20;
      doc.setFontSize(16);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setFont(undefined, 'bold');
      doc.text('Transactions Analytics', 15, cy);
      cy += 15;

      const drawMiniBarChart = (title: string, data: {label: string, value: number}[], x: number, y: number, w: number, h: number) => {
        doc.setFontSize(10);
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.setFont(undefined, 'bold');
        doc.text(title, x, y - 5);
        
        if (data.length === 0) {
          doc.setFontSize(8);
          doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
          doc.text('No data available for chart.', x, y + 10);
          return;
        }

        const maxVal = Math.max(...data.map(d => d.value), 1);
        const barWidth = Math.max((w / data.length) - 4, 3);
        
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.5);
        doc.line(x, y, x, y + h); 
        doc.line(x, y + h, x + w, y + h); 
        
        data.forEach((d, i) => {
          const barH = (d.value / maxVal) * h;
          const barX = x + 2 + i * (barWidth + (w > 100 && data.length > 10 ? 1.5 : 4));
          const barY = y + h - barH;
          
          doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
          doc.rect(barX, barY, barWidth, barH, 'F');
          
          doc.setFontSize(6);
          doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
          const label = d.label.length > 6 ? d.label.substring(0, 6) + '..' : d.label;
          
          doc.text(label, barX, y + h + 5);
          
          if (d.value > 0 && barWidth > 8) {
            doc.text(fmt(d.value, false), barX, barY - 2);
          }
        });
      };

      const last28Days = Array.from({ length: 28 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - i));
        return { 
          date: d, 
          label: `${d.getDate()}/${d.getMonth()+1}`, 
          value: 0 
        };
      });

      const now = new Date();
      const twentyEightDaysAgo = new Date();
      twentyEightDaysAgo.setDate(now.getDate() - 28);

      allTx.forEach((tx: any) => {
        const txDate = new Date(tx.createdAt);
        if (txDate >= twentyEightDaysAgo) {
          const dayMatch = last28Days.find(d => d.date.getDate() === txDate.getDate() && d.date.getMonth() === txDate.getMonth());
          if (dayMatch) {
            dayMatch.value += Number(tx.amount || 0);
          }
        }
      });

      drawMiniBarChart('Transaction Volume (Last 28 Days)', last28Days, 20, cy + 10, 160, 40);
      cy += 70;

      const channelMap: Record<string, number> = {};
      allTx.forEach((tx: any) => {
        const ch = tx.channel || 'None';
        channelMap[ch] = (channelMap[ch] || 0) + Number(tx.amount || 0);
      });
      const channelData = Object.keys(channelMap).map(k => ({ label: k, value: channelMap[k] }));

      drawMiniBarChart('Payment Channels (Volume)', channelData, 20, cy + 10, 160, 40);
      cy += 70;

      doc.save(`transactions_${period.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Error generating PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadTransactionsExcel = async (period: 'Daily' | 'Weekly' | 'Monthly' | 'All') => {
    setDownloadingPdf(true);
    setShowExportMenu(false);
    try {
      let filterRange = dateRange;
      if (period === 'Daily') filterRange = 'Today';
      else if (period === 'Weekly') filterRange = 'This Week';
      else if (period === 'Monthly') filterRange = 'This Month';

      const res = await api.transactions({ 
        search, 
        limit: 1000,
        dateRange: filterRange,
        type: txType,
        status: txStatus,
        channel: txChannel,
        specificDate
      });
      const allTx = res.items || [];
      
      const wsData = [
        [`ENAKO FINTECH - Transactions Report - ${period}`],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [],
        ['Date', 'Entity', 'Type', 'Channel', 'Currency', 'Amount', 'Amount (XAF)', 'Exchange Rate', 'Status', 'Description']
      ];
      
      allTx.forEach((tx: any) => {
        wsData.push([
          new Date(tx.createdAt).toLocaleDateString(),
          tx.entity || 'N/A',
          tx.type,
          tx.channel || 'N/A',
          tx.currency,
          Number(tx.amount),
          Number(tx.amountInXaf || tx.amount),
          Number(tx.exchangeRate || 1),
          tx.status,
          tx.description || ''
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      ws['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, 
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      
      XLSX.writeFile(wb, `transactions_${period.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error(error);
      alert('Error generating Excel');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <CreditCard className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Financial Ledger Locked</h2>
        <p className="text-secondary max-w-sm">Global ledger access is restricted to financial controllers and executive members.</p>
      </div>
    );
  }

  const volumeData = dashboard?.volumeData ?? [];
  const channelData = dashboard?.channelData ?? [];
  const topRevenueSources = dashboard?.topRevenueSources ?? [];
  const COLORS = ['#f59e0b', '#f97316', '#3b82f6'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Transactions Dashboard</h1>
          <p className="text-secondary text-base">Real-time monitoring of capital movement and collections.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} disabled={downloadingPdf} className="px-6 py-2.5 border border-outline-variant bg-white text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all flex items-center">
              <Download className="w-4 h-4 inline mr-2" />
              {downloadingPdf ? 'Exporting...' : 'Export Report'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant/30 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Download PDF</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => downloadTransactionsPdf('Daily')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors">Daily Report</button>
                    <button onClick={() => downloadTransactionsPdf('Weekly')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors">Weekly Report</button>
                    <button onClick={() => downloadTransactionsPdf('Monthly')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors">Monthly Report</button>
                    <button onClick={() => downloadTransactionsPdf('All')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors text-primary">All Dates</button>
                  </div>
                  <div className="p-3 border-y border-outline-variant/20 bg-surface-container-low">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Download Excel</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => downloadTransactionsExcel('Daily')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors text-green-700">Daily Report</button>
                    <button onClick={() => downloadTransactionsExcel('Weekly')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors text-green-700">Weekly Report</button>
                    <button onClick={() => downloadTransactionsExcel('Monthly')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors text-green-700">Monthly Report</button>
                    <button onClick={() => downloadTransactionsExcel('All')} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-container-low rounded-lg transition-colors text-green-800">All Dates</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {(role === 'ceo' || role === 'manager') && (
            <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all">
              <Plus className="w-4 h-4 inline mr-2" />New Transaction
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content Area (9 cols) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Today's Transactions Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant/30 p-5 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Collections (Today)</p>
              <p className="text-2xl font-bold font-mono text-green-600">{fmt(dashboard?.summary?.totalRevenue ?? 0)}</p>
              <p className="text-xs text-secondary mt-1">Income transactions</p>
            </div>
            <div className="bg-white border border-outline-variant/30 p-5 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Disbursements (Today)</p>
              <p className="text-2xl font-bold font-mono text-orange-600">{fmt((dashboard?.summary?.totalVolume ?? 0) - (dashboard?.summary?.totalRevenue ?? 0))}</p>
              <p className="text-xs text-secondary mt-1">Operational transactions</p>
            </div>
            <div className="bg-white border border-outline-variant/30 p-5 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Pending Status</p>
              <p className="text-2xl font-bold font-mono text-yellow-600">{fmt(totals.find(t => t.status === 'PENDING')?._sum?.amount ?? 0)}</p>
              <p className="text-xs text-secondary mt-1">{totals.find(t => t.status === 'PENDING')?._count ?? 0} transactions</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Transaction Volume Chart */}
            <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Transaction Volume (This Week)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(v) => `${v/1000000}M`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Volume (FCFA)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Channels Donut */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center">
              <h3 className="font-display text-lg font-bold text-primary w-full text-left mb-2 flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Payment Channels
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={channelData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col w-full gap-2 mt-2">
                {channelData.map((s, i) => (
                  <div key={s.name} className="flex justify-between items-center text-xs font-bold text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {s.name}
                    </div>
                    <span>{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Float Management */}
            <div className="col-span-12 lg:col-span-6 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                  <Building className="w-5 h-5" /> Float Management
                </h3>
                {(role === 'ceo' || role === 'manager') && (
                  <button onClick={() => setShowFloatModal(true)} className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-3 py-1.5 rounded-lg hover:bg-primary-container/40">
                    Update Float
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest mb-1">MTN Float Balance</p>
                    <p className="text-xl font-bold font-mono text-yellow-900">{fmt(dashboard?.floatManagement?.mtn?.balance ?? 0)}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-green-600 font-bold">In: {fmt(dashboard?.floatManagement?.mtn?.in ?? 0)}</p>
                    <p className="text-red-600 font-bold">Out: {fmt(dashboard?.floatManagement?.mtn?.out ?? 0)}</p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1">Orange Float Balance</p>
                    <p className="text-xl font-bold font-mono text-orange-900">{fmt(dashboard?.floatManagement?.orange?.balance ?? 0)}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-green-600 font-bold">In: {fmt(dashboard?.floatManagement?.orange?.in ?? 0)}</p>
                    <p className="text-red-600 font-bold">Out: {fmt(dashboard?.floatManagement?.orange?.out ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Revenue Sources */}
            <div className="col-span-12 lg:col-span-6 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Top Revenue Sources
              </h3>
              <div className="space-y-4">
                {topRevenueSources.map(source => (
                  <div key={source.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-primary">{source.name}</span>
                      <span className="text-[10px] font-mono text-secondary font-bold">{fmt(source.amount)} ({source.percent}%)</span>
                    </div>
                    <div className="w-full bg-surface-container-low rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${source.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Ledger Table (Existing mostly) */}
          <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-display text-lg font-bold text-primary">All Transactions</h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center gap-2">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Date:</label>
                  <input 
                    type="date" 
                    value={tempSpecificDate} 
                    onChange={e => {
                      setTempSpecificDate(e.target.value);
                      setSpecificDate(e.target.value);
                    }} 
                    className="px-3 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-container/20 text-primary" 
                  />
                  {tempSpecificDate && (
                    <button 
                      onClick={() => {
                        setTempSpecificDate('');
                        setSpecificDate('');
                      }} 
                      className="text-[10px] font-bold text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                  <input value={tempSearch} onChange={e => setTempSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && setSearch(tempSearch)} className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container/20 w-56 animate-in fade-in" placeholder="Search reference…" />
                </div>
                <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Reference & Entity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Type/Channel</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.2em] text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-secondary animate-pulse">Loading…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-secondary">No transactions recorded.</td></tr>
                  ) : items.map(tx => (
                    <tr key={tx.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded bg-primary-fixed flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{tx.entity}</p>
                            <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-0.5">{tx.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-primary block">{tx.type}</span>
                        {tx.channel && <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">{tx.channel}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border',
                          tx.status === 'SETTLED' ? 'bg-green-50 text-green-700 border-green-100' :
                          tx.status === 'FLAGGED' ? 'bg-red-50 text-red-700 border-red-100' :
                          tx.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-yellow-50 text-yellow-700 border-yellow-100',
                        )}>{tx.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-mono font-bold text-sm text-primary">{fmt(tx.amount, tx.currency)}</p>
                        <p className="text-[9px] font-bold text-secondary uppercase mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {tx.status === 'PENDING' && (role === 'ceo' || role === 'manager') && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleSettle(tx.id, tx.type)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark Complete">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { await api.setTransactionStatus(tx.id, 'FAILED'); load(); }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Mark Failed">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Filter Transactions Panel */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-primary mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Transactions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Date Range</label>
                <select value={tempDateRange} onChange={e => setTempDateRange(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary">
                  <option>All Dates</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Custom Range...</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Type</label>
                <select value={tempTxType} onChange={e => setTempTxType(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary">
                  <option>All Types</option>
                  <option>Income</option>
                  <option>Expense</option>
                  <option>Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Status</label>
                <select value={tempTxStatus} onChange={e => setTempTxStatus(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Channel</label>
                <select value={tempTxChannel} onChange={e => setTempTxChannel(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary">
                  <option>All Channels</option>
                  <option>MTN MoMo</option>
                  <option>Orange Money</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="pt-2 flex gap-2">
                <button onClick={handleApply} className="flex-1 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors">Apply</button>
                <button onClick={handleReset} className="px-3 py-2.5 border border-outline-variant/50 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-surface-container transition-colors">Reset</button>
              </div>
            </div>
          </div>

          {/* Transaction Summary Sidebar */}
          <div className="bg-primary text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <div className="relative z-10">
              <h3 className="font-display text-base font-bold mb-4">Summary (This Week)</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Volume</p>
                  <p className="text-xl font-bold font-mono">{fmt(dashboard?.summary?.totalVolume ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Revenue</p>
                  <p className="text-xl font-bold font-mono">{fmt(dashboard?.summary?.totalRevenue ?? 0)}</p>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-3">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Success</p>
                    <p className="text-sm font-bold">{dashboard?.summary?.successRate ?? 0}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Avg Value</p>
                    <p className="text-sm font-bold">{fmt(dashboard?.summary?.avgValue ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Failed Transactions Mini-table */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Failed Transactions
            </h3>
            <div className="space-y-3">
              {(dashboard?.failedTransactions ?? []).map((tx: any) => (
                <div key={tx.id} className="p-2.5 bg-red-50 rounded-lg border border-red-100 text-xs">
                  <div className="flex justify-between font-bold text-red-900 mb-1">
                    <span>{tx.reference}</span>
                    <span>{fmt(tx.amount, tx.currency)}</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>{tx.entity}</span>
                    <span className="text-[9px] uppercase">{tx.description ?? 'N/A'}</span>
                  </div>
                </div>
              ))}
              {dashboard?.failedTransactions?.length === 0 && (
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-2">No Failed TXs</p>
              )}
            </div>
            <button className="w-full mt-3 text-[10px] font-bold text-red-600 hover:underline text-center uppercase tracking-widest">View All Failed</button>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-primary mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Recent Activity Log
            </h3>
            <div className="space-y-3">
              {(dashboard?.recentActivity ?? []).map((log: any) => (
                <div key={log.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                    {log.user?.fullName?.substring(0, 2).toUpperCase() || 'SYS'}
                  </div>
                  <div>
                    <p className="text-xs text-secondary"><span className="font-bold text-primary">{log.user?.fullName || 'System'}</span> {log.action} <span className="font-mono text-primary">{log.details}</span></p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleString()} • {log.ipAddress || '127.0.0.1'}</p>
                  </div>
                </div>
              ))}
              {dashboard?.recentActivity?.length === 0 && (
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-2">No Recent Activity</p>
              )}
            </div>
          </div>

        </div>
      </div>
      
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Record New Transaction</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Entity / Reference *</label>
                  <input required value={form.entity} onChange={e => setForm({ ...form, entity: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Acme Corp" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount *</label>
                    <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0" min="0" step="any" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Currency *</label>
                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option value="XAF">XAF (Franc)</option>
                      <option value="USD">USD (Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="CNY">CNY (China)</option>
                      <option value="NGN">NGN (Naira)</option>
                      <option value="USDT">USDT (Tether)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Exchange Rate</label>
                    <input type="number" value={form.exchangeRate} onChange={e => setForm({ ...form, exchangeRate: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Rate" min="0" step="any" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount in XAF</label>
                    <input type="number" value={form.amountInXaf} onChange={e => setForm({ ...form, amountInXaf: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Total XAF" min="0" step="any" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                    <option>Receive</option>
                    <option>Send</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Payment Channel *</label>
                  <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                    <option>MTN</option>
                    <option>Orange</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none" placeholder="Add any relevant details..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  {submitting ? 'Processing...' : 'Submit Transaction'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showFloatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFloatModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Update Float Balance</h3>
                <button onClick={() => setShowFloatModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleUpdateFloat} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Channel *</label>
                  <select value={floatForm.channel} onChange={e => setFloatForm({ ...floatForm, channel: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                    <option>MTN</option>
                    <option>Orange</option>
                    <option>Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Current Balance (XAF) *</label>
                  <input required type="number" value={floatForm.balance} onChange={e => setFloatForm({ ...floatForm, balance: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0" min="0" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  {submitting ? 'Updating...' : 'Set Balance'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showChargesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChargesModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Complete Send Transaction</h3>
                <button onClick={() => setShowChargesModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={submitCharges} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Transfer Charges (XAF) *</label>
                  <input required type="number" value={chargesForm.charges} onChange={e => setChargesForm({ ...chargesForm, charges: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. 150" min="0" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  {submitting ? 'Processing...' : 'Confirm & Mark Completed'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
