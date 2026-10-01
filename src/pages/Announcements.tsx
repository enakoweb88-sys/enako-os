import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Announcements() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tag: 'Logistics' });

  // Active expanded comments drawer ID
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [commentingMap, setCommentingMap] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.announcements();
      setPosts(res);
    } catch (e: any) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createAnnouncement(form);
      setShowModal(false);
      setForm({ title: '', content: '', tag: 'Logistics' });
      load();
    } catch (e: any) { 
      alert(e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleToggleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likesCount: liked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1)
        };
      }
      return p;
    }));

    try {
      await api.toggleAnnouncementLike(postId);
    } catch (err: any) {
      console.error('Failed to toggle like', err);
      load(); // Fallback reload on error
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentInputMap[postId] || '').trim();
    if (!text) return;

    setCommentingMap(prev => ({ ...prev, [postId]: true }));
    try {
      const newComment = await api.addAnnouncementComment(postId, text);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment],
            commentsCount: (p.commentsCount || 0) + 1
          };
        }
        return p;
      }));
      setCommentInputMap(prev => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      alert(err.message || 'Failed to add comment');
    } finally {
      setCommentingMap(prev => ({ ...prev, [postId]: false }));
    }
  };

  const tags = ['Logistics', 'Compliance', 'Security', 'OS Update', 'Executive Order', 'HR', 'Finance'];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">Official staff updates, executive orders, and interactive announcements</p>
        </div>
        <div className="flex items-center gap-2">
          {role !== 'employee' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Post Announcement
            </button>
          )}
          <button 
            onClick={load} 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Metrics Row: 1 Featured Main Card + Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md md:col-span-2 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Broadcasting Overview</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500 text-xs font-medium">Active Internal Announcements</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{posts.length} Broadcasts</p>
              <p className="text-slate-600 text-xs pt-1">
                Real-time communications distributed across company departments and staff tiers.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Logged in as: <strong className="text-slate-700">{user?.fullName || 'Staff Member'}</strong></span>
            <span className="font-semibold text-slate-700 uppercase tracking-wider">{user?.role || 'Staff'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Topic Categories</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="bg-slate-50 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Filtered by official organizational taxonomy
          </p>
        </div>
      </div>

      {/* Main Feed */}
      <section className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
            <p className="text-slate-500 text-sm animate-pulse">Loading announcements…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">No Announcements</h3>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">There are no active announcements at this time.</p>
          </div>
        ) : posts.map(post => {
          const isCommentsOpen = activeCommentPostId === post.id;
          const commentsList = post.comments || [];

          return (
            <article key={post.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm transition-all">
              {/* Announcement Author & Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-sm">
                    {(post.author?.fullName ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{post.author?.fullName ?? 'Executive Operations'}</h4>
                    <p className="text-[11px] font-medium text-slate-500">
                      {post.author?.role?.name ?? 'STAFF'} · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {post.tag && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                    {post.tag}
                  </span>
                )}
              </div>

              {/* Title & Body Content */}
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{post.title}</h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>

              {/* Action Buttons: Like & Comments */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={cn(
                      "text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors",
                      post.likedByMe 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span>{post.likedByMe ? 'Liked' : 'Like'}</span>
                    {post.likesCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200/60 text-slate-800">
                        {post.likesCount}
                      </span>
                    )}
                  </button>

                  {/* Comment / Reply Button */}
                  <button 
                    onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                    className={cn(
                      "text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors",
                      isCommentsOpen 
                        ? "bg-slate-100 text-slate-900 border-slate-300" 
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span>{commentsList.length > 0 ? `Comments (${commentsList.length})` : 'Comment'}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section Drawer */}
              {isCommentsOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800">
                    Staff Discussion ({commentsList.length})
                  </h4>

                  {/* Comments List */}
                  <div className="space-y-2.5">
                    {commentsList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No comments yet. Be the first to share feedback.</p>
                    ) : (
                      commentsList.map((c: any) => (
                        <div key={c.id} className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {(c.user?.fullName || '?').charAt(0)}
                          </div>
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{c.user?.fullName || 'Staff Member'}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-700 mt-1 leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text"
                      placeholder="Write a comment or response..."
                      value={commentInputMap[post.id] || ''}
                      onChange={(e) => setCommentInputMap({ ...commentInputMap, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-slate-500 outline-none"
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      disabled={commentingMap[post.id] || !(commentInputMap[post.id] || '').trim()}
                      className="bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg text-xs hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Post Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">Post Global Announcement</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 font-medium text-slate-900" placeholder="e.g. Q4 Logistics Blueprint" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Tag</label>
                  <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 font-medium text-slate-900">
                    {tags.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Content *</label>
                  <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500 resize-none font-medium text-slate-900" placeholder="Elaborate on the update…" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 disabled:opacity-60 transition-colors shadow-sm">
                  {submitting ? 'Broadcasting…' : 'Broadcast Update'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
