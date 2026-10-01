import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  const totalValue = leads.reduce((acc, l) => acc + Number(l.value || 0), 0);
  const activeCount = leads.filter(l => l.status === 'Active Client' || l.status === 'Converted').length;

  return (
    <div className="space-y-6 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Pipeline & Leads</h1>
          <p className="text-slate-500 text-sm mt-1">Track, acquire, and convert merchant & diaspora clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowModal(true)} 
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Add New Lead
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
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pipeline Overview</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">Featured</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Total Potential Deal Value</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{totalValue.toLocaleString()} FCFA</p>
              <p className="text-slate-600 text-xs mt-2">
                Aggregated valuation of ongoing institutional negotiations and merchant onboardings.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Leads Tracked</span>
            <span className="font-bold text-slate-900">{leads.length} Records</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Conversion Status</span>
            <p className="text-2xl font-bold text-emerald-600">{activeCount} Converted</p>
            <p className="text-slate-500 text-xs mt-1">
              {leads.length > 0 ? `${Math.round((activeCount / leads.length) * 100)}% conversion rate` : '0% conversion rate'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Pipeline updated automatically
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Registered Leads</h3>
          <span className="text-xs text-slate-500 font-medium">Showing {leads.length} leads</span>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500 animate-pulse">Loading database leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No leads found. Click 'Add New Lead' above to create your first client lead.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Client Name</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Company</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Deal Value</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{lead.email} · {lead.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{lead.company}</td>
                    <td className="px-6 py-4 text-xs font-mono text-emerald-700 font-bold">{Number(lead.value || 0).toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        lead.status === 'Active Client' || lead.status === 'Converted' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        lead.status === 'Interested' || lead.status === 'KYC Sent' ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toast.success(`Initiating call to ${lead.phone || lead.name}...`)} 
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Call
                        </button>
                        <button 
                          onClick={() => toast.success(`Drafting email to ${lead.email}...`)} 
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Email
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">Add Client / Merchant Lead</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold">✕</button>
              </div>

              <form onSubmit={handleAddLead} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Client Contact Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-slate-500" placeholder="e.g. Jean-Paul Mbida" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-slate-500" placeholder="jp@doualamerchants.cm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                    <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-slate-500" placeholder="+237 677 00 11 22" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Company / Business Name</label>
                    <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-slate-500" placeholder="Douala Traders PLC" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Potential Deal Value (FCFA)</label>
                    <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Pipeline Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-slate-500">
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="KYC Sent">KYC Sent</option>
                    <option value="Active Client">Active Client / Converted</option>
                  </select>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 transition-colors shadow-sm disabled:opacity-60">
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
