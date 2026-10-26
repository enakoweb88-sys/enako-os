import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

type Metric = { title: string; current: number; target: number };

const PageTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <>
    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6481a8]">ENAKO OS&nbsp; / &nbsp;MARKETING&nbsp; / &nbsp;FIELD WORKSPACE</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#002b70]">{title}</h1>
    <p className="mt-1 text-xs text-[#6681a8]">{subtitle}</p>
  </>
);

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-[#d8e2ee] bg-white p-5 ${className}`}>{children}</section>
);

const scoreNames = [
  'Prospecting',
  'Verified Akawo account activations',
  'Landbanking accounts with first payment',
  'Customer follow-up within 48 hours',
  'Customer retention: second payment within 30 days',
  'Daily field reports and office check-ins',
  'Conduct and attendance',
];

const sampleMetrics: Metric[] = [
  { title: 'People approached', current: 16, target: 20 },
  { title: 'Qualified prospects', current: 6, target: 8 },
  { title: 'Verified accounts', current: 2, target: 3 },
  { title: 'Follow-ups completed', current: 4, target: 5 },
];

const sampleTasks = [
  ['Complete prospect follow-ups', 'Record outcome and agree the next action.'],
  ['Demonstrate ENAKO products', 'Match the product to the customer need.'],
  ['Check pending account references', 'Request confirmation through the approved workflow.'],
  ['Prepare the daily field report', 'Include results, evidence, blockers and next steps.'],
];

const sampleLeads = [
  ['Demo prospect A', 'Bonassama', 'Akawo / Savings', 'Follow-up due', 'Explain account setup'],
  ['Demo group B', 'Mambanda', 'Njangi', 'New lead', 'Arrange demonstration'],
  ['Demo prospect C', 'Ndobo', 'Land Banking', 'Account opened', 'Verify account reference'],
];

const territory = [
  ['Bonassama', 'Retail shops and services', 'Morning | Prospecting'],
  ['Mambanda', 'Traders and communities', 'Midday | Demonstrations'],
  ['Ndobo', 'Scheduled prospect follow-ups', 'Afternoon | Activation support'],
];

function MetricCard({ metric }: { metric: Metric }) {
  const progress = metric.target ? Math.min(100, (metric.current / metric.target) * 100) : 0;
  return <Card className="p-5"><p className="text-sm font-bold text-[#002b70]">{metric.title}</p><p className="mt-3 text-3xl font-bold text-[#002b70]">{metric.current} <span className="text-base font-normal text-[#6f86a7]">/ {metric.target}</span></p><div className="mt-3 h-1.5 rounded bg-[#eaf0f6]"><div className="h-full rounded bg-[#14bec7]" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-[10px] text-[#7087a8]">Daily sample target</p></Card>;
}

export function MarketerWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.goals().catch(() => []), api.tasks().catch(() => [])]).then(([loadedGoals, loadedTasks]) => {
      setGoals(Array.isArray(loadedGoals) ? loadedGoals.filter((goal: any) => scoreNames.includes(goal.title)) : []);
      setTasks(Array.isArray(loadedTasks) ? loadedTasks : []);
    });
  }, []);

  const metrics = useMemo<Metric[]>(() => goals.length ? goals.slice(0, 4).map((goal: any) => ({ title: goal.title, current: Number(goal.currentValue || 0), target: Number(goal.targetValue || 0) })) : sampleMetrics, [goals]);
  const priorities = tasks.length ? tasks.slice(0, 4).map((task: any) => [task.title, task.description || 'Record outcome and agree the next action.']) : sampleTasks;

  return <div className="space-y-5">
    <PageTitle title={`Good morning, ${user?.fullName?.split(' ')[0] || 'Marketer'}.`} subtitle="Plan your visits. Follow up. Turn interest into active accounts." />
    <div className="rounded-lg bg-[#e7f9fa] px-4 py-3 text-xs text-[#2589a3]"><b>SAMPLE WORKDAY</b><span className="mx-2">|</span>Example figures only. Management must approve final targets.</div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.title} metric={metric} />)}</div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2"><h2 className="font-bold text-[#002b70]">Today&apos;s priorities</h2><div className="mt-3 space-y-4">{priorities.map(([title, description]) => <div key={title} className="flex gap-3"><span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#d7e3ef]" /><div><p className="text-sm font-semibold text-[#002b70]">{title}</p><p className="mt-1 text-xs text-[#6a83a6]">{description}</p></div></div>)}</div><button onClick={() => navigate('/app/marketer/daily-report')} className="mt-5 rounded-lg bg-[#002b70] px-4 py-2 text-xs font-bold text-white">PREPARE DAILY REPORT</button></Card>
      <Card><h2 className="font-bold text-[#002b70]">Territory plan | Bonaberi</h2><div className="mt-4 space-y-5">{territory.map(([zone, detail, schedule], index) => <div key={zone}><p className="text-sm font-bold text-[#002b70]">0{index + 1}&nbsp; {zone}</p><p className="mt-1 text-xs text-[#6a83a6]">{detail}</p><p className="mt-1 text-[10px] font-medium text-[#168ba1]">{schedule}</p></div>)}</div></Card>
    </div>
    <p className="text-[10px] text-[#7189aa]">Proposed territory layout - confirm neighborhoods, boundaries and visit routes with the HOD.</p>
  </div>;
}

export function MarketerLeads() {
  return <div className="space-y-5"><PageTitle title="Leads & performance" subtitle="Keep customer activity, verified outcomes and targets clearly separated." />
    <Card><h2 className="font-bold text-[#002b70]">Lead and follow-up register</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="text-[10px] uppercase text-[#7187a8]"><tr><th className="pb-4">Prospect / zone</th><th className="pb-4">Product</th><th className="pb-4">Status</th><th className="pb-4">Next action</th></tr></thead><tbody>{sampleLeads.map(([name, zone, product, status, action]) => <tr key={name}><td className="py-2"><p className="font-semibold text-[#002b70]">{name}</p><p className="mt-1 text-[10px] text-[#7189aa]">{zone}</p></td><td className="py-2 text-[#002b70]">{product}</td><td className="py-2 text-[#002b70]">{status}</td><td className="py-2 text-[#002b70]">{action}</td></tr>)}</tbody></table></div><p className="mt-2 text-[10px] text-[#7189aa]">Live fields: assigned marketer, contact permission, follow-up date, outcome and evidence reference.</p></Card>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><Card className="lg:col-span-2"><h2 className="font-bold text-[#002b70]">Weekly scorecard | Sample figures</h2><div className="mt-4 grid grid-cols-[1fr_80px_80px] gap-y-3 text-xs"><p className="text-[10px] font-semibold uppercase text-[#7187a8]">Measure</p><p className="text-[10px] font-semibold uppercase text-[#7187a8]">Actual</p><p className="text-[10px] font-semibold uppercase text-[#7187a8]">Target</p>{[['People approached','82','100'],['Qualified prospects','31','40'],['Verified accounts','12','15'],['First transactions','6','8'],['Follow-ups completed','21','25'],['Daily reports','4','5']].flatMap(([label, actual, target]) => [<p key={`${label}-name`} className="text-[#002b70]">{label}</p>, <p key={`${label}-actual`} className="font-bold text-[#002b70]">{actual}</p>, <p key={`${label}-target`} className="text-[#7189aa]">{target}</p>])}</div></Card><Card><h2 className="font-bold text-[#002b70]">Verification & accountability</h2><p className="mt-4 text-xs leading-6 text-[#6681a8]">Account opened is not the same as a verified account and transaction.<br /><br />Confirm results against app records. Check duplicates before approval.<br /><br />Show commissions as pending or approved under the current policy.<br /><br />No commission is calculated here.</p></Card></div>
  </div>;
}

export function MarketerTerritory() { return <div className="space-y-5"><PageTitle title="My territory" subtitle="Your assigned visit areas and planned field routes." /><Card><h2 className="font-bold text-[#002b70]">Territory plan | Bonaberi</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{territory.map(([zone, detail, schedule], index) => <div key={zone} className="rounded-lg border border-[#d8e2ee] p-4"><p className="font-bold text-[#002b70]">0{index + 1}&nbsp; {zone}</p><p className="mt-2 text-xs text-[#6681a8]">{detail}</p><p className="mt-2 text-[10px] font-medium text-[#168ba1]">{schedule}</p></div>)}</div></Card></div>; }

export function MarketerPerformance() { return <MarketerLeads />; }

export function MarketerDailyReport() {
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({ reportDate: new Date().toISOString().slice(0, 10), marketer: `${user?.fullName || ''}`, people: '', qualified: '', followUps: '', accounts: '', transactions: '', evidence: '', completed: '', blockers: '', priorities: '' });
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); try { await api.createDailyReport({ type: 'FIELD', content: JSON.stringify({ ...form, submittedAt: new Date().toISOString() }) }); toast.success('Daily field report submitted for HOD review.'); } catch (error: any) { toast.error(error.message || 'Could not submit report.'); } };
  const input = (key: string, label: string, type = 'text') => <label className="text-xs font-bold text-[#002b70]">{label}<input type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} className="mt-1 w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 text-xs font-normal outline-none focus:border-[#14bec7]" /></label>;
  const textArea = (key: string, label: string) => <label className="block text-xs font-bold text-[#002b70]">{label}<textarea value={form[key]} onChange={(event) => update(key, event.target.value)} className="mt-2 w-full resize-none border-b border-[#d9e4ef] bg-transparent p-2 text-xs font-normal outline-none focus:border-[#14bec7]" rows={2} /></label>;
  return <div className="space-y-5"><PageTitle title="Daily field report" subtitle="A concise work record for the Head of Department to review." /><form onSubmit={submit} className="space-y-5"><Card><h2 className="font-bold text-[#002b70]">Activity, results and supporting evidence</h2><div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">{input('reportDate', 'Report date', 'date')}{input('marketer', 'Marketer name / assigned zone')}{input('people', 'People approached')}{input('qualified', 'Qualified prospects')}{input('followUps', 'Follow-ups completed')}{input('accounts', 'Accounts opened - pending verification')}{input('transactions', 'First transactions - pending verification')}{input('evidence', 'Evidence / account reference IDs')}</div><div className="mt-7 space-y-4">{textArea('completed', 'Completed tasks and customer feedback')}{textArea('blockers', 'Outstanding work, blockers and support needed')}{textArea('priorities', 'Next workday priorities')}</div><button className="mt-5 rounded-lg bg-[#002b70] px-4 py-2 text-xs font-bold text-white">SUBMIT FOR HOD REVIEW</button></Card></form><Card><h2 className="font-bold text-[#002b70]">Review workflow</h2><p className="mt-2 text-sm font-bold text-[#002b70]">Draft&nbsp; &gt;&nbsp; Submitted&nbsp; &gt;&nbsp; HOD review&nbsp; &gt;&nbsp; Verified / Returned for correction</p><p className="mt-2 text-[10px] text-[#7189aa]">Recommended live controls: submission timestamp, reviewer comments and a record of changes.</p></Card></div>;
}
