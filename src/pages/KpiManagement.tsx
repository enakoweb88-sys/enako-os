import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const FIELD_MARKETER_KPIS = [
  { title: 'Prospecting', target: 200, unit: 'verified prospects', weight: 10, description: 'New prospects contacted—about 10 daily. Count only genuine app downloads and verified prospects.' },
  { title: 'Verified Akawo account activations', target: 40, unit: 'verified accounts', weight: 30, description: 'Customers who create an Akawo account and pass required verification.' },
  { title: 'Landbanking accounts with first payment', target: 20, unit: 'funded accounts', weight: 15, description: 'Landbanking accounts with a confirmed first payment.' },
  { title: 'Customer follow-up within 48 hours', target: 20, unit: 'follow-ups', weight: 10, description: 'Follow up with every interested prospect within 48 hours.' },
  { title: 'Customer retention: second payment within 30 days', target: 60, unit: '%', weight: 15, description: 'Percentage of newly activated customers making a confirmed second payment within 30 days.' },
  { title: 'Daily field reports and office check-ins', target: 8, unit: 'reports/check-ins', weight: 10, description: 'Submit daily field reports and attend twice-weekly office check-ins.' },
  { title: 'Conduct and attendance', target: 100, unit: '%', weight: 10, description: 'Punctuality, accurate customer information and compliance with company procedures.' },
];

type KpiRow = { id?: string; title: string; description: string; target: string; unit: string; weight: string; currentValue?: number };
const blankRow = (): KpiRow => ({ title: '', description: '', target: '', unit: '', weight: '' });
const FIELD_MARKETER_UNITS = ['verified prospects', 'app downloads', 'verified accounts', 'funded accounts', 'follow-ups', 'retained customers', 'reports', 'office check-ins', '%'];
const DEPARTMENT_UNITS: Record<string, string[]> = {
  Engineering: ['features', 'deployments', 'pull requests', 'code reviews', 'bugs resolved', 'incidents', 'systems', 'hours', '%'],
  Finance: ['XAF', 'transactions', 'invoices', 'reconciliations', 'reports', 'audits', 'accounts', '%'],
  'Digital Marketing': ['campaigns', 'posts', 'leads', 'impressions', 'clicks', 'engagements', 'followers', 'conversions', '%'],
  Operations: ['tasks', 'workflows', 'cases', 'customers served', 'reports', 'visits', 'hours', '%'],
  Compliance: ['reviews', 'KYC cases', 'audits', 'incidents', 'reports', 'policies', '%'],
  Management: ['projects', 'milestones', 'reviews', 'reports', 'meetings', 'deliverables', '%'],
  HR: ['hires', 'interviews', 'trainings', 'reviews', 'employees', 'sessions', '%'],
  'Outreach / NGO': ['beneficiaries', 'applications', 'events', 'partners', 'donations', 'projects', 'visits', '%'],
};

export default function KpiManagement() {
  const { user } = useAuth();
  const isCeo = user?.role?.toUpperCase() === 'CEO';
  const [params, setParams] = useSearchParams();
  const [employees, setEmployees] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState(params.get('employeeId') || '');
  const [rows, setRows] = useState<KpiRow[]>([]);
  const [customUnits, setCustomUnits] = useState<Record<number, boolean>>({});
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [people, allGoals] = await Promise.all([api.employees({ limit: 1000 }), api.goals()]);
    setEmployees(people.items || []);
    setGoals(Array.isArray(allGoals) ? allGoals : []);
  };
  useEffect(() => { load().catch(() => toast.error('Could not load KPI workspace')); }, []);

  useEffect(() => {
    const person = employees.find(e => e.id === employeeId);
    if (person?.department) setDepartment(person.department);
  }, [employees, employeeId]);

  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[], [employees]);
  const filteredEmployees = employees.filter(e => !department || e.department === department);
  const selected = employees.find(e => e.id === employeeId);
  const unitOptions = selected?.title?.toLowerCase() === 'field marketer'
    ? FIELD_MARKETER_UNITS
    : (DEPARTMENT_UNITS[selected?.department] || ['tasks', 'projects', 'deliverables', 'reports', 'hours', '%']);
  useEffect(() => {
    if (!selected) { setRows([]); return; }
    const existing = goals.filter(g => g.scope === 'PERSONAL' && (g.ownerId === selected.id || g.owner?.id === selected.id) && (g.isKpi || selected.title?.toLowerCase() === 'field marketer'));
    if (existing.length) {
      setRows(existing.map(g => ({ id: g.id, title: g.title || '', description: g.description || '', target: String(g.targetLabel ?? g.targetValue ?? ''), unit: g.unit || '', weight: String(g.kpiWeight ?? FIELD_MARKETER_KPIS.find(k => k.title.toLowerCase() === g.title?.toLowerCase())?.weight ?? ''), currentValue: Number(g.currentValue || 0) })));
    } else if (selected.title?.toLowerCase() === 'field marketer') {
      setRows(FIELD_MARKETER_KPIS.map(k => ({ ...k, target: String(k.target), weight: String(k.weight) })));
    } else {
      setRows([]);
    }
    setRemovedIds([]);
    setCustomUnits({});
  }, [selected?.id, goals]);

  const scoreFor = (id: string) => Math.round(goals.filter(g => g.scope === 'PERSONAL' && (g.ownerId === id || g.owner?.id === id) && g.isKpi).reduce((sum, g) => {
    const target = Math.max(1, Number(g.targetValue || 0));
    return sum + Number(g.kpiWeight || 0) * Math.min(1, Number(g.currentValue || 0) / target);
  }, 0));
  const numericTarget = (value: string) => Number(value.replace(/,/g, '').match(/\d+(?:\.\d+)?/)?.[0] || 0);
  const score = rows.reduce((sum, row) => sum + Number(row.weight || 0) * Math.min(1, Number(row.currentValue || 0) / Math.max(1, numericTarget(row.target))), 0);
  const totalWeight = rows.reduce((sum, row) => sum + Number(row.weight || 0), 0);
  const rating = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Needs improvement' : 'Unsatisfactory';

  const updateRow = (index: number, field: keyof KpiRow, value: string) => setRows(current => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
  const removeRow = (index: number) => {
    const row = rows[index];
    if (row.id && !isCeo) return toast.error('Only the CEO can remove an existing KPI.');
    if (row.id) setRemovedIds(ids => [...ids, row.id!]);
    setRows(current => current.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!employeeId) return toast.error('Select an employee');
    if (rows.some(row => !row.title.trim() || !row.target.trim() || numericTarget(row.target) <= 0 || Number(row.weight) < 0)) return toast.error('Each KPI needs a title, a target containing a number, and a valid score.');
    if (totalWeight !== 100) return toast.error(`KPI scores must total 100 points. Current total: ${totalWeight}.`);
    setSaving(true);
    try {
      if (isCeo) await Promise.all(removedIds.map(id => api.deleteGoal(id)));
      const dueDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString();
      for (const row of rows) {
        const payload = { title: row.title.trim(), description: row.description.trim() || undefined, targetValue: numericTarget(row.target), targetLabel: row.target.trim(), unit: row.unit.trim() || undefined, kpiWeight: Number(row.weight), isKpi: true, dueDate, scope: 'PERSONAL', ownerId: employeeId };
        if (row.id) await api.updateGoal(row.id, payload); else await api.createGoal(payload);
      }
      toast.success('Employee KPI scorecard saved and synchronized.');
      setRemovedIds([]);
      await load();
      setParams({ employeeId });
    } catch (e: any) { toast.error(e.message || 'Could not save KPI scorecard'); }
    finally { setSaving(false); }
  };

  return <div className="space-y-4 pb-24 sm:space-y-5">
    <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operations / Employee KPIs</p><h1 className="mt-1 text-xl font-bold text-[#001f5b] sm:text-2xl">Employee KPI Scorecards</h1><p className="mt-1 text-xs text-slate-500">Each department and employee can have a different set of measurable monthly KPIs.</p></div>

    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6"><div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold text-slate-600">Department<select value={department} onChange={e => { setDepartment(e.target.value); setEmployeeId(''); setParams({}); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">All departments</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></label>
      <label className="text-xs font-bold text-slate-600">Employee<select value={employeeId} onChange={e => { setEmployeeId(e.target.value); setParams(e.target.value ? { employeeId: e.target.value } : {}); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Select employee</option>{filteredEmployees.map(e => <option key={e.id} value={e.id}>{e.fullName} — {e.title || 'Employee'}</option>)}</select></label>
    </div></section>

    {!selected && <section className="space-y-3"><div><h2 className="text-sm font-bold text-[#001f5b]">Employees</h2><p className="text-xs text-slate-500">Choose an employee to configure their individual KPI scorecard.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredEmployees.map(person => {
      const count = goals.filter(g => g.isKpi && (g.ownerId === person.id || g.owner?.id === person.id)).length;
      return <button key={person.id} onClick={() => { setEmployeeId(person.id); setParams({ employeeId: person.id }); }} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-[#00aeb5]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-900">{person.fullName}</p><p className="mt-0.5 text-xs text-slate-500">{person.title || 'Employee'} · {person.department || 'No department'}</p></div><span className="rounded-lg bg-[#001f5b] px-2.5 py-1 text-xs font-bold text-white">{scoreFor(person.id)}/100</span></div><p className="mt-4 text-xs text-slate-600">{count ? `${count} KPI${count === 1 ? '' : 's'} assigned` : 'No KPI scorecard assigned'}</p><p className="mt-2 text-[10px] font-bold uppercase text-[#00aeb5]">Open scorecard</p></button>;
    })}</div></section>}

    {selected && <>
      <section className="rounded-xl bg-[#001f5b] p-4 text-white sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-slate-300">{selected.fullName} · {selected.department}</p><h2 className="text-lg font-bold">{selected.title || 'Employee'}</h2></div><div className="sm:text-right"><p className="text-3xl font-bold">{Math.round(score)}<span className="text-sm text-slate-300">/100</span></p><p className="text-xs font-bold text-[#4ce0e4]">{rating}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-300 sm:grid-cols-4"><span>80–100 Excellent</span><span>65–79 Good</span><span>50–64 Needs improvement</span><span>Below 50 Unsatisfactory</span></div></section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#001f5b]">{selected.title || 'Employee'} KPI scorecard</h2><p className="text-xs text-slate-500">Edit criteria, monthly targets and score weights. Scores must total 100.</p></div><button onClick={() => setRows(current => [...current, blankRow()])} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#001f5b] px-4 py-2.5 text-xs font-bold text-[#001f5b] sm:w-auto"><Plus className="h-4 w-4"/>Add KPI</button></div>
        {rows.length === 0 ? <div className="p-8 text-center"><p className="text-sm font-bold text-slate-700">No KPIs assigned</p><p className="mt-1 text-xs text-slate-500">Add KPIs designed for this employee’s department and responsibilities.</p></div> : <div className="space-y-4 bg-slate-50 p-3 sm:p-5">{rows.map((row, i) => {
          const customUnit = Boolean(row.unit) && !unitOptions.includes(row.unit);
          return <article key={row.id || i} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#001f5b] text-xs font-bold text-white">{i + 1}</span><div><p className="text-xs font-bold text-[#001f5b]">KPI {i + 1}</p><p className="text-[10px] text-slate-500">Performance criterion and scoring</p></div></div>
              <button title="Remove KPI" onClick={() => removeRow(i)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4"/></button>
            </header>
            <div className="space-y-4 p-4 sm:p-5">
              <section className="grid gap-4 lg:grid-cols-2">
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">KPI name<input value={row.title} onChange={e => updateRow(i, 'title', e.target.value)} placeholder="e.g. Code review quality" className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-[#00aeb5]"/></label>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Description<textarea value={row.description} onChange={e => updateRow(i, 'description', e.target.value)} rows={2} placeholder="Expected outcome and verification criteria" className="mt-1.5 min-h-11 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#00aeb5]"/></label>
              </section>
              <section className="border-t border-slate-100 pt-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Target and scoring</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Monthly target<input type="text" value={row.target} onChange={e => updateRow(i, 'target', e.target.value)} placeholder="e.g. 200 prospects, 10 daily, or 60% retention" className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-[#00aeb5]"/><span className="mt-1.5 block font-normal normal-case text-slate-400">Enter numbers, words, or both. Include a number for progress tracking.</span></label>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Measurement unit<select value={customUnit || customUnits[i] ? 'custom' : row.unit} onChange={e => { const custom = e.target.value === 'custom'; setCustomUnits(state => ({ ...state, [i]: custom })); if (!custom) updateRow(i, 'unit', e.target.value); else updateRow(i, 'unit', ''); }} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-[#00aeb5]"><option value="">Select unit</option>{unitOptions.map(value => <option key={value} value={value}>{value}</option>)}<option value="custom">Custom unit</option></select>{customUnit || customUnits[i] ? <input value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)} placeholder="Type a custom measurement unit" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm normal-case text-slate-900"/> : null}</label>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:col-span-2 lg:col-span-1">Score weight<input type="number" min="0" max="100" value={row.weight} onChange={e => updateRow(i, 'weight', e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#00aeb5]"/><span className="mt-1.5 block font-normal normal-case text-slate-400">Points contributed to the 100-point score</span></label>
              </div></section>
            </div>
          </article>;
        })}</div>}
        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><p className={`text-sm font-bold ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>Total score weight: {totalWeight}/100</p><button onClick={save} disabled={saving || rows.length === 0} className="w-full rounded-lg bg-[#001f5b] px-5 py-3 text-xs font-bold text-white disabled:opacity-50 sm:w-auto">{saving ? 'Saving…' : 'Save KPI scorecard'}</button></div>
      </section>
    </>}
  </div>;
}
