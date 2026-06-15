import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ClipboardCheck, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.tasks();
      setTasks(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Task Management</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Track and manage operational tasks</p>
        </div>
        <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary">No tasks found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Task</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Assignee</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Priority</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          task.status === 'DONE' ? 'bg-green-50 text-green-600' : 'bg-surface-container text-primary'
                        )}>
                          {task.status === 'DONE' ? <CheckCircle2 className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{task.title}</p>
                          <p className="text-xs text-secondary mt-0.5 line-clamp-1 max-w-xs">{task.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-primary">{task.assignee?.fullName || 'Unassigned'}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider",
                        task.priority === 'HIGH' ? "bg-red-50 text-red-600 border border-red-100" :
                        task.priority === 'MEDIUM' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                        "bg-blue-50 text-blue-600 border border-blue-100"
                      )}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider",
                        task.status === 'DONE' ? "bg-green-50 text-green-700" :
                        task.status === 'IN_PROGRESS' ? "bg-blue-50 text-blue-700" :
                        "bg-surface-container-high text-secondary"
                      )}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs text-secondary font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
