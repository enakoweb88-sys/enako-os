import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function MarketingCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: 'Remittance MoMo Diaspora Expansion',
    channel: 'Meta Ads',
    targetProduct: 'Remittance & MoMo Transfers',
    spend: 250000,
    conversions: 48,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCampaigns();
      setCampaigns(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCampaign(form);
      toast.success('Ad Campaign created successfully!');
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSpend = campaigns.reduce((acc, c) => acc + Number(c.spend || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + Number(c.conversions || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paid Marketing & Ad Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Track Meta Ads, TikTok Ads, Google & LinkedIn paid customer acquisition</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Create Ad Campaign
          </button>
          <button 
            onClick={load} 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards: 1 Featured Main Card + Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid Growth Overview</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Total Ad Campaign Spend</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{totalSpend.toLocaleString()} FCFA</p>
              <p className="text-slate-600 text-xs mt-2">
                Capital deployed across paid digital acquisition channels targeting diaspora remittance and merchant accounts.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Converted Customers: <strong className="text-emerald-700">{totalConversions.toLocaleString()} leads</strong></span>
            <span>Average CPA: <strong className="text-slate-800">{totalConversions > 0 ? `${Math.round(totalSpend / totalConversions).toLocaleString()} FCFA` : '—'}</strong></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Acquisition Efficiency</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Total Conversions</span>
                <span className="font-mono text-emerald-700 font-bold">{totalConversions}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Active Campaigns</span>
                <span className="font-mono text-slate-800">{campaigns.length}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Performance metrics synchronized
          </p>
        </div>
      </div>

      {/* Campaign Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Database Ad Campaign Records</h3>
            <p className="text-xs text-slate-500">Showing {campaigns.length} active campaigns</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Date</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Ad Spend (FCFA)</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Converted Leads</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Calculated CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-xs text-slate-500">No campaigns recorded yet. Click 'Create Ad Campaign' to start tracking.</td>
                </tr>
              ) : (
                campaigns.map((c, i) => {
                  const cpa = c.conversions > 0 ? Math.round(c.spend / c.conversions) : 0;
                  return (
                    <tr key={c.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-700">
                        {new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">
                        {Number(c.spend).toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-emerald-700">
                        {c.conversions} leads
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-right text-slate-900">
                        {cpa > 0 ? `${cpa.toLocaleString()} FCFA` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">Create Paid Ad Campaign</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Campaign Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Ad Spend (FCFA) *</label>
                    <input required type="number" value={form.spend} onChange={e => setForm({ ...form, spend: Number(e.target.value) })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Target Conversions *</label>
                    <input required type="number" value={form.conversions} onChange={e => setForm({ ...form, conversions: Number(e.target.value) })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 transition-colors disabled:opacity-60 shadow-sm">
                  {submitting ? 'Creating Campaign...' : 'Launch Campaign Record'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
