import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function TasksWidget({ limit }: { limit?: number }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const [form, setForm] = useState({ title: '', description: '', priority: 'NORMAL', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.tasks();
      setTasks(limit ? res.slice(0, limit) : res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    try {
      const payload: any = { ...form, assigneeId: user?.id };
      if (!payload.dueDate) delete payload.dueDate;
      await api.createTask(payload);
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'NORMAL', dueDate: '' });
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await api.setTaskStatus(taskId, status);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status });
      }
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getProgress = (status: string) => {
    switch(status) {
      case 'TODO': return { w: 'w-0', bg: 'bg-slate-300' };
      case 'IN_PROGRESS': return { w: 'w-1/2', bg: 'bg-slate-700' };
      case 'REVIEW': return { w: 'w-3/4', bg: 'bg-slate-800' };
      case 'DONE': return { w: 'w-full', bg: 'bg-emerald-600' };
      case 'FAILED': 
      case 'CANCELLED': return { w: 'w-full', bg: 'bg-rose-500' };
      default: return { w: 'w-0', bg: 'bg-slate-300' };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full font-sans">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
        <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
          My Tasks
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreate(true)} 
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all"
          >
            Create Task
          </button>
          <button 
            onClick={load} 
            className="px-3 py-1.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500 animate-pulse">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer group flex flex-col p-4 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{task.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                      {task.priority} · {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg border ml-2 whitespace-nowrap',
                    task.status === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    task.status === 'IN_PROGRESS' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    task.status === 'FAILED' || task.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-slate-200 text-slate-800 border-slate-300',
                  )}>{task.status.replace('_', ' ')}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-1">
                  <div className={cn("h-full transition-all duration-500", getProgress(task.status).bg, getProgress(task.status).w)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 font-display uppercase tracking-wider text-sm">Create Task</h3>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider">Close</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg uppercase tracking-wider transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 uppercase tracking-wider transition-all">
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 font-display text-sm uppercase tracking-wider">Task Details</h3>
                <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider">Close</button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedTask.title}</h2>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <select 
                      value={selectedTask.status} 
                      onChange={e => handleUpdateStatus(selectedTask.id, e.target.value)}
                      className="text-sm font-bold text-slate-900 bg-transparent focus:outline-none w-full cursor-pointer"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Complete</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Due Date</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</p>
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
