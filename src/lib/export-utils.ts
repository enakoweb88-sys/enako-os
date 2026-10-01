import * as XLSX from 'xlsx';
import { exportTablePdf } from './pdf-export';

export interface DateRangeOption {
  key: string;
  label: string;
  category: 'preset' | 'past_month';
  monthOffset?: number;
  startDate?: Date;
  endDate?: Date;
}

export function getExportDateRanges(): DateRangeOption[] {
  const now = new Date();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  const options: DateRangeOption[] = [
    {
      key: 'LAST_7_DAYS',
      label: 'Last 7 Days',
      category: 'preset'
    },
    {
      key: 'CURRENT_MONTH',
      label: `Present Month (${currentMonthName} ${currentYear})`,
      category: 'preset'
    }
  ];

  // Add individual past months (up to 6 past months so the user can easily select 1, 2, 3, etc. months ago)
  for (let offset = 1; offset <= 6; offset++) {
    const pastDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthName = pastDate.toLocaleString('en-US', { month: 'long' });
    const year = pastDate.getFullYear();
    options.push({
      key: `MONTH_OFFSET_${offset}`,
      label: `${monthName} ${year} (${offset} mo. ago)`,
      category: 'past_month',
      monthOffset: offset
    });
  }

  options.push(
    {
      key: 'LAST_3_MONTHS',
      label: 'Last 3 Months (Quarterly)',
      category: 'preset'
    },
    {
      key: 'LAST_YEAR',
      label: 'Last Year (12 Months)',
      category: 'preset'
    },
    {
      key: 'ALL_TIME',
      label: 'All Time (Complete Ledger)',
      category: 'preset'
    }
  );

  return options;
}

export function filterItemsByDateRange<T>(
  items: T[],
  getDateStr: (item: T) => string | undefined | null,
  rangeKey: string
): T[] {
  if (rangeKey === 'ALL_TIME') return items;

  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getTime() + 86400000); // end of today

  if (rangeKey === 'LAST_7_DAYS') {
    start = new Date();
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (rangeKey === 'CURRENT_MONTH') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (rangeKey.startsWith('MONTH_OFFSET_')) {
    const offset = parseInt(rangeKey.replace('MONTH_OFFSET_', ''), 10) || 1;
    start = new Date(now.getFullYear(), now.getMonth() - offset, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
  } else if (rangeKey === 'LAST_3_MONTHS') {
    start = new Date();
    start.setMonth(now.getMonth() - 3);
    start.setHours(0, 0, 0, 0);
  } else if (rangeKey === 'LAST_YEAR') {
    start = new Date();
    start.setFullYear(now.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
  } else {
    return items;
  }

  return items.filter(item => {
    const raw = getDateStr(item);
    if (!raw) return true; // Keep if no date available
    const itemDate = new Date(raw);
    if (isNaN(itemDate.getTime())) return true;
    return itemDate >= start && itemDate <= end;
  });
}

export function exportToExcel(params: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  sheetName?: string;
}): boolean {
  try {
    const sheetData = [
      [params.title],
      [`Exported: ${new Date().toLocaleString()}`],
      [], // blank line
      params.headers,
      ...params.rows
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-calculate column widths
    const colWidths = params.headers.map((h, i) => {
      let maxLen = h.length;
      params.rows.forEach(row => {
        const val = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
        if (val.length > maxLen) maxLen = Math.min(val.length, 60);
      });
      return { wch: Math.max(maxLen + 3, 12) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, params.sheetName || 'Audit Report');
    XLSX.writeFile(wb, params.fileName);
    return true;
  } catch (err) {
    console.error('Failed to export to Excel:', err);
    return false;
  }
}
