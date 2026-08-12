import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Plus, RefreshCw, X, DollarSign, Target, TrendingUp, Users } from 'lucide-react';
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
    <div className="space-y-8 font-sans pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Paid Marketing & Ad Campaigns</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Track Meta Ads, TikTok Ads, Google & LinkedIn paid customer acquisition</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Ad Campaign
          </button>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Ad Campaign Spend</p>
          <p className="text-3xl font-mono font-bold text-primary">{totalSpend.toLocaleString()} FCFA</p>
        </div>
        <div className="p-6 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Converted Customers</p>
          <p className="text-3xl font-mono font-bold text-green-600">{totalConversions.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Average CPA (Cost Per Lead)</p>
          <p className="text-3xl font-mono font-bold text-blue-600">
            {totalConversions > 0 ? `${Math.round(totalSpend / totalConversions).toLocaleString()} FCFA` : '—'}
          </p>
        </div>
      </div>

      {/* Campaign Records Table */}
      <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm overflow-hidden space-y-6">
        <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" /> Database Ad Campaign Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Ad Spend (FCFA)</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Converted Leads</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Calculated CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {campaigns.map((c, i) => {
                const cpa = c.conversions > 0 ? Math.round(c.spend / c.conversions) : 0;
                return (
                  <tr key={c.id || i} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono font-bold text-primary">
                      {new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-sm font-mono font-bold text-primary">
                      {Number(c.spend).toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-4 text-sm font-mono font-bold text-green-600">
                      {c.conversions} leads
                    </td>
                    <td className="px-4 py-4 text-sm font-mono font-bold text-right text-blue-600">
                      {cpa > 0 ? `${cpa.toLocaleString()} FCFA` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-xl font-bold text-primary font-display">Create Paid Ad Campaign</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>

              <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Campaign Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Ad Spend (FCFA) *</label>
                    <input required type="number" value={form.spend} onChange={e => setForm({ ...form, spend: Number(e.target.value) })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Target Conversions *</label>
                    <input required type="number" value={form.conversions} onChange={e => setForm({ ...form, conversions: Number(e.target.value) })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
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
