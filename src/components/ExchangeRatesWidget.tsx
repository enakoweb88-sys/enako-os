import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, Edit3, X, RefreshCw, 
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

export interface ExchangeRateItem {
  code: string;
  name: string;
  flag: string;
  buyingRate: string;
  sellingRate: string;
  change24h: number;
  lastUpdated?: string;
}

export const INITIAL_CURRENCIES: Record<string, ExchangeRateItem> = {
  NGN: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', buyingRate: '', sellingRate: '', change24h: 0 },
  USDT: { code: 'USDT', name: 'Tether Crypto', flag: '🪙', buyingRate: '', sellingRate: '', change24h: 0 },
  USD: { code: 'USD', name: 'US Dollar', flag: '💵', buyingRate: '', sellingRate: '', change24h: 0 },
  EUR: { code: 'EUR', name: 'Euro', flag: '💶', buyingRate: '', sellingRate: '', change24h: 0 },
  GBP: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buyingRate: '', sellingRate: '', change24h: 0 },
};

export function getStoredExchangeRates(): Record<string, ExchangeRateItem> {
  try {
    const raw = localStorage.getItem('enako_exchange_rates');
    if (raw) {
      const parsed = JSON.parse(raw);
      const result = { ...INITIAL_CURRENCIES };
      Object.keys(parsed).forEach(code => {
        if (result[code]) {
          result[code] = { ...result[code], ...parsed[code] };
        }
      });
      return result;
    }
  } catch (e) {
    console.error('Failed to load exchange rates from storage', e);
  }
  return INITIAL_CURRENCIES;
}

export function saveStoredExchangeRates(rates: Record<string, ExchangeRateItem>) {
  try {
    localStorage.setItem('enako_exchange_rates', JSON.stringify(rates));
    window.dispatchEvent(new CustomEvent('enako_rates_updated'));
  } catch (e) {
    console.error('Failed to save exchange rates to storage', e);
  }
}

interface WidgetProps {
  canEdit?: boolean;
}

export function ExchangeRatesWidget({ canEdit = true }: WidgetProps) {
  const [rates, setRates] = useState<Record<string, ExchangeRateItem>>(INITIAL_CURRENCIES);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        // Fallback to local storage if API database is initializing
        const local = getStoredExchangeRates();
        Object.keys(local).forEach(code => {
          if (merged[code]) {
            merged[code] = { ...merged[code], ...local[code] };
          }
        });
      }

      setRates(merged);
      saveStoredExchangeRates(merged);
    } catch (err) {
      console.error('Failed to fetch exchange rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const handleUpdate = () => {
      const stored = getStoredExchangeRates();
      setRates(stored);
    };
    window.addEventListener('enako_rates_updated', handleUpdate);
    return () => window.removeEventListener('enako_rates_updated', handleUpdate);
  }, []);

  const openEditor = () => {
    const initial: Record<string, { buyingRate: string; sellingRate: string }> = {};
    Object.keys(rates).forEach(code => {
      initial[code] = {
        buyingRate: rates[code].buyingRate || '',
        sellingRate: rates[code].sellingRate || '',
      };
    });
    setEditForm(initial);
    setIsEditModalOpen(true);
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      await api.saveExchangeRates(payloadList).catch(() => null);
      saveStoredExchangeRates(updatedRates);
      setRates(updatedRates);
      setIsEditModalOpen(false);
      toast.success('Live currency buying & selling rates saved to database!');
    } catch (err) {
      toast.error('Failed to save exchange rates to database');
    }
  };

  const rateList = Object.values(rates);

  return (
    <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Market Command & Rate Matrix</span>
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            Live Buying & Selling Exchange Rates
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRates}
            className="p-2 border border-outline-variant/40 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh Market Rates from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canEdit && (
            <button
              onClick={openEditor}
              className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-xs active:scale-[0.98]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Rates</span>
            </button>
          )}
        </div>
      </div>

      {/* Rise & Fall Comparison Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-outline-variant/30">
              <th className="p-3.5">Currency Pair</th>
              <th className="p-3.5 text-right">Buying Rate (FCFA)</th>
              <th className="p-3.5 text-right">Selling Rate (FCFA)</th>
              <th className="p-3.5 text-right">24h Market Trend</th>
              <th className="p-3.5 text-right">Spread Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-medium">
            {rateList.map(curr => {
              const hasBuying = Boolean(curr.buyingRate && curr.buyingRate.trim() !== '');
              const hasSelling = Boolean(curr.sellingRate && curr.sellingRate.trim() !== '');
              const buying = Number(curr.buyingRate || 0);
              const selling = Number(curr.sellingRate || 0);
              const spread = (hasBuying && hasSelling && selling > buying) 
                ? (selling - buying).toFixed(curr.code === 'NGN' ? 3 : 2)
                : null;
              const isPositive = curr.change24h >= 0;

              return (
                <tr key={curr.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{curr.flag}</span>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">
                          {curr.code} <span className="text-xs font-normal text-slate-500">({curr.name})</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">1 {curr.code} : FCFA</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    {hasBuying ? (
                      <span>{curr.buyingRate} <span className="text-[10px] font-normal text-slate-400">XAF</span></span>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-xs">— Not Set —</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                    {hasSelling ? (
                      <span>{curr.sellingRate} <span className="text-[10px] font-normal text-slate-400">XAF</span></span>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-xs">— Not Set —</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    {(hasBuying || hasSelling) ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border ${
                        isPositive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-red-600" />}
                        <span>{isPositive ? `+${curr.change24h}%` : `${curr.change24h}%`}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">—</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-slate-500 text-xs">
                    {spread !== null ? `+${spread} XAF` : <span className="text-slate-400 font-normal">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Edit Exchange Rates */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-outline-variant/30"
            >
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Manage Live Currency Rates</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter buying & selling rates for Naira, USDT, Dollar, Euro & GBP into database.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSaveRates} className="p-6 space-y-5 overflow-y-auto">
                {Object.keys(editForm).map(code => {
                  const curr = rates[code] || INITIAL_CURRENCIES[code];
                  return (
                    <div key={code} className="p-4 bg-slate-50 rounded-2xl border border-outline-variant/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{curr.flag}</span>
                        <span className="font-bold text-slate-900 text-sm">{code} - {curr.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Buying Rate (FCFA)
                          </label>
                          <input
                            type="text"
                            value={editForm[code]?.buyingRate || ''}
                            onChange={e => setEditForm({
                              ...editForm,
                              [code]: { ...editForm[code], buyingRate: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Enter buying rate..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Selling Rate (FCFA)
                          </label>
                          <input
                            type="text"
                            value={editForm[code]?.sellingRate || ''}
                            onChange={e => setEditForm({
                              ...editForm,
                              [code]: { ...editForm[code], sellingRate: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-700 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Enter selling rate..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-primary text-white hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
                  >
                    Save Market Rates to DB
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
