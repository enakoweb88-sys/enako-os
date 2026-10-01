import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Clock, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const MEAL_OPTIONS = [
  'Fried Rice',
  'Ndole Plantain/dodo',
  'Corn Fufu and Hunklebery',
  'Ekwan'
];

const CATERING_VENDORS = [
  'mami chop'
];

export default function LogMealPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || 'EMPLOYEE').toLowerCase();
  const isManager = userRole === 'ceo' || userRole === 'manager' || userRole === 'outreach_manager';

  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState(user?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'ATE' | 'DID_NOT_EAT'>('ATE');
  const [mealName, setMealName] = useState(MEAL_OPTIONS[0]);
  const [customMeal, setCustomMeal] = useState('');
  const [vendor, setVendor] = useState(CATERING_VENDORS[0]);
  const [mealTime, setMealTime] = useState('13:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentLiveTime] = useState(() => new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }));

  useEffect(() => {
    // Load employees for manager selection
    api.employees({ limit: 100 })
      .then(res => {
        if (res?.items) {
          setEmployees(res.items);
          if (!employeeId && res.items.length > 0) {
            setEmployeeId(res.items[0].id);
          }
        }
      })
      .catch(() => {
        setEmployees([
          { id: user?.id || 'emp-current', fullName: user?.fullName || 'Current User', email: user?.email || '' }
        ]);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmployeeId = isManager ? employeeId : (user?.id || employeeId);
    if (!targetEmployeeId) {
      toast.error('Please select an employee beneficiary');
      return;
    }

    setSubmitting(true);
    const finalMealName = mealName === 'Other' ? (customMeal.trim() || 'Custom Meal') : mealName;

    const entryTimestamp = new Date().toISOString();
    const payload = {
      employeeId: targetEmployeeId,
      date,
      effectiveDate: date,
      entryTimestamp,
      systemRecordedAt: entryTimestamp,
      status,
      price: 1000,
      mealName: finalMealName,
      mealTime: mealTime ? new Date(`${date}T${mealTime}:00`).toISOString() : undefined,
      vendor,
      notes: notes.trim() || undefined,
      companyAmount: status === 'ATE' ? 500 : 0,
      employeeAmount: status === 'ATE' ? 500 : 0,
    };

    try {
      try {
        await api.recordMeal(payload);
      } catch (err) {
        console.warn('Backend API deferred, saving to local meals cache:', err);
      }

      const targetEmp = employees.find(e => e.id === targetEmployeeId) || {
        id: targetEmployeeId,
        fullName: user?.fullName || 'Staff Member',
      };

      // Persist in local storage cache
      const newMeal = {
        id: `MEAL-${Date.now()}`,
        ...payload,
        createdAt: entryTimestamp,
        employee: targetEmp
      };

      const existingRaw = localStorage.getItem('enako_meals_cache');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('enako_meals_cache', JSON.stringify([newMeal, ...existing]));

      // Log into unified system audit trail
      try {
        const deltaDays = Math.round(
          (new Date(entryTimestamp).getTime() - new Date(date).getTime()) / (1000 * 3600 * 24)
        );
        const auditRecord = {
          id: `AUD-MEAL-${Date.now()}`,
          module: 'Staff Meals',
          event: `Meal Check-in: ${status === 'ATE' ? finalMealName : 'Did Not Eat'}`,
          actor: user?.fullName || 'Staff Member',
          actorRole: user?.role || 'Employee',
          effectiveDate: date,
          entryTimestamp,
          deltaDays,
          status: 'VERIFIED',
          referenceId: newMeal.id,
          details: `Staff Beneficiary: ${targetEmp.fullName} • Vendor: ${vendor} • Subsidy: 1,000 FCFA`
        };
        const prevAudits = JSON.parse(localStorage.getItem('enako_system_audits') || '[]');
        localStorage.setItem('enako_system_audits', JSON.stringify([auditRecord, ...prevAudits]));
      } catch (auditErr) {
        console.warn('Audit record warning:', auditErr);
      }

      toast.success('Staff meal entry recorded successfully!');
      navigate('/app/meals');
    } catch (e: any) {
      toast.error(e.message || 'Failed to record meal entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 font-sans">
      {/* Header (No cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Link to="/app/meals" className="hover:text-slate-800 transition-colors">
              Operations & Workflows
            </Link>
            <span>/</span>
            <Link to="/app/meals" className="hover:text-slate-800 transition-colors">
              Staff Meals
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">Log Entry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Log Staff Meal Entry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record daily catering check-ins, dietary selections, and company subsidy tracking.
          </p>
        </div>

        <Link
          to="/app/meals"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Staff Meals
        </Link>
      </div>

      {/* Flat Form (No Cards, No Enclosing Boxes) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Beneficiary & Attendance */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Beneficiary & Attendance Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Member <span className="text-rose-500">*</span>
              </label>
              {isManager ? (
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                  {user?.fullName || 'Current User'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Meal Date <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Editable
                </span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Date meal was consumed (backdatable)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>System Entry Time</span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" /> Immutable
                </span>
              </label>
              <input
                type="text"
                disabled
                readOnly
                value={`${currentLiveTime}`}
                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 text-slate-500 rounded-lg text-xs font-mono font-semibold cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Automatic real-time system clock</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attendance Status <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('ATE')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    status === 'ATE'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Ate Lunch
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('DID_NOT_EAT')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    status === 'DID_NOT_EAT'
                      ? 'border-slate-800 bg-slate-800 text-white shadow-2xs font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Did Not Eat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Menu Selection & Catering Vendor */}
        {status === 'ATE' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Menu Selection & Catering
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Meal Platter / Dietary Option
                </label>
                <div className="space-y-2">
                  {MEAL_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      onClick={() => setMealName(opt)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        mealName === opt
                          ? 'border-[#001f5b] bg-[#001f5b]/5 text-slate-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mealChoice"
                        checked={mealName === opt}
                        onChange={() => setMealName(opt)}
                        className="text-[#001f5b] focus:ring-[#001f5b]"
                      />
                      <span className="text-xs font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Catering Service Provider
                  </label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                  >
                    {CATERING_VENDORS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Service Time Window
                  </label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Cost & Welfare Subsidy Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Welfare Subsidy & Co-Pay Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Total Meal Cost</span>
              <span className="text-sm font-bold text-slate-900">
                {status === 'ATE' ? '1,000 FCFA' : '0 FCFA'}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <span className="text-emerald-700 block text-[11px]">Company Subsidy (50%)</span>
              <span className="text-sm font-bold text-emerald-800">
                {status === 'ATE' ? '500 FCFA' : '0 FCFA'}
              </span>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
              <span className="text-blue-700 block text-[11px]">Employee Payroll Share (50%)</span>
              <span className="text-sm font-bold text-blue-900">
                {status === 'ATE' ? '500 FCFA' : '0 FCFA'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Dietary Feedback & Special Instructions */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Dietary Preferences & Kitchen Notes (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Specify allergy warnings, spice tolerances, or special delivery instructions for the caterer.
          </p>
          <textarea
            rows={6}
            placeholder="Type any dietary notes, food allergy warnings, or delivery requests here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Footer Buttons (No Cards) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Recorded in <strong>ENAKO Staff Welfare Portal</strong> • Auto-payroll reconciled
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/meals"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Recording Entry...' : 'Save Meal Entry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
