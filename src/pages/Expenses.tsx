import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  Search, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import ExportLedgerModal from '../components/ExportLedgerModal';

function fmt(val: string | number | null | undefined) {
  const n = Number(val ?? 0);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

export default function Expenses() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showExportModal, setShowExportModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch remote items
      let remoteItems: any[] = [];
      let remoteTotals: any[] = [];
      try {
        const res = await api.expenses({ limit: 100 });
        remoteItems = res?.items || (Array.isArray(res) ? res : []);
        remoteTotals = res?.totals || [];
      } catch (e) {
        console.warn('Backend expenses fetch deferred:', e);
      }

      // 2. Fetch local storage cached expenses
      const localRaw = localStorage.getItem('enako_custom_expenses');
      const localItems: any[] = localRaw ? JSON.parse(localRaw) : [];

      // 3. Merge: local items take precedence if matching id
      const combinedMap = new Map<string, any>();
      remoteItems.forEach(item => combinedMap.set(item.id, item));
      localItems.forEach(item => combinedMap.set(item.id, item));

      const merged = Array.from(combinedMap.values());
      // Sort newest first
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setItems(merged);

      // Recalculate totals dynamically
      let approvedSum = 0, approvedCount = 0;
      let pendingSum = 0, pendingCount = 0;
      let rejectedSum = 0, rejectedCount = 0;

      merged.forEach((item: any) => {
        const amt = Number(item.amount || 0);
        if (item.status === 'APPROVED') {
          approvedSum += amt;
          approvedCount++;
        } else if (item.status === 'PENDING') {
          pendingSum += amt;
          pendingCount++;
        } else if (item.status === 'REJECTED') {
          rejectedSum += amt;
          rejectedCount++;
        }
      });

      setTotals([
        { status: 'APPROVED', _sum: { amount: approvedSum }, _count: approvedCount },
        { status: 'PENDING', _sum: { amount: pendingSum }, _count: pendingCount },
        { status: 'REJECTED', _sum: { amount: rejectedSum }, _count: rejectedCount }
      ]);
    } catch (e: any) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  const handleReview = async (id: string, status: string) => {
    try { 
      try {
        await api.reviewExpense(id, status);
      } catch (err) {
        console.warn('API review failed, updating local state:', err);
      }

      // Update local storage
      const localRaw = localStorage.getItem('enako_custom_expenses');
      if (localRaw) {
        const localItems: any[] = JSON.parse(localRaw);
        const updated = localItems.map(item => item.id === id ? { ...item, status } : item);
        localStorage.setItem('enako_custom_expenses', JSON.stringify(updated));
      }

      toast.success(status === 'APPROVED' ? 'Claim approved' : 'Claim rejected');
      load(); 
    } catch (e: any) { 
      toast.error(e.message || 'Action failed'); 
    }
  };

  const filtered = items.filter(e => {
    const matchesSearch = 
      (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.submittedBy?.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const approvedTotal = totals.find(t => t.status === 'APPROVED')?._sum?.amount ?? 0;
  const approvedCount = totals.find(t => t.status === 'APPROVED')?._count ?? 0;
  const pendingTotal = totals.find(t => t.status === 'PENDING')?._sum?.amount ?? 0;
  const pendingCount = totals.find(t => t.status === 'PENDING')?._count ?? 0;
  const categoriesList = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

  const handleExportCsv = () => {
    if (items.length === 0) {
      toast.info('No expenses to export');
      return;
    }
    const headers = ['ID', 'Date', 'Claimant', 'Department', 'Description', 'Category', 'Amount (FCFA)', 'Status'];
    const rows = items.map(i => [
      i.id,
      new Date(i.createdAt || i.expenseDate || Date.now()).toISOString().split('T')[0],
      `"${i.submittedBy?.fullName || 'Staff'}"`,
      `"${i.department || 'Operations'}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      i.category || 'General',
      i.amount || 0,
      i.status || 'PENDING'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enako_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Expenses ledger exported to CSV');
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Top Header & Breadcrumb (Clean normal text per guidelines) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Finance & Accounts</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Expenses</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {role === 'employee' ? 'My Expense Claims' : 'Corporate Expense Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'employee' 
              ? 'Track your reimbursements, departmental claims, and payment settlements.' 
              : 'Review, reconcile, and audit corporate expenditures across all entities.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/expenses/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Expense
          </Link>

          {role !== 'employee' && (
            <Link
              to="/app/expenses/pending"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Approvals
              {pendingCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Export Ledger (PDF / Excel)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Ledger (PDF / Excel)
          </button>

          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards (Clean Zoho Workplace layout with bold sans typography) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Main Card: Approved Expenses Total */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Approved Expenses Total
              </span>
              <Wallet className="w-4 h-4 text-[#001f5b]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {fmt(approvedTotal)}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Corporate Reconciliations</span>
            <span className="font-bold text-emerald-600">
              {approvedCount} claims approved
            </span>
          </div>
        </div>

        {/* Card 2: Pending Review (Requested with clickable link underneath) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pending Review
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {fmt(pendingTotal)}
            </h3>
            <p className="text-xs text-amber-600 font-bold mt-1">
              {pendingCount} awaiting approval
            </p>
          </div>

          {/* Under card link requested by user */}
          <Link
            to="/app/expenses/pending"
            className="inline-flex items-center justify-between text-xs font-bold text-[#001f5b] hover:text-blue-800 transition-colors mt-4 pt-3 border-t border-slate-100 group"
          >
            <span>Review Pending Claims</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 3: Quick Action Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Claim Submission
              </span>
              <Plus className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Submit Reimbursement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              File a new operational or travel reimbursement claim directly.
            </p>
          </div>

          <Link
            to="/app/expenses/new"
            className="inline-flex items-center justify-between text-xs font-bold text-[#001f5b] hover:text-blue-800 transition-colors mt-4 pt-3 border-t border-slate-100 group"
          >
            <span>Open Claim Form</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Control Bar: Search and Category Filter */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by claimant, description, category, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
            <span>Showing <strong>{filtered.length}</strong> records</span>
          </div>
        </div>

        {/* Category Pills */}
        {categoriesList.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#001f5b] text-white border-[#001f5b]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#001f5b] text-white border-[#001f5b]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expense History Table (Clean Zoho Flat Design) */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Expense History & Reconciliation Ledger
          </h3>
          <span className="text-xs text-slate-400">
            Real-time corporate ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>
                {role !== 'employee' && (
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Employee & Dept
                  </th>
                )}
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Description
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                  Amount
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                {role !== 'employee' && (
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={role !== 'employee' ? 7 : 5} className="px-5 py-12 text-center text-xs text-slate-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={role !== 'employee' ? 7 : 5} className="px-5 py-12 text-center text-xs text-slate-500">
                    No expense claims found matching current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {new Date(t.createdAt || t.expenseDate || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Employee & Dept */}
                    {role !== 'employee' && (
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-slate-900">
                          {t.submittedBy?.fullName ?? 'Staff Member'}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-2.5 h-2.5 text-slate-400" />
                          {t.department || t.submittedBy?.department || 'Operations'}
                        </div>
                      </td>
                    )}

                    {/* Description */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="text-xs font-semibold text-slate-900">
                        {t.description}
                      </div>
                      {t.receiptRef && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ref: {t.receiptRef}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.category || 'General'}
                      </span>
                    </td>

                    {/* Amount (Standard bold proportional sans font per guidelines) */}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 text-xs">
                      {fmt(t.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border inline-block',
                        t.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        t.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200',
                      )}>
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {role !== 'employee' && (
                      <td className="px-5 py-3.5 text-right">
                        {t.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleReview(t.id, 'APPROVED')} 
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReview(t.id, 'REJECTED')} 
                              className="px-2.5 py-1 border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Reconciled</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Ledger Modal (PDF & Excel with Dynamic Months) */}
      <ExportLedgerModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="ENAKO OS • CORPORATE EXPENSES & DISBURSEMENTS LEDGER"
        defaultFileName="Enako_Corporate_Expenses"
        headers={['Date', 'Description', 'Category', 'Department', 'Amount', 'Payment Route', 'Status', 'Submitted By']}
        items={items}
        getDateStr={(exp) => exp.effectiveDate || exp.expenseDate || exp.createdAt}
        getRowData={(exp) => [
          exp.effectiveDate || exp.expenseDate || (exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'N/A'),
          exp.description || 'N/A',
          exp.category || 'General',
          exp.department || 'Operations',
          fmt(exp.amount || 0),
          exp.paymentMethod || 'Corporate Account',
          exp.status || 'PENDING',
          exp.submittedBy?.fullName || 'Staff Member'
        ]}
        orientation="landscape"
      />
    </div>
  );
}
