import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Plus, 
  Download, 
  TrendingUp, 
  CreditCard, 
  Wallet, 
  Repeat,
  CircleAlert,
  Megaphone,
  Briefcase,
  ChevronRight,
  Users,
  Utensils,
  ClipboardCheck,
  Activity,
  History,
  Zap,
  Calendar,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';

const stats = [
  { label: 'Total Company Revenue', value: '$0.00', change: '0%', trend: 'neutral', icon: CreditCard, color: 'primary' },
  { label: 'Total Expenses', value: '$0.00', change: '0%', trend: 'neutral', icon: Wallet, color: 'secondary' },
  { label: 'Net Profit Margin', value: '$0.00', change: '0%', trend: 'neutral', icon: TrendingUp, color: 'tertiary' },
  { label: 'Transaction Volume', value: '0', change: '0%', trend: 'neutral', icon: Repeat, color: 'primary-container' },
];

const transactions: any[] = [];

export default function Dashboard() {
  const [role, setRole] = useState<string>('ceo');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const savedRole = localStorage.getItem('enako_user_role') || 'ceo';
    const savedName = localStorage.getItem('enako_user_name') || 'Executive';
    setRole(savedRole);
    setUserName(savedName);
  }, []);

  const renderDashboard = () => {
    switch (role) {
      case 'ceo':
        return <CEODashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <CEODashboard />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary">
            {role === 'ceo' ? 'Enterprise Command Center' : 
             role === 'manager' ? 'Department Operations' : 'My Workspace'}
          </h2>
          <p className="text-secondary text-base">
            Welcome back, <span className="text-primary font-bold">{userName}</span>. System status is nominal.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-outline-variant text-secondary rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-surface-container transition-all">
            <Download className="w-4 h-4 inline mr-2" />
            Download Report
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm hover:scale-[0.98] transition-transform">
            <Plus className="w-4 h-4 inline mr-2" />
            {role === 'employee' ? 'New Request' : 'Create Initiative'}
          </button>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}

function RealtimeTransactionFeed() {
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    // Lead time feed disabled - connect to live data source
    return () => {};
  }, []);

  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-primary">Live Settlement Feed</h3>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">Real-time Network Activity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-black text-green-600 tracking-widest uppercase">Nodes Online</span>
          </div>
          <div className="w-[1px] h-4 bg-outline-variant/30"></div>
          <span className="text-[10px] font-black text-secondary tracking-widest uppercase">Region: Global</span>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feed.map((tx, idx) => (
          <motion.div 
            key={tx.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col justify-between p-4 bg-surface-container-low/30 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all group relative overflow-hidden h-[120px]"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-opacity">
               <Activity className="w-12 h-12 text-primary" />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex gap-3">
                <div className="size-8 rounded-lg bg-white border border-outline-variant/20 flex items-center justify-center shrink-0 group-hover:bg-primary-fixed group-hover:text-primary transition-colors">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-primary truncate max-w-[120px]">{tx.entity}</p>
                  <p className="text-[9px] font-bold text-secondary uppercase tracking-widest truncate">{tx.type}</p>
                </div>
              </div>
              <span className={cn(
                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                tx.status === 'SETTLED' ? "bg-green-50 text-green-700" : "bg-primary-fixed text-primary"
              )}>{tx.status}</span>
            </div>

            <div className="flex justify-between items-end mt-4 relative z-10">
              <div>
                <p className="text-[9px] text-outline font-bold uppercase tracking-tighter mb-0.5">{tx.time}</p>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-3 h-1 bg-primary/10 rounded-full">
                       <motion.div 
                         animate={{ opacity: [0.2, 1, 0.2] }} 
                         transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                         className="h-full bg-primary/30 rounded-full" 
                       />
                    </div>
                  ))}
                </div>
              </div>
              <p className={cn(
                "text-lg font-mono font-bold tracking-tighter leading-none",
                tx.amount.startsWith('+') ? "text-green-600" : "text-primary"
              )}>{tx.amount}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CEODashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2 rounded-lg",
                stat.color === 'primary' ? "bg-primary-fixed" : 
                stat.color === 'secondary' ? "bg-secondary-container" : "bg-tertiary-fixed"
              )}>
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold",
                stat.trend === 'up' ? "text-green-600 bg-green-50" : "text-secondary bg-surface-container"
              )}>{stat.change}</span>
            </div>
            <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-mono text-primary">{stat.value}</p>
            <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '0%' }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Financial Trajectory */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <h3 className="font-display text-xl font-bold text-primary">Financial Trajectory</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full relative flex items-center justify-center border-b border-l border-outline-variant/20 pb-4 pl-4">
             <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Awaiting Financial Ingestion</span>
          </div>
        </div>

        {/* Portfolio Growth */}
        <Link to="/app/investments" className="col-span-12 lg:col-span-4 bg-primary text-white rounded-xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between group transition-all hover:scale-[1.01] hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
          <div className="relative z-10">
            <h3 className="font-display text-2xl font-bold mb-8">Portfolio Growth</h3>
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">CASH RESERVE</p>
                <p className="text-3xl font-mono font-bold">$0.00</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg backdrop-blur-md border border-white/5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">ROI (YTD)</p>
                  <p className="text-xl font-bold text-white">0.00%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-white/20" />
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
            <p className="text-[12px] mb-4 text-white/60 uppercase tracking-widest font-bold font-display">Asset Allocation</p>
            <div className="flex h-2 rounded-full overflow-hidden w-full bg-white/10">
              <div className="h-full bg-primary-fixed w-[0%]"></div>
              <div className="h-full bg-tertiary-fixed w-[0%]"></div>
              <div className="h-full bg-outline-variant w-[0%]"></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-fixed"></div><span className="text-[10px] font-bold uppercase tracking-wider text-white/80">T-Bills</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-tertiary-fixed"></div><span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Equity</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-outline-variant"></div><span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Cash</span></div>
            </div>
          </div>
        </Link>

        {/* Global Ledger */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-display text-xl font-bold text-primary">Global Ledger</h3>
            <Link to="/app/transactions" className="text-on-primary-container text-[11px] font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
              View All Settlements
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Entity / Counterparty</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-secondary text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{t.entity}</p>
                        <p className="text-[11px] text-secondary uppercase tracking-wider mt-0.5">{t.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        t.status === 'PAID' || t.status === 'SETTLED' ? "bg-green-50 text-green-700" : "bg-primary-fixed text-primary"
                      )}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={cn(
                        "font-mono font-bold text-sm",
                        t.amount.startsWith('-') ? "text-primary" : "text-green-600"
                      )}>{t.amount}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Transaction Feed */}
        <div className="col-span-12 lg:col-span-12">
          <RealtimeTransactionFeed />
        </div>

        {/* Announcements & Decisions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Link to="/app/announcements" className="block bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:border-primary transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary">
                <Megaphone className="w-6 h-6" />
                <h3 className="font-display text-xl font-bold uppercase tracking-tight">Announcements</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-4">No active broadcasts</p>
            </div>
          </Link>

          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <CircleAlert className="w-6 h-6" />
              <h3 className="font-display text-xl font-bold">Pending Decisions</h3>
            </div>
            <div className="space-y-3">
               <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-4">All decisions cleared</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const managerStats = [
    { label: 'Department Velocity', value: '0%', icon: Zap, color: 'primary' },
    { label: 'Pending Approvals', value: '0', icon: ClipboardCheck, color: 'secondary' },
    { label: 'Budget Utilization', value: '$0.00', icon: Wallet, color: 'tertiary' },
    { label: 'Team Capacity', value: '0%', icon: Users, color: 'primary' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {managerStats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
             <div className="flex items-center gap-4 mb-4">
               <div className="p-2 bg-surface-container rounded-lg shrink-0">
                 <stat.icon className="w-5 h-5 text-primary" />
               </div>
               <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
             </div>
             <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Manager Operational Queue */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
                  <h3 className="font-display text-xl font-bold text-primary">Operational Queue</h3>
                  <div className="flex gap-2">
                     {['Urgent', 'Standard', 'Low'].map(t => (
                       <button key={t} className="px-3 py-1 bg-surface-container text-[10px] font-bold uppercase tracking-widest text-secondary rounded-full hover:bg-primary hover:text-white transition-all">{t}</button>
                     ))}
                  </div>
               </div>
               <div className="space-y-4">
                  {([] as any[]).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="size-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black text-xs">{item.node}</div>
                          <div>
                             <p className="text-sm font-bold text-primary">{item.task}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                  item.priority === 'High' ? "bg-red-50 text-red-600" : "bg-primary-fixed text-primary"
                                )}>{item.priority}</span>
                                <span className="text-[10px] text-outline uppercase font-bold">{item.time}</span>
                             </div>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
               <h3 className="font-display text-xl font-bold text-primary mb-6">Staff Performance Pulse</h3>
               <div className="h-[250px] flex items-end gap-3 px-2">
                  <div className="flex-1 flex items-center justify-center text-secondary text-[10px] font-bold uppercase">No Performance Data</div>
               </div>
               <div className="flex justify-between mt-6 px-2">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                    <span key={q} className="text-[10px] font-black text-outline uppercase tracking-widest">{q} Metrics</span>
                  ))}
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-primary text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
               <div className="absolute -top-12 -right-12 size-48 bg-white/5 rounded-full blur-2xl"></div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Manager Quick-Action</p>
                  <h3 className="font-display text-2xl font-bold mb-8">Onboarding Compliance</h3>
                  <p className="text-sm text-white/70 mb-8 leading-relaxed">System scan reveals pending security onboarding for new nodes. Execute system broadcast?</p>
                  <button className="w-full py-4 bg-white text-primary rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all active:scale-[0.98]">INITIALIZE BROADCAST</button>
               </div>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
               <h3 className="font-display text-lg font-bold text-primary mb-6">Department Status</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl">
                     <span className="text-xs font-bold text-secondary uppercase tracking-widest">Team Sync</span>
                     <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl">
                     <span className="text-xs font-bold text-secondary uppercase tracking-widest">Active Assets</span>
                     <span className="text-[10px] font-black text-primary bg-primary-fixed px-2 py-0.5 rounded">0 UNITS</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl">
                     <span className="text-xs font-bold text-secondary uppercase tracking-widest">Risk Level</span>
                     <span className="text-[10px] font-black text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">NOMINAL</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const employeeStats = [
    { label: 'Available Meal Credit', value: '$0.00', icon: Utensils, color: 'primary' },
    { label: 'Pending Reimbursements', value: '$0.00', icon: Wallet, color: 'secondary' },
    { label: 'Task Completion', value: '0%', icon: ClipboardCheck, color: 'tertiary' },
    { label: 'Active Goals', value: '0/0', icon: Target, color: 'primary-container' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employeeStats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm"
          >
             <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
             <div className="flex items-end justify-between">
                <p className="text-2xl font-bold font-display text-primary">{stat.value}</p>
                <div className="p-1.5 bg-surface-container rounded text-primary">
                  <stat.icon className="w-4 h-4" />
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-8 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-display text-xl font-bold text-primary">Assigned Task Force</h3>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">Active Operations for Q2 cycle</p>
                  </div>
                  <div className="flex items-center gap-2 text-secondary">
                     <Calendar className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">May 2024</span>
                  </div>
               </div>
               <div className="space-y-6">
                  {([] as any[]).map((log, i) => (
                    <div key={i} className="flex items-center justify-between pb-6 border-b border-outline-variant/10 last:border-0 last:pb-0 group cursor-pointer">
                       <div className="flex gap-4">
                          <div className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            log.status === 'COMPLETED' ? "bg-green-50 text-green-600" : "bg-primary-fixed text-primary group-hover:bg-primary group-hover:text-white"
                          )}>
                             <Zap className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-primary group-hover:text-primary-container transition-colors">{log.action}</p>
                             <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{log.ref} • Due: {log.deadline}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={cn(
                            "text-[8px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded border mb-1 block w-fit ml-auto",
                            log.importance === 'HIGH' ? "border-error/20 text-error bg-error/5" : "border-outline-variant/20 text-secondary"
                          )}>{log.importance}</span>
                          <span className={cn(
                            "text-[8px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full",
                            log.status === 'COMPLETED' ? "bg-green-100 text-green-800" : "bg-surface-container text-secondary"
                          )}>{log.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between hover:border-primary transition-all cursor-pointer group">
                  <div>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Shift Duration</p>
                    <p className="text-2xl font-bold font-display text-primary">00:00:00</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 mt-4">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Ops</span>
                  </div>
               </div>
               <div className="bg-primary text-white rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-primary/20 transition-all">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Estimated Compensation</p>
                  <p className="text-3xl font-bold font-display whitespace-nowrap">$0.00</p>
                  <button className="text-[10px] font-black text-white px-3 py-1 bg-white/10 rounded-full w-fit mt-4 uppercase tracking-widest hover:bg-white/20">View Paystub</button>
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-bold text-primary uppercase tracking-tighter">Personal Milestones</h3>
                  <Target className="w-5 h-5 text-secondary" />
               </div>
               <div className="space-y-6">
                  {([] as any[]).map((m, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-secondary">{m.label}</span>
                          <span className="text-primary">{m.progress}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${m.progress}%` }}
                            className={cn(
                              "h-full rounded-full",
                              m.color === 'green' ? "bg-green-500" : "bg-primary"
                            )}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform">
                  <Megaphone size={100} />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 text-secondary mb-4">
                    <Megaphone className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Latest Announcement</span>
                 </div>
                 <p className="text-sm font-bold text-primary mb-2">No active announcements</p>
                 <p className="text-[11px] text-secondary leading-relaxed mb-4">Stay tuned for company-wide updates and protocol changes.</p>
                 <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
