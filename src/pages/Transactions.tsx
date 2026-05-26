import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  CreditCard,
  X,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Transactions() {
  const [role, setRole] = useState<string>('ceo');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTx, setNewTx] = useState({
    entity: '',
    type: 'Corporate',
    method: 'SWIFT Transfer',
    status: 'Settled',
    amount: '',
    isIncoming: true
  });

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const stored = localStorage.getItem('enako_transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const tx = {
      ...newTx,
      id,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: (newTx.isIncoming ? '+' : '-') + '$' + parseFloat(newTx.amount).toLocaleString()
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('enako_transactions', JSON.stringify(updated));
    setShowAddModal(false);
    setNewTx({
      entity: '',
      type: 'Corporate',
      method: 'SWIFT Transfer',
      status: 'Settled',
      amount: '',
      isIncoming: true
    });
  };

  const filteredTx = transactions.filter(tx => 
    tx.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const settledToday = transactions
    .filter(tx => tx.status === 'Settled' && !tx.amount.startsWith('-'))
    .reduce((acc, tx) => acc + parseFloat(tx.amount.replace(/[+$ ,]/g, '')), 0);

  const pendingAuth = transactions
    .filter(tx => tx.status === 'Pending')
    .reduce((acc, tx) => acc + parseFloat(tx.amount.replace(/[+$ ,-]/g, '')), 0);

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <CreditCard className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Financial Ledger Locked</h2>
        <p className="text-secondary max-w-sm">Global ledger access is restricted to financial controllers and executive members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Ledger & Settlements</h1>
          <p className="text-secondary text-base">Real-time monitoring of global capital movement and multi-currency settlement logs.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 border border-outline-variant bg-white text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">
            <Download className="w-4 h-4 inline mr-2" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all"
          >
            New Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Settled Today', val: '$' + settledToday.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Pending Auth', val: '$' + pendingAuth.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: Clock, color: 'text-primary-container' },
          { label: 'Risk Flagged', val: transactions.some(t => t.status === 'Flagged') ? '$' + transactions.filter(t => t.status === 'Flagged').reduce((a, t) => a + parseFloat(t.amount.replace(/[+$ ,-]/g, '')), 0).toLocaleString() : '$0.00', icon: AlertCircle, color: 'text-error' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <p className="text-3xl font-display font-bold text-primary">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-outline-variant/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">Transaction History</h3>
              <div className="h-4 w-[1px] bg-outline-variant/30"></div>
              <div className="flex gap-2">
                 <button className="text-[10px] font-bold text-primary-container border-b-2 border-primary-container pb-1 tracking-widest uppercase">All Logs</button>
                 <button className="text-[10px] font-bold text-secondary hover:text-primary tracking-widest uppercase pb-1 transition-colors">Inbound</button>
                 <button className="text-[10px] font-bold text-secondary hover:text-primary tracking-widest uppercase pb-1 transition-colors">Outbound</button>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                 <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container/20 w-64" 
                  placeholder="Search hash, entity..." 
                 />
              </div>
              <button className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
                 <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">ID & Entity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Method</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center",
                        tx.amount.startsWith('+') ? "bg-green-50 text-green-600" : "bg-primary-container text-white"
                      )}>
                        {tx.amount.startsWith('+') ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{tx.entity}</p>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{tx.id} • {tx.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-outline" />
                      <span className="text-xs font-medium text-primary">{tx.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        tx.status === 'Settled' ? "bg-green-50 text-green-700 border-green-100" : 
                        tx.status === 'Flagged' ? "bg-red-50 text-red-700 border-red-100" : 
                        "bg-yellow-50 text-yellow-700 border-yellow-100"
                     )}>{tx.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className={cn(
                      "font-mono font-bold text-sm",
                      tx.amount.startsWith('+') ? "text-green-600" : "text-primary"
                    )}>{tx.amount}</p>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter mt-1">{tx.date}</p>
                  </td>
                </tr>
              ))}
              {filteredTx.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm text-secondary">No transactions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary">New Settlement Log</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleAddTx} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Entity / Customer</label>
                  <input required value={newTx.entity} onChange={e => setNewTx({...newTx, entity: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Acme Corp" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount (USD)</label>
                    <input required type="number" step="0.01" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Direction</label>
                    <select value={newTx.isIncoming ? 'in' : 'out'} onChange={e => setNewTx({...newTx, isIncoming: e.target.value === 'in'})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option value="in">Inbound (+)</option>
                      <option value="out">Outbound (-)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4">Commit Transaction</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
