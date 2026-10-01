import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api, apiRequest } from '../lib/api';
import ExportLedgerModal from '../components/ExportLedgerModal';
import { useAuth } from '../lib/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { ENAKO_LOGO_BASE64 } from '../lib/logo-base64';
import { ExchangeRatesWidget, getStoredExchangeRates } from '../components/ExchangeRatesWidget';
import { savePdf, runAutoTable } from '../lib/pdf-export';

function fmt(val: string | number | null | undefined, currency: string | boolean = 'XAF') {
  const n = Number(val ?? 0);
  if (currency === false) return n.toLocaleString('en-US');
  const currCode = typeof currency === 'string' ? currency : 'XAF';
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currCode}`;
}

export function formatCommaNumber(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value).replace(/,/g, '');
  if (isNaN(Number(str)) && str !== '-') return String(value);
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function cleanCommas(value: string): string {
  return (value || '').replace(/,/g, '');
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
  const [form, setForm] = useState({ 
    entity: '', 
    type: 'Receive', 
    channel: 'Bank Transfer', 
    amount: '', 
    amountInXaf: '', 
    exchangeRate: '1', 
    buyingRate: '1',
    sellingRate: '1',
    buyingAmountXaf: '',
    sellingAmountXaf: '',
    sellingCurrency: 'USD',
    sellingCurrencyAmount: '',
    marginXaf: '0',
    currency: 'XAF', 
    description: '' 
  });
  const [floatForm, setFloatForm] = useState({ channel: 'MTN', balance: '' });
  const [chargesForm, setChargesForm] = useState({ id: '', charges: '' });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const recalculateDualRates = (
    amountStr: string,
    srcCurr: string,
    bRateStr: string,
    sRateStr: string,
    sellCurr: string
  ) => {
    const amt = Number(cleanCommas(amountStr)) || 0;
    const bRate = Number(cleanCommas(bRateStr)) || 1;
    const sRate = Number(cleanCommas(sRateStr)) || 1;

    let buyingXaf = 0;
    let sellingXaf = 0;
    let sellCurrAmt = 0;

    if (amt > 0) {
      if (srcCurr === 'XAF') {
        sellingXaf = amt;
        if (sellCurr === 'XAF') {
          buyingXaf = amt;
          sellCurrAmt = amt;
        } else if (sellCurr === 'NGN') {
          // sRate is NGN per 1,000 XAF (e.g. 2150 NGN per 1,000 XAF)
          // Amount in NGN = (Amount in XAF / 1000) * sRate
          sellCurrAmt = (amt / 1000) * sRate;
          buyingXaf = bRate > 0 ? (sellCurrAmt / bRate) * 1000 : amt;
        } else {
          // Foreign target currency (EUR, USD, USDT, CNY, etc.):
          // Amount Sold in Target Currency = Amount in XAF / Selling Rate
          sellCurrAmt = sRate > 0 ? amt / sRate : 0;
          buyingXaf = bRate > 0 && bRate !== 1 ? sellCurrAmt * bRate : amt;
        }
      } else if (srcCurr === 'NGN') {
        // bRate/sRate are NGN per 1,000 XAF
        buyingXaf = bRate > 0 ? (amt / bRate) * 1000 : 0;
        sellingXaf = sRate > 0 ? (amt / sRate) * 1000 : 0;
        if (sellCurr === 'NGN') {
          sellCurrAmt = amt;
        } else if (sellCurr === 'XAF') {
          sellCurrAmt = sellingXaf;
        } else {
          sellCurrAmt = sRate > 0 ? sellingXaf / sRate : 0;
        }
      } else {
        // Foreign source currency (USD, EUR, USDT, CNY, etc.)
        buyingXaf = amt * bRate;
        sellingXaf = amt * sRate;

        if (sellCurr === srcCurr) {
          sellCurrAmt = amt;
        } else if (sellCurr === 'XAF') {
          sellCurrAmt = sellingXaf;
        } else if (sellCurr === 'NGN') {
          sellCurrAmt = (sellingXaf / 1000) * sRate;
        } else {
          sellCurrAmt = sRate > 0 ? sellingXaf / sRate : 0;
        }
      }
    }

    const margin = Math.max(0, sellingXaf - buyingXaf);

    return {
      buyingAmountXaf: buyingXaf > 0 ? String(Math.round(buyingXaf)) : '',
      sellingAmountXaf: sellingXaf > 0 ? String(Math.round(sellingXaf)) : '',
      sellingCurrencyAmount: sellCurrAmt > 0 ? String(Math.round(sellCurrAmt * 100) / 100) : '',
      marginXaf: margin > 0 ? String(Math.round(margin)) : '0',
    };
  };

  const handleCurrencyChange = (newCurr: string, txType: string = form.type) => {
    const storedRates = getStoredExchangeRates();
    const currData = storedRates[newCurr];
    let bRate = form.buyingRate;
    let sRate = form.sellingRate;

    if (newCurr === 'XAF') {
      bRate = '1';
      sRate = '1';
    } else if (currData) {
      bRate = String(currData.buyingRate || '1');
      sRate = String(currData.sellingRate || '1');
    }

    const calcs = recalculateDualRates(form.amount, newCurr, bRate, sRate, form.sellingCurrency);

    setForm(f => ({
      ...f,
      currency: newCurr,
      buyingRate: bRate,
      sellingRate: sRate,
      exchangeRate: txType === 'Receive' ? bRate : sRate,
      amountInXaf: calcs.buyingAmountXaf,
      ...calcs
    }));
  };

  const handleTypeChange = (newType: string) => {
    const storedRates = getStoredExchangeRates();
    const currData = storedRates[form.currency];
    let bRate = form.buyingRate;
    let sRate = form.sellingRate;

    if (form.currency !== 'XAF' && currData) {
      bRate = String(currData.buyingRate || form.buyingRate);
      sRate = String(currData.sellingRate || form.sellingRate);
    }

    const calcs = recalculateDualRates(form.amount, form.currency, bRate, sRate, form.sellingCurrency);

    setForm(f => ({
      ...f,
      type: newType,
      exchangeRate: newType === 'Receive' ? bRate : sRate,
      amountInXaf: calcs.buyingAmountXaf,
      ...calcs
    }));
  };

  const handleAmountChange = (rawInput: string) => {
    const cleaned = cleanCommas(rawInput);
    if (cleaned !== '' && isNaN(Number(cleaned)) && cleaned !== '.') return;

    const calcs = recalculateDualRates(cleaned, form.currency, form.buyingRate, form.sellingRate, form.sellingCurrency);

    setForm(f => ({
      ...f,
      amount: cleaned,
      amountInXaf: calcs.buyingAmountXaf,
      ...calcs
    }));
  };

  const handleBuyingRateChange = (rawInput: string) => {
    const cleaned = cleanCommas(rawInput);
    if (cleaned !== '' && isNaN(Number(cleaned)) && cleaned !== '.') return;

    const calcs = recalculateDualRates(form.amount, form.currency, cleaned, form.sellingRate, form.sellingCurrency);

    setForm(f => ({
      ...f,
      buyingRate: cleaned,
      exchangeRate: form.type === 'Receive' ? cleaned : f.exchangeRate,
      amountInXaf: calcs.buyingAmountXaf,
      ...calcs
    }));
  };

  const handleSellingRateChange = (rawInput: string) => {
    const cleaned = cleanCommas(rawInput);
    if (cleaned !== '' && isNaN(Number(cleaned)) && cleaned !== '.') return;

    const calcs = recalculateDualRates(form.amount, form.currency, form.buyingRate, cleaned, form.sellingCurrency);

    setForm(f => ({
      ...f,
      sellingRate: cleaned,
      exchangeRate: form.type === 'Send' ? cleaned : f.exchangeRate,
      ...calcs
    }));
  };

  const handleSellingCurrencyChange = (newSellCurr: string) => {
    const calcs = recalculateDualRates(form.amount, form.currency, form.buyingRate, form.sellingRate, newSellCurr);

    setForm(f => ({
      ...f,
      sellingCurrency: newSellCurr,
      ...calcs
    }));
  };

  const handleBuyingAmountXafChange = (rawInput: string) => {
    const cleaned = cleanCommas(rawInput);
    if (cleaned !== '' && isNaN(Number(cleaned)) && cleaned !== '.') return;

    const xaf = Number(cleaned) || 0;
    const bRate = Number(cleanCommas(form.buyingRate)) || 1;

    let srcAmt = 0;
    if (form.currency === 'XAF') {
      srcAmt = xaf;
    } else if (form.currency === 'NGN') {
      srcAmt = (xaf / 1000) * bRate;
    } else {
      srcAmt = bRate > 0 ? xaf / bRate : 0;
    }

    const srcAmtStr = srcAmt > 0 ? String(Math.round(srcAmt * 100) / 100) : form.amount;
    const calcs = recalculateDualRates(srcAmtStr, form.currency, form.buyingRate, form.sellingRate, form.sellingCurrency);

    setForm(f => ({
      ...f,
      amount: srcAmtStr,
      buyingAmountXaf: cleaned,
      amountInXaf: cleaned,
      ...calcs
    }));
  };

  const handleSellingAmountXafChange = (rawInput: string) => {
    const cleaned = cleanCommas(rawInput);
    if (cleaned !== '' && isNaN(Number(cleaned)) && cleaned !== '.') return;

    const sXaf = Number(cleaned) || 0;
    const sRate = Number(cleanCommas(form.sellingRate)) || 1;

    let sellCurrAmt = 0;
    if (form.sellingCurrency === 'XAF') {
      sellCurrAmt = sXaf;
    } else if (form.sellingCurrency === 'NGN') {
      sellCurrAmt = (sXaf / 1000) * sRate;
    } else {
      sellCurrAmt = sRate > 0 ? sXaf / sRate : 0;
    }

    const bXaf = Number(cleanCommas(form.buyingAmountXaf)) || 0;
    const margin = Math.max(0, sXaf - bXaf);

    setForm(f => ({
      ...f,
      sellingAmountXaf: cleaned,
      sellingCurrencyAmount: sellCurrAmt > 0 ? String(Math.round(sellCurrAmt * 100) / 100) : '',
      marginXaf: margin > 0 ? String(Math.round(margin)) : '0',
    }));
  };

  const handleSellingCurrencyAmountChange = (rawInput: string) => {
    const cleaned = cleanCommas(rawInput);
    if (cleaned !== '' && isNaN(Number(cleaned)) && cleaned !== '.') return;

    const sellAmt = Number(cleaned) || 0;
    const sRate = Number(cleanCommas(form.sellingRate)) || 1;
    const bRate = Number(cleanCommas(form.buyingRate)) || 1;

    let sXaf = 0;
    if (form.sellingCurrency === 'XAF') {
      sXaf = sellAmt;
    } else if (form.sellingCurrency === 'NGN') {
      sXaf = sRate > 0 ? (sellAmt / sRate) * 1000 : 0;
    } else {
      sXaf = sellAmt * sRate;
    }

    let bXaf = 0;
    if (form.sellingCurrency === 'XAF') {
      bXaf = sellAmt;
    } else if (form.sellingCurrency === 'NGN') {
      bXaf = bRate > 0 ? (sellAmt / bRate) * 1000 : 0;
    } else {
      bXaf = sellAmt * bRate;
    }

    const margin = Math.max(0, sXaf - bXaf);

    setForm(f => ({
      ...f,
      sellingCurrencyAmount: cleaned,
      sellingAmountXaf: sXaf > 0 ? String(Math.round(sXaf)) : '',
      buyingAmountXaf: f.currency === 'XAF' ? (bXaf > 0 ? String(Math.round(bXaf)) : f.buyingAmountXaf) : f.buyingAmountXaf,
      amountInXaf: f.currency === 'XAF' ? (bXaf > 0 ? String(Math.round(bXaf)) : f.amountInXaf) : f.amountInXaf,
      marginXaf: margin > 0 ? String(Math.round(margin)) : '0',
    }));
  };

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
      const cleanedAmt = Number(cleanCommas(form.amount));
      const cleanedXaf = form.buyingAmountXaf ? Number(cleanCommas(form.buyingAmountXaf)) : (form.amountInXaf ? Number(cleanCommas(form.amountInXaf)) : cleanedAmt);
      const cleanedRate = form.buyingRate ? Number(cleanCommas(form.buyingRate)) : 1;

      const rateDetails = `Buy Rate: ${form.buyingRate}, Sell Rate: ${form.sellingRate}, Target Sell: ${form.sellingCurrencyAmount || '0'} ${form.sellingCurrency}, Est. Margin: +${form.marginXaf || '0'} XAF`;
      const fullDesc = form.description ? `${form.description} | ${rateDetails}` : rateDetails;

      await api.createTransaction({ 
        ...form, 
        amount: cleanedAmt,
        amountInXaf: cleanedXaf,
        exchangeRate: cleanedRate,
        description: fullDesc,
      });
      setShowModal(false);
      setForm({ 
        entity: '', type: 'Receive', channel: 'Bank Transfer', amount: '', amountInXaf: '', 
        exchangeRate: '1', buyingRate: '1', sellingRate: '1', buyingAmountXaf: '', 
        sellingAmountXaf: '', sellingCurrency: 'USD', sellingCurrencyAmount: '', 
        marginXaf: '0', currency: 'XAF', description: '' 
      });
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
        body: JSON.stringify({ charges: Number(cleanCommas(chargesForm.charges)) }) 
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
      await api.setFloatBalance(floatForm.channel, Number(cleanCommas(floatForm.balance)));
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

      let allTx: any[] = [];
      try {
        const res = await api.transactions({ 
          search, 
          limit: 1000,
          dateRange: filterRange,
          type: txType,
          status: txStatus,
          channel: txChannel,
          specificDate
        });
        allTx = res?.items || (Array.isArray(res) ? res : []);
      } catch {
        allTx = items;
      }

      if (allTx.length === 0 && items.length > 0) {
        allTx = items;
      }
      
      const doc = new jsPDF();
      let cy = 20;

      const brandBlue = [0, 31, 91] as [number, number, number];
      const darkText = [30, 41, 59] as [number, number, number];
      const mutedText = [100, 116, 139] as [number, number, number];
      const borderColor = [226, 232, 240] as [number, number, number];

      try {
        if (ENAKO_LOGO_BASE64) {
          doc.addImage(ENAKO_LOGO_BASE64, 'PNG', 15, cy, 12, 12);
        }
      } catch {}

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
        new Date(tx.createdAt || Date.now()).toLocaleDateString(),
        (tx.entity || '').substring(0, 20),
        `${tx.type || '-'} / ${tx.channel || 'N/A'}`,
        fmt(tx.amount, tx.currency),
        tx.amountInXaf ? fmt(tx.amountInXaf, 'XAF') : '-',
        tx.status || 'SETTLED',
        (tx.description || '').substring(0, 40)
      ]);

      runAutoTable(doc, {
        startY: cy,
        head: [['Date', 'Entity', 'Type/Channel', 'Amount', 'XAF Amount', 'Status', 'Rate Details & Margin']],
        body: tableData.length > 0 ? tableData : [['No transactions recorded for this period', '', '', '', '', '', '']],
        theme: 'grid',
        headStyles: {
          fillColor: brandBlue,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2.5,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
      
      cy = ((doc as any).lastAutoTable?.finalY ?? 60) + 15;

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

      const saved = savePdf(doc, `transactions_${period.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
      if (saved) {
        toast.success(`Transactions ${period} report downloaded`);
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error(error.message || 'Error generating PDF');
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

      let allTx: any[] = [];
      try {
        const res = await api.transactions({ 
          search, 
          limit: 1000,
          dateRange: filterRange,
          type: txType,
          status: txStatus,
          channel: txChannel,
          specificDate
        });
        allTx = res?.items || (Array.isArray(res) ? res : []);
      } catch {
        allTx = items;
      }

      if (allTx.length === 0 && items.length > 0) {
        allTx = items;
      }
      
      const wsData = [
        [`ENAKO FINTECH - FX Transactions & Operations Report - ${period}`],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [],
        ['Date', 'Entity / Reference', 'Type', 'Channel', 'Currency', 'Amount', 'Amount (XAF)', 'Base Rate', 'Status', 'Rate & Margin Details']
      ];
      
      allTx.forEach((tx: any) => {
        const d = tx.createdAt ? new Date(tx.createdAt) : new Date();
        const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : 'N/A';
        wsData.push([
          dateStr,
          tx.entity || 'N/A',
          tx.type || '-',
          tx.channel || 'N/A',
          tx.currency || 'XAF',
          Number(tx.amount || 0),
          Number(tx.amountInXaf || tx.amount || 0),
          Number(tx.exchangeRate || 1),
          tx.status || 'SETTLED',
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
      toast.success(`Exported ${period} transactions to Excel`);
    } catch (error: any) {
      console.error('Error generating Excel:', error);
      toast.error(error.message || 'Error generating Excel');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-3 bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-tight">Financial Ledger Locked</h2>
        <p className="text-slate-500 text-xs max-w-sm">Global ledger access is restricted to financial controllers and executive members.</p>
      </div>
    );
  }

  const volumeData = dashboard?.volumeData ?? [];
  const channelData = dashboard?.channelData ?? [];
  const topRevenueSources = dashboard?.topRevenueSources ?? [];
  const COLORS = ['#f59e0b', '#f97316', '#3b82f6'];

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* ── 1. HEADER (Clean subtle header bar) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Transactions Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time monitoring of capital movement, forex settlements, and channel activity</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Report Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-1.5 border border-slate-200 bg-white text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Ledger (PDF / Excel)</span>
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

          <Link
            to="/app/transactions/all"
            className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>All Transactions →</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO STATS (Collections Today Big + Disbursements & Failed Small) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Big Card (8 cols): Collections (Today) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collections (Today)</p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Live Inflow
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 tracking-tight">
              {fmt(dashboard?.summary?.totalRevenue ?? 129534476)}
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-emerald-700">Income Transactions</span>
            <span>Settled Client Inflows</span>
          </div>
        </div>

        {/* Beside in smaller cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card: Disbursements (Today) */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disbursements (Today)</p>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {fmt((dashboard?.summary?.totalVolume ?? 0) - (dashboard?.summary?.totalRevenue ?? 0))}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Operational Outflows & Payouts</p>
          </div>

          {/* Card: Failed Transactions */}
          <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed Transactions</p>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-1 tracking-tight">
              {items.filter(i => i.status === 'FAILED').length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Unsettled or Rejected Movements</p>
          </div>
        </div>
      </div>

      {/* ── 3. LIVE FOREX RATE MATRIX ── */}
      <ExchangeRatesWidget canEdit={role === 'ceo' || role === 'manager'} />

      {/* ── 4. ANALYTICS & OPERATIONAL OVERVIEW ── */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Volume Chart */}
            <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Transaction Volume (This Week)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-5} tickFormatter={(v) => `${v/1000000}M`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="volume" stroke="#001f5b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Volume (FCFA)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channels Donut */}
            <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Payment Channels
              </h3>
              <div className="h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={channelData} innerRadius={48} outerRadius={68} paddingAngle={2} dataKey="value">
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-100 text-xs">
                {channelData.map((s, i) => (
                  <div key={s.name} className="flex justify-between items-center text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{s.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Table Preview (Latest 5 Transactions) */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
                <p className="text-xs text-slate-500 font-medium">Live transaction activity across all business units</p>
              </div>
              <Link
                to="/app/transactions/all"
                className="text-xs text-[#001f5b] hover:underline font-semibold"
              >
                View All Transactions →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-50/70">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Entity & Reference</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.slice(0, 5).map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900">{tx.entity}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.reference}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {tx.type} • {tx.channel || 'Standard'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border inline-block',
                          tx.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                          tx.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                          'bg-amber-50 text-amber-700 border-amber-200/60',
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {fmt(tx.amount, tx.currency)}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Float Management */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Float Management
              </h3>
              {(role === 'ceo' || role === 'manager') && (
                <button
                  onClick={() => setShowFloatModal(true)}
                  className="text-[11px] font-bold text-[#001f5b] hover:underline cursor-pointer"
                >
                  Update Float
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50/70 rounded-md border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">MTN Float Balance</p>
                  <p className="text-base font-bold text-slate-900">{fmt(dashboard?.floatManagement?.mtn?.balance ?? 0)}</p>
                </div>
                <div className="text-right text-[11px]">
                  <p className="text-emerald-700 font-bold">In: {fmt(dashboard?.floatManagement?.mtn?.in ?? 0)}</p>
                  <p className="text-rose-600 font-bold">Out: {fmt(dashboard?.floatManagement?.mtn?.out ?? 0)}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-md border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Orange Float Balance</p>
                  <p className="text-base font-bold text-slate-900">{fmt(dashboard?.floatManagement?.orange?.balance ?? 0)}</p>
                </div>
                <div className="text-right text-[11px]">
                  <p className="text-emerald-700 font-bold">In: {fmt(dashboard?.floatManagement?.orange?.in ?? 0)}</p>
                  <p className="text-rose-600 font-bold">Out: {fmt(dashboard?.floatManagement?.orange?.out ?? 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Revenue Sources */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-3">
              Top Revenue Sources
            </h3>
            <div className="space-y-3">
              {topRevenueSources.map(source => (
                <div key={source.name}>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-800">{source.name}</span>
                    <span className="text-[11px] font-bold text-slate-600">{fmt(source.amount)} ({source.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#001f5b] h-1.5 rounded-full" style={{ width: `${source.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-3">
              Summary (This Week)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Volume</span>
                <span className="font-bold text-slate-900">{fmt(dashboard?.summary?.totalVolume ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Revenue</span>
                <span className="font-bold text-emerald-700">{fmt(dashboard?.summary?.totalRevenue ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Success Rate</span>
                <span className="font-bold text-emerald-700">{dashboard?.summary?.successRate ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col z-10">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Record New Transaction</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase">Close</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Entity / Reference *</label>
                  <input required value={form.entity} onChange={e => setForm({ ...form, entity: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Acme Corp" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount *</label>
                    <input 
                      required 
                      type="text" 
                      value={formatCommaNumber(form.amount)} 
                      onChange={e => handleAmountChange(e.target.value)} 
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 font-mono font-bold" 
                      placeholder="e.g. 30,000 or 3,000,000" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Currency *</label>
                    <select 
                      value={form.currency} 
                      onChange={e => handleCurrencyChange(e.target.value)} 
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 font-bold"
                    >
                      <option value="XAF">XAF (Franc)</option>
                      <option value="USD">USD (Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="CNY">CNY (China)</option>
                      <option value="NGN">NGN (Naira)</option>
                      <option value="USDT">USDT (Tether)</option>
                    </select>
                  </div>
                </div>
                {/* Dual Rates Section: Buying Rate & Selling Rate */}
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Dual Rates & Selling Target</span>
                    <span className="text-[10px] text-secondary font-medium">Independent Buying & Selling rates per transaction</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">
                        Buying Rate {form.currency === 'NGN' || form.sellingCurrency === 'NGN' ? '(per 1,000 NGN)' : '(Buy)'} *
                      </label>
                      <input 
                        type="text" 
                        value={form.buyingRate} 
                        onChange={e => handleBuyingRateChange(e.target.value)} 
                        className="w-full bg-white border border-outline-variant/30 rounded-xl p-3 text-sm font-mono font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20" 
                        placeholder={form.currency === 'NGN' || form.sellingCurrency === 'NGN' ? "e.g. 400 per 1k NGN" : "Buying Rate (e.g. 600)"} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">
                        Selling Rate {form.currency === 'NGN' || form.sellingCurrency === 'NGN' ? '(per 1,000 NGN)' : '(Sell)'} *
                      </label>
                      <input 
                        type="text" 
                        value={form.sellingRate} 
                        onChange={e => handleSellingRateChange(e.target.value)} 
                        className="w-full bg-white border border-outline-variant/30 rounded-xl p-3 text-sm font-mono font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20" 
                        placeholder={form.currency === 'NGN' || form.sellingCurrency === 'NGN' ? "e.g. 420 per 1k NGN" : "Selling Rate (e.g. 620)"} 
                      />
                    </div>
                  </div>

                  {/* Dual Totals & Target Selling Currency Amount */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-700 mb-1 uppercase tracking-widest">
                        Total XAF Bought (Paid/Collected)
                      </label>
                      <input 
                        type="text" 
                        value={formatCommaNumber(form.buyingAmountXaf)} 
                        onChange={e => handleBuyingAmountXafChange(e.target.value)} 
                        className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm font-mono font-bold text-emerald-800 outline-none" 
                        placeholder="Total Buying XAF" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1 uppercase tracking-widest">
                        Total XAF Sold (Expected Sales)
                      </label>
                      <input 
                        type="text" 
                        value={formatCommaNumber(form.sellingAmountXaf)} 
                        onChange={e => handleSellingAmountXafChange(e.target.value)} 
                        className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm font-mono font-bold text-blue-800 outline-none" 
                        placeholder="Total Selling XAF" 
                      />
                    </div>
                  </div>

                  {/* Target Currency & Profit Spread Indicator */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">
                        Selling Target Currency
                      </label>
                      <select 
                        value={form.sellingCurrency} 
                        onChange={e => handleSellingCurrencyChange(e.target.value)} 
                        className="w-full bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-bold outline-none"
                      >
                        <option value="USD">USD (Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="CNY">CNY (China)</option>
                        <option value="NGN">NGN (Naira)</option>
                        <option value="USDT">USDT (Tether)</option>
                        <option value="XAF">XAF (Franc)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">
                        Amount Sold in {form.sellingCurrency}
                      </label>
                      <input 
                        type="text" 
                        value={formatCommaNumber(form.sellingCurrencyAmount)} 
                        onChange={e => handleSellingCurrencyAmountChange(e.target.value)} 
                        placeholder={`e.g. 1,000 ${form.sellingCurrency}`}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-mono font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20" 
                      />
                    </div>
                  </div>

                  {/* Profit Margin Spread Badge */}
                  {Number(cleanCommas(form.marginXaf)) > 0 && (
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Estimated Profit Spread (Margin):</span>
                      <span className="font-mono text-sm">+{formatCommaNumber(form.marginXaf)} XAF</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Type / Operation *</label>
                  <select value={form.type} onChange={e => handleTypeChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 font-bold text-slate-900">
                    <option value="Receive">Receive (Buy Currency)</option>
                    <option value="Send">Send (Sell Currency)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Payment Channel *</label>
                  <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 text-slate-900">
                    <option>MTN</option>
                    <option>Orange</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 resize-none text-slate-900" placeholder="Add any relevant details..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest mt-4 hover:bg-slate-800 transition-all shadow-md">
                  {submitting ? 'Processing...' : 'Submit Transaction'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showFloatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFloatModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col z-10">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Update Float Balance</h3>
                <button onClick={() => setShowFloatModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase">Close</button>
              </div>
              <form onSubmit={handleUpdateFloat} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Channel *</label>
                  <select value={floatForm.channel} onChange={e => setFloatForm({ ...floatForm, channel: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 text-slate-900">
                    <option>MTN</option>
                    <option>Orange</option>
                    <option>Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Current Balance (XAF) *</label>
                  <input 
                    required 
                    type="text" 
                    value={formatCommaNumber(floatForm.balance)} 
                    onChange={e => setFloatForm({ ...floatForm, balance: cleanCommas(e.target.value) })} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 font-mono font-bold text-slate-900" 
                    placeholder="e.g. 1,500,000" 
                  />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest mt-4 hover:bg-slate-800 transition-all shadow-md">
                  {submitting ? 'Updating...' : 'Set Balance'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showChargesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChargesModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col z-10">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Complete Send Transaction</h3>
                <button onClick={() => setShowChargesModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase">Close</button>
              </div>
              <form onSubmit={submitCharges} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Transfer Charges (XAF) *</label>
                  <input 
                    required 
                    type="text" 
                    value={formatCommaNumber(chargesForm.charges)} 
                    onChange={e => setChargesForm({ ...chargesForm, charges: cleanCommas(e.target.value) })} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 font-mono font-bold text-slate-900" 
                    placeholder="e.g. 150" 
                  />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest mt-4">
                  {submitting ? 'Processing...' : 'Confirm & Mark Completed'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Ledger Modal (PDF & Excel with Dynamic Months) */}
      <ExportLedgerModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="ENAKO FINTECH • TRANSACTIONS & SETTLEMENTS LEDGER"
        defaultFileName="Enako_Transactions_Ledger"
        headers={['Date', 'Entity / Client', 'Direction', 'Channel', 'Currency', 'Amount', 'Est. XAF', 'Exchange Rate', 'Status']}
        items={items}
        getDateStr={(tx: any) => tx.effectiveDate || tx.date || tx.createdAt}
        getRowData={(tx: any) => [
          tx.effectiveDate || tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'),
          tx.entity || 'N/A',
          tx.type || 'Receive',
          tx.channel || 'Bank Transfer',
          tx.currency || 'XAF',
          Number(tx.amount || 0),
          Number(tx.amountInXaf || tx.amount || 0),
          Number(tx.exchangeRate || 1),
          tx.status || 'SETTLED'
        ]}
        orientation="landscape"
      />
    </div>
  );
}
