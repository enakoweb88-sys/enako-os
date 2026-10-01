import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Content() {
  const [calendarData, setCalendarData] = useState<any>({ dailyCounts: [], summary: {} });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const [form, setForm] = useState({
    title: '',
    platform: 'Instagram',
    type: 'Post',
    category: 'Remittance & MoMo',
    text: '',
    date: new Date().toISOString().slice(0, 16),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cal, postList] = await Promise.all([
        api.contentCalendar().catch(() => ({ dailyCounts: [], summary: {} })),
        api.getPosts().catch(() => [])
      ]);
      setCalendarData(cal);
      setPosts(Array.isArray(postList) ? postList : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createPost({
        title: form.title || form.text.slice(0, 50),
        platform: form.platform,
        type: form.type,
        status: 'Pending',
        author: 'Digital Marketer',
        date: form.date,
      });
      toast.success('Post created and submitted for approval!');
      setShowModal(false);
      setForm({ title: '', platform: 'Instagram', type: 'Post', category: 'Remittance & MoMo', text: '', date: new Date().toISOString().slice(0, 16) });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await api.updatePostStatus(postId, newStatus);
      toast.success(`Post status updated to ${newStatus}`);
      load();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const filteredPosts = posts.filter(p => platformFilter === 'ALL' || p.platform?.toLowerCase() === platformFilter.toLowerCase());

  const liveCount = posts.filter(p => p.status === 'Published').length;
  const pendingCount = posts.filter(p => p.status === 'Pending').length;
  const scheduledCount = posts.filter(p => p.status === 'In Progress' || p.status === 'To Do').length;

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Content & Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Multi-channel social media posts, reels, articles, and scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowModal(true)} 
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Create Content Post
          </button>
          <button 
            onClick={load} 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overview Row: 1 Featured Main Card + Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Content Production Pipeline</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Total Publications & Drafts</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{posts.length} Content Items</p>
              <p className="text-slate-600 text-xs mt-2">
                Active multi-platform content assets deployed across Instagram, TikTok, LinkedIn, and Facebook.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Published Live: <strong className="text-emerald-700">{liveCount}</strong></span>
            <span>Pending Review: <strong className="text-amber-700">{pendingCount}</strong></span>
            <span>Scheduled: <strong className="text-slate-800">{scheduledCount}</strong></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Publishing Status</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Live Published</span>
                <span className="font-mono text-emerald-700 font-bold">{liveCount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Pending Approval</span>
                <span className="font-mono text-amber-700 font-bold">{pendingCount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Scheduled / Active</span>
                <span className="font-mono text-slate-800">{scheduledCount}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Real-time multi-channel feed
          </p>
        </div>
      </div>

      {/* Weekly Schedule Overview */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Weekly Posting Matrix</h3>
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500 animate-pulse">Loading calendar data...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {calendarData.dailyCounts?.map((day: any) => (
              <div key={day.day} className="border border-slate-200 rounded-lg p-3 flex flex-col h-24 bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{day.day}</span>
                <div className="space-y-1 mt-auto">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    <span>Posts</span>
                    <span className="font-mono text-slate-900">{day.posts}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    <span>Reels</span>
                    <span className="font-mono text-slate-900">{day.reels}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Content Posts Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Content Pipeline & Database Posts</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time status updates and multi-channel publication records.</p>
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'X'].map(plat => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-colors border",
                  platformFilter === plat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                )}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Content Title</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Platform</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Format</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Reach / Views</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPosts.length > 0 ? filteredPosts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{p.title}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] uppercase font-bold">{p.platform}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.type}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      p.status === 'Published' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      p.status === 'Approved' ? "bg-purple-50 text-purple-700 border-purple-200" :
                      p.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900">
                    {Number(p.reach || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={p.status}
                      onChange={e => handleStatusChange(p.id, e.target.value)}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded-md p-1 outline-none cursor-pointer hover:border-slate-500 text-slate-800"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Published">Published</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">No posts found for this platform. Click 'Create Content Post' above to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Content Post Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create & Schedule Content Post</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Post directly to organizational social channels</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Post Headline / Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" placeholder="e.g. Instant Orange & MTN Money Transfer Promo" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Platform *</label>
                    <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900">
                      <option>Instagram</option>
                      <option>TikTok</option>
                      <option>LinkedIn</option>
                      <option>Facebook</option>
                      <option>X</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Post Format *</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900">
                      <option value="Post">Image / Graphic Post</option>
                      <option value="Reel">Short Video / Reel / TikTok</option>
                      <option value="Article">Long-form Financial Article</option>
                      <option value="Story">Ephemeral Story</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Product Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900">
                    <option>Remittance & MoMo Transfers</option>
                    <option>B2B Merchant Lead Gen</option>
                    <option>High-Yield Savings</option>
                    <option>Land Banking & Real Estate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Post Caption & Copy *</label>
                  <textarea required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={4} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 resize-none text-slate-900" placeholder="Write caption copy, call to action, and hashtags..." />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Scheduled Date & Time *</label>
                  <input required type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 text-slate-900" />
                </div>

                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 transition-colors shadow-sm disabled:opacity-60">
                  {submitting ? 'Creating Post...' : 'Save & Submit Post'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
