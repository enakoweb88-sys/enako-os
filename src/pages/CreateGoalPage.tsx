import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, Award, Layers } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { mealDay } from '../lib/meal-utils';

const OBJECTIVE_TYPES = [
  { label: 'Financial Revenue & Margin (XAF)', value: 'Financial', defaultUnit: 'XAF' },
  { label: 'Growth & Expansion (%)', value: 'Growth', defaultUnit: '%' },
  { label: 'Operational Milestone', value: 'Milestone', defaultUnit: '%' },
  { label: 'Quantitative Target / Volume', value: 'Volume', defaultUnit: 'Units' },
  { label: 'Client & Retention Metric', value: 'Client', defaultUnit: '%' }
];

export default function CreateGoalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const canAssign = ['CEO', 'MANAGER'].includes(user?.role || '');
  const [cadence, setCadence] = useState('DAILY');
  const [periodStart, setPeriodStart] = useState(mealDay());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectiveType, setObjectiveType] = useState('Milestone');
  const [targetValue, setTargetValue] = useState('100');
  const [unit, setUnit] = useState('%');
  const [scope, setScope] = useState<'COMPANY' | 'DEPARTMENT' | 'PERSONAL'>(() => canAssign && searchParams.get('scope') === 'COMPANY' ? 'COMPANY' : 'PERSONAL');
  const [departmentId, setDepartmentId] = useState('');
  const [ownerId, setOwnerId] = useState((canAssign ? searchParams.get('ownerId') : null) || user?.id || '');

  const [departments, setDepartments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canAssign) {
      setUsersList(user ? [user] : []);
      setOwnerId(user?.id || '');
      setScope('PERSONAL');
      return;
    }
    // Load departments
    api.departments()
      .then(depts => {
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
          setDepartmentId(depts[0].id);
        }
      })
      .catch(() => {
        setDepartments([]);
        toast.error('Departments could not be loaded. Personal objectives are still available.');
      });

    // Load users for personal scope assignment
    const loadUsers = async () => {
      try {
        const res = await api.listUsers();
        if (Array.isArray(res) && res.length > 0) {
          setUsersList(user && !res.some(u => u.id === user.id) ? [user, ...res] : res);
          return;
        }
      } catch (e) {}

      try {
        const empRes = await api.employees({ limit: 100 });
        if (empRes?.items && Array.isArray(empRes.items) && empRes.items.length > 0) {
          setUsersList(user && !empRes.items.some(u => u.id === user.id) ? [user, ...empRes.items] : empRes.items);
          return;
        }
      } catch (e) {}

      setUsersList([
        { id: user?.id || 'usr-me', fullName: user?.fullName || 'Current User', email: user?.email || '', role: user?.role || 'Staff' }
      ]);
    };

    loadUsers();
  }, [user, canAssign]);

  const handleTypeChange = (typeVal: string) => {
    setObjectiveType(typeVal);
    const matched = OBJECTIVE_TYPES.find(t => t.value === typeVal);
    if (matched) {
      setUnit(matched.defaultUnit);
      if (typeVal === 'Milestone') {
        setTargetValue('100');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!title.trim()) {
      toast.error('Please enter an objective title');
      return;
    }

    setSubmitting(true);

    let targetVal = targetValue ? Number(targetValue) : undefined;
    if (objectiveType === 'Milestone') {
      targetVal = 100;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      targetValue: targetVal,
      currentValue: 0,
      unit: unit.trim() || undefined,
      scope: canAssign ? scope : 'PERSONAL',
      cadence, periodStart,
      departmentId: scope === 'DEPARTMENT' ? departmentId : undefined,
      ownerId: !canAssign ? user?.id : scope === 'PERSONAL' ? ownerId || user?.id : undefined,
    };

    try {
      await api.createGoal(payload);

      toast.success(`Objective "${payload.title}" created successfully!`);
      navigate('/app/goals/track');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create objective');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 font-sans">
      {/* Header (No cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Link to="/app/goals" className="hover:text-slate-800 transition-colors">
              Operations & Workflows
            </Link>
            <span>/</span>
            <Link to="/app/goals" className="hover:text-slate-800 transition-colors">
              Strategic Goals
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">New Objective</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Set an Objective
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {canAssign ? 'Set your own objective or assign one to an employee or department.' : 'Set daily, weekly, and monthly personal objectives. Only managers and the CEO can assign objectives to others.'}
          </p>
        </div>

        <Link
          to="/app/goals"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Strategic Goals
        </Link>
      </div>

      {/* Flat Form (No Cards, No Enclosing Boxes) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Objective Overview */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Objective Overview & Metrics
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Objective Title / Strategic Statement <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Resolve deployment errors, complete API tests, or ship this week's release"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category / Metric Type
                </label>
                <select
                  value={objectiveType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  {OBJECTIVE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Value ({unit || 'Value'})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000000 or 100"
                  value={targetValue}
                  min="0"
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Measurement Unit
                </label>
                <input
                  type="text"
                  placeholder="XAF, %, Clients, Reports..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-700">Objective period
                <select value={cadence} onChange={e => setCadence(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-2.5">
                  <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">Date in the target period
                <input type="date" required value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-2.5" />
              </label>
              <p className="text-xs text-slate-500 sm:col-span-2">Daily objectives end on the selected day. Weeks run Monday to Sunday; monthly objectives end on the last day of the selected month.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Scope & Ownership */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Scope & Ownership Alignment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Governance Scope
              </label>
              <select
                disabled={!canAssign}
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
              >
                {canAssign && <option value="COMPANY">Company-Wide (Enterprise Strategic OKR)</option>}
                {canAssign && <option value="DEPARTMENT">Departmental (Functional Unit Target)</option>}
                <option value="PERSONAL">Individual / Operative (Personal OKR)</option>
              </select>
            </div>

            {scope === 'DEPARTMENT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scope === 'PERSONAL' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Team Member / Key Owner
                </label>
                <select
                  disabled={!canAssign}
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  {usersList.map((u) => {
                    const roleStr = typeof u.role === 'object' ? u.role?.name : (u.role || 'Staff');
                    return (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({roleStr})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Deliverable Specifications */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Strategic Description & Deliverable Criteria (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Describe the expected business impact, supporting workflows, key milestones, and verification criteria.
          </p>
          <textarea
            rows={7}
            placeholder="Outline strategic rationale, critical operational milestones, counterparty targets, or executive deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Dispatched via <strong>ENAKO OKR Engine</strong> • Quantitative performance tracked
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/goals"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating Objective...' : 'Create & Dispatch Objective'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
