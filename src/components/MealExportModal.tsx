import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildMealReport, MealReportRecord } from "../lib/meal-report";
import { downloadMealReport } from "../lib/meal-report-export";

export default function MealExportModal({
  items,
  month: initialMonth,
  onClose,
}: {
  items: MealReportRecord[];
  month: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"month" | "range">("month");
  const [month, setMonth] = useState(initialMonth);
  const [start, setStart] = useState(initialMonth + "-01"),
    [end, setEnd] = useState(initialMonth + "-01");
  const [format, setFormat] = useState<"PDF" | "EXCEL">("PDF");
  const result = useMemo(() => {
    try {
      return {
        report: buildMealReport(
          items,
          mode === "month" ? { month } : { start, end },
        ),
        error: "",
      };
    } catch (error) {
      return {
        report: null,
        error: error instanceof Error ? error.message : "Invalid report period",
      };
    }
  }, [items, mode, month, start, end]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-export-title"
        className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex justify-between">
          <h2 id="meal-export-title" className="font-bold">
            Download meal bills and payroll report
          </h2>
          <button onClick={onClose} aria-label="Close report download">
            Close
          </button>
        </div>
        <p className="text-sm text-slate-600">
          Includes provider bills, employee payroll totals, payroll by provider,
          and dated meal records. The manager pays each full bill and recovers
          employee shares through payroll.
        </p>
        <label className="block text-sm">
          Period
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "month" | "range")}
            className="ml-3 rounded border p-2"
          >
            <option value="month">Month</option>
            <option value="range">Date range</option>
          </select>
        </label>
        {mode === "month" ? (
          <label className="block text-sm">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="ml-3 rounded border p-2"
            />
          </label>
        ) : (
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              From
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="block rounded border p-2"
              />
            </label>
            <label className="text-sm">
              To
              <input
                type="date"
                min={start}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="block rounded border p-2"
              />
            </label>
          </div>
        )}
        <div>
          <label htmlFor="meal-export-format" className="text-sm">
            Format
          </label>
          <select
            id="meal-export-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as "PDF" | "EXCEL")}
            className="ml-3 rounded border p-2"
          >
            <option value="PDF">PDF</option>
            <option value="EXCEL">Excel (.xlsx)</option>
          </select>
        </div>
        {result.error ? (
          <p role="alert" className="text-sm text-red-700">
            {result.error}
          </p>
        ) : (
          <p className="text-sm">
            {result.report?.records.length} records ·{" "}
            {result.report?.totals.count} consumed meals ·{" "}
            {result.report?.providers.length} providers
          </p>
        )}
        <button
          disabled={!result.report?.records.length}
          className="rounded-lg bg-[#001f5b] px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={() => {
            if (!result.report) return;
            try {
              downloadMealReport(result.report, format);
              toast.success("Meal report downloaded");
              onClose();
            } catch {
              toast.error(
                "Could not download the meal report. Please try again.",
              );
            }
          }}
        >
          Download {format === "PDF" ? "PDF" : "Excel"}
        </button>
      </section>
    </div>
  );
}
