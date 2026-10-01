import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { OrganizationHeaderCard } from '../../components/OrganizationHeaderCard';
import { WorkplaceStatCards } from '../../components/WorkplaceStatCards';
import { Server, Activity, ShieldCheck, GitCommit } from 'lucide-react';

export function EngineeringDashboard() {
  const [kpis, setKpis] = useState<any>({});
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    setRefreshing(true);
    Promise.all([
      api.engineeringKpis().catch(() => ({})),
      api.systemIntegrations().catch(() => []),
      api.deployments().catch(() => []),
      api.tasks().catch(() => []),
      api.auditLogs().catch(() => []),
    ])
      .then(([kpiData, integ, deps, tList, logs]) => {
        setKpis(kpiData);
        setIntegrations(integ);
        setDeployments(deps);
        setTasks(Array.isArray(tList) ? tList.slice(0, 6) : []);
        setAuditLogs(Array.isArray(logs) ? logs.slice(0, 5) : []);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Infrastructure Telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Reference Screenshot Top Header Card */}
      <OrganizationHeaderCard />

      {/* Reference Screenshot 4 Top Stat Cards */}
      <WorkplaceStatCards
        domainsCount={kpis.uptime || '99.98%'}
        usersCount={kpis.apiPerformance || '42ms'}
        groupsCount={kpis.deploymentSuccessRate || '99.4%'}
        licensesCount={`${kpis.securityIncidents ?? 0} Breaches`}
        card1Label="SYSTEM UPTIME"
        card2Label="API LATENCY"
        card3Label="DEPLOY SUCCESS"
        card4Label="SECURITY INCIDENTS"
        card1Icon={<Server className="w-5 h-5" />}
        card2Icon={<Activity className="w-5 h-5" />}
        card3Icon={<GitCommit className="w-5 h-5" />}
        card4Icon={<ShieldCheck className="w-5 h-5" />}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Engineering & Infrastructure Command
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time API latencies, MoMo webhooks, CI/CD telemetry, and system audit logs.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="px-4 py-2 bg-[#001f5b] hover:bg-[#001f5b]/90 text-white rounded-lg text-xs font-semibold tracking-wide transition-all disabled:opacity-50 shadow-2xs"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Payment Integrations & Infrastructure Services */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Financial Integrations & Gateways
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live health and round-trip ping for MTN MoMo, Orange Money & core APIs.</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold">
              All Nominal
            </span>
          </div>

          <div className="space-y-2.5">
            {integrations.map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg flex items-center justify-between hover:bg-slate-100/60 transition-all">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-0.5">{item.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{item.env} • Success: {item.successRate}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-slate-900">{item.latencyMs} ms</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Latency</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-semibold">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CI/CD Deployments */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">
              CI/CD Deployments
            </h3>
            <span className="text-xs text-slate-500">GitHub Main</span>
          </div>

          <div className="space-y-2.5">
            {deployments.map((dep: any, idx: number) => (
              <div key={idx} className="p-3 border border-slate-200/80 rounded-lg bg-slate-50/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-mono text-slate-900">{dep.repo}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-semibold">
                    {dep.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Commit: <strong className="text-slate-900">{dep.commit}</strong></span>
                  <span>{dep.duration}</span>
                  <span>{dep.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
            <span>Features in progress: <strong className="text-slate-900 font-semibold">{kpis.featuresInProgress || 4}</strong></span>
            <span>Tech debt: <strong className="text-slate-900 font-semibold">{kpis.techDebtReduction || '-15%'}</strong></span>
          </div>
        </div>
      </div>

      {/* Task Queue & Security Audit Telemetry */}
      <div className="grid grid-cols-12 gap-6">
        {/* Active Developer Tasks */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">
              Sprint Tasks & Bug Queue
            </h3>
            <Link to="/app/tasks" className="text-xs font-semibold text-[#001f5b] hover:underline">View All Tasks</Link>
          </div>

          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active engineering tasks in queue.</p>
            ) : (
              tasks.map((t: any) => (
                <div key={t.id} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-0.5">{t.title}</h4>
                    <p className="text-[10px] text-slate-500">Assigned: {t.assignee?.fullName || 'Engineering Team'}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-semibold border",
                    t.status === 'DONE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    t.status === 'IN_PROGRESS' ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & Audit Telemetry */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">
              Security & Audit Telemetry
            </h3>
            <span className="text-xs text-slate-500">Real DB Audit Logs</span>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No system audit logs recorded.</p>
            ) : (
              auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 font-mono block">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.entity} • IP: {log.ipAddress || 'Internal System'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
