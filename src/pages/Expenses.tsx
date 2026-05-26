import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudUpload, 
  Plus, 
  TrendingUp, 
  Search, 
  FileText, 
  MoreVertical,
  CircleCheck,
  ExternalLink,
  ClipboardCheck,
  XCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Expenses() {
  const [role, setRole] = useState<string>('ceo');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Travel',
    amount: '',
    receipt: null as File | null
  });

  const userName = localStorage.getItem('enako_user_name') || 'Executive';

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const stored = localStorage.getItem('enako_expenses');
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const exp = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      employee: userName,
      description: newExpense.description,
      category: newExpense.category,
      amount: '$' + parseFloat(newExpense.amount).toLocaleString(),
      status: 'Pending'
    };
    const updated = [exp, ...expenses];
    setExpenses(updated);
    localStorage.setItem('enako_expenses', JSON.stringify(updated));
    setShowAddModal(false);
    setNewExpense({ description: '', category: 'Travel', amount: '', receipt: null });
  };

  const handleStatusChange = (id: number, status: string) => {
    const updated = expenses.map(e => e.id === id ? { ...e, status } : e);
    setExpenses(updated);
    localStorage.setItem('enako_expenses', JSON.stringify(updated));
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = expenses
    .filter(e => e.status === 'Approved')
    .reduce((acc, e) => acc + parseFloat(e.amount.replace(/[$,]/g, '')), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl font-bold text-primary mb-2">
            {role === 'employee' ? 'My Expenses' : 'Expense Management'}
          </h1>
          <p className="text-secondary text-base">
            {role === 'employee' ? 'Track your reimbursements and corporate spending.' : 'Review and reconcile corporate spending for the current cycle.'}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border border-outline-variant bg-white px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container transition-all">
            <CloudUpload className="w-5 h-5 text-primary" />
            Upload Receipt
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Expense
          </button>
        </div>
      </div>

      {/* Bento Grid: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 grid grid-cols-1 gap-8">
          {/* Total Card */}
          <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                {role === 'employee' ? 'My Total This Month' : 'Enterprise Total MTD'}
              </span>
              <CircleCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="font-mono text-4xl text-primary tracking-tight font-bold">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-2 text-primary font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>0% from last month</span>
            </div>
          </div>

          {/* Budget Card */}
          <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                {role === 'employee' ? 'Personal Allowance' : 'Operating Budget'}
              </span>
              <FileText className="w-5 h-5 text-on-primary-container" />
            </div>
            <div className="font-mono text-4xl text-primary tracking-tight font-bold">
              {role === 'employee' ? `$${totalSpent.toLocaleString()} / $5,000` : `$${(250000 - totalSpent).toLocaleString()} left`}
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: role === 'employee' ? `${(totalSpent / 5000) * 100}%` : `${(totalSpent / 250000) * 100}%` }}
                className="bg-primary-container h-full rounded-full"
              />
            </div>
            <div className="mt-2 text-sm text-secondary font-medium">
              {role === 'employee' ? `${Math.round((totalSpent / 5000) * 100)}% of allowance used` : `${Math.round((totalSpent / 250000) * 100)}% of total budget used`}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="md:col-span-8 bg-white border border-outline-variant/30 p-8 rounded-xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-secondary">Spending Trends</h3>
            <span className="text-secondary text-[12px] font-bold">Last 6 Months</span>
          </div>
          <div className="flex-grow flex items-end justify-between gap-4 h-48 px-4">
            {[20, 50, 30, 80, 45, 60].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={cn(
                  "flex-1 relative rounded-t-sm transition-colors",
                  "bg-surface-container-high hover:bg-primary-container/50"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] text-secondary font-bold uppercase tracking-widest px-4 font-mono">
            <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="font-display text-2xl font-bold text-primary">Transaction History</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-container transition-all outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Date</th>
                {role !== 'employee' && <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Employee</th>}
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Description</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Category</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Amount</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredExpenses.map((t) => (
                <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-4 font-mono text-sm text-secondary">{t.date}</td>
                  {role !== 'employee' && <td className="px-8 py-4 font-bold text-primary text-sm">{t.employee}</td>}
                  <td className="px-8 py-4 font-bold text-primary">{t.description}</td>
                  <td className="px-8 py-4">
                    <span className="bg-surface-container-high px-2 py-1 rounded text-[11px] font-bold text-secondary uppercase tracking-wider">{t.category}</span>
                  </td>
                  <td className="px-8 py-4 font-mono font-bold text-primary">{t.amount}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      t.status === 'Approved' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    )}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                       {role !== 'employee' && t.status === 'Pending' ? (
                         <>
                           <button onClick={() => handleStatusChange(t.id, 'Approved')} className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"><ClipboardCheck className="w-5 h-5" /></button>
                           <button onClick={() => handleStatusChange(t.id, 'Rejected')} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><XCircle className="w-5 h-5" /></button>
                         </>
                       ) : (
                         <button className="text-secondary hover:text-primary transition-colors">
                           <ExternalLink className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-secondary text-sm">No expenses found for this selection.</td>
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
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">New Expense Claim</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Description</label>
                  <input required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Flight to London Node" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Amount (USD)</label>
                    <input required type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Category</label>
                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option>Travel</option>
                      <option>Hardware</option>
                      <option>Software</option>
                      <option>Welfare</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4">Submit Claim</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
