import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Users, Target, CheckSquare, Award } from 'lucide-react';

export function HeadDashboard() {
  const { user } = useAuth();
  const [departmentEmployees, setDepartmentEmployees] = useState<any[]>([]);
  const [deptGoals, setDeptGoals] = useState<any[]>([]);
  const [personalGoals, setPersonalGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalScope, setGoalScope] = useState<'DEPARTMENT' | 'PERSONAL'>('DEPARTMENT');
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetValue: 100,
    unit: '%',
    dueDate: '',
    ownerId: ''
  });

  const loadData = async () => {
    try {
      const [empRes, goalsRes] = await Promise.all([
        api.employees({ limit: 100 }),
        api.goals()
      ]);
      
      const ledDepts = user?.ledDepartments || [];
      const myDeptEmployees = empRes.items.filter((e: any) => ledDepts.includes(e.department));
      setDepartmentEmployees(myDeptEmployees);

      setDeptGoals(goalsRes.filter((g: any) => g.scope === 'DEPARTMENT' && ledDepts.includes(g.department)));
      setPersonalGoals(goalsRes.filter((g: any) => g.scope === 'PERSONAL' && myDeptEmployees.some((e: any) => e.id === g.ownerId)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal({
        ...goalForm,
        scope: goalScope,
        department: user?.ledDepartments?.[0],
      });
      toast.success('Goal deployed successfully');
      setShowGoalModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Department Leadership...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Reference Screenshot Top Header Card */}
      <OrganizationHeaderCard />

      {/* Reference Screenshot 4 Top Stat Cards */}
      <WorkplaceStatCards
        domainsCount={departmentEmployees.length}
        usersCount={deptGoals.length}
        groupsCount={personalGoals.length}
        licensesCount="88%"
        card1Label="TEAM OPERATIVES"
        card2Label="DEPARTMENT GOALS"
        card3Label="INDIVIDUAL TARGETS"
        card4Label="CYCLE COMPLETION"
        card1Icon={<Users className="w-5 h-5" />}
        card2Icon={<Target className="w-5 h-5" />}
        card3Icon={<CheckSquare className="w-5 h-5" />}
        card4Icon={<Award className="w-5 h-5" />}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Department Leadership & Goals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing: {user?.ledDepartments?.join(', ') || 'Core Unit'}
          </p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="bg-[#001f5b] hover:bg-[#001f5b]/90 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs"
        >
          Set Strategic Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Strategic Goals */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Department Strategic Goals</h3>
          <div className="space-y-3">
            {deptGoals.length === 0 ? (
              <p className="text-slate-500 text-xs py-4">No strategic goals defined for your department.</p>
            ) : (
              deptGoals.map((g, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/80">
                  <h4 className="font-semibold text-slate-900 text-xs">{g.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>Progress: {g.currentValue} / {g.targetValue} {g.unit}</span>
                    <span className="text-[#001f5b] font-bold">{g.status}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#001f5b] rounded-full" style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Individual Target Distribution */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Individual Target Distribution</h3>
          <div className="space-y-3">
            {personalGoals.length === 0 ? (
              <p className="text-slate-500 text-xs py-4">No individual goals assigned.</p>
            ) : (
              personalGoals.map((g, idx) => {
                const owner = departmentEmployees.find(e => e.id === g.ownerId);
                return (
                  <div key={idx} className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/80">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs">{g.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Assigned to: {owner?.fullName || 'Operative'}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                        {g.status}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#001f5b] rounded-full" style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }} />
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowGoalModal(false)} />
          <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-sm text-slate-900">Set Strategic Target</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-xs text-slate-400 hover:text-slate-700">Close</button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Scope</label>
                <select value={goalScope} onChange={e => setGoalScope(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium">
                  <option value="DEPARTMENT">Team/Department Goal</option>
                  <option value="PERSONAL">Individual Goal</option>
                </select>
              </div>

              {goalScope === 'PERSONAL' && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Assign To</label>
                  <select required value={goalForm.ownerId} onChange={e => setGoalForm({...goalForm, ownerId: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium">
                    <option value="">Select Employee...</option>
                    {departmentEmployees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Title</label>
                <input required value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium" placeholder="e.g. Increase Q3 Revenue" />
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                <textarea value={goalForm.description} onChange={e => setGoalForm({...goalForm, description: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium resize-none" rows={2} />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Target Value</label>
                  <input type="number" required value={goalForm.targetValue} onChange={e => setGoalForm({...goalForm, targetValue: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Unit</label>
                  <input required value={goalForm.unit} onChange={e => setGoalForm({...goalForm, unit: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium" placeholder="%, XAF, units" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Due Date</label>
                <input type="date" required value={goalForm.dueDate} onChange={e => setGoalForm({...goalForm, dueDate: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-medium" />
              </div>

              <button type="submit" className="w-full bg-[#001f5b] text-white py-2.5 rounded-lg text-xs font-semibold tracking-wide hover:bg-[#001f5b]/90 transition-colors mt-4">
                Deploy Goal
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
