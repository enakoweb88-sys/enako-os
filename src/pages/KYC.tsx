import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  UserCheck, 
  FileSearch, 
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ArrowRight,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function KYC() {
  const [role, setRole] = useState<string>('ceo');
  const [verifications, setVerifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKyc, setNewKyc] = useState({
    user: '',
    level: 'Tier 1',
    risk: 'Low'
  });

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const stored = localStorage.getItem('enako_kyc');
    if (stored) {
      setVerifications(JSON.parse(stored));
    }
  }, []);

  const handleAddKyc = (e: React.FormEvent) => {
    e.preventDefault();
    const kyc = {
      ...newKyc,
      id: `KYC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    };
    const updated = [kyc, ...verifications];
    setVerifications(updated);
    localStorage.setItem('enako_kyc', JSON.stringify(updated));
    setShowAddModal(false);
    setNewKyc({ user: '', level: 'Tier 1', risk: 'Low' });
  };

  const handleStatusChange = (id: string, status: string) => {
    const updated = verifications.map(v => v.id === id ? { ...v, status } : v);
    setVerifications(updated);
    localStorage.setItem('enako_kyc', JSON.stringify(updated));
  };

  const filteredKyc = verifications.filter(v => 
    v.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: verifications.length,
    verified: verifications.filter(v => v.status === 'Approved').length,
    pending: verifications.filter(v => v.status === 'Pending').length,
    highRisk: verifications.filter(v => v.risk === 'High').length
  };

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Compliance Access Required</h2>
        <p className="text-secondary max-w-sm">KYC data and AML screening tools are restricted to compliance officers and executive nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">KYC & Compliance</h1>
          <p className="text-secondary text-base">Entity verification, AML screening, and risk assessment workflows.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowAddModal(true)}
             className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all"
           >
             New Verification
           </button>
           <div className="bg-white border border-outline-variant/30 px-6 py-2.5 rounded-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className={cn("size-2 bg-yellow-500 rounded-full", stats.pending > 0 && "animate-pulse")}></div>
                 <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{stats.pending} Awaiting</span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/30"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : '0.0'}% Approval
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', val: stats.total.toString(), icon: FileSearch, color: 'text-primary' },
          { label: 'Verified', val: stats.verified.toString(), icon: UserCheck, color: 'text-green-600' },
          { label: 'Pending', val: stats.pending.toString(), icon: Clock, color: 'text-yellow-600' },
          { label: 'High Risk', val: stats.highRisk.toString(), icon: AlertTriangle, color: 'text-error' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
            <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-primary">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="size-10 bg-surface-container rounded-xl flex items-center justify-center text-primary-container">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h3 className="text-sm font-bold text-primary">Pending Verification Queue</h3>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search case ID or entity..."
                className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container/20 w-64"
              />
            </div>
            <button className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Application Case</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Verification Level</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Risk Score</th>
                <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredKyc.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-bold text-primary">{item.user}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{item.id} • Submitted {item.date}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-surface-container-high px-3 py-1 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest">
                      {item.level}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "size-2 rounded-full",
                         item.risk === 'Low' ? "bg-green-500" : item.risk === 'Medium' ? "bg-yellow-500" : "bg-error"
                       )}></div>
                       <span className="text-xs font-bold text-primary">{item.risk} Risk</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border w-fit",
                        item.status === 'Approved' ? "bg-green-50 text-green-700 border-green-100" :
                        item.status === 'Rejected' ? "bg-red-50 text-red-700 border-red-100" :
                        "bg-yellow-50 text-yellow-700 border-yellow-100"
                     )}>
                        {item.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : 
                         item.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : 
                         <Clock className="w-3 h-3" />}
                        {item.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {item.status === 'Pending' ? (
                       <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleStatusChange(item.id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleStatusChange(item.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><XCircle className="w-4 h-4" /></button>
                       </div>
                    ) : (
                      <button className="bg-primary text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-lg">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredKyc.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary">No verification requests found.</td>
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
                <h3 className="text-lg font-bold text-primary">New Compliance Case</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleAddKyc} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Entity / Full Name</label>
                  <input required value={newKyc.user} onChange={e => setNewKyc({...newKyc, user: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. John Doe / Global Assets LLC" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Verification Tier</label>
                    <select value={newKyc.level} onChange={e => setNewKyc({...newKyc, level: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option>Tier 1 (Personal)</option>
                      <option>Tier 2 (Corporate)</option>
                      <option>Tier 3 (Institutional)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Initial Risk</label>
                    <select value={newKyc.risk} onChange={e => setNewKyc({...newKyc, risk: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4">Initiate Screening</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
