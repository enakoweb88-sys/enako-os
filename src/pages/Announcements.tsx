import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Pin, 
  ThumbsUp, 
  Rocket, 
  MessageCircle, 
  Share2,
  Heart,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Info,
  X,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Announcements() {
  const [userName, setUserName] = useState<string>(localStorage.getItem('enako_user_name') || 'User');
  const [role, setRole] = useState<string>(localStorage.getItem('enako_user_role') || 'ceo');
  const [posts, setPosts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tag: 'Logistics' });

  useEffect(() => {
    setRole(localStorage.getItem('enako_user_role') || 'ceo');
    setUserName(localStorage.getItem('enako_user_name') || 'Executive');
    const stored = localStorage.getItem('enako_announcements');
    if (stored) {
      setPosts(JSON.parse(stored));
    }
  }, []);

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    const post = {
      ...newPost,
      id: Date.now(),
      author: userName,
      authorRole: role,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      likes: 0,
      initials: userName.split(' ').map(n => n[0]).join('')
    };
    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem('enako_announcements', JSON.stringify(updated));
    setShowAddModal(false);
    setNewPost({ title: '', content: '', tag: 'Logistics' });
  };

  const trendingTags = ['Logistics', 'Compliance', 'Security', 'OS Update', 'Executive Order'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Left Sidebar: Profile Summary */}
      <aside className="hidden lg:block lg:col-span-3 space-y-8">
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="h-20 bg-primary relative overflow-hidden">
          </div>
          <div className="px-6 pb-6 -mt-10 relative flex flex-col items-center">
            <div className="size-20 rounded-2xl border-4 border-white bg-surface-container flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-primary-container">{userName.charAt(0)}</span>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-primary">{userName}</h2>
            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-1">{role} - ENAKO OS</p>
          </div>
          <div className="border-t border-outline-variant px-6 py-4 space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-secondary">Post Impressions</span>
              <span className="text-primary font-mono">0</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-secondary">Network Reach</span>
              <span className="text-primary font-mono">0</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Trending Tags</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(tag => (
              <span key={tag} className="bg-surface-container px-3 py-1.5 rounded-lg text-[10px] font-bold text-primary border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {role !== 'employee' && (
           <button 
             onClick={() => setShowAddModal(true)}
             className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all"
           >
              <Plus className="w-4 h-4" />
              Post Update
           </button>
        )}
      </aside>

      {/* Main Feed */}
      <section className="col-span-1 lg:col-span-6 space-y-8">
        {posts.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center space-y-4">
             <Megaphone className="w-12 h-12 text-outline-variant mx-auto opacity-20" />
             <h3 className="text-xl font-bold text-primary">No Announcements Found</h3>
             <p className="text-secondary text-sm max-w-xs mx-auto">There are no active global announcements at this time. Check back later for updates.</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                 <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-lg">
                      {post.initials}
                    </div>
                    <div>
                       <h4 className="font-bold text-primary text-base leading-tight">{post.author}</h4>
                       <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{post.authorRole} • {post.date}</p>
                    </div>
                 </div>
                 <div className="bg-surface-container px-3 py-1 rounded text-[9px] font-bold text-primary uppercase tracking-widest border border-outline-variant/30">
                    {post.tag}
                 </div>
               </div>
               <h3 className="text-xl font-display font-bold text-primary mb-4 leading-snug">{post.title}</h3>
               <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{post.content}</p>
               <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                       <ThumbsUp className="w-5 h-5" />
                       <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                       <MessageCircle className="w-5 h-5" />
                       <span className="text-xs font-bold">Reply</span>
                    </button>
                  </div>
                  <button className="text-secondary hover:text-primary transition-colors">
                     <Share2 className="w-5 h-5" />
                  </button>
               </div>
            </article>
          ))
        )}
      </section>

      {/* Right Sidebar: Company Info */}
      <aside className="hidden lg:block lg:col-span-3 space-y-8">
        <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Company Updates</h3>
            <Info className="w-4 h-4 text-secondary" />
          </div>
          <ul className="space-y-8">
            {[
              { title: 'Global Node Alpha Active', desc: 'Connectivity established across 12 strategic nodes.' },
              { title: 'Protocol 4.0 Rolling Out', desc: 'Mandatory security updates for all executive terminals.' }
            ].map((update, i) => (
              <li key={i} className="group cursor-pointer">
                <span className="block text-sm font-black text-primary group-hover:text-primary-container transition-colors leading-tight mb-2 uppercase tracking-wider">{update.title}</span>
                <p className="text-xs text-secondary font-medium leading-relaxed">{update.desc}</p>
              </li>
            ))}
          </ul>
          <button className="w-full mt-10 py-3 border border-outline-variant rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-secondary hover:bg-surface-container transition-all">View Full Archive</button>
        </div>

        <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Compliance Pulse</h3>
            <ShieldCheck className="w-4 h-4 text-green-600" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">SOC2 STATUS</span>
              <span className="text-[10px] font-black text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase">CERTIFIED</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-green-600 w-full"></div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-secondary font-mono">
              <span className="uppercase tracking-widest">REAL-TIME UPTIME</span>
              <span className="text-primary">99.99%</span>
            </div>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Post Global Announcement</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleAddPost} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Title</label>
                  <input required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="e.g. Q4 Logistics Blueprint" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Tag</label>
                  <select value={newPost.tag} onChange={e => setNewPost({...newPost, tag: e.target.value})} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                     {trendingTags.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Content</label>
                  <textarea required value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} rows={5} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none" placeholder="Elaborate on the update..." />
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4">Broadcast Update</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
