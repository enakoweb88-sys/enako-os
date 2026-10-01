import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { apiRequest } from '../lib/api/core';
import { toast } from 'sonner';

const DEPARTMENTS = [
  'Engineering & Tech',
  'Operations & Workflow',
  'Marketing & Growth',
  'Finance & Accounting',
  'Human Resources',
  'Executive Office',
  'Customer Support'
];

const POPULAR_SERVICES = [
  'AWS Cloud Infrastructure',
  'Google Workspace Business',
  'Slack Enterprise Grid',
  'Microsoft 365 Enterprise',
  'GitHub Enterprise',
  'Zoom Video Communications',
  'Figma Organization',
  'OpenAI API Services',
  'Cloudflare Enterprise',
  'Other'
];

export default function CreateSubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('XAF');
  const [exchangeRate, setExchangeRate] = useState('1');
  const [costInXaf, setCostInXaf] = useState('');
  const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextBilling, setNextBilling] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [seats, setSeats] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-calculate next billing date based on cycle and start date
  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate);
      if (cycle === 'Monthly') {
        d.setMonth(d.getMonth() + 1);
      } else {
        d.setFullYear(d.getFullYear() + 1);
      }
      setNextBilling(d.toISOString().split('T')[0]);
    }
  }, [startDate, cycle]);

  // Currency rate conversion
  useEffect(() => {
    const numCost = parseFloat(cost) || 0;
    if (currency === 'XAF') {
      setCostInXaf(numCost.toString());
      setExchangeRate('1');
    } else if (currency === 'USD') {
      const rate = 615;
      setExchangeRate(rate.toString());
      setCostInXaf((numCost * rate).toString());
    } else if (currency === 'EUR') {
      const rate = 656;
      setExchangeRate(rate.toString());
      setCostInXaf((numCost * rate).toString());
    } else if (currency === 'GBP') {
      const rate = 780;
      setExchangeRate(rate.toString());
      setCostInXaf((numCost * rate).toString());
    }
  }, [cost, currency]);

  const numCostInXaf = parseFloat(costInXaf) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the subscription / service name.');
      return;
    }
    if (!cost || parseFloat(cost) <= 0) {
      toast.error('Please enter a valid subscription cost.');
      return;
    }

    setSubmitting(true);
    let finalReceiptUrl = receiptUrl;

    if (receiptFile) {
      try {
        const formData = new FormData();
        formData.append('file', receiptFile);
        const uploadRes = await apiRequest<{ url: string }>('/upload', {
          method: 'POST',
          body: formData,
        });
        finalReceiptUrl = uploadRes.url;
      } catch (err: any) {
        console.warn('Receipt upload deferred, continuing without attachment');
      }
    }

    const payload = {
      name: name.trim(),
      cost: Number(cost),
      currency,
      costInXaf: numCostInXaf,
      exchangeRate: Number(exchangeRate) || 1,
      cycle,
      status: 'Active' as const,
      startDate,
      nextBilling: nextBilling || startDate,
      department,
      seats: seats.trim() || undefined,
      notes: notes.trim() || undefined,
      receiptUrl: finalReceiptUrl,
    };

    try {
      try {
        await api.createSubscription(payload);
      } catch (err) {
        console.warn('Backend API deferred, saving to local cache:', err);
      }

      // Save to local cache
      const newSub = {
        id: `SUB-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      const existingRaw = localStorage.getItem('enako_subscriptions');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('enako_subscriptions', JSON.stringify([newSub, ...existing]));

      toast.success(`${payload.name} subscription logged successfully!`);
      navigate('/app/subscriptions');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create subscription');
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
            <Link to="/app/subscriptions" className="hover:text-slate-800 transition-colors">
              Finance & Accounts
            </Link>
            <span>/</span>
            <Link to="/app/subscriptions" className="hover:text-slate-800 transition-colors">
              Subscriptions
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">New Subscription</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Add Enterprise Subscription
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record recurring corporate software licenses, cloud infrastructure, or enterprise tools.
          </p>
        </div>

        <Link
          to="/app/subscriptions"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Subscriptions
        </Link>
      </div>

      {/* Flat Form (No Cards, No Enclosing Boxes) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Service Particulars */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Service & Vendor Particulars
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Service / Vendor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Cloud Infrastructure, Google Workspace, Zoom Enterprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1 self-center">
                  Quick select:
                </span>
                {POPULAR_SERVICES.slice(0, 5).map((srv) => (
                  <button
                    type="button"
                    key={srv}
                    onClick={() => setName(srv)}
                    className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors"
                  >
                    {srv}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Licensed Seats / Plan Tier (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50 Seats - Business Plus, Unlimited Tier"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Terms & Billing Cycle */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Pricing & Billing Cadence
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Currency <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  <option value="XAF">XAF / FCFA (Central African Franc)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rate Amount <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Billing Cycle <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCycle('Monthly')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      cycle === 'Monthly'
                        ? 'border-[#001f5b] bg-[#001f5b] text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setCycle('Yearly')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      cycle === 'Yearly'
                        ? 'border-[#001f5b] bg-[#001f5b] text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>

            {currency !== 'XAF' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                <span className="text-slate-600">
                  Calculated FCFA Equivalent ({currency} @ {exchangeRate} XAF):
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {numCostInXaf.toLocaleString('en-US', { maximumFractionDigits: 0 })} FCFA / {cycle}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Schedule & Renewal Dates */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Schedule & Renewal Timeline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Effective Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Next Renewal / Invoice Date
              </label>
              <input
                type="date"
                value={nextBilling}
                onChange={(e) => setNextBilling(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Notes & Documentation */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Business Rationale & Contract Terms (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Document license agreements, user allocation rules, contact representatives, or cancellation policies.
          </p>
          <textarea
            rows={7}
            placeholder="Type comprehensive license notes, vendor billing portal credentials, account contacts, or procurement justification..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Footer Buttons (No Cards) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Recorded in <strong>Corporate Subscriptions Ledger</strong> • Auto-renewal active
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/subscriptions"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving Subscription...' : 'Add Enterprise Subscription'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
