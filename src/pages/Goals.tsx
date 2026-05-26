import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Plus, 
  Activity, 
  TrendingUp, 
  Flag, 
  MoreHorizontal, 
  Zap, 
  Trophy 
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Goals() {
  const [role, setRole] = useState<string>('ceo');
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'Financial',
    target: '',
    current: '0',
    deadline: 'Dec 31',
    color: 'bg-primary'
  });

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    const storedGoals = localStorage.getItem('enako_goals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = {
      ...newGoal,
      progress: 0,
      id: Date.now()
    };
    const updatedGoals = [goal, ...goals];
    setGoals(updatedGoals);
    localStorage.setItem('enako_goals', JSON.stringify(updatedGoals));
    setShowAddForm(false);
    setNewGoal({
      title: '',
      category: 'Financial',
      target: '',
      current: '0',
      deadline: 'Dec 31',
      color: 'bg-primary'
    });
  };

  const completionRate = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;

  if (role === 'employee') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <Target className="w-16 h-16 text-outline-variant" />
        <h2 className="text-2xl font-display font-bold text-primary">Strategic KPIs Restricted</h2>
        <p className="text-secondary max-w-sm">Strategic objectives and corporate KPIs are visible to management and project leads only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Strategic Objectives</h1>
          <p className="text-secondary text-base">Long-term KPIs and operational targets for the current fiscal cycle.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Set New Objective'}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-outline-variant p-8 rounded-3xl shadow-lg max-w-2xl"
        >
          <h3 className="text-lg font-bold text-primary mb-6">Create New Strategic Goal</h3>
          <form onSubmit={handleAddGoal} className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Goal Title</label>
              <input 
                required
                value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container"
                placeholder="e.g. Increase Market Share"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Category</label>
              <select 
                value={newGoal.category}
                onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option>Financial</option>
                <option>Operational</option>
                <option>Growth</option>
                <option>Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Target Value</label>
              <input 
                required
                value={newGoal.target}
                onChange={e => setNewGoal({...newGoal, target: e.target.value})}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container"
                placeholder="e.g. $10M"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="submit" className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Deploy Objective</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Active Goals', val: goals.length.toString(), icon: Target },
          { label: 'Completion Rate', val: `${completionRate}%`, icon: Activity },
          { label: 'Current Velocity', val: '0%', icon: TrendingUp },
          { label: 'Next Milestone', val: goals.length > 0 ? goals[0].deadline : 'None', icon: Flag },
        ].map((stat, i) => (
           <div key={i} className="bg-white border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-5 h-5 text-primary-container" />
                <MoreHorizontal className="w-4 h-4 text-outline cursor-pointer hover:text-primary transition-colors" />
             </div>
             <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
             <p className="text-2xl font-display font-bold text-primary">{stat.val}</p>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {goals.length === 0 ? (
            <div className="bg-white border border-outline-variant/30 p-12 rounded-3xl shadow-sm text-center">
              <Target className="w-12 h-12 text-outline-variant mx-auto mb-4 opacity-50" />
              <p className="text-secondary font-bold uppercase tracking-widest text-[10px]">No active objectives found</p>
              <p className="text-xs text-outline mt-2">Initialize your first strategic KPI to begin tracking.</p>
            </div>
          ) : (
            goals.map((goal, i) => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-outline-variant/30 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-4">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center text-white shadow-inner", goal.color)}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-primary">{goal.title}</h3>
                        <span className="bg-surface-container px-3 py-0.5 rounded-full text-[9px] font-bold text-secondary uppercase tracking-widest">{goal.category}</span>
                      </div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">Deadline: {goal.deadline}, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-primary">{goal.progress}%</p>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Achieved</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${goal.progress}%` }}
                       transition={{ duration: 1, delay: i * 0.2 }}
                       className={cn("h-full rounded-full", goal.color)}
                     />
                   </div>
                   <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                     <span>Current: <span className="text-primary">{goal.current}</span></span>
                     <span>Target: <span className="text-primary">{goal.target}</span></span>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/20">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-primary-container" />
                <h3 className="text-sm font-bold text-primary">Hall of Achievement</h3>
              </div>
              <div className="space-y-6">
                 <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center py-4">No achievements logged</p>
              </div>
           </div>

           <div className="bg-primary text-white p-8 rounded-3xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">Focus Mode</h3>
              <p className="text-xs text-primary-fixed/70 mb-8 leading-relaxed">Concentrate on your primary objectives by muting secondary distractions across the platform.</p>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all backdrop-blur-sm">
                Enter Deep Work
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
