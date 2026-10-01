import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
  return n.toLocaleString();
}

export function BDOfficerDashboard() {
  const [pipeline, setPipeline] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [commission, setCommission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.pipeline(),
      api.tasks(),
      api.meetings(),
      api.leads(),
      api.bdPerformance(),
      api.commission()
    ])
      .then(([pl, t, mtg, ld, perf, comm]) => {
        setPipeline(pl || { totalValue: 0, stages: [] });
        setTasks(t || []);
        setMeetings(mtg || []);
        setLeads(ld || []);
        setPerformance(perf || { target: 0, achieved: 0, remaining: 0, daysLeft: 0, sources: [], topServices: [] });
        setCommission(comm || { total: 0, paid: 0, pending: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Business Development Hub...
      </div>
    );
  }

  const COLORS = ['#001f5b', '#16a34a', '#d97706', '#9333ea', '#64748b'];
  const percentAchieved = performance.target > 0 ? Math.floor((performance.achieved / performance.target) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Reference Screenshot Top Header Card */}
      <OrganizationHeaderCard />

      {/* Reference Screenshot 4 Top Stat Cards */}
      <WorkplaceStatCards
        domainsCount={fmt(pipeline?.totalValue)}
        usersCount={leads.length}
        groupsCount={`${percentAchieved}%`}
        licensesCount={fmt(commission?.total)}
        card1Label="PIPELINE VALUE"
        card2Label="ACTIVE LEADS"
        card3Label="QUOTA ACHIEVED"
        card4Label="COMMISSION (YTD)"
        card1Icon={<TrendingUp className="w-5 h-5" />}
        card2Icon={<Users className="w-5 h-5" />}
        card3Icon={<Target className="w-5 h-5" />}
        card4Icon={<Award className="w-5 h-5" />}
      />

      {/* Sales Pipeline Kanban Tracker */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Pipeline Stages & Active Deals
          </h3>
          <span className="text-xs text-slate-500">
            {pipeline?.stages?.reduce((acc: number, s: any) => acc + (s.count || 0), 0) || 0} active stage opportunities
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {(pipeline?.stages || []).map((stage: any) => (
            <div key={stage.name} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="text-[11px] font-semibold text-slate-700">{stage.name}</h4>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-bold">{stage.count}</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-900">{fmt(stage.value, false)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Performance & Commission */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 w-full text-left">Quota Performance</h3>
            
            <div className="relative w-36 h-36 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-100 stroke-[8]" />
                <circle cx="50" cy="50" r="40" className="fill-none stroke-[#001f5b] stroke-[8]" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * percentAchieved) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{percentAchieved}%</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Achieved</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Monthly Target</span>
                <span className="font-bold font-mono text-slate-900">{fmt(performance.target, false)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Remaining</span>
                <span className="font-bold font-mono text-rose-600">{fmt(performance.remaining, false)}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-100 text-slate-500 font-semibold">
                <span>{performance.daysLeft} Days Left in Cycle</span>
              </div>
            </div>
          </div>

          {/* Commission Summary */}
          <div className="bg-white border border-slate-200/90 text-slate-900 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Commission Ledger
            </h3>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Earned (YTD)</p>
            <p className="text-2xl font-bold mb-4 font-mono text-emerald-600">{fmt(commission.total)}</p>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-semibold">Paid</p>
                <p className="font-bold font-mono text-xs text-slate-900">{fmt(commission.paid)}</p>
              </div>
              <div className="w-px h-7 bg-slate-200 mx-2" />
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 font-semibold">Pending</p>
                <p className="font-bold font-mono text-xs text-amber-600">{fmt(commission.pending)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Today's Tasks
              </h3>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {tasks.filter(t => t.status === 'DONE').length} / {tasks.length}
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
              <div className="bg-[#001f5b] h-1.5 rounded-full transition-all" style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100 : 0}%` }} />
            </div>

            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No tasks assigned today.</p>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="flex items-start gap-3 p-3 border border-slate-200/80 rounded-lg bg-slate-50/60">
                    <input type="checkbox" checked={t.status === 'DONE'} readOnly className="mt-0.5 rounded text-[#001f5b] focus:ring-[#001f5b]" />
                    <div>
                      <p className={`text-xs font-semibold ${t.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{t.context} · {t.due}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Meetings */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Meetings
              </h3>
              <p className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Today</p>
            </div>
            <div className="space-y-2.5 mb-4">
              {meetings.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No meetings scheduled today.</p>
              ) : (
                meetings.map(m => (
                  <div key={m.id} className="flex gap-3 p-3 border-l-[3px] border-l-[#001f5b] bg-slate-50/60 rounded-r-lg border border-slate-200/80">
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold font-mono text-slate-900">{m.time}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{m.person}</p>
                      <div className="flex gap-2 items-center mt-0.5">
                        <p className="text-[10px] text-slate-500">{m.type}</p>
                        <span className={cn(
                          'text-[9px] font-semibold px-1.5 py-0.5 rounded border',
                          m.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}>{m.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => toast.success('Meeting scheduler opened')} className="w-full py-2 bg-white text-[#001f5b] border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Schedule Meeting
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Leads by Source Donut */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-800 w-full text-left mb-2">
              Leads by Source
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={performance.sources} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                    {performance.sources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {performance.sources.map((s: any, i: number) => (
                <div key={s.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {s.name} ({s.value}%)
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Top Services In Demand
            </h3>
            <div className="space-y-3">
              {performance.topServices.map((service: any) => (
                <div key={service.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-900">{service.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{service.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-[#001f5b] h-1.5 rounded-full" style={{ width: `${(service.count / (service.max || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="col-span-12 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Recent Leads
            </h3>
            <Link to="/app/leads" className="text-xs font-semibold text-[#001f5b] hover:underline">View All Leads</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Lead Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Source</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Interest</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{l.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">{l.phone}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{l.source}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{l.interest}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded border inline-block',
                        l.status === 'New' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        l.status === 'Interested' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      )}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 flex justify-end gap-2">
                      <button onClick={() => toast.success(`Initiating call sequence with ${l.name}...`)} className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors">
                        Call
                      </button>
                      <button onClick={() => toast.success(`Drafting WhatsApp message to ${l.phone}...`)} className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors">
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
