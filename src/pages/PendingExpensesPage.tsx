import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

function fmt(val: string | number | null | undefined) {
  const n = Number(val ?? 0);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA`;
}

export default function PendingExpensesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Remote items from API
      let remoteItems: any[] = [];
      try {
        const res = await api.expenses({ limit: 100 });
        remoteItems = res?.items || (Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn('Backend expenses fetch deferred:', err);
      }

      // 2. Local storage items
      const localRaw = localStorage.getItem('enako_custom_expenses');
      const localItems: any[] = localRaw ? JSON.parse(localRaw) : [];

      // 3. Merge: local items take precedence if matching id
      const combinedMap = new Map<string, any>();
      remoteItems.forEach(item => combinedMap.set(item.id, item));
      localItems.forEach(item => combinedMap.set(item.id, item));

      const merged = Array.from(combinedMap.values());
      const pendingClaims = merged.filter(item => item.status === 'PENDING');
      // Sort newest first
      pendingClaims.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setItems(pendingClaims);

      // Auto-open first item if available and none selected
      if (pendingClaims.length > 0 && !expandedId) {
        setExpandedId(pendingClaims[0].id);
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to load pending claims');
    } finally {
      setLoading(false);
    }
  }, [expandedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      try {
        await api.reviewExpense(id, status);
      } catch (err) {
        console.warn('API review endpoint deferred, updating locally:', err);
      }

      // Update in local cache
      const localRaw = localStorage.getItem('enako_custom_expenses');
      if (localRaw) {
        const localItems: any[] = JSON.parse(localRaw);
        const updated = localItems.map(item => item.id === id ? { ...item, status } : item);
        localStorage.setItem('enako_custom_expenses', JSON.stringify(updated));
      }

      setItems(prev => prev.filter(item => item.id !== id));
      toast.success(status === 'APPROVED' ? 'Claim approved and logged' : 'Claim rejected');
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (e: any) {
      toast.error(e.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    if (items.length === 0) return;
    if (!confirm(`Are you sure you want to approve all ${items.length} pending expense claims?`)) return;

    setLoading(true);
    try {
      for (const item of items) {
        try {
          await api.reviewExpense(item.id, 'APPROVED');
        } catch {
          // ignore individual error in batch
        }
      }

      const localRaw = localStorage.getItem('enako_custom_expenses');
      if (localRaw) {
        const localItems: any[] = JSON.parse(localRaw);
        const updated = localItems.map(item => ({ ...item, status: 'APPROVED' }));
        localStorage.setItem('enako_custom_expenses', JSON.stringify(updated));
      }

      setItems([]);
      setExpandedId(null);
      toast.success(`All ${items.length} pending claims approved`);
    } catch (e: any) {
      toast.error(e.message || 'Batch approval failed');
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(e => {
    const matchesSearch = 
      (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.submittedBy?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
  const totalPendingAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 font-sans">
      {/* Top Header & Breadcrumb (No cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Link to="/app/expenses" className="hover:text-slate-800 transition-colors">
              Finance & Accounts
            </Link>
            <span>/</span>
            <Link to="/app/expenses" className="hover:text-slate-800 transition-colors">
              Expenses
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Pending Approvals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pending Expense Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {items.length} claim{items.length === 1 ? '' : 's'} awaiting review • Total outstanding: <span className="font-bold text-slate-900">{fmt(totalPendingAmount)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {items.length > 0 && (
            <button
              onClick={handleApproveAll}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Approve All ({items.length})
            </button>
          )}
          <Link
            to="/app/expenses/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Expense
          </Link>
          <Link
            to="/app/expenses"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Expenses
          </Link>
        </div>
      </div>

      {/* Flat Search & Filter Controls (No Cards) */}
      <div className="space-y-3 pb-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by claimant, purpose, category, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs text-slate-500">
              Showing <strong>{filtered.length}</strong> of <strong>{items.length}</strong>
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Category Pills */}
        {categoriesList.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
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
              All ({items.length})
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
                {cat} ({items.filter(i => i.category === cat).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Flat List (No Cards, Click each to open & review) */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Loading pending claims...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-slate-800">
              No pending claims
            </p>
            <p className="text-xs text-slate-500 mt-1">
              All submitted expenses have been reviewed and processed.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className="border-b border-slate-200/90 pb-4 transition-colors"
              >
                {/* Header Summary Row - Clickable to open/collapse */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 cursor-pointer hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      className="mt-0.5 sm:mt-0 p-1 text-slate-400 hover:text-slate-700"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#001f5b]" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {item.description}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {item.category || 'General'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          Claimant: <strong>{item.submittedBy?.fullName || 'Staff Member'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Dept: <strong>{item.department || item.submittedBy?.department || 'Operations'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Date: {new Date(item.createdAt || item.expenseDate || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Status Indicator */}
                  <div className="flex items-center gap-4 self-end sm:self-auto pl-7 sm:pl-0">
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {fmt(item.amount)}
                    </span>
                    <span className="text-[11px] font-bold text-[#001f5b] hover:underline">
                      {isExpanded ? 'Hide Details' : 'Open Claim'}
                    </span>
                  </div>
                </div>

                {/* Expanded Detail Panel (When Opened) */}
                {isExpanded && (
                  <div className="mt-3 pl-8 pr-2 space-y-4 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="block text-slate-400 uppercase font-semibold text-[10px]">
                          Payment Route
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.paymentMethod || 'Corporate Account'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-slate-400 uppercase font-semibold text-[10px]">
                          Invoice / Receipt Reference
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.receiptRef || 'None provided'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-slate-400 uppercase font-semibold text-[10px]">
                          Claimant Email / Role
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.submittedBy?.email || 'N/A'} • {item.submittedBy?.role || 'Staff'}
                        </span>
                      </div>
                    </div>

                    {/* Full Justification Notes */}
                    <div>
                      <span className="block text-slate-400 uppercase font-semibold text-[10px] mb-1">
                        Business Justification & Notes
                      </span>
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {item.notes ? item.notes : 'No extra notes provided by claimant.'}
                      </div>
                    </div>

                    {/* Executive Decision Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500">
                        Select an action to record decision directly into the corporate ledger.
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReview(item.id, 'APPROVED')}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Approve Claim
                        </button>
                        <button
                          onClick={() => handleReview(item.id, 'REJECTED')}
                          disabled={isProcessing}
                          className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject Claim
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
