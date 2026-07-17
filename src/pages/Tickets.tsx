import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, MessageSquare, AlertCircle, X, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

// Define type for ticket to avoid any
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
      const defaultHost = window.location.hostname.replace(/^(www\.|app\.|os\.|client\.|dashboard\.)/, '');
      const url = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api/v1' : `https://api.${defaultHost}/api/v1`);
      const token = localStorage.getItem('token');
      const res = await fetch(`${url}/tickets/${viewTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: replyMessage })
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const reply = await res.json();
      
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

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Support Tickets</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Manage client issues and queries</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors">
            New Ticket
          </button>
          <button onClick={load} className="p-2 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {['New', 'In Progress', 'Resolved', 'Escalated'].map(status => (
          <div key={status} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <p className="text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">{status}</p>
            <p className="text-3xl font-bold font-display text-primary">
              {status === 'New' ? data.counts?.new || 0 : 
               status === 'In Progress' ? data.counts?.inProgress || 0 :
               status === 'Resolved' ? data.counts?.resolved || 0 :
               data.counts?.escalated || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading tickets...</div>
        ) : data.items?.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Ticket</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Client</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {data.items?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-bold text-primary">{ticket.subject}</p>
                          <p className="text-[10px] text-secondary mt-0.5 line-clamp-1 max-w-xs">{ticket.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-primary">{ticket.clientEmail}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider",
                        ticket.status === 'Resolved' ? "bg-green-50 text-green-700" :
                        ticket.status === 'Escalated' ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      )}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => setViewTicket(ticket)} className="px-3 py-1.5 border border-outline-variant text-primary text-xs font-bold rounded hover:bg-surface-container transition-colors">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-lg font-bold text-primary">Create Support Ticket</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Subject *</label>
                  <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20" placeholder="Brief summary of the issue" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20">
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-2 uppercase tracking-widest">Description *</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary-container/20 resize-none" placeholder="Provide as much detail as possible..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {viewTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewTicket(null)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-outline-variant/30 flex flex-col">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start bg-surface-container-low">
                <div>
                  <h3 className="text-lg font-display font-bold text-primary">{viewTicket.subject}</h3>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Ticket #{viewTicket.id} • {viewTicket.clientEmail}</p>
                </div>
                <button onClick={() => setViewTicket(null)} className="p-2 hover:bg-surface-container rounded-full"><X className="w-5 h-5 text-secondary" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Status</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      viewTicket.status === 'Resolved' ? "bg-green-50 text-green-700" :
                      viewTicket.status === 'Escalated' ? "bg-red-50 text-red-700" :
                      "bg-blue-50 text-blue-700"
                    )}>
                      {viewTicket.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Created</p>
                    <p className="text-sm font-medium">{new Date(viewTicket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Description</p>
                  <div className="p-4 bg-surface-container-low rounded-xl text-sm leading-relaxed text-on-surface">
                    {viewTicket.description}
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/20">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4">Activity Log</p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {viewTicket.clientEmail.substring(0, 2).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">{viewTicket.customer || viewTicket.clientEmail}</p>
                        <p className="text-sm text-secondary mt-1">Ticket was opened via support portal.</p>
                        <p className="text-[9px] text-outline mt-1 uppercase">{new Date(viewTicket.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {viewTicket.replies?.map((r: any) => (
                      <div key={r.id} className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          r.isAdmin ? "bg-primary text-white" : "bg-primary-container text-white"
                        )}>
                          {r.isAdmin ? 'EN' : viewTicket.clientEmail.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-surface-container-low rounded-xl p-3">
                          <p className="text-xs font-bold text-primary mb-1">{r.isAdmin ? 'ENAKO Support' : (viewTicket.customer || viewTicket.clientEmail)}</p>
                          <p className="text-sm text-on-surface whitespace-pre-wrap">{r.message}</p>
                          <p className="text-[9px] text-outline mt-2 uppercase">{new Date(r.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low">
                <form onSubmit={handleReply} className="flex items-end gap-3 bg-white border border-outline-variant/30 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                  <textarea 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    rows={1} 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none placeholder-outline outline-none min-h-[40px] p-2" 
                    placeholder="Write a reply..." 
                  />
                  <button type="submit" disabled={replying || !replyMessage.trim()} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shrink-0 mb-0.5 disabled:opacity-50">
                    <Send className="w-4 h-4" />
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
