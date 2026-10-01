import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import {
  INITIAL_CURRENCIES,
  ExchangeRateItem,
  getStoredExchangeRates,
  saveStoredExchangeRates
} from '../components/ExchangeRatesWidget';

export default function UpdateRatesPage() {
  const navigate = useNavigate();
  const [rates, setRates] = useState<Record<string, ExchangeRateItem>>(INITIAL_CURRENCIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, { buyingRate: string; sellingRate: string }>>({});

  const fetchRates = async () => {
    setLoading(true);
    try {
      const dbRates = await api.getExchangeRates().catch(() => null);
      const merged = { ...INITIAL_CURRENCIES };

      if (Array.isArray(dbRates) && dbRates.length > 0) {
        dbRates.forEach((item: any) => {
          if (merged[item.code]) {
            merged[item.code] = {
              ...merged[item.code],
              buyingRate: item.buyingRate || '',
              sellingRate: item.sellingRate || '',
              change24h: item.change24h ?? 0,
              lastUpdated: item.updatedAt,
            };
          }
        });
      } else {
        const local = getStoredExchangeRates();
        Object.keys(local).forEach(code => {
          if (merged[code]) {
            merged[code] = { ...merged[code], ...local[code] };
          }
        });
      }

      setRates(merged);
      const initial: Record<string, { buyingRate: string; sellingRate: string }> = {};
      Object.keys(merged).forEach(code => {
        initial[code] = {
          buyingRate: merged[code].buyingRate || '',
          sellingRate: merged[code].sellingRate || '',
        };
      });
      setEditForm(initial);
    } catch (err) {
      console.error('Failed to fetch exchange rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedRates: Record<string, ExchangeRateItem> = { ...rates };
      const payloadList: any[] = [];

      Object.keys(editForm).forEach(code => {
        if (updatedRates[code]) {
          const buyingRate = editForm[code].buyingRate.trim();
          const sellingRate = editForm[code].sellingRate.trim();

          updatedRates[code] = {
            ...updatedRates[code],
            buyingRate,
            sellingRate,
            lastUpdated: new Date().toISOString(),
          };

          payloadList.push({
            code,
            name: updatedRates[code].name,
            flag: updatedRates[code].flag,
            buyingRate,
            sellingRate,
            change24h: updatedRates[code].change24h,
          });
        }
      });

      setRates(updatedRates);
      saveStoredExchangeRates(updatedRates);

      if (api.setExchangeRates) {
        await api.setExchangeRates(payloadList).catch(err => {
          console.warn('API sync warning:', err);
        });
      }

      toast.success('Live currency buying & selling exchange rates saved successfully');
      navigate('/app/transactions');
    } catch (err) {
      toast.error('Failed to save exchange rates');
    } finally {
      setSaving(false);
    }
  };

  const rateList: ExchangeRateItem[] = Object.values(rates);

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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Update Exchange Rates</h1>
            <p className="text-xs text-slate-500 font-medium">Configure live market buying and selling rates for Naira, USDT, Dollar, Euro & GBP</p>
          </div>
        </div>

        <button
          onClick={fetchRates}
          className="p-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
          title="Refresh Rates"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Rates Form Card */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-2xs space-y-6">
        <div className="space-y-4">
          {rateList.map(curr => {
            const buying = Number(editForm[curr.code]?.buyingRate || 0);
            const selling = Number(editForm[curr.code]?.sellingRate || 0);
            const spread = (selling > buying && buying > 0)
              ? (selling - buying).toFixed(curr.code === 'NGN' ? 3 : 2)
              : null;

            return (
              <div
                key={curr.code}
                className="p-4 bg-slate-50/60 rounded-md border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Currency Label */}
                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <span className="text-2xl leading-none">{curr.flag}</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs leading-tight">
                      {curr.code} <span className="text-[11px] font-normal text-slate-500">({curr.name})</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {curr.code === 'NGN' ? 'NGN per 1,000 FCFA' : `1 ${curr.code} : FCFA`}
                    </p>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-md">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Buying Rate {curr.code === 'NGN' ? '(FCFA / 1,000 NGN)' : '(FCFA)'}
                    </label>
                    <input
                      type="text"
                      value={editForm[curr.code]?.buyingRate || ''}
                      onChange={e => setEditForm({
                        ...editForm,
                        [curr.code]: { ...editForm[curr.code], buyingRate: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 rounded-md border border-slate-200 focus:ring-1 focus:ring-[#001f5b] outline-none bg-white"
                      placeholder={curr.code === 'NGN' ? "e.g. 400" : "Enter buying rate..."}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Selling Rate {curr.code === 'NGN' ? '(FCFA / 1,000 NGN)' : '(FCFA)'}
                    </label>
                    <input
                      type="text"
                      value={editForm[curr.code]?.sellingRate || ''}
                      onChange={e => setEditForm({
                        ...editForm,
                        [curr.code]: { ...editForm[curr.code], sellingRate: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-xs font-bold text-emerald-700 rounded-md border border-slate-200 focus:ring-1 focus:ring-[#001f5b] outline-none bg-white"
                      placeholder={curr.code === 'NGN' ? "e.g. 420" : "Enter selling rate..."}
                    />
                  </div>
                </div>

                {/* Spread Margin Preview */}
                <div className="sm:text-right shrink-0 sm:w-28">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spread Margin</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {spread !== null ? `+${spread} XAF` : '—'}
                  </p>
                </div>
              </div>
            );
          })}
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
            disabled={saving}
            className="px-5 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-md text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Exchange Rates'}
          </button>
        </div>
      </form>
    </div>
  );
}
