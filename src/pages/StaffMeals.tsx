import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RefreshCw, 
  FileText, 
  UtensilsCrossed, 
  Clock, 
  Users, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ENAKO_LOGO_BASE64 } from '../lib/logo-base64';
import { exportTablePdf } from '../lib/pdf-export';
import ExportLedgerModal from '../components/ExportLedgerModal';

function fmt(val: string | number | null | undefined) {
  return `${Number(val ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

export default function StaffMeals() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';
  const isManager = role === 'ceo' || role === 'manager' || role === 'outreach_manager';

  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [search, setSearch] = useState('');
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let remoteMeals: any = { items: [], totals: null };
      let remoteEmps: any = { items: [] };

      try {
        const [mealsRes, empRes] = await Promise.all([
          api.meals(),
          api.employees({ limit: 100 })
        ]);
        remoteMeals = mealsRes;
        remoteEmps = empRes;
      } catch (err) {
        console.warn('Backend meals API deferred:', err);
      }

      // Merge local storage cached meals
      const localRaw = localStorage.getItem('enako_meals_cache');
      const localMeals: any[] = localRaw ? JSON.parse(localRaw) : [];

      const combinedMap = new Map<string, any>();
      (remoteMeals?.items || []).forEach((m: any) => combinedMap.set(m.id, m));
      localMeals.forEach(m => combinedMap.set(m.id, m));

      const merged = Array.from(combinedMap.values());
      // Sort newest first
      merged.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
      setItems(merged);

      // Recalculate totals
      let compSum = 0;
      let empSum = 0;
      let totalCount = merged.length;
      merged.forEach(m => {
        if (m.status === 'ATE') {
          compSum += Number(m.companyAmount || 500);
          empSum += Number(m.employeeAmount || 500);
        }
      });

      setTotals({
        _count: totalCount,
        _sum: {
          companyAmount: compSum,
          employeeAmount: empSum
        }
      });

      setEmployees(remoteEmps?.items || []);
    } catch (e: any) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeId) return;
    try {
      await api.disputeMeal(disputeId, disputeReason);
      toast.success('Discrepancy report submitted for manager review');
      setDisputeId(null);
      setDisputeReason('');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit dispute');
    }
  };

  const downloadMealReportPdf = async (period: '7 Days' | '28 Days' | '3 Months' | '6 Months' | '1 Year') => {
    try {
      const now = new Date();
      let startDate = new Date();
      if (period === '7 Days') startDate.setDate(now.getDate() - 7);
      else if (period === '28 Days') startDate.setDate(now.getDate() - 28);
      else if (period === '3 Months') startDate.setMonth(now.getMonth() - 3);
      else if (period === '6 Months') startDate.setMonth(now.getMonth() - 6);
      else if (period === '1 Year') startDate.setFullYear(now.getFullYear() - 1);

      let targetMeals = items.filter(m => {
        if (!m.date) return false;
        const d = new Date(m.date);
        return !isNaN(d.getTime()) && d >= startDate && d <= now;
      });

      // If no records in exact window, fall back to all loaded items
      if (targetMeals.length === 0) {
        targetMeals = items;
      }

      const rows = targetMeals.map(m => {
        const d = m.date ? new Date(m.date) : new Date();
        const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : 'N/A';
        return [
          dateStr,
          m.employee?.fullName || m.userName || 'Staff Member',
          m.status === 'ATE' ? 'Consumed' : 'Did Not Eat',
          m.mealName || 'Standard Lunch',
          m.status === 'ATE' ? fmt(m.price || 1000) : '0 FCFA',
          m.status === 'ATE' ? fmt(m.companyAmount || 500) : '0 FCFA',
          m.status === 'ATE' ? fmt(m.employeeAmount || 500) : '0 FCFA'
        ];
      });

      const success = exportTablePdf({
        title: 'STAFF WELFARE & MEALS REPORT',
        subtitle: `Period: Last ${period} • Total Records: ${targetMeals.length}`,
        headers: ['Date', 'Employee', 'Status', 'Menu Option', 'Total', 'Company Pays', 'Employee Pays'],
        rows,
        fileName: `Enako_Staff_Meals_${period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      });

      setShowExportMenu(false);
      if (success) {
        toast.success(`Downloaded meals report for last ${period}`);
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (e: any) {
      console.error('Failed to generate meals PDF:', e);
      toast.error('Failed to generate PDF');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = items.filter(m => m.date?.startsWith(todayStr) && m.status === 'ATE');

  const filteredItems = items.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.employee?.fullName || '').toLowerCase().includes(q) ||
      (m.mealName || '').toLowerCase().includes(q) ||
      (m.status || '').toLowerCase().includes(q)
    );
  });

  const companyTotalSpend = totals?._sum?.companyAmount ?? 0;
  const employeeTotalSpend = totals?._sum?.employeeAmount ?? 0;
  const totalMealsEaten = items.filter(m => m.status === 'ATE').length;
  const uniqueEmployeesCount = new Set(items.map(m => m.employeeId).filter(Boolean)).size;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      {/* Top Header & Breadcrumb (Clean normal text per guidelines) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Operations & Workflows</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Staff Meals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Staff Meal & Welfare Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise welfare portal for tracking daily catering consumption, co-pay subsidies, and vendor audits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/meals/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Meal Entry
          </Link>

          {/* Export Ledger (PDF / Excel) */}
          <button 
            onClick={() => setShowExportModal(true)} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Ledger (PDF / Excel)
          </button>

          <button 
            onClick={load} 
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Metric Cards: Hero Card (Company Welfare Spend) + 3 Side Cards (Matching Cash Collections layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Large Main Featured Hero Card: Company Meal Subsidy */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Staff Welfare • Company Contribution
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#001f5b]/10 text-[#001f5b] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Company Subsidy Invested</p>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {fmt(companyTotalSpend)}
            </h3>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span className="font-medium">Total Staff Lunches Subsidized</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {totalMealsEaten} meals co-financed
            </span>
          </div>
        </div>

        {/* The other three cards placed at the side */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 sm:gap-3.5 justify-between">
          {/* Card 2: Today's Logged Meals */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Today's Lunch Orders
              </span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {todayMeals.length} Meals
              </h4>
              <span className="text-xs font-semibold text-emerald-600">Active today</span>
            </div>
          </div>

          {/* Card 3: Employee Share Deductions */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Employee Payroll Share
              </span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {fmt(employeeTotalSpend)}
              </h4>
              <span className="text-xs text-slate-500">Payroll deductions</span>
            </div>
          </div>

          {/* Card 4: Registered Staff Beneficiaries */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Staff Beneficiaries
              </span>
              <Users className="w-4 h-4 text-[#001f5b]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {uniqueEmployeesCount || employees.length || 0} Operatives
              </h4>
              <span className="text-xs text-slate-500">Enrolled in welfare</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Meal Ledger Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Staff Meal Attendance & Welfare Ledger
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Daily catering audit trail and payroll reconciliation records
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search employee or platter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-xs text-slate-500">
              Loading meal attendance records...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Menu Platter</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Rate</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Subsidy</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee Share</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-xs text-slate-500">
                      No meal records found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {new Date(m.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-900 text-xs">
                        {m.employee?.fullName || 'Staff Member'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border inline-block",
                          m.status === 'ATE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {m.status === 'ATE' ? 'Consumed' : 'Did Not Eat'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-700 max-w-xs truncate">
                        {m.mealName || 'Standard Lunch'}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                        {m.status === 'ATE' ? fmt(m.price || 1000) : '0 FCFA'}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-bold text-emerald-700">
                        {m.status === 'ATE' ? fmt(m.companyAmount || 500) : '0 FCFA'}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-bold text-blue-700">
                        {m.status === 'ATE' ? fmt(m.employeeAmount || 500) : '0 FCFA'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {m.status === 'ATE' ? (
                          <button
                            onClick={() => setDisputeId(m.id)}
                            className="text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
                          >
                            Report Discrepancy
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Discrepancy Modal */}
      <AnimatePresence>
        {disputeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 font-sans">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <h3 className="font-bold text-slate-900 text-sm">Report Meal Discrepancy</h3>
                <button onClick={() => setDisputeId(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider cursor-pointer">Close</button>
              </div>
              <form onSubmit={handleDispute} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Discrepancy / Audit Comment
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Employee was on approved medical leave or out of office..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setDisputeId(null)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744]">Submit Audit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Ledger Modal (PDF & Excel with Dynamic Months) */}
      <ExportLedgerModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="ENAKO OS • STAFF WELFARE & MEALS REPORT"
        defaultFileName="Enako_Staff_Meals"
        headers={['Date', 'Employee', 'Status', 'Menu Option', 'Total Price', 'Company Co-Pay', 'Employee Co-Pay']}
        items={items}
        getDateStr={(m: any) => m.effectiveDate || m.date || m.createdAt}
        getRowData={(m: any) => [
          m.effectiveDate || m.date || (m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'),
          m.employee?.fullName || m.userName || 'Staff Member',
          m.status === 'ATE' ? 'Consumed' : 'Did Not Eat',
          m.mealName || 'Standard Lunch',
          m.status === 'ATE' ? fmt(m.price || 1000) : '0 FCFA',
          m.status === 'ATE' ? fmt(m.companyAmount || 500) : '0 FCFA',
          m.status === 'ATE' ? fmt(m.employeeAmount || 500) : '0 FCFA'
        ]}
      />
    </div>
  );
}
