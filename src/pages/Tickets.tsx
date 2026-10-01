import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

type Ticket = {
  id: string;
  subject: string;
  description: string;
  customer: string;
  clientEmail: string;
  status: string;
  createdAt: string;
  replies: any[];
};

export default function Tickets() {
  const [data, setData] = useState<any>({ counts: {}, items: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Normal' });
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createSupportTicket(form);
      setShowModal(false);
      setForm({ subject: '', description: '', priority: 'Normal' });
      toast.success('Ticket submitted successfully');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewTicket || !replyMessage.trim()) return;
    setReplying(true);
    try {
      const reply = await api.replySupportTicket(viewTicket.id, replyMessage);
      
      setViewTicket(prev => prev ? { 
        ...prev, 
        status: 'Resolved',
        replies: [...(prev.replies || []), reply]
      } : null);
      setReplyMessage('');
      toast.success('Reply sent successfully');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReplying(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.supportTickets();
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

  const newCount = data.counts?.new || 0;
  const inProgressCount = data.counts?.inProgress || 0;
  const resolvedCount = data.counts?.resolved || 0;
  const escalatedCount = data.counts?.escalated || 0;
  const totalCount = (data.items || []).length;

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 uppercase tracking-tight">Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Manage client issues and queries</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors">
            New Ticket
          </button>
          <button onClick={load} className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards: 1 Large Main Card + Small Sub-Cards (White Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Featured Card */}
        <div className="bg-white border-2 border-slate-300 p-6 rounded-lg shadow-md col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Total Support Tickets</p>
            <h3 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mb-2">{totalCount}</h3>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Client Inquiries Stream</span>
            <span className="font-bold text-amber-600">{newCount} New / Open</span>
          </div>
        </div>

        {/* Sub-Card 1 */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">In Progress</p>
            <h3 className="text-2xl font-bold font-display text-slate-900 mb-1">{inProgressCount}</h3>
          </div>
          <p className="text-xs text-slate-500">Under Review</p>
        </div>

        {/* Sub-Card 2 */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Resolved</p>
            <h3 className="text-2xl font-bold font-display text-emerald-600 mb-1">{resolvedCount}</h3>
          </div>
          <p className="text-xs text-slate-500">{escalatedCount} Escalated</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading tickets...</div>
        ) : data.items?.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Client</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ticket.subject}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">{ticket.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900">{ticket.clientEmail}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border inline-block",
                        ticket.status === 'Resolved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        ticket.status === 'Escalated' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => setViewTicket(ticket)} className="px-3 py-1.5 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Create Support Ticket</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-xs uppercase tracking-wider font-bold">Close</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Subject *</label>
                  <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400" placeholder="Brief summary of the issue" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400">
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Description *</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-slate-400 resize-none" placeholder="Provide as much detail as possible..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest mt-4 hover:bg-slate-800">
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {viewTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewTicket(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900">{viewTicket.subject}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ticket #{viewTicket.id} • {viewTicket.clientEmail}</p>
                </div>
                <button onClick={() => setViewTicket(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 uppercase">Close</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-block",
                      viewTicket.status === 'Resolved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      viewTicket.status === 'Escalated' ? "bg-rose-50 text-rose-700 border-rose-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {viewTicket.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Created</p>
                    <p className="text-sm font-medium text-slate-900">{new Date(viewTicket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</p>
                  <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed text-slate-800 border border-slate-200">
                    {viewTicket.description}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Activity Log</p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {viewTicket.clientEmail.substring(0, 2).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{viewTicket.customer || viewTicket.clientEmail}</p>
                        <p className="text-sm text-slate-600 mt-1">Ticket was opened via support portal.</p>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase">{new Date(viewTicket.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {viewTicket.replies?.map((r: any) => (
                      <div key={r.id} className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          r.isAdmin ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-800"
                        )}>
                          {r.isAdmin ? 'EN' : viewTicket.clientEmail.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-900 mb-1">{r.isAdmin ? 'ENAKO Support' : (viewTicket.customer || viewTicket.clientEmail)}</p>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{r.message}</p>
                          <p className="text-[9px] text-slate-400 mt-2 uppercase">{new Date(r.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <form onSubmit={handleReply} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-2">
                  <textarea 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    rows={1} 
                    className="flex-1 bg-transparent border-none text-sm resize-none outline-none p-2" 
                    placeholder="Write a reply..." 
                  />
                  <button type="submit" disabled={replying || !replyMessage.trim()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 shrink-0 disabled:opacity-50">
                    Send Reply
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
