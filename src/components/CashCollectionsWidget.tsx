import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, MapPin, ArrowRight, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, CashCollection, CashCollectionStats } from '../lib/api';
import { cn } from '../lib/utils';

function fmt(val: number | string | null | undefined) {
  const n = Number(val ?? 0);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} XAF`;
}

export function CashCollectionsWidget() {
  const [collections, setCollections] = useState<CashCollection[]>([]);
  const [stats, setStats] = useState<CashCollectionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.cashCollections({ limit: 4 }).catch(() => ({ items: [] })),
      api.cashCollectionStats().catch(() => null),
    ]).then(([res, statsRes]) => {
      setCollections(res.items || []);
      setStats(statsRes);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 bg-white border border-outline-variant/30 rounded-2xl text-xs text-secondary animate-pulse">Loading live field cash collection stream…</div>;
  }

  return (
    <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Live Field Cash Collections Stream</h3>
            <p className="text-xs text-secondary">Real-time mobile field reports submitted by cash managers.</p>
          </div>
        </div>

        <Link
          to="/app/cash-collections"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          View All Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
        <div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Today's Total</span>
          <span className="text-lg font-bold font-mono text-emerald-600">{fmt(stats?.todayCollected)}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Pending Deposits</span>
          <span className="text-lg font-bold font-mono text-amber-600">{fmt(stats?.pendingAmount)}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Total Outstanding</span>
          <span className="text-lg font-bold font-mono text-primary">{fmt(stats?.totalOutstanding)}</span>
        </div>
      </div>

      {/* Collections Feed List */}
      {collections.length === 0 ? (
        <p className="text-xs text-secondary text-center py-4">No field collection reports submitted yet today.</p>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="p-3.5 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {col.collector?.fullName?.slice(0, 2).toUpperCase() || 'CC'}
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">{col.clientName}</p>
                  <p className="text-[10px] text-secondary flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-secondary" /> {col.location} • {col.collector?.fullName}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold font-mono text-emerald-600">+{fmt(col.amountCollected)}</p>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-0.5",
                    col.status === 'COMPLETE' && "bg-emerald-50 text-emerald-700",
                    col.status === 'PENDING' && "bg-amber-50 text-amber-700",
                    col.status === 'CANCELLED' && "bg-red-50 text-red-700"
                  )}
                >
                  {col.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
