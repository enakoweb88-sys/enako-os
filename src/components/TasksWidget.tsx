import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ClipboardCheck, CheckCircle2, Clock, Plus, X } from 'lucide-react';
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
      await api.updateTaskStatus(taskId, status);
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
      case 'TODO': return { w: 'w-0', bg: 'bg-gray-300' };
      case 'IN_PROGRESS': return { w: 'w-1/2', bg: 'bg-blue-500' };
      case 'REVIEW': return { w: 'w-3/4', bg: 'bg-purple-500' };
      case 'DONE': return { w: 'w-full', bg: 'bg-green-500' };
      case 'FAILED': 
      case 'CANCELLED': return { w: 'w-full', bg: 'bg-red-500' };
      default: return { w: 'w-0', bg: 'bg-gray-300' };
    }
  };

  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30 rounded-t-xl">
        <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" /> My Tasks
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(true)} className="p-1.5 bg-primary text-white rounded hover:shadow-lg transition-all" title="Create Task">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={load} className="p-1.5 border border-outline-variant/30 rounded text-secondary hover:bg-surface-container transition-all" title="Refresh">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {loading ? (
          <div className="py-8 text-center text-sm text-secondary animate-pulse">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-sm text-secondary">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer group flex flex-col p-4 bg-surface-container-low/50 hover:bg-surface-container-low rounded-xl border border-outline-variant/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-primary group-hover:text-primary-fixed">{task.title}</p>
                    <p className="text-[10px] text-secondary uppercase tracking-widest mt-0.5">
                      {task.priority} · {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] font-black uppercase px-2 py-0.5 rounded ml-2 whitespace-nowrap',
                    task.status === 'DONE' ? 'bg-green-50 text-green-700' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                    task.status === 'FAILED' || task.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                    'bg-primary-fixed text-primary',
                  )}>{task.status.replace('_', ' ')}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden mt-1">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <h3 className="font-bold text-primary font-display">Create Task</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm focus:outline-none">
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-bold text-secondary hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <h3 className="font-bold text-primary font-display flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Task Details</h3>
                <button onClick={() => setSelectedTask(null)} className="p-1 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-primary">{selectedTask.title}</h2>
                  <p className="text-sm text-secondary mt-2 whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Status</p>
                    <select 
                      value={selectedTask.status} 
                      onChange={e => handleUpdateStatus(selectedTask.id, e.target.value)}
                      className="text-sm font-bold text-primary bg-transparent focus:outline-none w-full cursor-pointer"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Complete</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Due Date</p>
                    <p className="text-sm font-bold text-primary">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</p>
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
