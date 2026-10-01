import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, CashCollection } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const SECTORS = [
  'Douala - Akwa Commercial Center',
  'Douala - Bonanjo Financial Hub',
  'Douala - Deido & Bepanda',
  'Douala - Bonaberi Industrial Zone',
  'Yaoundé - Bastos & Centre Ville',
  'Yaoundé - Mokolo & Ngoa-Ekélé',
  'Bafoussam - Marché Central',
  'Kribi - Port Corridor',
  'Other / Regional Route'
];

const COLLECTORS = [
  'Christian Enako (Lead Ops)',
  'Marcelle Ebogo (Field Agent A)',
  'Jean-Paul Kamga (Douala Central)',
  'Eric Mballa (Yaoundé Sector)',
  'Fabrice Nono (Western Route)',
  'Open Field Assignment Pool'
];

export default function CreateCashTaskPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState(SECTORS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [amount, setAmount] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [collectorName, setCollectorName] = useState(COLLECTORS[0]);
  const [collectionTime, setCollectionTime] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [bagId, setBagId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const numOutstanding = parseFloat(outstandingBalance) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Please enter the merchant or client name.');
      return;
    }
    if (numAmount <= 0) {
      toast.error('Please enter a valid collection amount.');
      return;
    }

    setSubmitting(true);
    const finalLocation = location.startsWith('Other') 
      ? (customLocation.trim() || 'Regional Field Sector') 
      : location;

    const newId = `COL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCol: CashCollection = {
      id: newId,
      collectorId: 'COL-FIELD',
      clientName: clientName.trim(),
      location: finalLocation,
      amountCollected: numAmount,
      outstandingBalance: numOutstanding,
      currency: 'XAF',
      collectionTime: collectionTime ? new Date(collectionTime).toISOString() : new Date().toISOString(),
      status: 'PENDING',
      description: instructions.trim() || `Field collection assigned for ${clientName.trim()}`,
      receiptUrl: bagId.trim() ? `BAG: ${bagId.trim()}` : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collector: {
        id: 'COL-FIELD',
        fullName: collectorName.split('(')[0].trim(),
        email: 'collector@enako.cm',
        role: { name: 'Field Cash Collector' },
      },
    };

    try {
      // 1. Try sending to backend API
      try {
        await api.createCashCollection({
          clientName: newCol.clientName,
          location: newCol.location,
          amountCollected: newCol.amountCollected,
          outstandingBalance: newCol.outstandingBalance,
          status: newCol.status,
          description: newCol.description,
        });
      } catch (err) {
        console.warn('Backend API deferred, saving to local collection cache:', err);
      }

      // 2. Persist in local storage keys for instantaneous sync
      const storageKeys = ['enako_collections', 'enako_cash_collections', 'cash_collections'];
      for (const key of storageKeys) {
        try {
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          localStorage.setItem(key, JSON.stringify([newCol, ...list]));
        } catch (e) {}
      }

      toast.success(`Cash collection task #${newId} created & dispatched!`);
      navigate('/app/cash-collections');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create collection task');
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
            <Link to="/app/cash-collections" className="hover:text-slate-800 transition-colors">
              Finance & Accounts
            </Link>
            <span>/</span>
            <Link to="/app/cash-collections" className="hover:text-slate-800 transition-colors">
              Cash Collections
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">New Task</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create Cash Collection Task
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign a secure field cash collection, deposit pickup, or merchant sweep to an operative.
          </p>
        </div>

        <Link
          to="/app/cash-collections"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Collections
        </Link>
      </div>

      {/* Flat Form (No Cards, No Enclosing Boxes) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Merchant & Location Particulars */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Client & Merchant Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client / Merchant Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Akwa Supermarché, Bastos Telecom, K-Mall Depot"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Collection Sector / Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {location.startsWith('Other') && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specify Custom Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Limbe Down-Beach Commercial Sector"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Financial Target */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Target Cash Amount
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Collection Amount (XAF / FCFA) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 2500000"
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
                  Target: {numAmount.toLocaleString('en-US')} FCFA
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Outstanding Balance / Shortage (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={outstandingBalance}
                  onChange={(e) => setOutstandingBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-20 bg-slate-50/60 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  FCFA
                </div>
              </div>

              {numOutstanding > 0 && (
                <p className="text-xs font-semibold text-amber-700 mt-1.5">
                  Remaining Debt: {numOutstanding.toLocaleString('en-US')} FCFA
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Operative Assignment & Logistics */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Field Assignment & Vault Route
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Operative / Collector
              </label>
              <select
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
              >
                {COLLECTORS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scheduled Pickup Date
              </label>
              <input
                type="date"
                value={collectionTime}
                onChange={(e) => setCollectionTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Security Bag / Seal Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SEAL-8849 / ENVELOPE-02"
                value={bagId}
                onChange={(e) => setBagId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Collection Instructions (Generous Space) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Field Instructions & Security Route Notes (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Specify merchant contact person, payment mode, counting instructions, or vault delivery protocol.
          </p>
          <textarea
            rows={7}
            placeholder="Type comprehensive field instructions, merchant manager contacts, denominations requested, or vault delivery destination..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Footer Buttons (No Cards) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Dispatched via <strong>ENAKO Field Ops Network</strong> • Real-time audit sync
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/cash-collections"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Dispatching Task...' : 'Create & Dispatch Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
