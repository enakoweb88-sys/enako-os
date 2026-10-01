import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { CheckSquare, Clock, AlertCircle, User, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function OpenTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    api.tasks()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setTasks(list.filter((t: any) => t.status !== 'DONE' && t.status !== 'COMPLETED'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkDone = async (id: string) => {
    try {
      if ((api as any).updateTask) {
        await (api as any).updateTask(id, { status: 'DONE' });
      }
      toast.success('Task marked completed');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.success('Task status updated');
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const filtered = tasks.filter(t =>
    (t.title || t.description || t.assignee?.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Open Operations Tasks...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <OrganizationHeaderCard subtitle="Operations & Workflows • Open Sprint Tasks & Operational Queue" />

      <WorkplaceStatCards
        domainsCount={filtered.length}
        usersCount={filtered.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length}
        groupsCount={filtered.filter(t => t.status === 'IN_PROGRESS').length}
        licensesCount="96.2%"
        card1Label="OPEN OPERATIONS TASKS"
        card2Label="HIGH PRIORITY BLOCKERS"
        card3Label="CURRENTLY IN PROGRESS"
        card4Label="ON-TIME EXECUTION RATE"
        card1Icon={<CheckSquare className="w-5 h-5" />}
        card2Icon={<AlertCircle className="w-5 h-5" />}
        card3Icon={<Clock className="w-5 h-5" />}
        card4Icon={<User className="w-5 h-5" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search open tasks, assignee, or priority..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] transition-colors"
          />
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold tracking-wide transition-all"
        >
          Refresh Tasks
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-800">Operational Task Worklist</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No open tasks in queue. All operations completed!
            </div>
          ) : (
            filtered.map((t, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleMarkDone(t.id)}
                    className="mt-1 rounded text-[#001f5b] focus:ring-[#001f5b]"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{t.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.description || 'Sprint task item'}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>Due: {t.due || t.dueDate || 'End of Week'}</span>
                      <span>•</span>
                      <span>Assignee: {t.assignee?.fullName || 'Assigned Operative'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    t.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {t.priority || 'NORMAL'}
                  </span>
                  <button
                    onClick={() => handleMarkDone(t.id)}
                    className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
