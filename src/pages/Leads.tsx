import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Phone, Mail, UserCircle, Plus, X, Building2, DollarSign, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: 1500000,
    status: 'Contacted'
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.leads();
      setLeads(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createLead(form);
      toast.success('Lead created & saved to database!');
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', company: '', value: 1500000, status: 'Contacted' });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20">
      <div className="flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Sales Pipeline & Marketing Leads</h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-bold">Track, acquire, and convert merchant & diaspora clients</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(true)} 
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Lead
          </button>
          <button onClick={load} className="p-2.5 border border-outline-variant/30 rounded-xl text-secondary hover:bg-surface-container transition-all">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-secondary animate-pulse">Loading database leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary">No leads found. Click 'Add New Lead' above to create your first client lead.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Client Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Company</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Deal Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-primary/60" />
                        <div>
                          <p className="text-sm font-bold text-primary">{lead.name}</p>
                          <p className="text-[10px] text-secondary font-mono mt-0.5">{lead.email} · {lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-primary">{lead.company}</td>
                    <td className="px-4 py-4 text-sm font-mono text-green-600 font-bold">{Number(lead.value || 0).toLocaleString()} FCFA</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        lead.status === 'Active Client' || lead.status === 'Converted' ? "bg-green-50 text-green-700 border-green-200" :
                        lead.status === 'Interested' || lead.status === 'KYC Sent' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toast.success(`Initiating call to ${lead.phone || lead.name}...`)} className="p-2 rounded-xl hover:bg-green-50 text-green-600 border border-green-200 transition-colors" title="Call">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button onClick={() => toast.success(`Drafting email to ${lead.email}...`)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 border border-blue-200 transition-colors" title="Email">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-xl font-bold text-primary font-display">Add Client / Merchant Lead</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-secondary" /></button>
              </div>

              <form onSubmit={handleAddLead} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Client Contact Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Jean-Paul Mbida" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="jp@doualamerchants.cm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Phone Number *</label>
                    <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="+237 677 00 11 22" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Company / Business Name</label>
                    <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Douala Traders PLC" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Potential Deal Value (FCFA)</label>
                    <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-secondary mb-1.5 uppercase tracking-widest">Pipeline Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="KYC Sent">KYC Sent</option>
                    <option value="Active Client">Active Client / Converted</option>
                  </select>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
                  {submitting ? 'Saving Lead...' : 'Save Lead to Database'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
