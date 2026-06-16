import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Calendar as CalendarIcon, Image, PlaySquare, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Content() {
  const [data, setData] = useState<any>({ dailyCounts: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ platform: 'LinkedIn', date: '', text: '' });

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setShowModal(false);
      setForm({ platform: 'LinkedIn', date: '', text: '' });
      toast.success('Post scheduled successfully');
      load();
    }, 1000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.contentCalendar();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Content Calendar</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Manage scheduled posts & media</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors">
            Schedule Post
          </button>
          <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {['Scheduled', 'In Progress', 'Pending', 'Overdue'].map(status => (
          <div key={status} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">{status}</p>
            <p className="text-3xl font-bold font-display text-primary">
              {status === 'Scheduled' ? data.summary?.scheduled || 0 : 
               status === 'In Progress' ? data.summary?.inProgress || 0 :
               status === 'Pending' ? data.summary?.pending || 0 :
               data.summary?.overdue || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {data.dailyCounts?.map((day: any) => (
              <div key={day.day} className="border border-outline-variant/30 rounded-xl p-4 flex flex-col h-32 hover:border-primary/50 transition-colors">
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-auto">{day.day}</span>
                <div className="space-y-2 mt-4">
                  {day.posts > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface-container-low px-2 py-1 rounded">
                      <Image className="w-3 h-3" /> {day.posts} Posts
                    </div>
                  )}
                  {day.reels > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface-container-low px-2 py-1 rounded">
                      <PlaySquare className="w-3 h-3" /> {day.reels} Reels
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Schedule New Post</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleSchedule} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Platform *</label>
                    <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                      <option>LinkedIn</option>
                      <option>Twitter</option>
                      <option>Facebook</option>
                      <option>Instagram</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Schedule Date *</label>
                    <input required type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Post Text *</label>
                  <textarea required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={5} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none" placeholder="Write your content here..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Media Assets</label>
                  <div className="border-2 border-dashed border-outline-variant/50 rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <Image className="w-8 h-8 text-secondary mb-2 opacity-50" />
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest">Upload Images / Video</p>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  {submitting ? 'Scheduling...' : 'Schedule Post'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
