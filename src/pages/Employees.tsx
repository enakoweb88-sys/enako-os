import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Employees() {
  const [role, setRole] = useState<string>('ceo');
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Staff');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    dept: 'Operations',
    status: 'Active',
    email: '',
    phone: '',
    location: 'Remote',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
  });

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const storedEmployees = localStorage.getItem('enako_employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      // Default initial data if empty
      const initial = [
        { id: 'OPERATIVE-001', name: 'Alaric Voss', role: 'Security Architect', dept: 'Operations', status: 'Active', email: 'voss@enako.os', phone: '+1 (555) 012-3456', location: 'Frankfurt Node', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', online: true },
        { id: 'OPERATIVE-002', name: 'Lyra Belacqua', role: 'Liquidity Analyst', dept: 'Finance', status: 'Active', email: 'lyra@enako.os', phone: '+1 (555) 012-7890', location: 'London Node', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', online: false }
      ];
      setEmployees(initial);
      localStorage.setItem('enako_employees', JSON.stringify(initial));
    }
  }, []);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `OPERATIVE-${Math.floor(1000 + Math.random() * 9000)}`;
    const emp = { ...newEmployee, id, online: true };
    const updated = [emp, ...employees];
    setEmployees(updated);
    localStorage.setItem('enako_employees', JSON.stringify(updated));
    setShowAddModal(false);
    setNewEmployee({
      name: '',
      role: '',
      dept: 'Operations',
      status: 'Active',
      email: '',
      phone: '',
      location: 'Remote',
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All Staff' || 
                      (activeTab === 'Management' && emp.dept === 'Management') ||
                      (activeTab === 'Operations' && emp.dept === 'Operations') ||
                      (activeTab === 'Remote' && emp.location === 'Remote');
    return matchesSearch && matchesTab;
  });

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <Users className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Access Restricted</h2>
        <p className="text-secondary max-w-sm">The organization directory is only accessible by management and executive nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Organization Directory</h1>
          <p className="text-secondary text-base">Manage global headcount, organizational hierarchy, and operative deployment.</p>
        </div>
        {role !== 'employee' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg active:scale-95 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Deploy Operative
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-12 bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4">
               {['All Staff', 'Management', 'Operations', 'Remote'].map((tab) => (
                 <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-lg transition-all",
                    activeTab === tab ? "bg-primary-container text-white" : "text-secondary hover:bg-surface-container"
                  )}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text"
                placeholder="Search name, role, or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Employee Info</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Department</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={emp.img} className="size-12 rounded-2xl object-cover shadow-sm" alt={emp.name} referrerPolicy="no-referrer" />
                          {emp.online && <div className="absolute -bottom-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-white"></div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{emp.name}</p>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{emp.id} • {emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-surface-container-high px-3 py-1 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest">
                        {emp.dept}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border w-fit",
                        emp.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" : "bg-primary-fixed text-primary border-primary-container/10"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <button className="p-2 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all"><Mail className="w-4 h-4" /></button>
                        <button className="p-2 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all"><Phone className="w-4 h-4" /></button>
                        <button className="p-2 bg-surface-container-high rounded-xl text-secondary hover:text-primary transition-all"><MapPin className="w-4 h-4" /></button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-outline hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
            <span>Showing {filteredEmployees.length} Global Employees</span>
            <div className="flex gap-8">
              <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Previous</button>
              <button className="hover:text-primary transition-colors disabled:opacity-30" disabled={filteredEmployees.length === 0}>Next Page</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/30"
            >
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="text-xl font-bold text-primary">Deploy New Operative</h3>
                  <p className="text-xs text-secondary uppercase tracking-widest font-bold mt-1">Initialization Sequence</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-6 h-6 text-secondary" />
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Full Name</label>
                      <input 
                        required
                        value={newEmployee.name}
                        onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20"
                        placeholder="e.g. John Doe"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Role</label>
                      <input 
                        required
                        value={newEmployee.role}
                        onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20"
                        placeholder="e.g. Lead Engineer"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Department</label>
                      <select 
                        value={newEmployee.dept}
                        onChange={e => setNewEmployee({...newEmployee, dept: e.target.value})}
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20"
                      >
                        <option>Operations</option>
                        <option>Engineering</option>
                        <option>Finance</option>
                        <option>Compliance</option>
                        <option>Management</option>
                      </select>
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">Abort</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg transition-all">Complete Deployment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
