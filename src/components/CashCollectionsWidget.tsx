import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, MapPin, ArrowRight, DollarSign, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { api, CashCollection, CashCollectionStats } from '../lib/api';
import { cn } from '../lib/utils';

function fmt(val: number | string | null | undefined) {
  const n = Number(val ?? 0);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} XAF`;
}

function parseNoteText(item: any): string {
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

export function CashCollectionsWidget() {
  const [collections, setCollections] = useState<CashCollection[]>([]);
  const [stats, setStats] = useState<CashCollectionStats | null>(null);
  const [loading, setLoading] = useState(true);

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

        result.push({
          id,
          collectorId: item.collectorId || 'COL-REAL',
          clientName: item.clientName || 'Client',
          location: item.location || item.depositDestination || 'Douala Field Sector',
          amountCollected: amt,
          outstandingBalance: shortage,
          currency: 'XAF',
          collectionTime: item.collectionTime || item.timestamp || new Date().toISOString(),
          status: (item.status === 'COMPLETE' || item.status === 'PENDING' || item.status === 'CANCELLED') ? item.status : 'PENDING',
          description: item.description || item.notes || item.summaryNote || '',
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

  const loadStreamData = () => {
    Promise.all([
      api.cashCollections({ limit: 10 }).catch(() => ({ items: [] })),
      api.cashCollectionStats().catch(() => null),
    ]).then(([res, statsRes]) => {
      const backendItems = res.items || [];
      const localItems = getLocalUserCollections();
      const backendIds = new Set(backendItems.map((i: any) => i.id));
      const combined = [...backendItems, ...localItems.filter((l) => !backendIds.has(l.id))];

      setCollections(combined.slice(0, 5));
      setStats(statsRes);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStreamData();
    const interval = setInterval(loadStreamData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 bg-white border border-outline-variant/30 rounded-2xl text-xs text-secondary animate-pulse">Loading live field cash collection stream…</div>;
  }

  return (
    <div id="cash-collections" className="scroll-mt-6 bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs space-y-4 font-sans">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Live Field Cash Collections Stream</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time mobile field reports & notes submitted by collectors</p>
        </div>

        <Link
          to="/app/cash-collections"
          className="text-xs text-[#001f5b] hover:underline font-semibold"
        >
          View All
        </Link>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-md bg-slate-50/70 border border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Today's Total</span>
          <span className="text-base font-bold text-emerald-700">{fmt(stats?.todayCollected)}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Deposits</span>
          <span className="text-base font-bold text-amber-600">{fmt(stats?.pendingAmount)}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Outstanding</span>
          <span className="text-base font-bold text-slate-900">{fmt(stats?.totalOutstanding)}</span>
        </div>
      </div>

      {/* Collections Feed List */}
      {collections.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6 font-medium">No field collection reports submitted yet today.</p>
      ) : (
        <div className="space-y-2.5">
          {collections.map((col) => {
            const noteText = parseNoteText(col);
            return (
              <div
                key={col.id}
                className="p-3.5 rounded-md border border-slate-100 hover:bg-slate-50/60 transition-all flex flex-col gap-2 bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#001f5b]/10 flex items-center justify-center text-xs font-bold text-[#001f5b] shrink-0">
                      {col.collector?.fullName?.slice(0, 2).toUpperCase() || 'CC'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{col.clientName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {col.location} • <span className="font-medium text-slate-700">{col.collector?.fullName || 'Field Agent'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-700">+{fmt(col.amountCollected)}</p>
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-0.5 border",
                        col.status === 'COMPLETE' && "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                        col.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-200/60",
                        col.status === 'CANCELLED' && "bg-rose-50 text-rose-700 border-rose-200/60"
                      )}
                    >
                      {col.status}
                    </span>
                  </div>
                </div>

                {noteText && (
                  <div className="px-2.5 py-1.5 rounded-md bg-amber-50/60 border border-amber-200/50 text-[11px] text-amber-950 font-normal flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">Note:</span>
                      <p className="leading-relaxed text-amber-900">{noteText}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

