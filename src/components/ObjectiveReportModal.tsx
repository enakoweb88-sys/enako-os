import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { mealDay } from '../lib/meal-utils';
import { exportTablePdf } from '../lib/pdf-export';
import { exportToExcel } from '../lib/export-utils';

export default function ObjectiveReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const canAssign = ['CEO', 'MANAGER'].includes(user?.role || '');
  const [period, setPeriod] = useState('MONTHLY');
  const [date, setDate] = useState(mealDay());
  const [ownerId, setOwnerId] = useState(user?.id || '');
  const [employees, setEmployees] = useState<any[]>([]);
  const [format, setFormat] = useState('PDF');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setOwnerId(user?.id || '');
    if (!canAssign) return;
    api.employees({ limit: 1000 }).then(result => setEmployees(result.items || []))
      .catch(() => toast.error('Employee list could not be loaded. Your own report is still available.'));
  }, [isOpen, canAssign, user?.id]);

  if (!isOpen) return null;

  const download = async () => {
    if (!date || downloading) return;
    setDownloading(true);
    try {
      const report = await api.goalReport({ period, date: period === 'MONTHLY' ? `${date.slice(0, 7)}-01` : date, ownerId: canAssign ? ownerId || undefined : user?.id });
      if (!report.items.length) { toast.info('No completed objectives in this period.'); return; }
      const headers = ['Objective', 'Owner / Department', 'Period', 'Target', 'Achieved', 'Completed on', 'Date source'];
      const rows = report.items.map(goal => [
        goal.title, goal.owner?.fullName || goal.department?.name || 'Company', goal.cadence || 'Unscheduled',
        `${goal.targetValue ?? 100} ${goal.unit || ''}`, `${goal.currentValue ?? 0} ${goal.unit || ''}`,
        new Date(goal.completedAt || goal.updatedAt).toLocaleString('en-GB', { timeZone: 'Africa/Douala' }),
        goal.completedAt ? 'Recorded completion' : 'Legacy: last update estimate',
      ]);
      const title = 'ENAKO OS • COMPLETED OBJECTIVES';
      const subtitle = `${report.start} to ${report.end} · ${report.items.length} completed objectives · Africa/Douala`;
      const baseName = `Enako_Completed_Objectives_${period}_${report.start}_${report.end}`;
      const success = format === 'PDF'
        ? exportTablePdf({ title, subtitle, headers, rows, fileName: `${baseName}.pdf`, orientation: 'landscape' })
        : exportToExcel({ title: `${title} · ${subtitle}`, headers, rows, fileName: `${baseName}.xlsx`, sheetName: 'Completed Objectives' });
      if (!success) throw new Error('Could not generate the report');
      toast.success(`Downloaded ${report.items.length} completed objectives`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Could not download objectives');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="objective-report-title" className="w-full max-w-lg space-y-5 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 id="objective-report-title" className="font-bold text-slate-900">Completed objectives report</h2>
          <button onClick={onClose} aria-label="Close report" className="text-sm text-slate-500">Close</button>
        </div>
        <p className="text-xs text-slate-500">Download objectives completed during the selected period. Weeks run Monday to Sunday. Older objectives without a completion timestamp use their last update date, marked as an estimate.</p>
        <label className="block text-xs font-semibold text-slate-700">Report period
          <select value={period} onChange={e => setPeriod(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-2.5">
            <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-700">{period === 'MONTHLY' ? 'Month' : period === 'WEEKLY' ? 'Choose a date in the week' : 'Day'}
          <input type={period === 'MONTHLY' ? 'month' : 'date'} required value={period === 'MONTHLY' ? date.slice(0, 7) : date} onChange={e => setDate(period === 'MONTHLY' && e.target.value ? `${e.target.value}-01` : e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-2.5" />
        </label>
        {canAssign && <label className="block text-xs font-semibold text-slate-700">Report owner
          <select value={ownerId} onChange={e => setOwnerId(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-2.5">
            <option value={user?.id}>My objectives</option>
            <option value="">All employees and shared objectives</option>
            {employees.filter(employee => employee.id !== user?.id).map(employee => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
          </select>
        </label>}
        <label className="block text-xs font-semibold text-slate-700">File format
          <select value={format} onChange={e => setFormat(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 p-2.5"><option>PDF</option><option value="EXCEL">Excel</option></select>
        </label>
        <button onClick={download} disabled={downloading || !date} className="w-full rounded-lg bg-[#001f5b] p-2.5 text-sm font-semibold text-white disabled:opacity-50">{downloading ? 'Generating report...' : 'Download report'}</button>
      </div>
    </div>
  );
}
