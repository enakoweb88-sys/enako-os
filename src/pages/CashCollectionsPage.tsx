import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RefreshCw, 
  FileSpreadsheet, 
  Wallet, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { api, CashCollection, CashCollectionStats } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

function fmt(val: number | string | null | undefined, currency = true) {
  const n = Number(val ?? 0);
  if (currency) return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} XAF`;
  return n.toLocaleString();
}

function parseNoteText(item: any): string {
  if (!item) return '';
  if (item.summaryNote) return item.summaryNote;
  if (item.notes) return item.notes;
  if (!item.description) return '';
  if (typeof item.description === 'string') {
    if (item.description.startsWith('{')) {
      try {
        const parsed = JSON.parse(item.description);
        return parsed.summaryNote || parsed.notes || '';
      } catch (e) {}
    }
    return item.description;
  }
  return '';
}

const MOCK_COLLECTIONS: CashCollection[] = [];

const DEFAULT_STATS: CashCollectionStats = {
  todayCollected: 0,
  todayCount: 0,
  pendingAmount: 0,
  pendingCount: 0,
  totalCollected: 0,
  totalOutstanding: 0,
  totalRecords: 0,
};

export default function CashCollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<CashCollection[]>([]);
  const [stats, setStats] = useState<CashCollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected row for full detail modal
  const [selectedCollection, setSelectedCollection] = useState<CashCollection | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isManagerOrCeo = user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'OUTREACH_MANAGER';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientName: '',
    location: '',
    amountCollected: '',
    outstandingBalance: '',
    status: 'PENDING' as 'COMPLETE' | 'PENDING' | 'CANCELLED',
    collectorName: 'Christian Enako',
    description: '',
  });

  const getLocalUserCollections = (): CashCollection[] => {
    try {
      const keys = ['enako_collections', 'enako_cash_collections', 'cash_collections', 'enako_drafts'];
      let rawItems: any[] = [];
      for (const k of keys) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) rawItems.push(...p);
          } catch (e) {}
        }
      }

      if (rawItems.length === 0) return [];

      const userRaw = localStorage.getItem('enako_cash_user') || localStorage.getItem('enako_user');
      let collectorName = 'Field Collector';
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u.name || u.fullName) collectorName = u.name || u.fullName;
        } catch (e) {}
      }

      const seen = new Set();
      const result: CashCollection[] = [];

      for (const item of rawItems) {
        const id = item.id || `COL-${Math.floor(1000 + Math.random() * 9000)}`;
        if (seen.has(id)) continue;
        seen.add(id);

        const amt = Number(item.amountCollected ?? item.amount ?? 0);
        const shortage = Number(item.outstandingBalance ?? item.shortageAmount ?? 0);
        const client = item.clientName || 'Merchant Client';
        const loc = item.location || item.depositDestination || 'Douala Field Sector';

        result.push({
          id,
          collectorId: item.collectorId || 'COL-REAL',
          clientName: client,
          location: loc,
          amountCollected: amt,
          outstandingBalance: shortage,
          currency: 'XAF',
          collectionTime: item.collectionTime || item.timestamp || new Date().toISOString(),
          status: (item.status === 'COMPLETE' || item.status === 'PENDING' || item.status === 'CANCELLED') ? item.status : 'PENDING',
          description: item.description || item.notes || item.summaryNote || 'Field Cash Collection Task',
          receiptUrl: item.receiptUrl || '',
          createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
          updatedAt: item.updatedAt || item.timestamp || new Date().toISOString(),
          collector: item.collector || {
            id: 'COL-REAL',
            fullName: collectorName,
            email: 'collector@enako.cm',
            role: { name: 'Field Cash Collector' },
          },
        });
      }

      return result;
    } catch (err) {
      return [];
    }
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.cashCollections({ search, status: statusFilter === 'ALL' ? undefined : statusFilter, page, limit: 20 }).catch(() => null);
      const statsRes = await api.cashCollectionStats().catch(() => null);

      const localRealCollections = getLocalUserCollections();
      const backendItems = res?.items || [];
      const backendIds = new Set(backendItems.map((i: any) => i.id));
      const combinedReal = [...backendItems, ...localRealCollections.filter(l => !backendIds.has(l.id))];

      if (combinedReal.length > 0) {
        const filteredReal = combinedReal.filter(c => {
          if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
          if (search) {
            const q = search.toLowerCase();
            return (
              c.clientName.toLowerCase().includes(q) ||
              c.location.toLowerCase().includes(q) ||
              (c.collector?.fullName || '').toLowerCase().includes(q)
            );
          }
          return true;
        });

        setCollections(filteredReal);
        setTotal(filteredReal.length);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let todayCollected = 0;
        let todayCount = 0;
        let pendingAmount = 0;
        let pendingCount = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;

        combinedReal.forEach(c => {
          const amt = Number(c.amountCollected || 0);
          totalCollected += amt;
          totalOutstanding += Number(c.outstandingBalance || 0);

          if (c.status === 'PENDING') {
            pendingAmount += amt;
            pendingCount++;
          }

          const colTime = new Date(c.collectionTime);
          if (colTime >= today && (c.status === 'COMPLETE' || c.status === 'OPEN')) {
            todayCollected += amt;
            todayCount++;
          }
        });

        setStats({
          todayCollected,
          todayCount,
          pendingAmount,
          pendingCount,
          totalCollected,
          totalOutstanding,
          totalRecords: combinedReal.length,
        });
      } else {
        const filteredMock = MOCK_COLLECTIONS.filter(c => {
          if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
          if (search) {
            const q = search.toLowerCase();
            return c.clientName.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || (c.collector?.fullName || '').toLowerCase().includes(q);
          }
          return true;
        });
        setCollections(filteredMock);
        setTotal(filteredMock.length);
        setStats(statsRes || DEFAULT_STATS);
      }
    } catch (err: any) {
      const localReal = getLocalUserCollections();
      if (localReal.length > 0) {
        setCollections(localReal);
        setTotal(localReal.length);
      } else {
        setCollections(MOCK_COLLECTIONS);
        setTotal(MOCK_COLLECTIONS.length);
      }
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    const interval = setInterval(loadData, 10000);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [search, statusFilter, page]);

  const handleCreateCollectionTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.clientName.trim()) {
      toast.error('Please enter a client name.');
      return;
    }

    setCreateSubmitting(true);
    const newId = `COL-${Math.floor(1000 + Math.random() * 9000)}`;
    const amt = Number(createForm.amountCollected) || 0;
    const shortage = Number(createForm.outstandingBalance) || 0;

    const newCol: CashCollection = {
      id: newId,
      collectorId: 'COL-001',
      clientName: createForm.clientName.trim(),
      location: createForm.location.trim() || 'Douala Central Sector',
      amountCollected: amt,
      outstandingBalance: shortage,
      currency: 'XAF',
      collectionTime: new Date().toISOString(),
      status: createForm.status,
      description: createForm.description.trim() || 'Field collection task assigned via Admin Dashboard.',
      receiptUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collector: {
        id: 'COL-001',
        fullName: createForm.collectorName.trim() || 'Field Collector',
        email: 'collector@enako.cm',
        role: { name: 'Field Cash Collector' },
      },
    };

    try {
      await api.createCashCollection({
        clientName: newCol.clientName,
        location: newCol.location,
        amountCollected: newCol.amountCollected,
        outstandingBalance: newCol.outstandingBalance,
        status: newCol.status,
        description: newCol.description,
      }).catch(() => null);
    } catch (err) {}

    try {
      const existingRaw = localStorage.getItem('enako_collections');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newCol, ...existing];
      localStorage.setItem('enako_collections', JSON.stringify(updated));
      localStorage.setItem('enako_cash_collections', JSON.stringify(updated));
    } catch (err) {}

    toast.success(`Collection task #${newId} created & assigned successfully!`);
    setCreateSubmitting(false);
    setShowCreateModal(false);
    setCreateForm({
      clientName: '',
      location: '',
      amountCollected: '',
      outstandingBalance: '',
      status: 'PENDING',
      collectorName: 'Christian Enako',
      description: '',
    });
    loadData();
  };

  const handleUpdateStatus = async (id: string, newStatus: 'COMPLETE' | 'PENDING' | 'CANCELLED') => {
    setUpdatingStatus(true);
    try {
      await api.updateCashCollectionStatus(id, newStatus);
      toast.success(`Collection status updated to ${newStatus}`);
      if (selectedCollection && selectedCollection.id === id) {
        setSelectedCollection({ ...selectedCollection, status: newStatus });
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const exportCSV = () => {
    if (collections.length === 0) {
      toast.error('No collection data to export');
      return;
    }
    const headers = ['Collector', 'Client Name', 'Location', 'Amount Collected (XAF)', 'Outstanding Balance (XAF)', 'Status', 'Date', 'Description'];
    const rows = collections.map(c => [
      `"${c.collector?.fullName || 'Collector'}"`,
      `"${c.clientName}"`,
      `"${c.location}"`,
      c.amountCollected,
      c.outstandingBalance,
      c.status,
      `"${new Date(c.collectionTime).toLocaleString()}"`,
      `"${c.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cash_collections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Cash collection report exported as CSV');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 font-sans">
      
      {/* Top Header & Breadcrumb (Clean normal text per guidelines) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Finance & Accounts</span>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Cash Collections</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Field Cash Collections & Audits
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit stream, field client report logs, outstanding debt tracking & deposit verifications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/app/cash-collections/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#001f5b] rounded-lg hover:bg-[#001744] transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Cash Task
          </Link>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* API Sync Notice Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between shadow-2xs">
          <div>
            <strong className="font-bold">Backend Sync Notice:</strong> {errorMessage}.
            <p className="text-[11px] text-amber-700 mt-0.5">
              If live backend is deploying, wait 1 minute for build completion or run backend locally on port 5000.
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Metric Cards: Hero Card (Today's Collected) + 3 Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Large Main Featured Hero Card: Today's Collected */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Field Operations • Collections (Today)
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#001f5b]/10 text-[#001f5b] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Today's Collected</p>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {fmt(stats?.todayCollected)}
            </h3>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span className="font-medium">Live Field Collection Stream</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {stats?.todayCount || 0} visits completed today
            </span>
          </div>
        </div>

        {/* The other three cards placed at the side */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 sm:gap-3.5 justify-between">
          {/* Card 2: Pending Deposits */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pending Deposits
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {fmt(stats?.pendingAmount)}
              </h4>
              <span className="text-xs font-semibold text-amber-600">
                {stats?.pendingCount || 0} unverified
              </span>
            </div>
          </div>

          {/* Card 3: Total Outstanding Debt */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Outstanding Debt
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
                {fmt(stats?.totalOutstanding)}
              </h4>
              <span className="text-xs text-slate-500">Remaining client balance</span>
            </div>
          </div>

          {/* Card 4: Total Revenue Gathered */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 transition-all flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Revenue Gathered
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
                {fmt(stats?.totalCollected)}
              </h4>
              <span className="text-xs text-slate-500">{stats?.totalRecords || 0} reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, location, or collector..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Status:
          </span>
          {['ALL', 'COMPLETE', 'PENDING', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collector</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client & Location</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount Collected</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outstanding Debt</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500 font-medium">
                    Loading cash collection records...
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500 font-medium">
                    No cash collection reports found.
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr
                    key={col.id}
                    onClick={() => setSelectedCollection(col)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {col.collector?.fullName || 'Field Agent'}
                        </p>
                        <p className="text-[10px] text-slate-500">{col.collector?.email || '—'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900">{col.clientName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {col.location}
                      </p>
                      {parseNoteText(col) && (
                        <p className="text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 inline-block max-w-xs truncate">
                          Note: "{parseNoteText(col)}"
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-emerald-700">
                      +{fmt(col.amountCollected)}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-amber-700">
                      {fmt(col.outstandingBalance)}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {new Date(col.collectionTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          col.status === 'COMPLETE' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          col.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-200",
                          col.status === 'CANCELLED' && "bg-rose-50 text-rose-700 border-rose-200"
                        )}
                      >
                        {col.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCollection(col);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all ml-auto"
                      >
                        Full Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing {collections.length} of {total} records</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={collections.length < 20}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Full Detail Modal */}
      <AnimatePresence>
        {selectedCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCollection(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">Cash Collection Report Details</h3>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        selectedCollection.status === 'COMPLETE' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        selectedCollection.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-200",
                        selectedCollection.status === 'CANCELLED' && "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      {selectedCollection.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Submitted by {selectedCollection.collector?.fullName || 'Cash Manager'} on {new Date(selectedCollection.collectionTime).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs"
                >
                  Close
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Financial Summary Box */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Amount Collected</span>
                    <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                      +{fmt(selectedCollection.amountCollected)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Outstanding Balance</span>
                    <p className="text-xl font-bold font-mono text-amber-600 mt-1">
                      {fmt(selectedCollection.outstandingBalance)}
                    </p>
                  </div>
                </div>

                {/* Client & Visit Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Client & Visit Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Client Name:</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedCollection.clientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Location Visited:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedCollection.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Time of Collection:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(selectedCollection.collectionTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Field Collector:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedCollection.collector?.fullName} ({selectedCollection.collector?.email})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Field Notes Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Field Description & Client Interaction Notes
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {parseNoteText(selectedCollection) || 'No additional notes provided.'}
                  </div>
                </div>

                {/* Receipt Photo Proof */}
                {selectedCollection.receiptUrl && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                      Receipt / Deposit Slip Proof Attachment
                    </h4>
                    <a
                      href={selectedCollection.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-bold text-slate-900 hover:underline p-3 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      View Full Attachment Proof
                    </a>
                  </div>
                )}

                {/* Status Modification for Managers & CEO */}
                {isManagerOrCeo && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest block">
                      Executive Deposit Verification Controls
                    </span>
                    <div className="flex gap-3">
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedCollection.id, 'COMPLETE')}
                        className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        Mark Complete & Settled
                      </button>
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedCollection.id, 'CANCELLED')}
                        className="py-2.5 px-5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        Cancel Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Collection Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">Assign Field Cash Collection Task</h3>
                  <p className="text-xs text-slate-500">Create a task for field collectors or log an incoming cash payment.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreateCollectionTask} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Client Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={createForm.clientName}
                    onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })}
                    placeholder="e.g. Kamer Logistics / Merchant Shop"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location / Market Sector</label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      placeholder="e.g. Akwa Commercial Hub"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Collector</label>
                    <input
                      type="text"
                      value={createForm.collectorName}
                      onChange={(e) => setCreateForm({ ...createForm, collectorName: e.target.value })}
                      placeholder="e.g. Christian Enako"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount Collected / Target (XAF)</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.amountCollected}
                      onChange={(e) => setCreateForm({ ...createForm, amountCollected: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Outstanding Balance (XAF)</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.outstandingBalance}
                      onChange={(e) => setCreateForm({ ...createForm, outstandingBalance: e.target.value })}
                      placeholder="e.g. 0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Initial Task Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="PENDING">PENDING (Awaiting Collection / Deposit)</option>
                    <option value="COMPLETE">COMPLETE (Collection Verified)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Task Instructions / Notes</label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Instructions for the field collector or interaction details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {createSubmitting ? 'Saving...' : 'Create Collection Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
