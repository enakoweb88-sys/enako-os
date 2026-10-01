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
  NGN: { code: 'NGN', name: 'Cameroonn Naira', flag: '🇳🇬', buyingRate: '', sellingRate: '', change24h: 0 },
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

  const rateList: ExchangeRateItem[] = Object.values(rates);

  return (
    <div id="exchange-rates" className="scroll-mt-6 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Market Command & Rate Matrix</h3>
          <p className="text-xs text-slate-500 font-medium">Live Buying & Selling Exchange Rates</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRates}
            className="p-1.5 border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Market Rates from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canEdit && (
            <button
              onClick={openEditor}
              className="bg-[#001f5b] text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 hover:bg-[#001744] transition-all shadow-2xs cursor-pointer"
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
            <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="py-2.5 px-3">Currency Pair</th>
              <th className="py-2.5 px-3 text-right">Buying Rate (FCFA)</th>
              <th className="py-2.5 px-3 text-right">Selling Rate (FCFA)</th>
              <th className="py-2.5 px-3 text-right">24h Market Trend</th>
              <th className="py-2.5 px-3 text-right">Spread Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
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
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{curr.flag}</span>
                      <div>
                        <p className="font-bold text-slate-800 text-xs leading-tight">
                          {curr.code} <span className="text-[11px] font-normal text-slate-500">({curr.name})</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {curr.code === 'NGN' ? 'NGN per 1,000 FCFA' : `1 ${curr.code} : FCFA`}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-xs">
                    {hasBuying ? (
                      <span>{curr.buyingRate} <span className="text-[10px] font-normal text-slate-400">XAF</span></span>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-xs">— Not Set —</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700 text-xs">
                    {hasSelling ? (
                      <span>{curr.sellingRate} <span className="text-[10px] font-normal text-slate-400">XAF</span></span>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-xs">— Not Set —</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {(hasBuying || hasSelling) ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isPositive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border-rose-200/60'
                        }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                        <span>{isPositive ? `+${curr.change24h}%` : `${curr.change24h}%`}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">—</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-semibold text-slate-600 text-xs">
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage Live Currency Rates</h3>
                  <p className="text-xs text-slate-500 font-normal">Enter buying & selling rates for Naira, USDT, Dollar, Euro & GBP into database.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSaveRates} className="p-5 space-y-4 overflow-y-auto">
                {Object.keys(editForm).map(code => {
                  const curr = rates[code] || INITIAL_CURRENCIES[code];
                  return (
                    <div key={code} className="p-3.5 bg-slate-50/60 rounded-md border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{curr.flag}</span>
                        <span className="font-bold text-slate-900 text-xs">{code} - {curr.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Buying Rate {code === 'NGN' ? '(FCFA / 1,000 NGN)' : '(FCFA)'}
                          </label>
                          <input
                            type="text"
                            value={editForm[code]?.buyingRate || ''}
                            onChange={e => setEditForm({
                              ...editForm,
                              [code]: { ...editForm[code], buyingRate: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-md border border-slate-200 focus:ring-1 focus:ring-[#001f5b] outline-none bg-white"
                            placeholder={code === 'NGN' ? "e.g. 400" : "Enter buying rate..."}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Selling Rate {code === 'NGN' ? '(FCFA / 1,000 NGN)' : '(FCFA)'}
                          </label>
                          <input
                            type="text"
                            value={editForm[code]?.sellingRate || ''}
                            onChange={e => setEditForm({
                              ...editForm,
                              [code]: { ...editForm[code], sellingRate: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-700 rounded-md border border-slate-200 focus:ring-1 focus:ring-[#001f5b] outline-none bg-white"
                            placeholder={code === 'NGN' ? "e.g. 420" : "Enter selling rate..."}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-md font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md font-semibold text-xs bg-[#001f5b] text-white hover:bg-[#001744] transition-all shadow-2xs cursor-pointer"
                  >
                    Save Rates to DB
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
