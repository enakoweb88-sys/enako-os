import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  Wallet,
  Globe,
  CircleDollarSign,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

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
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const stored = localStorage.getItem('enako_investments');
    if (stored) {
      setInvestments(JSON.parse(stored));
    }
  }, []);

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = {
      ...newAsset,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: '$' + parseInt(newAsset.amount).toLocaleString(),
      weight: newAsset.weight + '%',
      color: 'bg-primary'
    };
    const updated = [asset, ...investments];
    setInvestments(updated);
    localStorage.setItem('enako_investments', JSON.stringify(updated));
    setShowAllocateModal(false);
    setNewAsset({ title: '', category: 'Emerging Markets', amount: '', weight: '10' });
  };

  const totalPortfolio = investments.reduce((acc, inv) => acc + parseInt(inv.amount.replace(/[$,]/g, '')), 0);

  if (role === 'employee' || role === 'manager') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <TrendingUp className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Strategic Assets Restricted</h2>
        <p className="text-secondary max-w-sm">Portfolio management and strategic asset allocation are reserved for executive stakeholders only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Investment Strategy</h1>
        <p className="text-secondary text-base">Hedge, allocation, and portfolio performance metrics across global markets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-primary-container rounded-2xl flex items-center justify-center text-white">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Total Portfolio Value</p>
                  <p className="text-3xl font-display font-bold text-primary">${totalPortfolio.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-xl flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-secondary">{investments.length > 0 ? '+4.2%' : '0.0%'} MoM</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-4 mb-4">
              {investments.length === 0 ? (
                <span className="w-full text-center text-[10px] font-bold text-secondary uppercase tracking-widest self-center">No Performance Data</span>
              ) : (
                [30, 45, 25, 60, 40, 80, 55, 90, 70, 85, 65, 95].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-primary/10 hover:bg-primary/30 transition-colors rounded-t-sm"
                  />
                ))
              )}
            </div>
            <div className="flex justify-between px-4 text-[10px] font-bold text-secondary uppercase tracking-widest">
              <span>JAN</span><span>DEC</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Asset Allocation</h3>
              <div className="space-y-4">
                 {investments.length === 0 ? (
                   <p className="text-[10px] text-center text-secondary py-4 uppercase font-bold tracking-widest">No assets allocated</p>
                 ) : (
                   investments.slice(0, 4).map((asset) => (
                     <div key={asset.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-primary">
                          <span>{asset.title}</span>
                          <span>{asset.weight}</span>
                        </div>
                        <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", asset.color)} style={{ width: asset.weight }}></div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
            </div>

            <div className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Regional Exposure</h3>
              <div className="space-y-4">
                {[
                  { region: 'Northern Europe', status: 'OVERWEIGHT', icon: Globe },
                  { region: 'East Asia', status: 'STABLE', icon: Globe },
                  { region: 'MENA Region', status: 'NEUTRAL', icon: Globe },
                  { region: 'North America', status: 'UNDERWEIGHT', icon: Globe }
                ].map((reg: any) => (
                  <div key={reg.region} className="flex items-center justify-between p-3 border border-outline-variant/10 rounded-2xl hover:bg-surface-container-low transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <reg.icon className="w-4 h-4 text-primary-container" />
                      <span className="text-sm font-bold text-primary">{reg.region}</span>
                    </div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">{reg.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-primary text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[10px] font-bold text-primary-fixed/60 uppercase tracking-[0.2em] mb-2">Available Capital</p>
            <p className="text-4xl font-display font-bold mb-8">$2.4M</p>
            <button 
              onClick={() => setShowAllocateModal(true)}
              className="w-full py-4 bg-white text-primary rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary-fixed transition-all"
            >
              Allocate Assets
            </button>
          </div>

          <div className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Recent Diversification</h3>
            <div className="space-y-6">
              {investments.length === 0 ? (
                <p className="text-[10px] text-center text-secondary py-4 uppercase font-bold tracking-widest">No recent activity</p>
              ) : (
                investments.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="size-10 bg-surface-container rounded-xl flex items-center justify-center">
                         <CircleDollarSign className="w-5 h-5 text-primary-container" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">{item.title}</p>
                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{item.category} • {item.date}</p>
                      </div>
                    </div>
                    <p className="text-xs font-mono font-bold text-primary">{item.amount}</p>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-8 py-3 border border-outline-variant/20 text-secondary hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              View Strategy Map
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAllocateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAllocateModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Strategic Asset Allocation</h3>
                <button onClick={() => setShowAllocateModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleAllocate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Asset Name</label>
                  <input required value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. S&P 500 ETF" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount (USD)</label>
                    <input required type="number" value={newAsset.amount} onChange={e => setNewAsset({...newAsset, amount: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Portfolio Weight (%)</label>
                    <input required type="number" value={newAsset.weight} onChange={e => setNewAsset({...newAsset, weight: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4">Commit Allocation</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
