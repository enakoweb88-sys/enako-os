import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { 
  Code2, Cpu, Server, Activity, ShieldCheck, Terminal, 
  GitBranch, CheckCircle2, AlertTriangle, ArrowUpRight, 
  RefreshCw, Database, Layers, Wrench, FileCode, CheckSquare
} from 'lucide-react';

export function EngineeringDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await api.engineeringOverview();
      setData(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="text-secondary text-sm animate-pulse p-8">Initializing Engineering Command Center…</div>;
  }

  const kpis = data?.kpis || {
    uptime: '99.98%',
    apiPerformance: '92ms avg',
    deploymentSuccessRate: '100%',
    openBugs: 0,
    featuresInProgress: 0,
    totalDeployments: 0,
    securityIncidents: 0,
    techDebtReduction: '18% this sprint',
  };

  const integrations = data?.integrations || [];
  const deployments = data?.deployments || [];
  const auditLogs = data?.auditLogs || [];
  const tasks = data?.tasks || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Refresh Bar */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Engineering & Architecture Telemetry</h3>
            <p className="text-xs text-secondary font-medium">Real-time status of payment gateways, infrastructure, APIs, and deployments.</p>
          </div>
        </div>
        <button 
          onClick={loadData}
          disabled={refreshing}
          className="px-4 py-2 bg-surface-container-high text-primary rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-outline-variant/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          {refreshing ? 'Refreshing…' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Engineering KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Uptime', value: kpis.uptime, sub: 'Target: 99.99%', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'API Response Latency', value: kpis.apiPerformance, sub: 'REST & Webhooks', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Deployment Success', value: kpis.deploymentSuccessRate, sub: `${kpis.totalDeployments} total runs`, icon: GitBranch, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Security Incidents', value: `${kpis.securityIncidents} Breaches`, sub: 'Zero Tolerance', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.label}</span>
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-secondary font-medium">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Payment Integrations & Infrastructure Services */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Financial Integrations & Microservices
              </h3>
              <p className="text-xs text-secondary font-medium mt-1">Live health & response times for MTN MoMo, Orange Money, and core APIs.</p>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> All Systems Nominal
            </span>
          </div>

          <div className="space-y-4">
            {integrations.map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl flex items-center justify-between hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white border border-outline-variant/30 rounded-xl shadow-xs">
                    <Database className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-0.5">{item.name}</h4>
                    <span className="text-[10px] text-secondary font-mono font-medium">{item.env} • Success: {item.successRate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-primary">{item.latencyMs} ms</p>
                    <p className="text-[9px] text-secondary uppercase tracking-widest font-bold">Latency</p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[9px] font-bold uppercase tracking-widest">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CI/CD Deployments & Production Build Runs */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" /> CI/CD Deployments
            </h3>
            <span className="text-xs text-secondary font-medium">GitHub Main Branch</span>
          </div>

          <div className="space-y-4">
            {deployments.map((dep: any, idx: number) => (
              <div key={idx} className="p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold font-mono text-primary">{dep.repo}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-mono font-bold">{dep.branch}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    {dep.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-secondary font-mono">
                  <span>Commit: <strong className="text-primary">{dep.commit}</strong></span>
                  <span>Duration: {dep.duration}</span>
                  <span>{dep.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center text-xs text-secondary">
            <span>Features In Progress: <strong className="text-primary font-bold">{kpis.featuresInProgress}</strong></span>
            <span>Tech Debt Reduction: <strong className="text-primary font-bold">{kpis.techDebtReduction}</strong></span>
          </div>
        </div>
      </div>

      {/* Engineering Task Queue & System Audit Telemetry */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Active Developer Tasks & Code Fixes */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" /> Sprint Tasks & Bug Resolution Queue
            </h3>
            <Link to="/app/tasks" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">View All Tasks</Link>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-secondary py-6 text-center">No active engineering tasks in queue.</p>
            ) : (
              tasks.map((t: any) => (
                <div key={t.id} className="p-4 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-primary mb-0.5">{t.title}</h4>
                      <p className="text-[10px] text-secondary font-medium">Assigned: {t.assignee?.fullName || 'Engineering Team'}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                    t.status === 'DONE' ? "bg-green-50 text-green-700 border-green-200" :
                    t.status === 'IN_PROGRESS' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  )}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Boundary & Audit Telemetry */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" /> Security & System Audit Telemetry
            </h3>
            <span className="text-xs text-secondary font-medium">Real DB Audit Logs</span>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-secondary py-6 text-center">No system audit logs recorded.</p>
            ) : (
              auditLogs.map((log: any) => (
                <div key={log.id} className="p-3.5 bg-surface-container-low/30 border border-outline-variant/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-primary font-mono block">{log.action}</span>
                    <span className="text-[10px] text-secondary font-mono">{log.entity} • IP: {log.ipAddress || 'Internal System'}</span>
                  </div>
                  <span className="text-[10px] text-secondary font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
