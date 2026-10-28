import { useEffect, useState } from 'react';
import { Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export function MarketerDailyLeaderboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.marketerDailyLeaderboard().then(setRows).catch(() => setRows([]));
  }, []);

  return <section className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
      <div><h3 className="text-sm font-bold text-slate-900">Today&apos;s field performance</h3><p className="text-xs text-slate-500 mt-0.5">Ranked from submitted field results, with conversions weighted highest.</p></div>
      <Link to="/app/goals" className="text-xs font-bold text-[#001f5b] flex items-center gap-1.5"><Target className="w-4 h-4" /> Manage KPIs</Link>
    </div>
    {rows.length ? <div className="divide-y divide-slate-100">
      {rows.slice(0, 5).map((row) => <div key={row.reportId} className="px-5 py-3 flex items-center gap-4">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${row.rank === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{row.rank === 1 ? <Award className="w-4 h-4" /> : row.rank}</span>
        <div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-900 truncate">{row.marketer.fullName}</p><p className="text-[10px] text-slate-500">{Number(row.metrics.accounts || 0)} accounts · {Number(row.metrics.transactions || 0)} first payments · {Number(row.metrics.followUps || 0)} follow-ups</p></div>
        <div className="text-right"><p className="text-sm font-bold text-[#001f5b]">{row.score}</p><p className="text-[9px] uppercase tracking-wider text-slate-400">points</p></div>
      </div>)}
    </div> : <p className="px-5 py-8 text-center text-xs text-slate-500">No field report has been submitted today.</p>}
  </section>;
}
