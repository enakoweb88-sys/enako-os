/**
 * Dashboard Data Store
 * 
 * Module-level cache that persists dashboard data across navigation.
 * Data is loaded once on first mount, then silently refreshed in the background
 * without showing loading states on subsequent visits.
 */

type Subscriber = () => void;

interface DashboardData {
  overview: any;
  transactions: any[];
  healthScore: any;
  outreachStats: any;
  lastFetchedAt: number | null;
  isInitialLoad: boolean;  // true = never loaded before, show loading spinner
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes — refetch in background after this

let data: DashboardData = {
  overview: null,
  transactions: [],
  healthScore: null,
  outreachStats: null,
  lastFetchedAt: null,
  isInitialLoad: true,
};

const subscribers = new Set<Subscriber>();

function notify() {
  subscribers.forEach(fn => fn());
}

export function subscribeToDashboard(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function getDashboardData(): DashboardData {
  return data;
}

export async function fetchDashboardData(
  apiFns: {
    overview: () => Promise<any>;
    healthScore: () => Promise<any>;
    transactions: (params: any) => Promise<any>;
    outreachStats: () => Promise<any>;
  }
): Promise<void> {
  const now = Date.now();

  // If data was fetched recently and it's not the initial load, skip
  if (data.lastFetchedAt && (now - data.lastFetchedAt) < STALE_TIME && !data.isInitialLoad) {
    return;
  }

  try {
    const [ov, h, t, outStats] = await Promise.all([
      apiFns.overview().catch(() => null),
      apiFns.healthScore().catch(() => null),
      apiFns.transactions({ limit: 6 }).catch(() => ({ items: [] })),
      apiFns.outreachStats().catch(() => null),
    ]);

    data = {
      overview: ov ?? data.overview,
      transactions: Array.isArray(t) ? t : t?.items || data.transactions,
      healthScore: h ?? data.healthScore,
      outreachStats: outStats ?? data.outreachStats,
      lastFetchedAt: Date.now(),
      isInitialLoad: false,
    };

    notify();
  } catch (err) {
    console.error('Dashboard data fetch error:', err);
    // On error, just mark initial load as done so we don't show spinner forever
    if (data.isInitialLoad) {
      data = { ...data, isInitialLoad: false };
      notify();
    }
  }
}
