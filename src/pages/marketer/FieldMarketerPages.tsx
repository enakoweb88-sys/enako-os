import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Phone,
  MapPin,
  Tag,
  Target,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api, type MarketerLead, type MarketerTerritoryZone, type MarketerScorecard } from '../../lib/api';
import { useAuth } from '../../lib/auth';

type Metric = { title: string; current: number; target: number; unit?: string };

const PageTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6481a8]">
      ENAKO OS&nbsp; / &nbsp;MARKETING&nbsp; / &nbsp;FIELD WORKSPACE
    </p>
    <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#002b70]">{title}</h1>
    <p className="mt-1 text-xs text-[#6681a8]">{subtitle}</p>
  </div>
);

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  
  <section className={`rounded-xl border border-[#d8e2ee] bg-white p-5 shadow-xs ${className}`}>
    {children}
  </section>
);

const scoreWeights: Record<string, number> = {
  prospecting: 10,
  'verified akawo account activations': 30,
  'landbanking accounts with first payment': 15,
  'customer follow-up within 48 hours': 10,
  'customer retention: second payment within 30 days': 15,
  'daily field reports and office check-ins': 10,
  'conduct and attendance': 10,
};

function MetricCard({ metric }: { metric: Metric; key?: any }) {
  const progress = metric.target ? Math.min(100, Math.round((metric.current / metric.target) * 100)) : 0;
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <p className="text-xs font-bold text-[#002b70] leading-snug">{metric.title}</p>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-[#002b70]">{metric.current}</span>
          <span className="text-sm font-medium text-[#6f86a7]">/ {metric.target}</span>
          {metric.unit && <span className="text-[10px] text-[#8aa1be] ml-1">{metric.unit}</span>}
        </div>
      </div>
      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-[#eaf0f6] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#14bec7] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-[#7087a8]">
          <span>Progress</span>
          <span className="font-semibold text-[#002b70]">{progress}%</span>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. MARKETER WORKSPACE (HOME)
// ─────────────────────────────────────────────────────────────

export function MarketerWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [territory, setTerritory] = useState<MarketerTerritoryZone[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedGoals, loadedTasks, loadedTerritory] = await Promise.all([
        api.goals().catch(() => []),
        api.tasks().catch(() => []),
        api.marketerTerritory().catch(() => []),
      ]);

      let validGoals = Array.isArray(loadedGoals)
        ? loadedGoals.filter((goal: any) => Object.keys(scoreWeights).includes(goal.title?.trim().toLowerCase()))
        : [];

      // If Anthony or field marketer has no goals assigned yet, auto-provision the official template
      if (validGoals.length === 0) {
        try {
          const autoSeeded = await api.ensureMarketerKpis();
          if (Array.isArray(autoSeeded) && autoSeeded.length > 0) {
            validGoals = autoSeeded.filter((goal: any) =>
              Object.keys(scoreWeights).includes(goal.title?.trim().toLowerCase()),
            );
          }
        } catch {
          // ignore auto-seed error
        }
      }

      setGoals(validGoals);
      setTasks(Array.isArray(loadedTasks) ? loadedTasks : []);
      setTerritory(Array.isArray(loadedTerritory) ? loadedTerritory : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo<Metric[]>(() => {
    if (goals.length > 0) {
      return goals.slice(0, 4).map((goal: any) => ({
        title: goal.title,
        current: Number(goal.currentValue || 0),
        target: Number(goal.targetValue || 0),
        unit: goal.unit || undefined,
      }));
    }
    return [
      { title: 'Prospecting', current: 0, target: 200, unit: 'prospects' },
      { title: 'Verified Akawo activations', current: 0, target: 40, unit: 'accounts' },
      { title: 'Landbanking accounts', current: 0, target: 20, unit: 'accounts' },
      { title: 'Customer follow-up', current: 0, target: 20, unit: 'follow-ups' },
    ];
  }, [goals]);

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Good morning, ${user?.fullName?.split(' ')[0] || 'Marketer'}.`}
        subtitle="Plan visits, record prospect follow-ups, and log verified account activations."
      />

      {/* Monthly KPI Overview Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-[#e7f9fa] border border-[#bce8ee] px-4 py-3 text-xs text-[#167891]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#14bec7] shrink-0" />
          <span>
            <b>MONTHLY PERFORMANCE WORKSPACE</b> — KPIs sync automatically with your approved daily field reports.
          </span>
        </div>
        <button
          onClick={() => navigate('/app/marketer/performance')}
          className="font-bold text-[#002b70] hover:underline flex items-center gap-1 shrink-0"
        >
          View all 7 KPIs <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </div>

      {/* Main Grid: Priorities & Territory */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Today's Priorities */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#002b70]">Today&apos;s Priorities & Action Plan</h2>
              <span className="text-[10px] font-semibold text-[#6a83a6] uppercase tracking-wider">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {tasks.length > 0 ? (
                tasks.slice(0, 4).map((task: any) => (
                  <div key={task.id || task.title} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#14bec7]" />
                    <div>
                      <p className="text-xs font-bold text-[#002b70]">{task.title}</p>
                      <p className="mt-0.5 text-xs text-[#6a83a6]">{task.description || 'Record outcome and agree next step with prospect.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                [
                  ['Follow up high-priority prospects', 'Contact newly recorded prospects within 48 hours.'],
                  ['Demonstrate Akawo & Land Banking', 'Present product benefits to shop owners and cooperatives.'],
                  ['Collect verification evidence', 'Capture account reference numbers for completed registrations.'],
                  ['Submit daily field report', 'Log daily activity metrics before 6:00 PM for HOD review.'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#14bec7]" />
                    <div>
                      <p className="text-xs font-bold text-[#002b70]">{title}</p>
                      <p className="mt-0.5 text-xs text-[#6a83a6]">{desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/app/marketer/daily-report')}
              className="rounded-lg bg-[#001f5b] hover:bg-[#001f5b]/90 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
            >
              PREPARE DAILY FIELD REPORT
            </button>
            <button
              onClick={() => navigate('/app/marketer/leads')}
              className="rounded-lg border border-[#ccdbe8] bg-white px-4 py-2.5 text-xs font-bold text-[#002b70] hover:bg-slate-50 transition-colors"
            >
              OPEN LEAD REGISTER
            </button>
          </div>
        </Card>

        {/* Assigned Territory Preview */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#002b70]">Assigned Territory</h2>
            <button
              onClick={() => navigate('/app/marketer/territory')}
              className="text-[11px] font-bold text-[#14bec7] hover:underline"
            >
              View details
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {territory.length > 0 ? (
              territory.map((zone, idx) => (
                <div key={zone.id || zone.zoneName} className="p-3 rounded-lg border border-[#e4ecf4] bg-[#fbfdff]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#002b70]">
                      0{idx + 1}&nbsp; {zone.zoneName}
                    </p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                      {zone.region || 'Bonaberi'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6a83a6]">{zone.targetAudience || 'Market vendors & shops'}</p>
                  {zone.schedule && (
                    <p className="mt-1.5 text-[10px] font-semibold text-[#14bec7]">{zone.schedule}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">Loading assigned territory zones...</p>
            )}
          </div>

          <p className="mt-4 text-[10px] text-[#7189aa] leading-relaxed">
            Boundaries and visit schedules are approved by the Head of Department.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. MARKETER LEADS & SCORECARD REGISTER
// ─────────────────────────────────────────────────────────────

export function MarketerLeads() {
  const [leads, setLeads] = useState<MarketerLead[]>([]);
  const [scorecard, setScorecard] = useState<MarketerScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  // New Lead Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    prospectName: '',
    phone: '',
    zone: 'Bonassama',
    product: 'Akawo / Savings',
    followUpDate: '',
    nextAction: '',
    notes: '',
    contactPermission: true,
  });

  // Edit / Action Modal State
  const [editingLead, setEditingLead] = useState<MarketerLead | null>(null);
  const [editOutcome, setEditOutcome] = useState('');
  const [editEvidence, setEditEvidence] = useState('');
  const [editStatus, setEditStatus] = useState('NEW_LEAD');

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, scorecardRes] = await Promise.all([
        api.marketerLeads().catch(() => []),
        api.marketerScorecard().catch(() => null),
      ]);
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
      setScorecard(scorecardRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!newLead.prospectName.trim()) {
      toast.error('Prospect name is required');
      return;
    }

    try {
      await api.createMarketerLead(newLead);
      toast.success('Prospect lead added to register');
      setShowAddModal(false);
      setNewLead({
        prospectName: '',
        phone: '',
        zone: 'Bonassama',
        product: 'Akawo / Savings',
        followUpDate: '',
        nextAction: '',
        notes: '',
        contactPermission: true,
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lead');
    }
  };

  const handleUpdateLeadOutcome = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      await api.updateMarketerLead(editingLead.id, {
        status: editStatus,
        outcome: editOutcome,
        evidenceRef: editEvidence,
      });
      toast.success('Lead outcome updated successfully');
      setEditingLead(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update lead');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title="Leads & Field Performance"
          subtitle="Record prospect interactions, schedule follow-ups, and track verified account outcomes."
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#001f5b] hover:bg-[#001f5b]/90 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PROSPECT LEAD</span>
        </button>
      </div>

      {/* Lead Register Table */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-bold text-[#002b70]">Lead & Follow-up Register</h2>
            <p className="text-xs text-[#6a83a6] mt-0.5">
              Live customer leads with follow-up milestones and evidence reference IDs.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#14bec7]">
            {leads.length} recorded {leads.length === 1 ? 'prospect' : 'prospects'}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#7187a8] border-b border-slate-100">
              <tr>
                <th className="pb-3">Prospect / Zone</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Follow-up / Action</th>
                <th className="pb-3">Evidence ID</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading live leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No leads in your register yet. Click &quot;NEW PROSPECT LEAD&quot; to add your first prospect.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isVerified = lead.status === 'VERIFIED';
                  const isOpened = lead.status === 'ACCOUNT_OPENED';
                  const isDue = lead.status === 'FOLLOW_UP_DUE';
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <p className="font-bold text-[#002b70]">{lead.prospectName}</p>
                        <p className="text-[10px] text-[#7189aa] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{lead.zone || 'Bonaberi'}</span>
                        </p>
                      </td>
                      <td className="py-3 text-slate-600">
                        {lead.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lead.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </td>
                      <td className="py-3 font-semibold text-[#002b70]">{lead.product || 'Akawo / Savings'}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isOpened
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isDue
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-slate-700">
                        <p className="font-medium">{lead.nextAction || 'Follow up'}</p>
                        {lead.followUpDate && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(lead.followUpDate).toLocaleDateString()}</span>
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 font-mono text-[11px]">
                        {lead.evidenceRef ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-[#002b70]">
                            {lead.evidenceRef}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setEditStatus(lead.status);
                            setEditOutcome(lead.outcome || '');
                            setEditEvidence(lead.evidenceRef || '');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 text-[#002b70] hover:bg-slate-200 font-semibold text-[11px] transition-colors"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Grid: Live Weekly Scorecard & Verification Policy */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Live Weekly Scorecard */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-[#002b70]">Weekly Field Scorecard</h2>
              <p className="text-xs text-[#6a83a6] mt-0.5">
                Calculated from your submitted daily field reports and recorded lead activations for the current calendar week.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase">
              Current Week
            </span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_80px_80px_100px] gap-y-3.5 text-xs items-center">
            <p className="text-[10px] font-bold uppercase text-[#7187a8]">Measure</p>
            <p className="text-[10px] font-bold uppercase text-[#7187a8] text-center">Actual</p>
            <p className="text-[10px] font-bold uppercase text-[#7187a8] text-center">Target</p>
            <p className="text-[10px] font-bold uppercase text-[#7187a8] text-right">Progress</p>

            {(scorecard?.measures || [
              { label: 'People approached', actual: 0, target: 100 },
              { label: 'Qualified prospects', actual: 0, target: 40 },
              { label: 'Verified accounts', actual: 0, target: 15 },
              { label: 'First transactions', actual: 0, target: 8 },
              { label: 'Follow-ups completed', actual: 0, target: 25 },
              { label: 'Daily reports', actual: 0, target: 5 },
            ]).map((measure) => {
              const pct = measure.target ? Math.min(100, Math.round((measure.actual / measure.target) * 100)) : 0;
              return (
                <div key={measure.label} className="contents">
                  <p className="font-semibold text-[#002b70]">{measure.label}</p>
                  <p className="font-bold text-[#002b70] text-center">{measure.actual}</p>
                  <p className="text-[#7189aa] text-center">{measure.target}</p>
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#14bec7]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Verification Policy Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-[#002b70]">Verification & Accountability</h2>
            <div className="mt-3 space-y-3 text-xs text-[#6681a8] leading-relaxed">
              <p>
                <b>Account opened</b> is not the same as a verified account. A verified account requires active app registration and valid KYC documentation.
              </p>
              <p>
                Always enter the <b>evidence / account reference ID</b> into the lead record or your daily report so the HOD can verify with banking records.
              </p>
              <p>
                Commissions are calculated on verified first transactions and retained accounts under company policy.
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-[11px] text-amber-800">
            <b>Note:</b> Submissions without evidence references cannot be verified by management.
          </div>
        </Card>
      </div>

      {/* ── MODAL: CREATE LEAD ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#002b70]">Add New Prospect Lead</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#002b70] mb-1">Prospect / Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mambanda Provision Stores"
                  value={newLead.prospectName}
                  onChange={(e) => setNewLead({ ...newLead, prospectName: e.target.value })}
                  className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#002b70] mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#002b70] mb-1">Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Bonassama"
                    value={newLead.zone}
                    onChange={(e) => setNewLead({ ...newLead, zone: e.target.value })}
                    className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#002b70] mb-1">Product Interested In</label>
                  <select
                    value={newLead.product}
                    onChange={(e) => setNewLead({ ...newLead, product: e.target.value })}
                    className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                  >
                    <option value="Akawo / Savings">Akawo / Savings</option>
                    <option value="Njangi">Njangi</option>
                    <option value="Land Banking">Land Banking</option>
                    <option value="Remittance & MoMo">Remittance & MoMo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#002b70] mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={newLead.followUpDate}
                    onChange={(e) => setNewLead({ ...newLead, followUpDate: e.target.value })}
                    className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#002b70] mb-1">Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Demonstrate mobile app, confirm initial deposit"
                  value={newLead.nextAction}
                  onChange={(e) => setNewLead({ ...newLead, nextAction: e.target.value })}
                  className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#002b70] mb-1">Notes / Context</label>
                <textarea
                  rows={2}
                  placeholder="Additional background on prospect need and objections..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="contactPermission"
                  checked={newLead.contactPermission}
                  onChange={(e) => setNewLead({ ...newLead, contactPermission: e.target.checked })}
                  className="rounded border-slate-300 text-[#14bec7]"
                />
                <label htmlFor="contactPermission" className="text-slate-600 font-medium">
                  Prospect granted permission to be contacted by ENAKO.
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001f5b] text-white rounded-lg font-bold hover:bg-[#001f5b]/90 shadow-xs"
                >
                  Save Prospect Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: UPDATE LEAD / OUTCOME ── */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#002b70]">Update Prospect Outcome</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingLead.prospectName}</p>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLeadOutcome} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#002b70] mb-1">Lead Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                >
                  <option value="NEW_LEAD">New Lead</option>
                  <option value="FOLLOW_UP_DUE">Follow-up Due</option>
                  <option value="ACCOUNT_OPENED">Account Opened (Pending Verification)</option>
                  <option value="VERIFIED">Verified Account</option>
                  <option value="LOST">Lost / Not Interested</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#002b70] mb-1">
                  Evidence / Account Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACC-2026-AKW-0091"
                  value={editEvidence}
                  onChange={(e) => setEditEvidence(e.target.value)}
                  className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Reference required for HOD verification and KPI credit.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#002b70] mb-1">Follow-up Outcome & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record customer response, commitments, or reason for delay..."
                  value={editOutcome}
                  onChange={(e) => setEditOutcome(e.target.value)}
                  className="w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 outline-none focus:border-[#14bec7]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001f5b] text-white rounded-lg font-bold hover:bg-[#001f5b]/90 shadow-xs"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. MARKETER TERRITORY
// ─────────────────────────────────────────────────────────────

export function MarketerTerritory() {
  const [territory, setTerritory] = useState<MarketerTerritoryZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .marketerTerritory()
      .then((res) => setTerritory(Array.isArray(res) ? res : []))
      .catch(() => setTerritory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageTitle
        title="My Assigned Territory"
        subtitle="Your assigned visit zones, target groups, and planned daily field routes."
      />

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-[#002b70]">Territory Plan • Bonaberi Region</h2>
          <span className="text-xs font-semibold text-[#14bec7]">
            {territory.length} Assigned {territory.length === 1 ? 'Zone' : 'Zones'}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="py-8 text-center text-slate-400 col-span-3">Loading assigned territory...</div>
          ) : territory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 col-span-3">No territory assigned yet by HOD.</div>
          ) : (
            territory.map((zone, index) => (
              <div
                key={zone.id || zone.zoneName}
                className="rounded-xl border border-[#d8e2ee] bg-[#fbfdff] p-5 shadow-2xs hover:border-[#14bec7] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#002b70]">
                    0{index + 1}&nbsp; {zone.zoneName}
                  </p>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                    {zone.region || 'Bonaberi'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[#6681a8] leading-relaxed">
                  {zone.targetAudience || 'Market vendors, commercial shops and local community groups'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#14bec7]">{zone.schedule || 'Scheduled Visit'}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Active Zone</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-[#002b70]">Territory Management & Reassignment Policy</p>
          <p>
            Territory boundaries and schedules are managed by your Head of Department. If you require boundary adjustments or additional coverage support, discuss during the weekly field check-in.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. MARKETER PERFORMANCE (SCORECARD & 7 KPI DIMENSIONS)
// ─────────────────────────────────────────────────────────────

export function MarketerPerformance() {
  const [goals, setGoals] = useState<any[]>([]);
  const [scorecard, setScorecard] = useState<MarketerScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.goals().catch(() => []),
      api.marketerScorecard().catch(() => null),
    ]).then(([gRes, scRes]) => {
      let valid = Array.isArray(gRes)
        ? gRes.filter((g: any) => Object.keys(scoreWeights).includes(g.title?.trim().toLowerCase()))
        : [];
      if (valid.length === 0) {
        api.ensureMarketerKpis().then((res) => {
          if (Array.isArray(res)) setGoals(res);
        }).catch(() => undefined);
      } else {
        setGoals(valid);
      }
      setScorecard(scRes);
      setLoading(false);
    });
  }, []);

  const monthlyScore = Math.round(
    goals.reduce((score, goal) => {
      const weight = scoreWeights[goal.title?.trim().toLowerCase()] || 0;
      const target = Number(goal.targetValue || 0);
      const progress = target > 0 ? Math.min(Number(goal.currentValue || 0) / target, 1) : 0;
      return score + weight * progress;
    }, 0),
  );

  const rating =
    monthlyScore >= 80
      ? 'Excellent'
      : monthlyScore >= 65
      ? 'Good'
      : monthlyScore >= 50
      ? 'Needs improvement'
      : 'Unsatisfactory';

  return (
    <div className="space-y-6">
      <PageTitle
        title="My Field Performance & Scorecard"
        subtitle="Transparent evaluation of your monthly KPI achievements and weekly activity volume."
      />

      {/* Monthly Weighted Rating Banner */}
      <div className="rounded-xl bg-[#001f5b] text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Monthly Field Marketer Score
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">{monthlyScore}</span>
            <span className="text-base text-slate-300">/ 100 points</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#14bec7] text-white">
              {rating}
            </span>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-white/10 sm:pl-6 text-xs text-slate-300 space-y-1">
          <p>
            Evaluation Period: <b>{new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</b>
          </p>
          <p>Weighted across 7 performance pillars</p>
        </div>
      </div>

      {/* 7 KPI Dimensions Breakdown */}
      <Card>
        <h2 className="font-bold text-[#002b70] border-b border-slate-100 pb-3">
          7 Official Field Marketer KPI Dimensions
        </h2>

        <div className="mt-4 divide-y divide-slate-100">
          {goals.map((goal) => {
            const weight = scoreWeights[goal.title?.trim().toLowerCase()] || 0;
            const target = Number(goal.targetValue || 0);
            const current = Number(goal.currentValue || 0);
            const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

            return (
              <div key={goal.id || goal.title} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#002b70]">{goal.title}</p>
                    {weight > 0 && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                        Weight: {weight} pts
                      </span>
                    )}
                  </div>
                  {goal.description && <p className="text-[11px] text-slate-500 mt-0.5">{goal.description}</p>}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#002b70]">{current}</span>
                    <span className="text-xs text-slate-400"> / {target} {goal.unit || ''}</span>
                  </div>
                  <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#14bec7]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 w-10 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. MARKETER DAILY REPORT (SUBMISSION & HOD REVIEW HISTORY)
// ─────────────────────────────────────────────────────────────

export function MarketerDailyReport() {
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({
    reportDate: new Date().toISOString().slice(0, 10),
    marketer: `${user?.fullName || ''}`,
    people: '',
    qualified: '',
    followUps: '',
    accounts: '',
    transactions: '',
    evidence: '',
    completed: '',
    blockers: '',
    priorities: '',
  });

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.dailyReports({ type: 'FIELD' });
      setHistory(Array.isArray(res) ? res : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const update = (key: string, value: string) => setForm((curr) => ({ ...curr, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.createDailyReport({
        type: 'FIELD',
        content: JSON.stringify({
          ...form,
          submittedAt: new Date().toISOString(),
        }),
      });
      toast.success('Daily field report submitted for HOD review.');
      setForm((curr) => ({
        ...curr,
        people: '',
        qualified: '',
        followUps: '',
        accounts: '',
        transactions: '',
        evidence: '',
        completed: '',
        blockers: '',
        priorities: '',
      }));
      loadHistory();
    } catch (error: any) {
      toast.error(error.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadReportForCorrection = (report: any) => {
    try {
      const parsed = JSON.parse(report.content);
      setForm({
        reportDate: parsed.reportDate || new Date().toISOString().slice(0, 10),
        marketer: parsed.marketer || user?.fullName || '',
        people: String(parsed.people || ''),
        qualified: String(parsed.qualified || ''),
        followUps: String(parsed.followUps || ''),
        accounts: String(parsed.accounts || ''),
        transactions: String(parsed.transactions || ''),
        evidence: parsed.evidence || '',
        completed: parsed.completed || '',
        blockers: parsed.blockers || '',
        priorities: parsed.priorities || '',
      });
      toast.info('Report loaded into form for correction & re-submission.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Unable to parse report details.');
    }
  };

  const input = (key: string, label: string, type = 'text', placeholder = '') => (
    <label className="text-xs font-bold text-[#002b70]">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(event) => update(key, event.target.value)}
        className="mt-1 w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2 text-xs font-normal outline-none focus:border-[#14bec7]"
      />
    </label>
  );

  const textArea = (key: string, label: string, placeholder = '') => (
    <label className="block text-xs font-bold text-[#002b70]">
      {label}
      <textarea
        value={form[key]}
        placeholder={placeholder}
        onChange={(event) => update(key, event.target.value)}
        className="mt-1.5 w-full rounded-md border border-[#d9e4ef] bg-[#fbfdff] p-2.5 text-xs font-normal outline-none focus:border-[#14bec7]"
        rows={2}
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <PageTitle
        title="Daily Field Report"
        subtitle="A concise record of customer activity, verification references, and field outcomes for HOD review."
      />

      {/* Main Submission Form */}
      <form onSubmit={submit} className="space-y-6">
        <Card>
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-[#002b70]">Activity, Results & Supporting Evidence</h2>
            <p className="text-xs text-[#6a83a6] mt-0.5">
              Enter your daily figures accurately. All accounts and transactions require reference IDs for verification.
            </p>
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {input('reportDate', 'Report date *', 'date')}
            {input('marketer', 'Marketer name / Assigned zone *', 'text', 'Anthony - Bonassama')}
            {input('people', 'People approached today', 'number', 'e.g. 15')}
            {input('qualified', 'Qualified prospects identified', 'number', 'e.g. 6')}
            {input('followUps', 'Follow-ups completed', 'number', 'e.g. 4')}
            {input('accounts', 'Accounts opened (pending verification)', 'number', 'e.g. 2')}
            {input('transactions', 'First transactions completed', 'number', 'e.g. 1')}
            {input('evidence', 'Evidence / Account Reference IDs', 'text', 'ACC-2026-081, TX-9921')}
          </div>

          <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
            {textArea('completed', 'Completed tasks and customer feedback', 'Describe shops visited, customer questions, and product reactions...')}
            {textArea('blockers', 'Outstanding work, blockers and support needed', 'Network issues, customer KYC objections, or materials required...')}
            {textArea('priorities', 'Next workday priorities', 'Specific prospects to revisit tomorrow and targeted zone...')}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-[#7189aa]">
              Reports submitted are routed directly to your Head of Department for verification.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#001f5b] hover:bg-[#001f5b]/90 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT FOR HOD REVIEW'}
            </button>
          </div>
        </Card>
      </form>

      {/* Review Workflow Guide Card */}
      <Card>
        <h2 className="font-bold text-[#002b70]">Approval & Review Workflow</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#002b70]">
          <span className="bg-slate-100 px-2.5 py-1 rounded">Draft</span>
          <span>&gt;</span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded">Submitted</span>
          <span>&gt;</span>
          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded">HOD Review</span>
          <span>&gt;</span>
          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded">Verified & Credited</span>
          <span className="text-slate-400 font-normal">or</span>
          <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded">Returned for Correction</span>
        </div>
        <p className="mt-2 text-[10px] text-[#7189aa]">
          Verified reports automatically advance your personal monthly KPI counters and weekly scorecard.
        </p>
      </Card>

      {/* Previous Submissions & Review History */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-[#002b70]">Submission & HOD Review History</h2>
            <p className="text-xs text-[#6a83a6] mt-0.5">
              Review status, verification feedback, and correction requests from management.
            </p>
          </div>
          <button
            onClick={loadHistory}
            className="text-xs font-bold text-[#14bec7] hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {loadingHistory ? (
            <p className="py-6 text-center text-xs text-slate-400">Loading submission history...</p>
          ) : history.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No daily field reports submitted yet. Complete the form above to submit your first report.
            </p>
          ) : (
            history.map((rep) => {
              const isVerified = rep.status === 'VERIFIED';
              const isReturned = rep.status === 'RETURNED';

              let parsedContent: any = {};
              try {
                parsedContent = JSON.parse(rep.content);
              } catch {}

              return (
                <div
                  key={rep.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isReturned
                      ? 'bg-rose-50/40 border-rose-200'
                      : isVerified
                      ? 'bg-teal-50/30 border-teal-200'
                      : 'bg-[#fbfdff] border-[#d8e2ee]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100/80 pb-2.5">
                    <div>
                      <span className="font-bold text-xs text-[#002b70]">
                        Report Date: {new Date(rep.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        Submitted at {new Date(rep.createdAt || rep.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isVerified
                            ? 'bg-teal-50 text-teal-800 border-teal-300'
                            : isReturned
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isVerified ? 'Verified by HOD' : isReturned ? 'Returned for Correction' : 'Under Review'}
                      </span>

                      {isReturned && (
                        <button
                          onClick={() => handleLoadReportForCorrection(rep)}
                          className="px-2.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition-colors"
                        >
                          Revise & Resubmit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Approached</span>
                      <p className="font-bold text-[#002b70]">{parsedContent.people || '0'}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Qualified</span>
                      <p className="font-bold text-[#002b70]">{parsedContent.qualified || '0'}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Follow-ups</span>
                      <p className="font-bold text-[#002b70]">{parsedContent.followUps || '0'}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Accounts</span>
                      <p className="font-bold text-[#002b70]">{parsedContent.accounts || '0'}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200/80 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Transactions</span>
                      <p className="font-bold text-[#002b70]">{parsedContent.transactions || '0'}</p>
                    </div>
                  </div>

                  {/* Evidence Reference */}
                  {parsedContent.evidence && (
                    <p className="mt-2 text-xs text-slate-600">
                      <b>Evidence IDs:</b> <span className="font-mono text-[#002b70]">{parsedContent.evidence}</span>
                    </p>
                  )}

                  {/* HOD Reviewer Note */}
                  {rep.reviewerComments && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-900">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>HOD Feedback {rep.reviewer?.fullName ? `from ${rep.reviewer.fullName}` : ''}:</span>
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed">{rep.reviewerComments}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
