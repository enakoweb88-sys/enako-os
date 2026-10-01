import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RefreshCw, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  User,
  Building2,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let remoteTasks: any[] = [];
      try {
        remoteTasks = await api.tasks();
      } catch (err) {
        console.warn('Backend tasks API deferred:', err);
      }

      // Merge local storage cached tasks
      const localRaw = localStorage.getItem('enako_tasks_cache');
      const localTasks: any[] = localRaw ? JSON.parse(localRaw) : [];

      const combinedMap = new Map<string, any>();
      (remoteTasks || []).forEach((t: any) => combinedMap.set(t.id, t));
      localTasks.forEach(t => combinedMap.set(t.id, t));

      const merged = Array.from(combinedMap.values());
      // Sort newest first
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTasks(merged);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      try {
        await api.setTaskStatus(taskId, status);
      } catch (e) {}

      // Update in local cache
      const localRaw = localStorage.getItem('enako_tasks_cache');
      if (localRaw) {
        const localTasks: any[] = JSON.parse(localRaw);
        const updated = localTasks.map(t => t.id === taskId ? { ...t, status } : t);
        localStorage.setItem('enako_tasks_cache', JSON.stringify(updated));
      }

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev: any) => ({ ...prev, status }));
      }
      toast.success(`Task status updated to ${status.replace('_', ' ')}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update task');
    }
  };

  const getProgress = (status: string) => {
    switch(status) {
      case 'TODO': return { w: 'w-0', bg: 'bg-slate-300' };
      case 'IN_PROGRESS': return { w: 'w-1/2', bg: 'bg-blue-600' };
      case 'REVIEW': return { w: 'w-3/4', bg: 'bg-amber-500' };
      case 'DONE': return { w: 'w-full', bg: 'bg-emerald-600' };
      case 'FAILED': 
      case 'CANCELLED': return { w: 'w-full', bg: 'bg-rose-500' };
      default: return { w: 'w-0', bg: 'bg-slate-300' };
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchQuery || (
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.department && t.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.assignee?.fullName && t.assignee.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;
  const openCount = tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').length;
  const urgentCount = tasks.filter(t => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE').length;
  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* Top Header & Breadcrumb (Clean normal text per guidelines) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Operations & Workflows</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Tasks</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Operational Task Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, assign, and execute operational workflows and team responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/tasks/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Task
          </Link>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Metric Cards: Hero Card (Active Workflows) + 3 Side Cards (Matching Cash Collections layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Large Main Featured Hero Card: Active Workflows */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Workforce Execution • Open Tasks
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#001f5b]/10 text-[#001f5b] flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Active Workflows & Open Deliverables</p>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {openCount} Tasks Active
            </h3>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span className="font-medium">Completion Rate ({completionRate}%)</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {doneCount} of {totalCount} completed
            </span>
          </div>
        </div>

        {/* The other three cards placed at the side */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 sm:gap-3.5 justify-between">
          {/* Card 2: In Progress */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                In Progress
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {inProgressCount}
              </h4>
              <span className="text-xs text-slate-500">Under active execution</span>
            </div>
          </div>

          {/* Card 3: Urgent & High Priority */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                High & Urgent Priority
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
                {urgentCount}
              </h4>
              <span className="text-xs text-slate-500">Requires swift action</span>
            </div>
          </div>

          {/* Card 4: Completed Tasks */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Delivered Workflows
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
                {doneCount}
              </h4>
              <span className="text-xs text-slate-500">Successfully closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search and Priority Filters */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by title, description, assignee, or dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Priority:
            </span>
            {['ALL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all shrink-0 ${
                  priorityFilter === p
                    ? 'bg-[#001f5b] text-white border-[#001f5b]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Task List Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Task Execution Registry
          </h2>
          <span className="text-xs text-slate-500">
            Showing <strong>{filteredTasks.length}</strong> tasks
          </span>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading operational tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No tasks found matching current filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Task Particulars</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignee & Dept</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Progress</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Due</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => (
                  <tr 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)} 
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs font-bold text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="text-xs font-semibold text-slate-800">
                        {task.assignee?.fullName || 'Assigned Operative'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-2.5 h-2.5 text-slate-400" />
                        {task.department || 'Operations'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        task.priority === 'URGENT' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        task.priority === 'HIGH' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {task.priority || 'NORMAL'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className={cn("h-full transition-all duration-500", getProgress(task.status).bg, getProgress(task.status).w)} />
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border inline-block",
                        task.status === 'DONE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        task.status === 'IN_PROGRESS' ? "bg-sky-50 text-sky-700 border-sky-200" :
                        task.status === 'REVIEW' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        task.status === 'FAILED' || task.status === 'CANCELLED' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {task.status ? task.status.replace('_', ' ') : 'OPEN'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'No deadline'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {task.status !== 'DONE' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(task.id, 'DONE');
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Task Details Drawer / Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 font-sans">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Task Details
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider cursor-pointer">Close</button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="block text-slate-400 uppercase font-semibold text-[10px] mb-1">Description</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-slate-400 uppercase font-semibold text-[10px]">Assignee</span>
                    <span className="font-bold text-slate-900">{selectedTask.assignee?.fullName || 'Assigned Operative'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase font-semibold text-[10px]">Department</span>
                    <span className="font-bold text-slate-900">{selectedTask.department || 'Operations'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase font-semibold text-[10px]">Due Date</span>
                    <span className="font-semibold text-slate-700">
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No date set'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase font-semibold text-[10px]">Priority</span>
                    <span className="font-bold text-slate-900">{selectedTask.priority || 'NORMAL'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Quick Status Update:</span>
                  <div className="flex gap-1.5">
                    {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedTask.id, st)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                          selectedTask.status === st
                            ? 'bg-[#001f5b] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
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
