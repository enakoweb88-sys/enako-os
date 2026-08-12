import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2, Plus, RefreshCw, X, ArrowUpRight, TrendingUp, Users, Eye,
  CheckCircle2, Globe, ExternalLink, Activity, ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const [form, setForm] = useState({
    platform: 'Facebook (ENAKO Fintech)',
    handle: '@enakofintech',
    followers: 45000,
    engagement: '5.2%',
    impressions: 180000,
    growth: 12.5
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSocialAccounts();
      setAccounts(Array.isArray(res) ? res : []);
      if (!selectedAccount && res?.length > 0) {
        setSelectedAccount(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.linkSocialAccount(form);
      toast.success('Social Media Account linked successfully!');
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to link account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Managed Social Media Accounts</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Link, monitor, and analyze performance across all official ENAKO channels</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Link Social Account
          </button>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {accounts.map(acc => (
          <motion.div
            key={acc.id || acc.platform}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedAccount(acc)}
            className={cn(
              "p-5 rounded-2xl border cursor-pointer transition-all space-y-3 bg-white",
              selectedAccount?.platform === acc.platform ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-outline-variant/30 hover:border-primary/40 shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[9px] font-bold uppercase">Connected</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary truncate">{acc.platform}</h4>
              <p className="text-[10px] text-secondary font-mono mt-0.5">{acc.followers?.toLocaleString() || 0} Followers</p>
            </div>
            <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-primary">{acc.engagement || '0%'} Eng</span>
              <span className="text-green-600 flex items-center"><ArrowUpRight className="w-3 h-3" />+{acc.growth || 0}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Account Performance Detail View */}
      {selectedAccount && (
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary text-white rounded-2xl">
                <Share2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-primary">{selectedAccount.platform}</h3>
                <p className="text-xs text-secondary font-mono mt-1">Official ENAKO Verified Channel · Live Analytics Telemetry</p>
              </div>
            </div>
            <a 
              href={`https://social.enako.app/${encodeURIComponent(selectedAccount.platform)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="px-4 py-2 border border-outline-variant/30 rounded-xl text-xs font-bold text-primary hover:bg-surface-container transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              Open Channel <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Community Followers</p>
              <p className="text-3xl font-mono font-bold text-primary">{Number(selectedAccount.followers || 0).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Average Engagement Rate</p>
              <p className="text-3xl font-mono font-bold text-primary">{selectedAccount.engagement || '0%'}</p>
            </div>
            <div className="p-5 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Monthly Impression Reach</p>
              <p className="text-3xl font-mono font-bold text-primary">{Number(selectedAccount.impressions || 0).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Monthly Growth Rate</p>
              <p className="text-3xl font-mono font-bold text-green-600">+{selectedAccount.growth || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Link New Account Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-xl font-bold text-primary font-display">Link Official Social Media Account</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>

              <form onSubmit={handleLinkAccount} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Platform & Channel Name *</label>
                  <input required value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. YouTube (ENAKO Official)" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Social Handle / Username *</label>
                  <input required value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="@enakofintech" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Initial Followers</label>
                    <input type="number" value={form.followers} onChange={e => setForm({ ...form, followers: Number(e.target.value) })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Engagement Rate</label>
                    <input value={form.engagement} onChange={e => setForm({ ...form, engagement: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. 6.4%" />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
                  {submitting ? 'Linking Account...' : 'Link Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
