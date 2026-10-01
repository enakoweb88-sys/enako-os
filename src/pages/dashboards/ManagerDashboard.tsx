import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Globe, Users, CreditCard, ShieldCheck, Mail, ChevronDown,
  Layers, Edit3, ArrowUpRight, TrendingUp, CheckSquare, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { api, outreachAPI } from '../../lib/api';
import { TasksWidget } from '../../components/TasksWidget';
import { CashCollectionsWidget } from '../../components/CashCollectionsWidget';
import { ExchangeRatesWidget } from '../../components/ExchangeRatesWidget';

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.overview().catch(() => null),
      api.employees({ limit: 6 }).catch(() => ({ items: [] })),
    ])
      .then(([ov, emp]) => {
        setOverview(ov);
        setStaff(emp?.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-lg p-10 text-center shadow-2xs">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider animate-pulse">
          Loading Management Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. ORGANIZATION SUMMARY CARD (Zoho Workplace Style) ── */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-lg border border-slate-200/90 p-1 flex items-center justify-center bg-white shadow-2xs shrink-0">
            <img src="/logo.png" alt="ENAKO Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              E NAKO COMPANY PLC
            </h2>
            <p className="text-xs text-slate-500 font-medium">Operations & Team Management Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1 max-w-xl">
          <div>
            <p className="text-xs text-slate-500 font-normal">Super Administrator Email Address</p>
            <p className="text-xs font-bold text-slate-800">support@enakoos.com</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-normal">Plan</p>
            <p className="text-xs font-bold text-[#001f5b]">Workplace Standard</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-normal">Subscription Duration</p>
            <p className="text-xs font-bold text-slate-800">Monthly</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-normal">Renewal Date</p>
            <p className="text-xs font-bold text-slate-800">28/10/2026</p>
          </div>
        </div>

        <button
          onClick={() => toast.success('Department operational parameters active')}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
          title="Edit Details"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* ── 2. TOP METRIC CARDS WITH COLORED BOTTOM ACCENT ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: DOMAINS */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-rose-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">DOMAINS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">1</p>
          </div>
        </div>

        {/* Card 2: ORGANIZATION USERS */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-emerald-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">ORGANIZATION USERS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {overview?.employees?.active ?? 1}
            </p>
          </div>
        </div>

        {/* Card 3: GROUPS */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-[#001f5b] rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#001f5b]/10 flex items-center justify-center text-[#001f5b] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">GROUPS</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">1</p>
          </div>
        </div>

        {/* Card 4: TOTAL LICENSES */}
        <div className="bg-white border border-slate-200/90 border-b-[3px] border-b-amber-500 rounded-lg p-4 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">TOTAL LICENSES</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">2</p>
          </div>
        </div>
      </div>

      {/* ── 3. OPERATIONAL WORKFLOW WIDGETS ── */}
      <div className="space-y-6">
        <TasksWidget />
        <ExchangeRatesWidget canEdit={true} />
        <CashCollectionsWidget canManage={true} />
      </div>
    </div>
  );
}
