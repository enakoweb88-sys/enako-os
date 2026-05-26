import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  UtensilsCrossed, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  TriangleAlert,
  TrendingUp,
  ClipboardPen
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function StaffMeals() {
  const [role, setRole] = useState<string>('ceo');
  const [meals, setMeals] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const storedMeals = localStorage.getItem('enako_meals');
    if (storedMeals) {
      setMeals(JSON.parse(storedMeals));
    }
  }, []);

  const employees = [
    { id: 'EMP-001', name: 'Marcus Thorne', dept: 'Operations' },
    { id: 'EMP-002', name: 'Sarah Chen', dept: 'Engineering' },
    { id: 'EMP-003', name: 'James Wilson', dept: 'Compliance' },
  ];

  const handleLogMeal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let newEntry;
    if (role === 'employee') {
      const userName = localStorage.getItem('enako_user_name') || 'Current user';
      newEntry = {
        name: userName,
        dept: 'Operations',
        id: 'EMP-OWN',
        date: new Date().toISOString().split('T')[0],
        status: 'ATE',
        share: '2,500 FCFA'
      };
    } else {
      if (!selectedEmployee) return;
      const emp = employees.find(e => e.name === selectedEmployee);
      newEntry = {
        name: selectedEmployee,
        dept: emp?.dept || 'Operations',
        id: emp?.id || 'EMP-001',
        date: mealDate,
        status: 'ATE',
        share: '2,500 FCFA'
      };
    }

    const updatedMeals = [newEntry, ...meals];
    setMeals(updatedMeals);
    localStorage.setItem('enako_meals', JSON.stringify(updatedMeals));
  };

  const totalMeals = meals.length;
  const totalContribution = meals.length * 2500;
  const participationRate = meals.length > 0 ? (meals.length / 50 * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-section-gap">
        <h1 className="font-display text-5xl font-bold text-primary mb-2">Staff Meal Management</h1>
        <p className="text-secondary text-lg max-w-2xl">
          {role === 'employee' ? 'Track your daily welfare benefits and meal history.' : 'Enterprise welfare portal for tracking daily consumption across global operations.'}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Financial Summary - Change height/content based on role */}
        <div className={cn(
          "bg-white border border-outline-variant p-8 rounded-2xl flex flex-col justify-between shadow-sm",
          role === 'employee' ? "col-span-12 lg:col-span-4" : "col-span-12 lg:col-span-4"
        )}>
          <div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-8 block">
              {role === 'employee' ? 'MY CONTRIBUTION SUMMARY' : 'MONTHLY FINANCIAL SUMMARY'}
            </span>
            <div className="space-y-8">
              <div>
                <p className="text-secondary text-sm font-medium mb-1">
                  {role === 'employee' ? 'Total Meals Consumed' : 'Company Contribution'}
                </p>
                <p className="font-display text-3xl font-bold text-primary">
                  {role === 'employee' ? `${meals.filter(m => m.name === (localStorage.getItem('enako_user_name') || 'Current user')).length} Meals` : `${totalContribution.toLocaleString()} FCFA`}
                </p>
              </div>
              <div className="pt-6 border-t border-outline-variant/30">
                <p className="text-secondary text-sm font-medium mb-1">
                  {role === 'employee' ? 'Deduction Amount' : 'Employee Share'}
                </p>
                <p className="font-display text-3xl font-bold text-on-primary-container">
                  {role === 'employee' ? `${(meals.filter(m => m.name === (localStorage.getItem('enako_user_name') || 'Current user')).length * 500).toLocaleString()} FCFA` : `${(meals.length * 500).toLocaleString()} FCFA`}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-secondary text-[11px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>0% change from last cycle</span>
          </div>
        </div>

        {/* Participation Chart Overlay */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant p-8 rounded-2xl overflow-hidden relative group shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-start relative z-10 mb-auto">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1 block">
                {role === 'employee' ? 'SYSTEM ATTENDANCE' : 'WELFARE ANALYTICS'}
              </span>
              <h3 className="font-display text-3xl font-bold text-primary">
                {role === 'employee' ? (meals.length > 0 ? 'Active' : 'No History') : `${participationRate}% Participation`}
              </h3>
            </div>
            <div className="bg-outline-variant text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">STABLE</div>
          </div>
          <div className="h-48 mt-12 flex items-center justify-center gap-3 px-2">
            {meals.length === 0 ? (
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">No consumption data found</span>
            ) : (
              <div className="flex items-end gap-2 w-full h-full pb-4">
                {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-primary/20 rounded-t-sm"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-12 lg:col-span-3 glass-panel border border-outline-variant p-8 rounded-2xl shadow-sm">
          {role === 'employee' ? (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-8 block">QUICK CHECK-IN</span>
                <div className="space-y-4 mb-8">
                  <p className="text-secondary text-sm">Scan QR code or click below to log today's meal entry.</p>
                  <div className="aspect-square bg-surface-container rounded-2xl flex items-center justify-center border-2 border-dashed border-outline-variant">
                    <UtensilsCrossed className="w-12 h-12 text-outline-variant" />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleLogMeal()}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                <ClipboardPen className="w-4 h-4" />
                LOG MEAL TODAY
              </button>
            </div>
          ) : (
            <>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-8 block">DAILY MEAL ENTRY</span>
              <form className="space-y-6" onSubmit={handleLogMeal}>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">EMPLOYEE</label>
                  <select 
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">DATE</label>
                  <input 
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm outline-none" 
                    type="date" 
                    value={mealDate}
                    onChange={(e) => setMealDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Ate Today?</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest" type="submit">YES</button>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-primary-container transition-all">LOG ENTRY</button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-8">
        {/* Calendar Side */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white border border-outline-variant p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">OCTOBER 2024</span>
              <div className="flex gap-4">
                <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-primary transition-colors text-secondary" />
                <ChevronRight className="w-5 h-5 cursor-pointer hover:text-primary transition-colors text-secondary" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-secondary mb-6 uppercase tracking-widest">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-3 text-center">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div 
                  key={day}
                  className={cn(
                    "aspect-square flex items-center justify-center text-xs font-bold rounded-full transition-all cursor-pointer",
                    day === 24 ? "bg-primary text-white" : "hover:bg-surface-container-low text-on-surface",
                    [3, 10, 17].includes(day) && "bg-on-tertiary-container/10 text-on-tertiary-container"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary-fixed text-primary p-8 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <UtensilsCrossed size={140} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold opacity-70 block mb-6 uppercase tracking-[0.2em]">
                {role === 'employee' ? 'MY BENEFIT STATUS' : 'SYSTEM STATUS'}
              </span>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs opacity-80 mb-1">Current Balance</p>
                  <p className="font-display text-3xl font-bold">0 FCFA</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80 mb-1">Status</p>
                  <p className="font-display text-2xl font-bold tracking-tight">INACTIVE</p>
                </div>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-white/5">
                <TriangleAlert className="w-4 h-4" />
                Report Discrepancy
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="font-display text-2xl font-bold text-primary">
              {role === 'employee' ? 'My Consumption Log' : 'Enterprise Consumption Log'}
            </h3>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                <input className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search entries..." type="text"/>
              </div>
              <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-surface-container-high transition-colors">
                <BarChart3 className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Share</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {meals.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold font-display text-sm">
                          {row.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{row.name}</p>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{row.dept} • {row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono font-medium text-secondary">{row.date}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        row.status === 'ATE' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                      )}>{row.status}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono font-bold text-primary">{row.share}</td>
                    <td className="px-8 py-5">
                      <button className="text-secondary hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {meals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-sm text-secondary">
                      No records found for the current period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
