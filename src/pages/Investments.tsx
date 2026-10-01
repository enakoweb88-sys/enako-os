import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function Investments() {
  const [role, setRole] = useState<string>('ceo');
  const [investments, setInvestments] = useState<any[]>([]);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    title: '',
    category: 'Emerging Markets',
    amount: '',
    weight: '10'
  });

  useEffect(() => {
    setRole(sessionStorage.getItem('enako_user_role') || 'ceo');
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const data = await api.getInvestments();
      setInvestments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const asset = {
        ...newAsset,
        amount: Number(newAsset.amount),
        weight: Number(newAsset.weight),
        color: 'bg-slate-900'
      };
      await api.createInvestment(asset);
      setShowAllocateModal(false);
      setNewAsset({ title: '', category: 'Emerging Markets', amount: '', weight: '10' });
      loadInvestments();
    } catch (e) {
      console.error(e);
    }
  };

  const totalPortfolio = investments.reduce((acc, inv) => acc + Number(inv.amount), 0);

  if (role === 'employee' || role === 'manager') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-3 bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Strategic Assets Restricted</h2>
        <p className="text-slate-500 text-xs max-w-sm">Portfolio management and strategic asset allocation are reserved for executive stakeholders only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Investment Strategy</h1>
          <p className="text-slate-500 text-sm mt-1">Hedge, allocation, and portfolio performance metrics across global markets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAllocateModal(true)} 
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Allocate Assets
          </button>
          <button 
            onClick={loadInvestments} 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Featured Card */}
          <div className="bg-white border-2 border-slate-300 p-6 rounded-lg shadow-md text-slate-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Portfolio Value</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">${totalPortfolio.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs font-bold text-slate-700">
                <span>{investments.length > 0 ? '+4.2%' : '0.0%'} MoM</span>
              </div>
            </div>
            
            <div className="h-56 flex items-end justify-between gap-2 px-2 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              {investments.length === 0 ? (
                <span className="w-full text-center text-xs font-medium text-slate-400 self-center">No Performance Data</span>
              ) : (
                [30, 45, 25, 60, 40, 80, 55, 90, 70, 85, 65, 95].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 transition-colors rounded-t-sm"
                  />
                ))
              )}
            </div>
            <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>JAN</span><span>DEC</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm text-slate-900">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Asset Allocation</h3>
              <div className="space-y-4">
                 {investments.length === 0 ? (
                   <p className="text-xs text-center text-slate-400 py-4">No assets allocated</p>
                 ) : (
                   investments.slice(0, 4).map((asset) => (
                     <div key={asset.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-900">
                          <span>{asset.title}</span>
                          <span>{asset.weight}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-slate-800 rounded-full" style={{ width: `${asset.weight}%` }}></div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm text-slate-900">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Regional Exposure</h3>
              <div className="space-y-2.5">
                {[
                  { region: 'Northern Europe', status: 'OVERWEIGHT' },
                  { region: 'East Asia', status: 'STABLE' },
                  { region: 'MENA Region', status: 'NEUTRAL' },
                  { region: 'North America', status: 'UNDERWEIGHT' }
                ].map((reg: any) => (
                  <div key={reg.region} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
                    <span className="text-xs font-semibold text-slate-800">{reg.region}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{reg.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Available Capital Card (Pure White) */}
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm text-slate-900">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Available Capital</span>
            <p className="text-3xl font-extrabold text-slate-900 mb-6">$2.4M USD</p>
            <button 
              onClick={() => setShowAllocateModal(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Allocate Assets
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm text-slate-900">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Diversification</h3>
            <div className="space-y-4">
              {investments.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-4">No recent activity</p>
              ) : (
                investments.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-start justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.category} • {new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900">${Number(item.amount).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Allocate Modal */}
      <AnimatePresence>
        {showAllocateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAllocateModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">Strategic Asset Allocation</h3>
                <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
              </div>
              <form onSubmit={handleAllocate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Asset Name</label>
                  <input required value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="e.g. S&P 500 ETF" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Amount (USD)</label>
                    <input required type="number" value={newAsset.amount} onChange={e => setNewAsset({...newAsset, amount: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Portfolio Weight (%)</label>
                    <input required type="number" value={newAsset.weight} onChange={e => setNewAsset({...newAsset, weight: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="0" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 transition-colors shadow-sm">
                  Commit Allocation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
