import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, TrendingDown, DollarSign, Edit3, X, Check, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Layers, Lock, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export interface ExchangeRateItem {
  code: string;
  name: string;
  flag: string;
  buyingRate: string;
  sellingRate: string;
  change24h: number;
  lastUpdated: string;
}

export const DEFAULT_EXCHANGE_RATES: Record<string, ExchangeRateItem> = {
  NGN: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', buyingRate: '0.38', sellingRate: '0.42', change24h: 1.2, lastUpdated: new Date().toISOString() },
  USDT: { code: 'USDT', name: 'Tether Crypto', flag: '🪙', buyingRate: '610', sellingRate: '628', change24h: 0.8, lastUpdated: new Date().toISOString() },
  USD: { code: 'USD', name: 'US Dollar', flag: '💵', buyingRate: '600', sellingRate: '620', change24h: -0.5, lastUpdated: new Date().toISOString() },
  EUR: { code: 'EUR', name: 'Euro', flag: '💶', buyingRate: '650', sellingRate: '670', change24h: 0.4, lastUpdated: new Date().toISOString() },
  GBP: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', buyingRate: '770', sellingRate: '795', change24h: -0.2, lastUpdated: new Date().toISOString() },
};

export function getStoredExchangeRates(): Record<string, ExchangeRateItem> {
  try {
    const raw = localStorage.getItem('enako_exchange_rates');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_EXCHANGE_RATES, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load exchange rates from storage', e);
  }
  return DEFAULT_EXCHANGE_RATES;
}

export function saveStoredExchangeRates(rates: Record<string, ExchangeRateItem>) {
  try {
    localStorage.setItem('enako_exchange_rates', JSON.stringify(rates));
    window.dispatchEvent(new CustomEvent('enako_rates_updated'));
  } catch (e) {
    console.error('Failed to save exchange rates', e);
  }
}

interface WidgetProps {
  canEdit?: boolean;
}

export function ExchangeRatesWidget({ canEdit = true }: WidgetProps) {
  const [rates, setRates] = useState<Record<string, ExchangeRateItem>>(getStoredExchangeRates());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, { buyingRate: string; sellingRate: string }>>({});

  const refreshRates = () => {
    setRates(getStoredExchangeRates());
  };

  useEffect(() => {
    refreshRates();
    const handleUpdate = () => refreshRates();
    window.addEventListener('enako_rates_updated', handleUpdate);
    return () => window.removeEventListener('enako_rates_updated', handleUpdate);
  }, []);

  const openEditor = () => {
    const initial: Record<string, { buyingRate: string; sellingRate: string }> = {};
    Object.keys(rates).forEach(code => {
      initial[code] = {
        buyingRate: rates[code].buyingRate,
        sellingRate: rates[code].sellingRate,
      };
    });
    setEditForm(initial);
    setIsEditModalOpen(true);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRates: Record<string, ExchangeRateItem> = { ...rates };

    Object.keys(editForm).forEach(code => {
      if (updatedRates[code]) {
        updatedRates[code] = {
          ...updatedRates[code],
          buyingRate: editForm[code].buyingRate || updatedRates[code].buyingRate,
          sellingRate: editForm[code].sellingRate || updatedRates[code].sellingRate,
          lastUpdated: new Date().toISOString(),
        };
      }
    });

    saveStoredExchangeRates(updatedRates);
    setRates(updatedRates);
    setIsEditModalOpen(false);
    toast.success('Live currency buying & selling rates updated successfully!');
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
            onClick={refreshRates}
            className="p-2 border border-outline-variant/40 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh Market Rates"
          >
            <RefreshCw className="w-4 h-4" />
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
              const buying = Number(curr.buyingRate);
              const selling = Number(curr.sellingRate);
              const spread = (selling - buying).toFixed(curr.code === 'NGN' ? 3 : 2);
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
                    {curr.buyingRate} <span className="text-[10px] font-normal text-slate-400">XAF</span>
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                    {curr.sellingRate} <span className="text-[10px] font-normal text-slate-400">XAF</span>
                  </td>

                  <td className="p-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border ${
                      isPositive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-red-600" />}
                      <span>{isPositive ? `+${curr.change24h}%` : `${curr.change24h}%`}</span>
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-slate-500 text-xs">
                    +{spread} XAF
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
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-outline-variant/30"
            >
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Manage Live Currency Rates</h3>
                  <p className="text-xs text-slate-500 font-medium">Update buying & selling exchange rates for Naira, USDT, Dollar, Euro & GBP.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSaveRates} className="p-6 space-y-5 overflow-y-auto">
                {Object.keys(editForm).map(code => {
                  const curr = rates[code] || DEFAULT_EXCHANGE_RATES[code];
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
                            placeholder="e.g. 0.38"
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
                            placeholder="e.g. 0.42"
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
                    Save Market Rates
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
