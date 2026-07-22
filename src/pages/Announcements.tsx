import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ThumbsUp, MessageCircle, X, Plus, RefreshCw, Send, CornerDownRight } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Left Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 space-y-8">
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="h-20 bg-primary relative overflow-hidden" />
          <div className="px-6 pb-6 -mt-10 relative flex flex-col items-center">
            <div className="size-20 rounded-2xl border-4 border-white bg-surface-container flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-primary-container">
                {user?.fullName?.charAt(0) ?? '?'}
              </span>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-primary">{user?.fullName}</h2>
            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-1">{user?.role} — ENAKO OS</p>
          </div>
          <div className="border-t border-outline-variant px-6 py-4 space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-secondary">Total Announcements</span>
              <span className="text-primary font-mono">{posts.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-surface-container px-3 py-1.5 rounded-lg text-[10px] font-bold text-primary border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {role !== 'employee' && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Post Update
          </button>
        )}
      </aside>

      {/* Main Feed */}
      <section className="col-span-1 lg:col-span-9 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Company Announcements</h1>
            <p className="text-secondary text-xs mt-1">Official staff updates, executive orders, and interactive announcements</p>
          </div>
          <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {/* Mobile post button */}
        {role !== 'employee' && (
          <button onClick={() => setShowModal(true)} className="lg:hidden w-full py-3 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Post Update
          </button>
        )}

        {loading ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center">
            <p className="text-secondary text-sm animate-pulse">Loading announcements…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center space-y-4">
            <Megaphone className="w-12 h-12 text-outline-variant mx-auto opacity-20" />
            <h3 className="text-xl font-bold text-primary">No Announcements</h3>
            <p className="text-secondary text-sm max-w-xs mx-auto">There are no active announcements at this time.</p>
          </div>
        ) : posts.map(post => {
          const isCommentsOpen = activeCommentPostId === post.id;
          const commentsList = post.comments || [];

          return (
            <article key={post.id} className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm transition-all">
              {/* Announcement Author & Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-lg">
                    {(post.author?.fullName ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-base leading-tight">{post.author?.fullName ?? 'Executive Operations'}</h4>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">
                      {post.author?.role?.name ?? 'STAFF'} · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {post.tag && (
                  <div className="bg-surface-container px-3 py-1 rounded-lg text-[9px] font-bold text-primary uppercase tracking-widest border border-outline-variant/30">
                    {post.tag}
                  </div>
                )}
              </div>

              {/* Title & Body Content */}
              <h3 className="text-xl font-display font-bold text-primary mb-3 leading-snug">{post.title}</h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-6 whitespace-pre-line">{post.content}</p>

              {/* Action Buttons: Like & Comments */}
              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                <div className="flex items-center gap-6">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-2 text-xs font-bold transition-colors py-1.5 px-3 rounded-lg border",
                      post.likedByMe 
                        ? "bg-primary text-white border-primary" 
                        : "text-secondary border-outline-variant/40 hover:bg-surface-container hover:text-primary"
                    )}
                  >
                    <ThumbsUp className={cn("w-4 h-4", post.likedByMe && "fill-white")} />
                    <span>{post.likedByMe ? 'Liked' : 'Like'}</span>
                    {post.likesCount > 0 && (
                      <span className={cn("ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono", post.likedByMe ? "bg-white/20 text-white" : "bg-surface-container text-primary")}>
                        {post.likesCount}
                      </span>
                    )}
                  </button>

                  {/* Comment / Reply Button */}
                  <button 
                    onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                    className={cn(
                      "flex items-center gap-2 text-xs font-bold transition-colors py-1.5 px-3 rounded-lg border",
                      isCommentsOpen 
                        ? "bg-surface-container text-primary border-outline-variant" 
                        : "text-secondary border-outline-variant/40 hover:bg-surface-container hover:text-primary"
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{commentsList.length > 0 ? `Comments (${commentsList.length})` : 'Comment'}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section Drawer */}
              {isCommentsOpen && (
                <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-4 bg-surface-container-low/50 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    Employee Comments & Discussion ({commentsList.length})
                  </h4>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {commentsList.length === 0 ? (
                      <p className="text-xs text-secondary italic">No comments yet. Be the first to share feedback!</p>
                    ) : (
                      commentsList.map((c: any) => (
                        <div key={c.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-outline-variant/30">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {(c.user?.fullName || '?').charAt(0)}
                          </div>
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">{c.user?.fullName || 'Staff Member'}</span>
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
                      className="flex-1 bg-white border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      disabled={commentingMap[post.id] || !(commentInputMap[post.id] || '').trim()}
                      className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Post Global Announcement</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 font-medium text-primary" placeholder="e.g. Q4 Logistics Blueprint" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Tag</label>
                  <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 font-medium text-primary">
                    {tags.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Content *</label>
                  <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none font-medium text-primary" placeholder="Elaborate on the update…" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 disabled:opacity-60">
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
