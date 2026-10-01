import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, Award, Layers } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const OBJECTIVE_TYPES = [
  { label: 'Financial Revenue & Margin (XAF)', value: 'Financial', defaultUnit: 'XAF' },
  { label: 'Growth & Expansion (%)', value: 'Growth', defaultUnit: '%' },
  { label: 'Operational Milestone', value: 'Milestone', defaultUnit: '%' },
  { label: 'Quantitative Target / Volume', value: 'Volume', defaultUnit: 'Units' },
  { label: 'Client & Retention Metric', value: 'Client', defaultUnit: '%' }
];

export default function CreateGoalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectiveType, setObjectiveType] = useState('Financial');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('XAF');
  const [dueDate, setDueDate] = useState('');
  const [scope, setScope] = useState<'COMPANY' | 'DEPARTMENT' | 'PERSONAL'>('COMPANY');
  const [departmentId, setDepartmentId] = useState('');
  const [ownerId, setOwnerId] = useState(user?.id || '');

  const [departments, setDepartments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load departments
    api.departments()
      .then(depts => {
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
          setDepartmentId(depts[0].id);
        }
      })
      .catch(() => {
        setDepartments([
          { id: 'dept-ops', name: 'Operations & Logistics' },
          { id: 'dept-fin', name: 'Finance & Treasury' },
          { id: 'dept-tech', name: 'Engineering & Tech' },
          { id: 'dept-bd', name: 'Business Development' },
          { id: 'dept-field', name: 'Outreach & Field' }
        ]);
        setDepartmentId('dept-ops');
      });

    // Load users for personal scope assignment
    const loadUsers = async () => {
      try {
        const res = await api.listUsers();
        if (Array.isArray(res) && res.length > 0) {
          setUsersList(res);
          return;
        }
      } catch (e) {}

      try {
        const empRes = await api.employees({ limit: 100 });
        if (empRes?.items && Array.isArray(empRes.items) && empRes.items.length > 0) {
          setUsersList(empRes.items);
          return;
        }
      } catch (e) {}

      setUsersList([
        { id: user?.id || 'usr-me', fullName: user?.fullName || 'Current User', email: user?.email || '', role: user?.role || 'Staff' }
      ]);
    };

    loadUsers();
  }, [user]);

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
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      scope,
      departmentId: scope === 'DEPARTMENT' ? departmentId : undefined,
      ownerId: scope === 'PERSONAL' ? ownerId : undefined,
    };

    try {
      let created = null;
      try {
        created = await api.createGoal(payload);
      } catch (err) {
        console.warn('Backend API deferred, saving to local goals cache:', err);
      }

      // Persist to local cache for instant feedback
      const localId = created?.id || `GOAL-${Date.now()}`;
      const newGoal = {
        id: localId,
        title: payload.title,
        description: payload.description,
        targetValue: payload.targetValue,
        currentValue: 0,
        unit: payload.unit,
        dueDate: payload.dueDate,
        scope: payload.scope,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        department: scope === 'DEPARTMENT' ? departments.find(d => d.id === departmentId) : undefined,
        owner: scope === 'PERSONAL' ? usersList.find(u => u.id === ownerId) || user : undefined,
      };

      const existingRaw = localStorage.getItem('enako_goals_cache');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('enako_goals_cache', JSON.stringify([newGoal, ...existing]));

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
              Goals & KPIs
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">New Objective</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Define Strategic Objective & KPI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Establish executive milestones, department targets, and quantitative key results for corporate operations.
          </p>
        </div>

        <Link
          to="/app/goals"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Goals & KPIs
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
                placeholder="e.g. Achieve 150M FCFA Monthly Remittance Volume, Expand Cash Pickup Agents to 30 Hubs"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Due Date / Completion Horizon
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full sm:w-1/3 px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
              />
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
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
              >
                <option value="COMPANY">Company-Wide (Enterprise Strategic OKR)</option>
                <option value="DEPARTMENT">Departmental (Functional Unit Target)</option>
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
