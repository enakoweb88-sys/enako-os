import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  const totalFollowers = accounts.reduce((acc, a) => acc + Number(a.followers || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Managed Social Media Channels</h1>
          <p className="text-slate-500 text-sm mt-1">Link, monitor, and analyze performance across all official channels</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Link Social Account
          </button>
          <button 
            onClick={load} 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Featured Overview Card + Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Social Footprint Overview</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Aggregated Community Following</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{totalFollowers.toLocaleString()} Followers</p>
              <p className="text-slate-600 text-xs mt-2">
                Live telemetry and audience reach across connected Facebook, Instagram, LinkedIn, TikTok, and X profiles.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Connected Profiles: <strong className="text-slate-900">{accounts.length} Channels</strong></span>
            <span>Selected Focus: <strong className="text-emerald-700">{selectedAccount?.platform || 'None'}</strong></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Network Health</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Active Channels</span>
                <span className="font-mono text-emerald-700 font-bold">{accounts.length}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Avg Engagement</span>
                <span className="font-mono text-slate-800">5.2%</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            API connections synchronized
          </p>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {accounts.map(acc => (
          <div
            key={acc.id || acc.platform}
            onClick={() => setSelectedAccount(acc)}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors space-y-2 bg-white",
              selectedAccount?.platform === acc.platform ? "border-slate-900 shadow-md ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300 shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">{acc.platform}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold uppercase border border-emerald-200">Active</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 font-mono">{acc.followers?.toLocaleString() || 0} Followers</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-slate-700">{acc.engagement || '0%'} Eng</span>
              <span className="text-emerald-700">+{acc.growth || 0}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Account Performance Detail View */}
      {selectedAccount && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedAccount.platform}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Official Verified Channel · Live Analytics Telemetry</p>
            </div>
            <a 
              href={`https://social.enako.app/${encodeURIComponent(selectedAccount.platform)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-wider"
            >
              Open Channel →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Community Followers</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{Number(selectedAccount.followers || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Engagement Rate</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{selectedAccount.engagement || '0%'}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Impression Reach</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{Number(selectedAccount.impressions || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Growth Rate</p>
              <p className="text-2xl font-mono font-bold text-emerald-700">+{selectedAccount.growth || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Link New Account Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">Link Social Media Channel</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
              </div>

              <form onSubmit={handleLinkAccount} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Platform & Channel Name *</label>
                  <input required value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="e.g. YouTube (ENAKO Official)" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Social Handle / Username *</label>
                  <input required value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="@enakofintech" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Initial Followers</label>
                    <input type="number" value={form.followers} onChange={e => setForm({ ...form, followers: Number(e.target.value) })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Engagement Rate</label>
                    <input value={form.engagement} onChange={e => setForm({ ...form, engagement: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="e.g. 6.4%" />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 transition-colors disabled:opacity-60 shadow-sm">
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
