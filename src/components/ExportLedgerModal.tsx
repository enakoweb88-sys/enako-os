import React, { useState, useMemo } from 'react';
import { Download, FileText, Table, X, Calendar, Check, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getExportDateRanges, filterItemsByDateRange, exportToExcel, DateRangeOption } from '../lib/export-utils';
import { exportTablePdf } from '../lib/pdf-export';

interface ExportLedgerModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  defaultFileName: string;
  headers: string[];
  items: T[];
  getDateStr: (item: T) => string | undefined | null;
  getRowData: (item: T) => (string | number)[];
  orientation?: 'portrait' | 'landscape';
}

export default function ExportLedgerModal<T>({
  isOpen,
  onClose,
  title,
  subtitle,
  defaultFileName,
  headers,
  items,
  getDateStr,
  getRowData,
  orientation
}: ExportLedgerModalProps<T>) {
  const [format, setFormat] = useState<'PDF' | 'EXCEL'>('PDF');
  const [selectedRange, setSelectedRange] = useState<string>('LAST_7_DAYS');
  const [selectedPastMonth, setSelectedPastMonth] = useState<string>('MONTH_OFFSET_1');

  const dateRangeOptions = useMemo(() => getExportDateRanges(), []);

  // Determine active range key
  const effectiveRangeKey = selectedRange === 'SPECIFIC_PAST_MONTH' ? selectedPastMonth : selectedRange;

  // Filtered items based on range
  const filteredItems = useMemo(() => {
    return filterItemsByDateRange(items, getDateStr, effectiveRangeKey);
  }, [items, getDateStr, effectiveRangeKey]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const rows = filteredItems.map(getRowData);
    const rangeObj = dateRangeOptions.find(o => o.key === effectiveRangeKey);
    const rangeLabel = rangeObj ? rangeObj.label : 'Export';
    const cleanDateStr = new Date().toISOString().split('T')[0];

    const fileNameBase = `${defaultFileName}_${rangeLabel.replace(/[^a-zA-Z0-9]/g, '_')}_${cleanDateStr}`;

    if (format === 'EXCEL') {
      const success = exportToExcel({
        title,
        headers,
        rows,
        fileName: `${fileNameBase}.xlsx`,
        sheetName: 'Ledger Records'
      });
      if (success) {
        toast.success(`Exported ${filteredItems.length} records to Excel (.xlsx)`);
        onClose();
      } else {
        toast.error('Failed to export Excel file');
      }
    } else {
      const success = exportTablePdf({
        title,
        subtitle: subtitle || `Period: ${rangeLabel} • Total Records: ${filteredItems.length}`,
        headers,
        rows,
        fileName: `${fileNameBase}.pdf`,
        orientation
      });
      if (success) {
        toast.success(`Exported ${filteredItems.length} records to PDF`);
        onClose();
      } else {
        toast.error('Failed to export PDF file');
      }
    }
  };

  const currentMonthOption = dateRangeOptions.find(o => o.key === 'CURRENT_MONTH');
  const pastMonthOptions = dateRangeOptions.filter(o => o.category === 'past_month');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#001f5b] text-white flex items-center justify-center shadow-2xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Choose file export format and historical audit timeframe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Format Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Export File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('PDF')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  format === 'PDF'
                    ? 'border-[#001f5b] bg-[#001f5b]/5 text-[#001f5b] shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  format === 'PDF' ? 'bg-[#001f5b] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs">PDF Document</p>
                  <p className="text-[10px] text-slate-500">Official branded PDF</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('EXCEL')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  format === 'EXCEL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  format === 'EXCEL' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs">Excel (.xlsx)</p>
                  <p className="text-[10px] text-slate-500">Spreadsheet table</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Timeframe & Date Range
            </label>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRange('LAST_7_DAYS')}
                className={`px-3 py-2 rounded-md text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedRange === 'LAST_7_DAYS'
                    ? 'border-[#001f5b] bg-[#001f5b] text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Last 7 Days</span>
                {selectedRange === 'LAST_7_DAYS' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRange('CURRENT_MONTH')}
                className={`px-3 py-2 rounded-md text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedRange === 'CURRENT_MONTH'
                    ? 'border-[#001f5b] bg-[#001f5b] text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{currentMonthOption?.label || 'Present Month'}</span>
                {selectedRange === 'CURRENT_MONTH' && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRange('LAST_3_MONTHS')}
                className={`px-3 py-2 rounded-md text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedRange === 'LAST_3_MONTHS'
                    ? 'border-[#001f5b] bg-[#001f5b] text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Last 3 Months</span>
                {selectedRange === 'LAST_3_MONTHS' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRange('LAST_YEAR')}
                className={`px-3 py-2 rounded-md text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedRange === 'LAST_YEAR'
                    ? 'border-[#001f5b] bg-[#001f5b] text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Last Year (12 Mo.)</span>
                {selectedRange === 'LAST_YEAR' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Previous Months Dropdown (so they can pick e.g. 1, 2, 3 months ago) */}
            <div className="pt-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Or Download Specific Previous Month:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPastMonth}
                  onChange={(e) => {
                    setSelectedPastMonth(e.target.value);
                    setSelectedRange('SPECIFIC_PAST_MONTH');
                  }}
                  className={`w-full px-3 py-2 rounded-md text-xs font-semibold border outline-none cursor-pointer transition-colors ${
                    selectedRange === 'SPECIFIC_PAST_MONTH'
                      ? 'border-[#001f5b] bg-blue-50/40 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {pastMonthOptions.map(p => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedRange('SPECIFIC_PAST_MONTH')}
                  className={`px-3 py-2 rounded-md text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
                    selectedRange === 'SPECIFIC_PAST_MONTH'
                      ? 'bg-[#001f5b] text-white border-[#001f5b]'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Apply Month
                </button>
              </div>
            </div>

            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setSelectedRange('ALL_TIME')}
                className={`text-[11px] font-semibold hover:underline ${
                  selectedRange === 'ALL_TIME' ? 'text-[#001f5b] font-bold' : 'text-slate-500'
                }`}
              >
                {selectedRange === 'ALL_TIME' ? '✓ Showing All Time Records' : 'View All Time (Complete Ledger)'}
              </button>
            </div>
          </div>

          {/* Record Count Preview Box */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
            <span className="text-slate-600 font-medium">Selected Ledger Records:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-900 font-bold font-mono text-[11px]">
              {filteredItems.length} records
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={filteredItems.length === 0}
            className={`px-5 py-2 rounded-md text-xs font-semibold text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${
              format === 'EXCEL'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-[#001f5b] hover:bg-[#001744]'
            } disabled:opacity-50`}
          >
            <Download className="w-3.5 h-3.5" />
            Download {format === 'EXCEL' ? 'Excel Spreadsheet (.xlsx)' : 'PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
