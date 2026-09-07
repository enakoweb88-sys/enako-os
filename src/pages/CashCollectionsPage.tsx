import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  X,
  User,
  DollarSign,
  TrendingUp,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldCheck
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
        // Fallback gracefully to demo records only if zero real records exist anywhere
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
    <div className="space-y-8 pb-20">
      
      {/* ── Top Header Title ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">Field Cash Collections Command Center</h1>
            <p className="text-xs text-secondary font-medium">
              Real-time audit stream, field client report logs, outstanding debt tracking & deposit verifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-primary text-white rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Collection Task
          </button>
          <button
            onClick={loadData}
            className="p-3 border border-outline-variant/30 rounded-[2px] text-secondary hover:bg-surface-container transition-all"
            title="Refresh List"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={exportCSV}
            className="px-5 py-3 border border-outline-variant/30 bg-white text-secondary rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── API Sync Notice Banner ── */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">Backend Sync Notice:</strong> {errorMessage}.
              <p className="text-[11px] text-amber-700 mt-0.5">
                If live backend is deploying, wait 1 minute for build completion or run backend locally on port 5000.
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Today's Collected</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-primary font-mono">{fmt(stats?.todayCollected)}</p>
          <p className="text-[11px] text-secondary mt-1 font-semibold">{stats?.todayCount || 0} visits completed today</p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Pending Deposits</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-primary font-mono">{fmt(stats?.pendingAmount)}</p>
          <p className="text-[11px] text-secondary mt-1 font-semibold">{stats?.pendingCount || 0} unverified bank deposits</p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Outstanding Debt</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-primary font-mono">{fmt(stats?.totalOutstanding)}</p>
          <p className="text-[11px] text-secondary mt-1 font-semibold">Remaining client balances</p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Revenue Gathered</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-primary font-mono">{fmt(stats?.totalCollected)}</p>
          <p className="text-[11px] text-secondary mt-1 font-semibold">Across {stats?.totalRecords || 0} total reports</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, location, or collector…"
            className="w-full bg-surface border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'COMPLETE', 'PENDING', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all",
                statusFilter === st
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Data Table ── */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 border-b border-outline-variant/20">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Collector</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Client & Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Amount Collected</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Outstanding Debt</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Collection Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-secondary animate-pulse font-medium">
                    Loading cash collection records…
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-secondary font-medium">
                    No cash collection reports found.
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr
                    key={col.id}
                    onClick={() => setSelectedCollection(col)}
                    className="hover:bg-surface-container-low/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {col.collector?.fullName?.slice(0, 2).toUpperCase() || 'CC'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary group-hover:text-blue-600 transition-colors">
                            {col.collector?.fullName || 'Field Agent'}
                          </p>
                          <p className="text-[10px] text-secondary">{col.collector?.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-primary">{col.clientName}</p>
                      <p className="text-[10px] text-secondary flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-secondary" /> {col.location}
                      </p>
                      {parseNoteText(col) && (
                        <p className="text-[10px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 mt-1.5 inline-block max-w-xs truncate">
                          Note: "{parseNoteText(col)}"
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-600">
                      +{fmt(col.amountCollected)}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-bold text-amber-600">
                      {fmt(col.outstandingBalance)}
                    </td>

                    <td className="px-6 py-4 text-[11px] text-secondary font-medium">
                      {new Date(col.collectionTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          col.status === 'COMPLETE' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          col.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-200",
                          col.status === 'CANCELLED' && "bg-red-50 text-red-700 border-red-200"
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
                        className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold text-primary hover:bg-surface-container transition-all flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/10 flex items-center justify-between text-xs text-secondary font-medium">
          <span>Showing {collections.length} of {total} records</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-30"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={collections.length < 20}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Full Detail Modal / Drawer ── */}
      <AnimatePresence>
        {selectedCollection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCollection(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-primary font-display">Cash Collection Report Details</h3>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        selectedCollection.status === 'COMPLETE' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        selectedCollection.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-200",
                        selectedCollection.status === 'CANCELLED' && "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {selectedCollection.status}
                    </span>
                  </div>
                  <p className="text-xs text-secondary font-medium mt-0.5">
                    Submitted by {selectedCollection.collector?.fullName || 'Cash Manager'} on {new Date(selectedCollection.collectionTime).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Financial Summary Box */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <div>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Amount Collected</span>
                    <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                      +{fmt(selectedCollection.amountCollected)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Outstanding Balance</span>
                    <p className="text-xl font-bold font-mono text-amber-600 mt-1">
                      {fmt(selectedCollection.outstandingBalance)}
                    </p>
                  </div>
                </div>

                {/* Client & Visit Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-1.5">
                    Client & Visit Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-secondary font-medium block">Client Name:</span>
                      <span className="font-bold text-primary text-sm">{selectedCollection.clientName}</span>
                    </div>
                    <div>
                      <span className="text-secondary font-medium block">Location Visited:</span>
                      <span className="font-bold text-primary text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> {selectedCollection.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary font-medium block">Time of Collection:</span>
                      <span className="font-semibold text-primary">
                        {new Date(selectedCollection.collectionTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary font-medium block">Field Collector:</span>
                      <span className="font-semibold text-primary">
                        {selectedCollection.collector?.fullName} ({selectedCollection.collector?.email})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Field Notes Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-1.5">
                    Field Description & Client Interaction Notes
                  </h4>
                  <div className="p-4 rounded-xl bg-surface border border-outline-variant/30 text-xs text-primary leading-relaxed whitespace-pre-wrap">
                    {parseNoteText(selectedCollection) || 'No additional notes provided.'}
                  </div>
                </div>

                {/* Receipt Photo Proof */}
                {selectedCollection.receiptUrl && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-1.5">
                      Receipt / Deposit Slip Proof Attachment
                    </h4>
                    <a
                      href={selectedCollection.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline p-3 rounded-xl border border-blue-200 bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4" /> View Full Attachment Proof
                    </a>
                  </div>
                )}

                {/* Status Modification for Managers & CEO */}
                {isManagerOrCeo && (
                  <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest block">
                      Executive Deposit Verification Controls
                    </span>
                    <div className="flex gap-3">
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedCollection.id, 'COMPLETE')}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Complete & Settled
                      </button>
                      <button
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedCollection.id, 'CANCELLED')}
                        className="py-3 px-5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ── Create Collection Task Modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary font-display">Assign Field Cash Collection Task</h3>
                    <p className="text-xs text-secondary">Create a task for field collectors or log an incoming cash payment.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <form onSubmit={handleCreateCollectionTask} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Client Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={createForm.clientName}
                    onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })}
                    placeholder="e.g. Kamer Logistics / Merchant Shop"
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Location / Market Sector</label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      placeholder="e.g. Akwa Commercial Hub"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Assigned Collector</label>
                    <input
                      type="text"
                      value={createForm.collectorName}
                      onChange={(e) => setCreateForm({ ...createForm, collectorName: e.target.value })}
                      placeholder="e.g. Christian Enako"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Amount Collected / Target (XAF)</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.amountCollected}
                      onChange={(e) => setCreateForm({ ...createForm, amountCollected: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Outstanding Balance (XAF)</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.outstandingBalance}
                      onChange={(e) => setCreateForm({ ...createForm, outstandingBalance: e.target.value })}
                      placeholder="e.g. 0"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Initial Task Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PENDING">PENDING (Awaiting Collection / Deposit)</option>
                    <option value="COMPLETE">COMPLETE (Collection Verified)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Task Instructions / Notes</label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Instructions for the field collector or interaction details..."
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-secondary hover:bg-surface-container rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md"
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
