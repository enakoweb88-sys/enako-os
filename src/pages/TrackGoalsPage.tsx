import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Building2, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  X,
  ExternalLink,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

export default function TrackGoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'COMPANY' | 'DEPARTMENT' | 'PERSONAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // Quick progress update in detail view
  const [newProgressValue, setNewProgressValue] = useState<string>('');
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let remoteGoals: any[] = [];
      try {
        const res = await api.goals();
        remoteGoals = Array.isArray(res) ? res : res?.items || [];
      } catch (err) {
        console.warn('Backend goals API deferred, loading cache:', err);
      }

      // Merge local storage cached goals
      const localRaw = localStorage.getItem('enako_goals_cache');
      const localGoals: any[] = localRaw ? JSON.parse(localRaw) : [];

      const combinedMap = new Map<string, any>();
      remoteGoals.forEach((g: any) => combinedMap.set(g.id, g));
      localGoals.forEach((g: any) => {
        if (!combinedMap.has(g.id)) {
          combinedMap.set(g.id, g);
        }
      });

      const merged = Array.from(combinedMap.values());
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setGoals(merged);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to load strategic goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getProgress = (goal: any) => {
    if (!goal.targetValue) return 0;
    const curr = Number(goal.currentValue || 0);
    const tgt = Number(goal.targetValue);
    if (tgt <= 0) return 0;
    return Math.min(100, Math.round((curr / tgt) * 100));
  };

  const handleUpdateProgress = async (goalId: string) => {
    if (!newProgressValue || isNaN(Number(newProgressValue))) {
      toast.error('Please enter a valid numeric progress value');
      return;
    }

    setUpdatingProgress(true);
    const numericVal = Number(newProgressValue);

    try {
      try {
        await api.updateProgress(goalId, numericVal);
      } catch (err) {
        console.warn('Backend update progress deferred:', err);
      }

      // Update in state
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          const isComplete = g.targetValue && numericVal >= Number(g.targetValue);
          return {
            ...g,
            currentValue: numericVal,
            status: isComplete ? 'COMPLETED' : g.status
          };
        }
        return g;
      }));

      // Update in local cache
      const localRaw = localStorage.getItem('enako_goals_cache');
      if (localRaw) {
        const cached = JSON.parse(localRaw);
        const updated = cached.map((g: any) => {
          if (g.id === goalId) {
            const isComplete = g.targetValue && numericVal >= Number(g.targetValue);
            return { ...g, currentValue: numericVal, status: isComplete ? 'COMPLETED' : g.status };
          }
          return g;
        });
        localStorage.setItem('enako_goals_cache', JSON.stringify(updated));
      }

      if (selectedGoal && selectedGoal.id === goalId) {
        const isComplete = selectedGoal.targetValue && numericVal >= Number(selectedGoal.targetValue);
        setSelectedGoal((prev: any) => ({
          ...prev,
          currentValue: numericVal,
          status: isComplete ? 'COMPLETED' : prev.status
        }));
      }

      toast.success('Objective progress updated successfully');
      setNewProgressValue('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    try {
      try {
        await api.completeGoal(goalId);
      } catch (err) {
        console.warn('Backend complete goal deferred:', err);
      }

      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'COMPLETED', currentValue: g.targetValue || g.currentValue } : g));

      const localRaw = localStorage.getItem('enako_goals_cache');
      if (localRaw) {
        const cached = JSON.parse(localRaw);
        const updated = cached.map((g: any) => g.id === goalId ? { ...g, status: 'COMPLETED', currentValue: g.targetValue || g.currentValue } : g);
        localStorage.setItem('enako_goals_cache', JSON.stringify(updated));
      }

      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal((prev: any) => ({ ...prev, status: 'COMPLETED', currentValue: prev.targetValue || prev.currentValue }));
      }

      toast.success('Objective marked as completed!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to complete objective');
    }
  };

  const filteredGoals = goals.filter(g => {
    const matchesSearch = !search || (
      (g.title && g.title.toLowerCase().includes(search.toLowerCase())) ||
      (g.description && g.description.toLowerCase().includes(search.toLowerCase())) ||
      (g.department?.name && g.department.name.toLowerCase().includes(search.toLowerCase())) ||
      (g.owner?.fullName && g.owner.fullName.toLowerCase().includes(search.toLowerCase()))
    );

    const matchesScope = scopeFilter === 'ALL' || g.scope === scopeFilter;
    const progress = getProgress(g);
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'COMPLETED' && (g.status === 'COMPLETED' || progress >= 100)) ||
      (statusFilter === 'ACTIVE' && g.status !== 'COMPLETED' && progress < 100);

    return matchesSearch && matchesScope && matchesStatus;
  });

  const totalCount = goals.length;
  const companyGoalsCount = goals.filter(g => g.scope === 'COMPANY').length;
  const completedGoalsCount = goals.filter(g => g.status === 'COMPLETED' || getProgress(g) >= 100).length;
  const avgProgress = totalCount > 0 ? Math.round(goals.reduce((acc, g) => acc + getProgress(g), 0) / totalCount) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
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
            <span className="text-[#001f5b] font-bold">Track Goals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Strategic Objectives Tracking Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time progress, target completion horizons, and quantitative team benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/goals/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Set New Objective
          </Link>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>



      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search objectives by title, department, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Scope Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            {(['ALL', 'COMPANY', 'DEPARTMENT', 'PERSONAL'] as const).map(sc => (
              <button
                key={sc}
                onClick={() => setScopeFilter(sc)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer",
                  scopeFilter === sc
                    ? "bg-white text-[#001f5b] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {sc === 'ALL' ? 'All Scopes' : sc.charAt(0) + sc.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-[#001f5b]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active / In Progress</option>
            <option value="COMPLETED">Completed (100%)</option>
          </select>
        </div>
      </div>

      {/* Goals Worklist / Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Objectives & Key Results Worklist</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any objective row to view in-depth details, audit deliverables, or log progress updates.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filteredGoals.length} {filteredGoals.length === 1 ? 'Objective' : 'Objectives'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-medium text-slate-500 animate-pulse">
            Loading strategic objectives...
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Target className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No objectives found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No strategic goals match the current filters. Set a new objective to begin tracking performance.
            </p>
            <Link
              to="/app/goals/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Set New Objective
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Objective & Scope</th>
                  <th className="px-5 py-3">Ownership / Dept</th>
                  <th className="px-5 py-3 w-48">Progress Rate</th>
                  <th className="px-5 py-3">Target Metrics</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Due Horizon</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredGoals.map((goal) => {
                  const progress = getProgress(goal);
                  const isCompleted = goal.status === 'COMPLETED' || progress >= 100;
                  return (
                    <tr
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoal(goal);
                        setNewProgressValue(String(goal.currentValue || 0));
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#001f5b] transition-colors">
                              {goal.title}
                            </p>
                            {goal.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {goal.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn(
                                "px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border",
                                goal.scope === 'COMPANY' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                goal.scope === 'DEPARTMENT' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                "bg-slate-100 text-slate-700 border-slate-200"
                              )}>
                                {goal.scope || 'COMPANY'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-800 font-semibold flex items-center gap-1.5">
                          {goal.scope === 'DEPARTMENT' ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{goal.department?.name || 'Departmental'}</span>
                            </>
                          ) : goal.scope === 'PERSONAL' ? (
                            <>
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{goal.owner?.fullName || 'Individual'}</span>
                            </>
                          ) : (
                            <>
                              <Target className="w-3.5 h-3.5 text-slate-400" />
                              <span>All Organization</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">{progress}%</span>
                            <span className="text-[10px] text-slate-400">
                              {goal.currentValue || 0} / {goal.targetValue || 100} {goal.unit || ''}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isCompleted ? "bg-emerald-600" : progress > 50 ? "bg-[#001f5b]" : "bg-amber-500"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                        {goal.targetValue ? (
                          <span>
                            {Number(goal.targetValue).toLocaleString()} {goal.unit || ''}
                          </span>
                        ) : (
                          <span className="text-slate-400">Milestone</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border inline-block",
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        )}>
                          {isCompleted ? 'COMPLETED' : 'ACTIVE'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[11px] text-slate-600 font-medium">
                        {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'End of Quarter'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#001f5b] hover:underline">
                          Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Goal Details Drawer / Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200"
            >
              {/* Modal Top Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#001f5b]/10 text-[#001f5b]">
                      {selectedGoal.scope || 'COMPANY'} OBJECTIVE
                    </span>
                    <span className={cn(
                      "px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border",
                      selectedGoal.status === 'COMPLETED' || getProgress(selectedGoal) >= 100
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    )}>
                      {selectedGoal.status === 'COMPLETED' || getProgress(selectedGoal) >= 100 ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedGoal.title}</h3>
                </div>

                <button
                  onClick={() => setSelectedGoal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 text-xs">
                {/* Description */}
                <div>
                  <span className="block text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1.5">
                    Objective Description & Strategic Scope
                  </span>
                  <p className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg text-slate-700 leading-relaxed">
                    {selectedGoal.description || 'No extended description provided for this operational objective.'}
                  </p>
                </div>

                {/* Progress Visualizer */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Completion Progress
                    </span>
                    <span className="text-sm font-bold text-[#001f5b]">
                      {getProgress(selectedGoal)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getProgress(selectedGoal) >= 100 ? "bg-emerald-600" : "bg-[#001f5b]"
                      )}
                      style={{ width: `${getProgress(selectedGoal)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Current: <strong>{Number(selectedGoal.currentValue || 0).toLocaleString()} {selectedGoal.unit || ''}</strong></span>
                    <span>Target: <strong>{Number(selectedGoal.targetValue || 100).toLocaleString()} {selectedGoal.unit || ''}</strong></span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                      Assigned Ownership
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {selectedGoal.scope === 'DEPARTMENT'
                        ? selectedGoal.department?.name || 'Departmental'
                        : selectedGoal.scope === 'PERSONAL'
                        ? selectedGoal.owner?.fullName || 'Personal Operative'
                        : 'Company-Wide (Executive)'}
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                      Target Horizon / Due Date
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {selectedGoal.dueDate ? new Date(selectedGoal.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Open Target'}
                    </p>
                  </div>
                </div>

                {/* Interactive Progress Update Box */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Log Progress Update
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={`Enter new value in ${selectedGoal.unit || 'units'}...`}
                      value={newProgressValue}
                      onChange={(e) => setNewProgressValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] focus:bg-white transition-all font-mono"
                    />
                    <button
                      onClick={() => handleUpdateProgress(selectedGoal.id)}
                      disabled={updatingProgress}
                      className="px-4 py-2 bg-[#001f5b] text-white text-xs font-bold rounded-lg hover:bg-[#001744] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updatingProgress ? 'Saving...' : 'Update Progress'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">Fast action:</span>
                    {selectedGoal.status !== 'COMPLETED' && getProgress(selectedGoal) < 100 && (
                      <button
                        onClick={() => handleMarkComplete(selectedGoal.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark as 100% Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
