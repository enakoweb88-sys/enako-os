export const emptyFinanceDashboard = () => ({
  banking: [] as any[], accounts: {} as any, budget: [] as any[],
  cashPosition: { chartData: [] as any[] }, invoices: { summary: {} as any, recent: [] as any[] },
});

export type FinanceDashboardData = ReturnType<typeof emptyFinanceDashboard>;
type FinanceSource = {
  accountsSummary: () => Promise<any>; banking: () => Promise<any[]>;
  budget: () => Promise<any[]>; cashPosition: () => Promise<any>; invoicesOverview: () => Promise<any>;
};
const rows = (value: any) => Array.isArray(value) ? value.filter(row => row && typeof row === 'object') : [];

// A failed section must not discard the other sections that loaded successfully.
export async function loadFinanceDashboard(source: FinanceSource) {
  const requests = [
    ['accounts', () => source.accountsSummary()], ['banking', () => source.banking()],
    ['budget', () => source.budget()], ['cashPosition', () => source.cashPosition()],
    ['invoices', () => source.invoicesOverview()],
  ] as const;
  const results = await Promise.allSettled(requests.map(async ([, request]) => request()));
  const data = emptyFinanceDashboard();
  const failed: string[] = [];
  results.forEach((result, index) => {
    const key = requests[index][0];
    if (result.status === 'rejected') { failed.push(key); return; }
    const value = result.value;
    if (key === 'banking' || key === 'budget') data[key] = rows(value);
    else if (key === 'cashPosition') data.cashPosition = { chartData: rows(value?.chartData) };
    else if (key === 'invoices') data.invoices = { summary: value?.summary || {}, recent: rows(value?.recent) };
    else data.accounts = value || {};
  });
  return { data, failed };
}

export function treasuryBalances(banking: any[]) {
  const totals: Record<string, number> = {};
  for (const account of banking) {
    const amount = Number(account.balance);
    if (!Number.isFinite(amount)) continue;
    const currency = typeof account.currency === 'string' ? account.currency.toUpperCase() : 'XAF';
    totals[currency] = (totals[currency] || 0) + amount;
  }
  return Object.entries(totals);
}
