import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw, Calendar as CalendarIcon, Image, PlaySquare, X, Plus,
  FileText, CheckCircle2, Send, Share2, Layers, Filter, Eye, MessageSquare
} from 'lucide-react';
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

  return (
    <div className="space-y-8 font-sans pb-20">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Digital Content & Campaign Posts</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Manage multi-channel social media posts, reels, articles, and scheduling</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(true)} 
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Content Post
          </button>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Scheduled & Active', count: posts.filter(p => p.status === 'In Progress' || p.status === 'To Do').length, color: 'border-blue-200 bg-blue-50/50' },
          { label: 'Pending Approval', count: posts.filter(p => p.status === 'Pending').length, color: 'border-amber-200 bg-amber-50/50' },
          { label: 'Approved & Ready', count: posts.filter(p => p.status === 'Approved').length, color: 'border-purple-200 bg-purple-50/50' },
          { label: 'Live Published', count: posts.filter(p => p.status === 'Published').length, color: 'border-green-200 bg-green-50/50' },
        ].map(stat => (
          <div key={stat.label} className={cn("border rounded-2xl p-5 shadow-sm space-y-1 bg-white", stat.color)}>
            <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-mono font-bold text-primary">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Weekly Schedule Overview */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" /> Weekly Posting Matrix
        </h3>
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading calendar data...</div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {calendarData.dailyCounts?.map((day: any) => (
              <div key={day.day} className="border border-outline-variant/30 rounded-xl p-3 flex flex-col h-28 bg-surface-container-low/30 hover:border-primary transition-all">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{day.day}</span>
                <div className="space-y-1 mt-auto">
                  <div className="flex items-center justify-between text-[10px] font-bold text-secondary bg-white border border-outline-variant/20 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1"><Image className="w-3 h-3 text-blue-600" /> Posts</span>
                    <span className="font-mono text-primary">{day.posts}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-secondary bg-white border border-outline-variant/20 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1"><PlaySquare className="w-3 h-3 text-purple-600" /> Reels</span>
                    <span className="font-mono text-primary">{day.reels}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Content Posts Table */}
      <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-6">
          <div>
            <h3 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Content Pipeline & Database Posts
            </h3>
            <p className="text-xs text-secondary font-medium">Real-time status updates and multi-channel publication records.</p>
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'X'].map(plat => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                  platformFilter === plat ? "bg-primary text-white border-primary" : "bg-surface-container-low text-secondary border-outline-variant/30 hover:border-primary/50"
                )}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Content Title</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Platform</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Format</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Reach / Views</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredPosts.length > 0 ? filteredPosts.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-primary max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-4 text-xs font-bold text-primary">
                    <span className="px-2.5 py-1 bg-surface-container-high rounded-md text-[10px] uppercase">{p.platform}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-secondary font-medium">{p.type}</td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                      p.status === 'Published' ? "bg-green-50 text-green-700 border-green-200" :
                      p.status === 'Approved' ? "bg-purple-50 text-purple-700 border-purple-200" :
                      p.status === 'Pending' ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-mono font-bold text-primary">
                    {Number(p.reach || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <select
                      value={p.status}
                      onChange={e => handleStatusChange(p.id, e.target.value)}
                      className="text-[10px] font-bold bg-white border border-outline-variant/30 rounded-lg p-1.5 outline-none cursor-pointer hover:border-primary"
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
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary text-sm">No posts found for this platform. Click 'Create Content Post' above to create one.</td>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="text-xl font-bold text-primary font-display">Create & Schedule Content Post</h3>
                  <p className="text-xs text-secondary uppercase tracking-widest font-bold mt-0.5">Post directly to ENAKO social channels</p>
                </div>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Post Headline / Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Instant Orange & MTN Money Transfer Promo" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Platform *</label>
                    <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Instagram</option>
                      <option>TikTok</option>
                      <option>LinkedIn</option>
                      <option>Facebook</option>
                      <option>X</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Post Format *</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="Post">Image / Graphic Post</option>
                      <option value="Reel">Short Video / Reel / TikTok</option>
                      <option value="Article">Long-form Financial Article</option>
                      <option value="Story">Ephemeral Story</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Product Promo Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Remittance & MoMo Transfers</option>
                    <option>B2B Merchant Lead Gen</option>
                    <option>High-Yield Savings</option>
                    <option>Land Banking & Real Estate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Post Caption & Copy *</label>
                  <textarea required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={4} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Write caption copy, call to action, and hashtags..." />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Scheduled Date & Time *</label>
                  <input required type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
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
