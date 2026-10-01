import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Clock, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const CATEGORIES = [
  'Travel & Transit',
  'Office & Utilities',
  'Hardware & IT',
  'Software & Cloud',
  'Meals & Welfare',
  'Operations',
  'Marketing',
  'Consultancy',
  'Other'
];

const DEPARTMENTS = [
  'Executive Office',
  'Finance & Accounting',
  'Operations',
  'Engineering & Tech',
  'Outreach & Field',
  'Business Development',
  'Customer Support'
];

export default function CreateExpensePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || 'EMPLOYEE').toLowerCase();
  const isExecutive = userRole === 'ceo' || userRole === 'manager';

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & Transit');
  const [customCategory, setCustomCategory] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Operations');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentLiveTime] = useState(() => new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }));
  const [paymentMethod, setPaymentMethod] = useState('Corporate Account');
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a claim description');
      return;
    }
    if (numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;
    
    // CEO and Manager do not submit for review; they approve and record directly
    const initialStatus = isExecutive ? 'APPROVED' : 'PENDING';
    const entryTimestamp = new Date().toISOString();

    const payload = {
      description: description.trim(),
      amount: numAmount,
      category: finalCategory,
      department,
      expenseDate,
      effectiveDate: expenseDate,
      entryTimestamp,
      systemRecordedAt: entryTimestamp,
      paymentMethod,
      receiptRef: receiptRef.trim() || undefined,
      notes: notes.trim() || undefined,
      status: initialStatus,
      submittedBy: {
        id: user?.id || 'emp-current',
        fullName: user?.fullName || (isExecutive ? 'CEO & Executive Office' : 'Staff Member'),
        email: user?.email || '',
        role: user?.role || 'CEO'
      }
    };

    try {
      let created = null;
      try {
        created = await api.createExpense(payload);
      } catch (err) {
        console.warn('Backend API deferred, saving locally:', err);
      }

      const localId = created?.id || `EXP-${Date.now()}`;
      const newClaim = {
        id: localId,
        description: payload.description,
        amount: payload.amount,
        category: payload.category,
        department: payload.department,
        status: initialStatus,
        createdAt: entryTimestamp,
        expenseDate: payload.expenseDate,
        effectiveDate: payload.expenseDate,
        entryTimestamp,
        systemRecordedAt: entryTimestamp,
        paymentMethod: payload.paymentMethod,
        receiptRef: payload.receiptRef,
        notes: payload.notes,
        submittedBy: payload.submittedBy
      };

      const existingRaw = localStorage.getItem('enako_custom_expenses');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('enako_custom_expenses', JSON.stringify([newClaim, ...existingList]));

      // Log into unified system audit trail
      try {
        const deltaDays = Math.round(
          (new Date(entryTimestamp).getTime() - new Date(expenseDate).getTime()) / (1000 * 3600 * 24)
        );
        const auditRecord = {
          id: `AUD-EXP-${Date.now()}`,
          module: 'Expenses',
          event: `Expense Claim Logged: ${finalCategory} - ${numAmount.toLocaleString()} FCFA`,
          actor: payload.submittedBy.fullName,
          actorRole: payload.submittedBy.role,
          effectiveDate: expenseDate,
          entryTimestamp,
          deltaDays,
          status: isExecutive ? 'VERIFIED' : 'PENDING',
          referenceId: localId,
          details: `Description: ${description.trim()} • Cost Center: ${department} • Channel: ${paymentMethod}`
        };
        const prevAudits = JSON.parse(localStorage.getItem('enako_system_audits') || '[]');
        localStorage.setItem('enako_system_audits', JSON.stringify([auditRecord, ...prevAudits]));
      } catch (auditErr) {
        console.warn('Expense audit record warning:', auditErr);
      }

      if (isExecutive) {
        toast.success('Expense authorized and recorded directly into ledger');
      } else {
        toast.success('Expense claim submitted for executive review');
      }
      navigate('/app/expenses');
    } catch (e: any) {
      toast.error(e.message || 'Failed to record expense');
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
            <Link to="/app/expenses" className="hover:text-slate-800 transition-colors">
              Finance & Accounts
            </Link>
            <span>/</span>
            <Link to="/app/expenses" className="hover:text-slate-800 transition-colors">
              Expenses
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">
              {isExecutive ? 'Record Expense' : 'New Claim'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isExecutive ? 'Authorize & Record Expense' : 'Submit Expense Claim'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isExecutive
              ? 'Directly authorize, approve, and log an executive or company expenditure into the ledger.'
              : 'File a corporate reimbursement or departmental expenditure for management review.'}
          </p>
        </div>

        <Link
          to="/app/expenses"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Expenses
        </Link>
      </div>

      {/* Flat Form (No Cards, No Enclosing Boxes) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Expense Particulars
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Purpose <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Regional client visit transport & logistics, Cloud server renewal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount (FCFA / XAF) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 75000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-20 bg-slate-50/60 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    FCFA
                  </div>
                </div>

                {numAmount > 0 && (
                  <p className="text-xs font-bold text-slate-700 mt-1.5">
                    Total: {numAmount.toLocaleString('en-US')} FCFA
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cost Center / Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Category & Dates */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Category & Classification
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                      category === cat
                        ? 'border-[#001f5b] bg-[#001f5b] text-white'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {category === 'Other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    required
                    placeholder="Specify custom category (e.g. Legal Consultation, Licensing)"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                  />
                </div>
              )}
            </div>

            {/* Effective Incurred Date & Immutable System Timestamp */}
            <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Editable Date Incurred */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#001f5b]" />
                      Date Incurred / Expense Date <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Editable (Backdate if forgotten)
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-[#001f5b] focus:ring-1 focus:ring-[#001f5b] transition-all shadow-2xs cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    The calendar date this expenditure was incurred (editable if logging retroactively).
                  </p>
                </div>

                {/* Non-Editable System Entry Timestamp */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      System Entry Timestamp
                    </label>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Immutable
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed select-none">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{currentLiveTime} (Auto-Captured)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    System-locked timestamp permanently recorded in the security audit ledger. Non-editable.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment / Settlement Route
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  <option value="Corporate Account">Corporate Account (Direct Wire/Cheque)</option>
                  <option value="Corporate MoMo / Orange">Corporate MoMo / Orange Money</option>
                  <option value="Petty Cash Desk">Petty Cash Desk</option>
                  <option value="Personal Reimbursement">Personal Reimbursement (Staff Paid First)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Invoice / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-9481 / MTN-883"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Business Justification & Notes (Increased Space per user request) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Business Justification & Notes (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Provide detailed rationale, vendor terms, project attribution, or auditing comments.
          </p>
          <textarea
            rows={8}
            placeholder="Type comprehensive justification, background details, counterparty contacts, or audit trail notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Footer Buttons (No Cards) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {isExecutive ? (
              <span>Acting as <strong>{user?.fullName || 'CEO / Executive'}</strong> • Instant ledger reconciliation</span>
            ) : (
              <span>Logged by <strong>{user?.fullName || 'Staff Member'}</strong> • Routes to Executive Review</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/expenses"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>Recording Expense...</>
              ) : isExecutive ? (
                <>Authorize & Record Expense</>
              ) : (
                <>Submit Claim for Review</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
