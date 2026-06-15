import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Calendar as CalendarIcon, Image, PlaySquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Content() {
  const [data, setData] = useState<any>({ dailyCounts: [], summary: {} });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.contentCalendar();
      setData(res);
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
          <h1 className="font-display text-2xl font-bold text-primary">Content Calendar</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Manage scheduled posts & media</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success("Post creator opened")} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors">
            Schedule Post
          </button>
          <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {['Scheduled', 'In Progress', 'Pending', 'Overdue'].map(status => (
          <div key={status} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">{status}</p>
            <p className="text-3xl font-bold font-display text-primary">
              {status === 'Scheduled' ? data.summary?.scheduled || 0 : 
               status === 'In Progress' ? data.summary?.inProgress || 0 :
               status === 'Pending' ? data.summary?.pending || 0 :
               data.summary?.overdue || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {data.dailyCounts?.map((day: any) => (
              <div key={day.day} className="border border-outline-variant/30 rounded-xl p-4 flex flex-col h-32 hover:border-primary/50 transition-colors">
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-auto">{day.day}</span>
                <div className="space-y-2 mt-4">
                  {day.posts > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface-container-low px-2 py-1 rounded">
                      <Image className="w-3 h-3" /> {day.posts} Posts
                    </div>
                  )}
                  {day.reels > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface-container-low px-2 py-1 rounded">
                      <PlaySquare className="w-3 h-3" /> {day.reels} Reels
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
