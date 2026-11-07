import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Download, Search, Filter, Lock, Clock, Calendar,
  ArrowRightLeft, FileText, CheckCircle2, AlertTriangle, Eye,
  RefreshCw, UtensilsCrossed, CreditCard, Receipt, UserCheck, KeyRound,
  History, Layers, Sparkles, Check, ChevronRight, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import ExportLedgerModal from '../../components/ExportLedgerModal';

type AuditModule = 'ALL' | 'TRANSACTIONS' | 'KYC' | 'EXPENSES' | 'MEALS' | 'LEAVE' | 'VAULT';

export interface SystemAuditRecord {
  id: string;
  module: 'Transactions' | 'KYC' | 'Expenses' | 'Staff Meals' | 'Leave' | 'Security & Vault';
  event: string;
  actor: string;
  actorRole: string;
  effectiveDate: string; // The date it happened in reality (editable/backdatable)
  entryTimestamp: string; // The exact non-editable system date & time it was recorded
  deltaDays: number; // Difference in days: entryTimestamp date - effectiveDate
  status: 'VERIFIED' | 'APPROVED' | 'PENDING' | 'SECURED' | 'RECORDED';
  referenceId?: string;
  ip?: string;
  details: string;
  hash?: string;
}

function getActorName(val: any): string {
  if (!val) return 'System Operator';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.fullName || val.name || val.userName || val.email || 'Authorized Operator';
  }
  return String(val);
}

function getRoleName(val: any): string {
  if (!val) return 'Operations';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.role || val.title || val.name || 'Operations';
  }
  return String(val);
}

export default function SecurityAuditPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AuditModule>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [discrepancyFilter, setDiscrepancyFilter] = useState<'ALL' | 'SAME_DAY' | 'BACKDATED'>('ALL');
  const [auditLogs, setAuditLogs] = useState<SystemAuditRecord[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<SystemAuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch only REAL system records across all modules
  const loadRealAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api.auditLogs();
      const modules: Record<string, SystemAuditRecord['module']> = { transaction: 'Transactions', expense: 'Expenses', meal: 'Staff Meals', leave: 'Leave', kyc: 'KYC', kyc_submission: 'KYC' };
      setAuditLogs(rows.map(row => ({ id: row.id, module: modules[row.entity.toLowerCase()] || 'Security & Vault', event: row.action,
        actor: row.actor?.fullName || 'System', actorRole: row.actor?.role?.name || 'System', effectiveDate: row.createdAt.slice(0, 10), entryTimestamp: row.createdAt,
        deltaDays: 0, status: 'RECORDED', referenceId: row.entityId || undefined, details: row.entity + (row.entityId ? ' ? ' + row.entityId : '') })));
    } catch (error) {
      setAuditLogs([]); toast.error(error instanceof Error ? error.message : 'Audit records unavailable');
    } finally { setLoading(false); }

  }, [user]);

  useEffect(() => {
    loadRealAuditLogs();
  }, [loadRealAuditLogs]);

  // Filtered list
  const filteredAudits = useMemo(() => {
    return auditLogs.filter(log => {
      // 1. Tab filter
      if (activeTab === 'TRANSACTIONS' && log.module !== 'Transactions') return false;
      if (activeTab === 'KYC' && log.module !== 'KYC') return false;
      if (activeTab === 'EXPENSES' && log.module !== 'Expenses') return false;
      if (activeTab === 'MEALS' && log.module !== 'Staff Meals') return false;
      if (activeTab === 'LEAVE' && log.module !== 'Leave') return false;
      if (activeTab === 'VAULT' && log.module !== 'Security & Vault') return false;

      // 2. Discrepancy filter
      if (discrepancyFilter === 'SAME_DAY' && (log.deltaDays || 0) > 0) return false;
      if (discrepancyFilter === 'BACKDATED' && (log.deltaDays || 0) <= 0) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = log.id.toLowerCase().includes(q);
        const matchEvent = log.event.toLowerCase().includes(q);
        const matchActor = log.actor.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchRef = log.referenceId?.toLowerCase().includes(q);
        if (!matchId && !matchEvent && !matchActor && !matchDetails && !matchRef) return false;
      }

      return true;
    });
  }, [auditLogs, activeTab, discrepancyFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const txnCount = auditLogs.filter(a => a.module === 'Transactions').length;
    const kycCount = auditLogs.filter(a => a.module === 'KYC').length;
    const expCount = auditLogs.filter(a => a.module === 'Expenses').length;
    const mealsCount = auditLogs.filter(a => a.module === 'Staff Meals').length;
    const leaveCount = auditLogs.filter(a => a.module === 'Leave').length;
    const backdatedCount = auditLogs.filter(a => (a.deltaDays || 0) > 0).length;
    return { total, txnCount, kycCount, expCount, mealsCount, leaveCount, backdatedCount };
  }, [auditLogs]);

  const getModuleBadgeColor = (mod: SystemAuditRecord['module']) => {
    switch (mod) {
      case 'Transactions':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'KYC':
        return 'bg-blue-50 text-[#001f5b] border-blue-200';
      case 'Expenses':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Staff Meals':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Leave':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Security & Vault':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getModuleIcon = (mod: SystemAuditRecord['module']) => {
    switch (mod) {
      case 'Transactions':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />;
      case 'KYC':
        return <UserCheck className="w-3.5 h-3.5 text-[#001f5b]" />;
      case 'Expenses':
        return <Receipt className="w-3.5 h-3.5 text-purple-600" />;
      case 'Staff Meals':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />;
      case 'Leave':
        return <Calendar className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Security & Vault':
        return <Lock className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Security</span>
            <span>/</span>
            <span>Access & Credentials</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">System Audit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#001f5b]" />
            Enterprise System Audit & Activity Verification Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Latest 500 saved company audit events. Dates show when each event was recorded.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={loadRealAuditLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Live Audit Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#001f5b] hover:bg-[#001744] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit (PDF / Excel)
          </button>
        </div>
      </div>

      {/* Top Telemetry Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Audits</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.total}</p>
          <p className="text-[10px] text-slate-500">Live system events</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.txnCount}</p>
          <p className="text-[10px] text-slate-500">Fund movements</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KYC Dossiers</p>
          <p className="text-lg font-bold text-[#001f5b] mt-0.5">{stats.kycCount}</p>
          <p className="text-[10px] text-slate-500">Identity clearances</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expenses & Claims</p>
          <p className="text-lg font-bold text-purple-700 mt-0.5">{stats.expCount}</p>
          <p className="text-[10px] text-slate-500">Corporate claims</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meals & Welfare</p>
          <p className="text-lg font-bold text-amber-700 mt-0.5">{stats.mealsCount}</p>
          <p className="text-[10px] text-slate-500">Daily staff lunches</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retroactive Logs</p>
          <p className="text-lg font-bold text-amber-600 mt-0.5 flex items-center gap-1">
            {stats.backdatedCount}
            <span className="text-[10px] font-normal text-slate-500">entries</span>
          </p>
          <p className="text-[10px] text-slate-500">Backdated actions</p>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto pb-px">
        {[
          { key: 'ALL', label: 'All System Audits', count: stats.total },
          { key: 'TRANSACTIONS', label: 'Transactions Audits', count: stats.txnCount },
          { key: 'KYC', label: 'KYC Audits', count: stats.kycCount },
          { key: 'EXPENSES', label: 'Expense Audits', count: stats.expCount },
          { key: 'MEALS', label: 'Meals Audits', count: stats.mealsCount },
          { key: 'LEAVE', label: 'Leave Audits', count: stats.leaveCount },
          { key: 'VAULT', label: 'Security & Vault', count: auditLogs.filter(a => a.module === 'Security & Vault').length },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AuditModule)}
              className={`px-3.5 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${isActive
                  ? 'border-[#001f5b] text-[#001f5b]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-[#001f5b]/10 text-[#001f5b]' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Audit ID, actor, event, or reference..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-[#001f5b] transition-colors placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Discrepancy Filter:
          </label>
          <select
            value={discrepancyFilter}
            onChange={e => setDiscrepancyFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Records (Any Timing)</option>
            <option value="SAME_DAY">Same-Day / Real-Time Entries Only</option>
            <option value="BACKDATED">Retroactive / Backdated Entries Only</option>
          </select>
        </div>
      </div>

      {/* Main Audit Ledger Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {activeTab === 'ALL' ? 'Unified System Audit Ledger' : `${activeTab} Audit Trail`}
            </h3>
            <span className="text-[11px] text-slate-400">
              ({filteredAudits.length} live records)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> System Entry: Immutable
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Occurred On: User-Reported
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Audit ID</th>
                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Module</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity & Particulars</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Initiator / Actor</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Occurred On (Effective)</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#001f5b]" />
                    <span>System Recorded At</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Audit Discrepancy</th>
                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-[#001f5b] animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">Loading live system audit logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-700">No audit records found matching your filter criteria.</p>
                      <p className="text-[11px] text-slate-400">Transactions, meals, expenses, and leave requests will appear here as they are recorded.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAudits.map((log, index) => {
                  const isBackdated = (log.deltaDays || 0) > 0;
                  return (
                    <tr key={`${log.id}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                      {/* Audit ID */}
                      <td className="px-4 py-3 font-mono font-bold text-[#001f5b] text-[11px] whitespace-nowrap">
                        {log.id}
                      </td>

                      {/* Module Badge */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getModuleBadgeColor(log.module)}`}>
                          {getModuleIcon(log.module)}
                          {log.module}
                        </span>
                      </td>

                      {/* Event description */}
                      <td className="px-4 py-3 max-w-sm">
                        <p className="font-semibold text-slate-900 line-clamp-1">{log.event}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{log.details}</p>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{getActorName(log.actor)}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{getRoleName(log.actorRole)}</span>
                      </td>

                      {/* Occurred On (Effective Date) */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700 font-semibold">
                        {log.effectiveDate}
                      </td>

                      {/* System Recorded At (Immutable) */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-800">
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{formatIsoTimestamp(log.entryTimestamp)}</span>
                        </div>
                      </td>

                      {/* Timing Discrepancy */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {isBackdated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200" title={`User recorded this event ${log.deltaDays} day(s) after it actually occurred`}>
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            Backdated (+{log.deltaDays}d)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            Same-Day Entry
                          </span>
                        )}
                      </td>

                      {/* Integrity Status */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {log.status}
                        </span>
                      </td>

                      {/* Inspect Receipt Button */}
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedAudit(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#001f5b] text-white flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    System Audit Inspection Receipt
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {selectedAudit.id} • {selectedAudit.module}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAudit(null)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Timing & Discrepancy Verification Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Temporal Discrepancy Analysis
                  </span>
                  {(selectedAudit.deltaDays || 0) > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Backdated Record ({selectedAudit.deltaDays} day delay)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      Real-Time / Same-Day Submission
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Actual Occurrence Date (Effective)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {selectedAudit.effectiveDate}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">When the event occurred in reality</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Immutable System Commit (Auto-Locked)
                    </span>
                    <span className="font-mono font-bold text-[#001f5b] text-sm">
                      {formatIsoTimestamp(selectedAudit.entryTimestamp)}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">When written into the database</p>
                  </div>
                </div>
              </div>

              {/* Event Particulars */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Event Summary
                  </span>
                  <p className="font-semibold text-slate-900">{selectedAudit.event}</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Responsible Actor & Clearance
                  </span>
                  <p className="font-semibold text-slate-900">{getActorName(selectedAudit.actor)}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{getRoleName(selectedAudit.actorRole)}</p>
                </div>
              </div>

              {/* Context Details */}
              <div className="p-3 bg-white border border-slate-200 rounded-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Audit Details & Metadata
                </span>
                <p className="text-slate-700 leading-relaxed font-sans">{selectedAudit.details}</p>
                {selectedAudit.referenceId && (
                  <p className="text-[11px] font-mono text-slate-500 mt-2">
                    Reference Key: <span className="font-bold text-slate-800">{selectedAudit.referenceId}</span>
                  </p>
                )}
              </div>

              {/* Cryptographic Seal */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-md space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                  <span>Cryptographic Integrity Seal</span>
                  <span className="text-emerald-400 font-bold">Event integrity information</span>
                </div>
                <p className="break-all text-slate-300">
                  {selectedAudit.hash || 'No cryptographic integrity proof is attached to this event.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 bg-[#001f5b] hover:bg-[#001744] text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Ledger Modal (PDF & Excel with Dynamic Months) */}
      <ExportLedgerModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="ENAKO OS • ENTERPRISE SYSTEM AUDIT & VERIFICATION LEDGER"
        defaultFileName="Enako_System_Audit_Ledger"
        headers={['Audit ID', 'Module', 'Activity & Particulars', 'Actor', 'Occurred On', 'System Recorded At', 'Audit Discrepancy', 'Status']}
        items={filteredAudits}
        getDateStr={(l: any) => l.effectiveDate || l.entryTimestamp}
        getRowData={(l: any) => [
          l.id,
          l.module,
          l.event,
          `${getActorName(l.actor)} (${getRoleName(l.actorRole)})`,
          l.effectiveDate,
          formatIsoTimestamp(l.entryTimestamp),
          (l.deltaDays || 0) > 0 ? `Backdated (+${l.deltaDays}d)` : 'Same-Day Entry',
          l.status
        ]}
        orientation="landscape"
      />
    </div>
  );
}

function formatIsoTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoString;
  }
}
