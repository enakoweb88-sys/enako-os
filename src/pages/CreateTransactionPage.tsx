import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw, DollarSign, ArrowRight, ShieldCheck, Calendar, Clock, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getStoredExchangeRates } from '../components/ExchangeRatesWidget';
import { formatCommaNumber, cleanCommas } from './Transactions';

const CURRENCIES = [
  { code: 'XAF', name: 'Central African Franc', flag: '🇨🇲' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', name: 'US Dollar', flag: '💵' },
  { code: 'EUR', name: 'Euro', flag: '💶' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'USDT', name: 'Tether Crypto', flag: '🪙' },
];

const CHANNELS = [
  'Bank Transfer',
  'Cash Desk',
  'MTN Mobile Money',
  'Orange Money',
  'Crypto / USDT',
  'Express Union',
  'Inter-Account Transfer'
];

export default function CreateTransactionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [currentLiveTime] = useState(() => new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }));

  const [form, setForm] = useState({
    entity: '',
    type: 'Receive',
    channel: 'Bank Transfer',
    transactionDate: new Date().toISOString().split('T')[0],
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
          sellCurrAmt = (amt / 1000) * sRate;
          buyingXaf = bRate > 0 ? (sellCurrAmt / bRate) * 1000 : amt;
        } else {
          sellCurrAmt = sRate > 0 ? amt / sRate : 0;
          buyingXaf = bRate > 0 && bRate !== 1 ? sellCurrAmt * bRate : amt;
        }
      } else if (srcCurr === 'NGN') {
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
        buyingXaf = amt * bRate;
        sellingXaf = amt * sRate;
        if (sellCurr === srcCurr) {
          sellCurrAmt = amt;
        } else if (sellCurr === 'XAF') {
          sellCurrAmt = sellingXaf;
        } else {
          sellCurrAmt = amt;
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

  const handleCurrencyChange = (newCurrency: string) => {
    const storedRates = getStoredExchangeRates();
    const currData = storedRates[newCurrency];
    let bRate = '1';
    let sRate = '1';

    if (newCurrency !== 'XAF' && currData) {
      bRate = String(currData.buyingRate || '1');
      sRate = String(currData.sellingRate || '1');
    }

    const calcs = recalculateDualRates(form.amount, newCurrency, bRate, sRate, form.sellingCurrency);

    setForm(f => ({
      ...f,
      currency: newCurrency,
      buyingRate: bRate,
      sellingRate: sRate,
      exchangeRate: f.type === 'Receive' ? bRate : sRate,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.entity || !form.amount) {
      toast.error('Please enter the entity name and amount');
      return;
    }

    setSubmitting(true);
    const entryTimestamp = new Date().toISOString();
    try {
      const cleanedAmt = Number(cleanCommas(form.amount));
      const cleanedXaf = form.buyingAmountXaf ? Number(cleanCommas(form.buyingAmountXaf)) : (form.amountInXaf ? Number(cleanCommas(form.amountInXaf)) : cleanedAmt);
      const cleanedRate = form.buyingRate ? Number(cleanCommas(form.buyingRate)) : 1;

      const rateDetails = `Buy Rate: ${form.buyingRate}, Sell Rate: ${form.sellingRate}, Target Sell: ${form.sellingCurrencyAmount || '0'} ${form.sellingCurrency}, Est. Margin: +${form.marginXaf || '0'} XAF`;
      const fullDesc = form.description ? `${form.description} | ${rateDetails}` : rateDetails;

      await api.createTransaction({
        ...form,
        date: form.transactionDate,
        effectiveDate: form.transactionDate,
        entryTimestamp,
        systemRecordedAt: entryTimestamp,
        amount: cleanedAmt,
        amountInXaf: cleanedXaf,
        exchangeRate: cleanedRate,
        description: fullDesc,
      });

      // Log into unified system audit trail
      try {
        const deltaDays = Math.round(
          (new Date(entryTimestamp).getTime() - new Date(form.transactionDate).getTime()) / (1000 * 3600 * 24)
        );
        const auditRecord = {
          id: `AUD-TXN-${Date.now()}`,
          module: 'Transactions',
          event: `Transaction Created: ${form.type.toUpperCase()} ${cleanedAmt.toLocaleString()} ${form.currency}`,
          actor: user?.fullName || 'Financial Operator',
          actorRole: user?.role || 'Finance',
          effectiveDate: form.transactionDate,
          entryTimestamp,
          deltaDays,
          status: 'VERIFIED',
          referenceId: `TXN-${Date.now().toString().slice(-6)}`,
          details: `Entity: ${form.entity} • Channel: ${form.channel} • Amount: ${cleanedAmt.toLocaleString()} ${form.currency} (${cleanedXaf.toLocaleString()} XAF)`
        };
        const prevAudits = JSON.parse(localStorage.getItem('enako_system_audits') || '[]');
        localStorage.setItem('enako_system_audits', JSON.stringify([auditRecord, ...prevAudits]));
      } catch (auditErr) {
        console.warn('Transaction audit log warning:', auditErr);
      }

      toast.success('Transaction created and queued for settlement');
      navigate('/app/transactions');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            to="/app/transactions"
            className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Back to Transactions"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Create New Transaction</h1>
            <p className="text-xs text-slate-500 font-medium">Record client capital movement, exchange rates, and ledger settlement</p>
          </div>
        </div>

        <Link
          to="/app/transactions/all"
          className="text-xs text-[#001f5b] hover:underline font-semibold"
        >
          View All Transactions →
        </Link>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-2xs space-y-6">
        {/* Effective Date & Immutable System Timestamp */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Editable Transaction / Event Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#001f5b]" />
                  Transaction / Event Date <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Editable (Backdate if forgotten)
                </span>
              </div>
              <input
                type="date"
                required
                value={form.transactionDate}
                onChange={e => setForm({ ...form, transactionDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-900 outline-none focus:border-[#001f5b] focus:ring-1 focus:ring-[#001f5b] transition-all shadow-2xs cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The actual calendar date this financial transaction took place with the client.
              </p>
            </div>

            {/* Non-Editable System Entry Timestamp */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  System Entry Timestamp
                </label>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Immutable
                </span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-600 cursor-not-allowed select-none">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentLiveTime} (Auto-Captured)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                System-locked timestamp permanently recorded in the security audit ledger. Non-editable.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Type Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Transaction Direction
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'Receive' }))}
              className={`py-2.5 px-4 rounded-md text-xs font-bold transition-all border text-center cursor-pointer ${
                form.type === 'Receive'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ↓ Receive (Inflow / Deposit)
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'Send' }))}
              className={`py-2.5 px-4 rounded-md text-xs font-bold transition-all border text-center cursor-pointer ${
                form.type === 'Send'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ↑ Send (Outflow / Payout)
            </button>
          </div>
        </div>

        {/* Entity and Channel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Client / Beneficiary Entity <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.entity}
              onChange={e => setForm({ ...form, entity: e.target.value })}
              placeholder="e.g. Jean Dupont, MTN Corp, Enako Escrow"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Payment Channel
            </label>
            <select
              value={form.channel}
              onChange={e => setForm({ ...form, channel: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-colors"
            >
              {CHANNELS.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Currency & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Source Currency
            </label>
            <select
              value={form.currency}
              onChange={e => handleCurrencyChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs text-slate-900 font-semibold outline-none focus:border-[#001f5b] focus:bg-white transition-colors"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Amount ({form.currency}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formatCommaNumber(form.amount)}
              onChange={e => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs font-bold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Currency Conversion Strip (if not XAF) */}
        {form.currency !== 'XAF' && (
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Forex Conversion Details</span>
              <Link to="/app/transactions/rates" className="text-[11px] text-[#001f5b] hover:underline font-semibold">
                View Live Rates Matrix →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Buying Rate
                </label>
                <input
                  type="text"
                  value={form.buyingRate}
                  onChange={e => setForm({ ...form, buyingRate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Selling Rate
                </label>
                <input
                  type="text"
                  value={form.sellingRate}
                  onChange={e => setForm({ ...form, sellingRate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Est. XAF Valuation
                </label>
                <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-900">
                  {form.buyingAmountXaf ? `${Number(form.buyingAmountXaf).toLocaleString()} XAF` : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description / Reference Note */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Internal Note / Reference Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Add context, settlement receipt numbers, or client purpose..."
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-md text-xs text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-colors"
          />
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/transactions')}
            className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-md text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
