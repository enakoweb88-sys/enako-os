export function mealDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function mealDate(record: any): string {
  return (record.effectiveDate || record.date || '').slice(0, 10);
}

// Old form versions saved a second, synthetic record after a successful POST.
// Keep the server ID and remove only matching browser copies.
export function reconcileMealCache(remote: any[], cached: any[]) {
  return cached.filter(local => !remote.some(saved =>
    saved.id === local.id || (
      saved.employeeId === local.employeeId && mealDate(saved) === mealDate(local) &&
      saved.status === local.status && (saved.mealName || '') === (local.mealName || '')
    )
  ));
}

export function monthlyMealSummary(items: any[], month = mealDay().slice(0, 7)) {
  const consumed = items.filter(m => mealDate(m).startsWith(`${month}-`) && m.status === 'ATE');
  return {
    count: consumed.length,
    companyAmount: consumed.reduce((sum, m) => sum + Number(m.companyAmount ?? 500), 0),
    employeeAmount: consumed.reduce((sum, m) => sum + Number(m.employeeAmount ?? 500), 0),
    beneficiaries: new Set(consumed.map(m => m.employeeId).filter(Boolean)).size,
  };
}
