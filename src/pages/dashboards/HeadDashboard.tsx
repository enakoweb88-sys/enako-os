import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Target, Users, TrendingUp, Plus, X } from 'lucide-react';

export function HeadDashboard() {
  const { user } = useAuth();
  const [departmentEmployees, setDepartmentEmployees] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Goals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalScope, setGoalScope] = useState<'DEPARTMENT' | 'PERSONAL'>('DEPARTMENT');
  const [goalForm, setGoalForm] = useState({
    title: '', description: '', targetValue: 100, unit: '%',
    ownerId: '', dueDate: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, goalsRes] = await Promise.all([
        api.employees({ limit: 100 }), // Assume small enough company to fetch most, or we'd add specific API filters
        api.goals()
      ]);
      const myDepts = user?.ledDepartments || [];
      const myEmployees = empRes.items.filter(e => myDepts.includes(e.department));
      setDepartmentEmployees(myEmployees);

      // Filter goals for our department or assigned to our department's employees
      const myGoals = goalsRes.filter((g: any) => 
        (g.scope === 'DEPARTMENT' && myDepts.includes(g.department?.name)) ||
        (g.scope === 'PERSONAL' && myEmployees.find(e => e.id === g.ownerId))
      );
      setGoals(myGoals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: goalForm.title,
        description: goalForm.description,
        targetValue: goalForm.targetValue,
        unit: goalForm.unit,
        scope: goalScope,
        dueDate: goalForm.dueDate ? new Date(goalForm.dueDate).toISOString() : undefined,
      };

      if (goalScope === 'DEPARTMENT') {
        payload.departmentId = user?.ledDepartments?.[0]; // Defaulting to first led department
      } else {
        payload.ownerId = goalForm.ownerId;
      }

      await api.createGoal(payload);
      setShowGoalModal(false);
      setGoalForm({ title: '', description: '', targetValue: 100, unit: '%', ownerId: '', dueDate: '' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading Department Data…</div>;

  const deptGoals = goals.filter(g => g.scope === 'DEPARTMENT');
  const personalGoals = goals.filter(g => g.scope === 'PERSONAL');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary">Department Leadership</h2>
          <p className="text-secondary text-base">
            Managing: {user?.ledDepartments?.join(', ')}
          </p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Set Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">Team Members</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold font-display text-primary">{departmentEmployees.length}</p>
            <div className="p-1.5 bg-surface-container rounded text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">Team Goals</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold font-display text-primary">{deptGoals.length}</p>
            <div className="p-1.5 bg-surface-container rounded text-primary">
              <Target className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
          <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">Individual Goals</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold font-display text-primary">{personalGoals.length}</p>
            <div className="p-1.5 bg-surface-container rounded text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary mb-6">Department Strategic Goals</h3>
          <div className="space-y-4">
            {deptGoals.length === 0 ? (
              <p className="text-secondary text-sm">No strategic goals defined for your department.</p>
            ) : (
              deptGoals.map((g, idx) => (
                <div key={idx} className="p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                  <h4 className="font-bold text-primary text-sm">{g.title}</h4>
                  <p className="text-xs text-secondary mt-1">{g.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-secondary">
                    <span>Progress: {g.currentValue} / {g.targetValue} {g.unit}</span>
                    <span className="text-primary">{g.status}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-primary mb-6">Individual Target Distribution</h3>
          <div className="space-y-4">
            {personalGoals.length === 0 ? (
              <p className="text-secondary text-sm">No individual goals assigned.</p>
            ) : (
              personalGoals.map((g, idx) => {
                const owner = departmentEmployees.find(e => e.id === g.ownerId);
                return (
                  <div key={idx} className="p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-primary text-sm">{g.title}</h4>
                        <p className="text-xs text-secondary mt-1">Assigned to: {owner?.fullName || 'Unknown'}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-surface-container rounded text-primary">
                        {g.status}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setShowGoalModal(false)} />
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-primary">Set Strategic Target</h3>
              <button onClick={() => setShowGoalModal(false)}><X className="w-5 h-5 text-secondary" /></button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Scope</label>
                <select value={goalScope} onChange={e => setGoalScope(e.target.value as any)} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm">
                  <option value="DEPARTMENT">Team/Department Goal</option>
                  <option value="PERSONAL">Individual Goal</option>
                </select>
              </div>

              {goalScope === 'PERSONAL' && (
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Assign To</label>
                  <select required value={goalForm.ownerId} onChange={e => setGoalForm({...goalForm, ownerId: e.target.value})} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm">
                    <option value="">Select Employee...</option>
                    {departmentEmployees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Title</label>
                <input required value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm" placeholder="e.g. Increase Q3 Revenue" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Description</label>
                <textarea value={goalForm.description} onChange={e => setGoalForm({...goalForm, description: e.target.value})} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm resize-none" rows={2} />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Target Value</label>
                  <input type="number" required value={goalForm.targetValue} onChange={e => setGoalForm({...goalForm, targetValue: Number(e.target.value)})} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Unit</label>
                  <input required value={goalForm.unit} onChange={e => setGoalForm({...goalForm, unit: e.target.value})} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm" placeholder="%, XAF, units" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-secondary mb-1 uppercase tracking-widest">Due Date</label>
                <input type="date" required value={goalForm.dueDate} onChange={e => setGoalForm({...goalForm, dueDate: e.target.value})} className="w-full p-2 border border-outline-variant/30 rounded-lg text-sm" />
              </div>

              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest mt-4">
                Deploy Goal
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
