import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  Users, Target, Calendar, CheckSquare, BarChart, PieChart,
  DollarSign, ArrowRight, Award, MessageCircle, PhoneCall
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function fmt(val: string | number | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return n.toLocaleString('fr-CM', { style: 'currency', maximumFractionDigits: 0 });
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
        setPipeline(pl?.stages?.length ? pl : {
          totalValue: 12500000,
          stages: [
            { name: 'New Lead', count: 24, value: 1200000 },
            { name: 'Contacted', count: 18, value: 2500000 },
            { name: 'Interested', count: 12, value: 3800000 },
            { name: 'KYC Sent', count: 5, value: 1500000 },
            { name: 'Active Client', count: 3, value: 3500000 }
          ]
        });
        setTasks(t.length ? t : [
          { id: 1, title: 'Follow up with MTN Rep', context: 'MTN Float Integration', due: 'Today', status: 'IN_PROGRESS' },
          { id: 2, title: 'Send proposal to Tech Hub', context: 'Tech Hub Ltd', due: 'Today', status: 'DONE' },
          { id: 3, title: 'Call new lead from Facebook', context: 'Lead: John Doe', due: 'Tomorrow', status: 'TODO' },
        ]);
        setMeetings(mtg.length ? mtg : [
          { id: 1, time: '10:00 AM', person: 'Sarah Jenkins', type: 'Initial Discovery', status: 'Confirmed' },
          { id: 2, time: '02:30 PM', person: 'Michael Obi', type: 'Proposal Review', status: 'Pending' },
        ]);
        setLeads(ld.length ? ld : [
          { id: 1, name: 'Grace M.', phone: '+237 671 234 567', source: 'WhatsApp', interest: 'Njangi Group', status: 'New', date: '2026-06-11' },
          { id: 2, name: 'Definitive Tech', phone: '+237 692 345 678', source: 'Referral', interest: 'B2B API', status: 'Contacted', date: '2026-06-10' },
          { id: 3, name: 'Alice W.', phone: '+237 653 456 789', source: 'Facebook', interest: 'Bill Payments', status: 'Interested', date: '2026-06-09' },
        ]);
        setPerformance(perf?.target ? perf : {
          target: 20000000, achieved: 12500000, remaining: 7500000, daysLeft: 19,
          sources: [
            { name: 'Referral', value: 45 },
            { name: 'Facebook', value: 25 },
            { name: 'WhatsApp', value: 15 },
            { name: 'Walk In', value: 10 },
            { name: 'Other', value: 5 }
          ],
          topServices: [
            { name: 'B2B API Integrations', count: 42, max: 50 },
            { name: 'Njangi Group Setup', count: 35, max: 50 },
            { name: 'Utility Payments', count: 28, max: 50 }
          ]
        });
        setCommission(comm?.total ? comm : { total: 450000, paid: 300000, pending: 150000 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary text-sm animate-pulse">Loading…</div>;

  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#64748b'];
  const percentAchieved = Math.floor((performance.achieved / performance.target) * 100);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Sales Pipeline Kanban Tracker */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-end mb-6 min-w-[800px]">
          <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
            <Target className="w-5 h-5" /> Sales Pipeline
          </h3>
          <div className="text-right">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Pipeline Value</p>
            <p className="font-display text-2xl font-bold text-primary">{fmt(pipeline.totalValue)}</p>
          </div>
        </div>
        
        <div className="flex gap-4 min-w-[800px]">
          {pipeline.stages.map((stage: any, i: number) => (
            <div key={stage.name} className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">{stage.name}</h4>
                <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold">{stage.count}</span>
              </div>
              <p className="text-sm font-mono font-bold text-secondary">{fmt(stage.value, false)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Performance & Commission */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500" />
            <h3 className="font-display text-lg font-bold text-primary mb-4 w-full text-left">My Performance</h3>
            
            <div className="relative w-40 h-40 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-surface-container-high stroke-[8]" />
                <circle cx="50" cy="50" r="40" className="fill-none stroke-primary stroke-[8]" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * percentAchieved) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold text-primary">{percentAchieved}%</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Achieved</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Monthly Target</span>
                <span className="font-bold font-mono text-primary">{fmt(performance.target, false)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Remaining</span>
                <span className="font-bold font-mono text-orange-600">{fmt(performance.remaining, false)}</span>
              </div>
              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-outline-variant/30 text-secondary font-bold uppercase tracking-widest">
                <span>{performance.daysLeft} Days Left</span>
              </div>
            </div>
          </div>

          {/* Commission Summary */}
          <div className="bg-primary text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <div className="relative z-10">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" /> Commission Summary
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Total Earned (YTD)</p>
              <p className="text-3xl font-display font-bold mb-4">{fmt(commission.total)}</p>
              
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <div>
                  <p className="text-[10px] uppercase text-white/70 tracking-widest font-bold">Paid</p>
                  <p className="font-bold">{fmt(commission.paid)}</p>
                </div>
                <div className="w-px h-8 bg-white/20 mx-2" />
                <div className="text-right">
                  <p className="text-[10px] uppercase text-white/70 tracking-widest font-bold">Pending</p>
                  <p className="font-bold text-yellow-300">{fmt(commission.pending)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* My Tasks */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <CheckSquare className="w-5 h-5" /> Today's Tasks
              </h3>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-container px-2 py-1 rounded">
                {tasks.filter(t => t.status === 'DONE').length} / {tasks.length}
              </span>
            </div>
            
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mb-4">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100}%` }} />
            </div>

            <div className="space-y-3">
              {tasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-low/50">
                  <input type="checkbox" checked={t.status === 'DONE'} readOnly className="mt-1" />
                  <div>
                    <p className={`text-sm font-bold ${t.status === 'DONE' ? 'text-secondary line-through' : 'text-primary'}`}>{t.title}</p>
                    <p className="text-[10px] text-secondary uppercase tracking-widest mt-0.5">{t.context} · {t.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meetings */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Meetings
              </h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-fixed px-2 py-1 rounded">Today</p>
            </div>
            <div className="space-y-3 mb-4">
              {meetings.map(m => (
                <div key={m.id} className="flex gap-4 p-3 border-l-2 border-primary bg-surface-container-low/50 rounded-r-lg">
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-primary">{m.time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{m.person}</p>
                    <div className="flex gap-2 items-center mt-0.5">
                      <p className="text-[10px] text-secondary uppercase tracking-widest">{m.type}</p>
                      <span className={cn(
                        'text-[8px] font-black uppercase px-1.5 rounded-full',
                        m.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      )}>{m.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Meeting scheduler opened')} className="w-full py-2 bg-surface-container-low text-primary text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container transition-colors">
              Schedule Meeting
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Leads by Source Donut */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="font-display text-lg font-bold text-primary w-full text-left mb-2 flex items-center gap-2">
              <PieChart className="w-5 h-5" /> Leads by Source
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={performance.sources} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {performance.sources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {performance.sources.map((s: any, i: number) => (
                <div key={s.name} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {s.name} ({s.value}%)
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" /> Top Services Interested In
            </h3>
            <div className="space-y-4">
              {performance.topServices.map((service: any) => (
                <div key={service.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-primary">{service.name}</span>
                    <span className="text-[10px] font-mono text-secondary font-bold">{service.count}</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(service.count / service.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="col-span-12 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Users className="w-5 h-5" /> Recent Leads
            </h3>
            <Link to="/app/leads" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View All Leads</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Lead Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Contact</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Source</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Interest</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leads.map((l: any) => (
                  <tr key={l.id} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-sm font-bold text-primary">{l.name}</td>
                    <td className="px-4 py-3 text-xs text-secondary font-mono">{l.phone}</td>
                    <td className="px-4 py-3 text-xs text-secondary">{l.source}</td>
                    <td className="px-4 py-3 text-xs font-bold text-primary">{l.interest}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-[9px] font-black uppercase px-2 py-0.5 rounded',
                        l.status === 'New' ? 'bg-blue-50 text-blue-700' :
                        l.status === 'Interested' ? 'bg-green-50 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      )}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 flex justify-end gap-2">
                      <button onClick={() => toast.success(`Initiating call sequence with ${l.name}...`)} className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors" title="Call">
                        <PhoneCall className="w-4 h-4" />
                      </button>
                      <button onClick={() => toast.success(`Drafting WhatsApp message to ${l.phone}...`)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors" title="Message">
                        <MessageCircle className="w-4 h-4" />
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
