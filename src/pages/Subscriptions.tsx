import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CreditCard, Calendar, Server, Search, DollarSign, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { apiRequest } from '../lib/api/core';

type Subscription = {
  id: string;
  name: string;
  cost: string | number;
  cycle: 'Monthly' | 'Yearly';
  status: 'Active' | 'Paused' | 'Cancelled';
  startDate: string;
  nextBilling: string;
  receiptUrl?: string;
};

export default function Subscriptions() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'employee';
  
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCycle, setNewCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReceiptUrl, setNewReceiptUrl] = useState('');
  const [newReceiptFile, setNewReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.subscriptions();
      setSubs(res);
    } catch (e: any) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredSubs = subs.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const monthlyTotal = subs.reduce((acc, curr) => {
    if (curr.status !== 'Active') return acc;
    const costNum = typeof curr.cost === 'string' ? parseFloat(curr.cost) : curr.cost;
    return acc + (curr.cycle === 'Monthly' ? costNum : costNum / 12);
  }, 0);

  const activeCount = subs.filter(s => s.status === 'Active').length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCost || !newStartDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    try {
      let finalReceiptUrl = newReceiptUrl;

      if (newReceiptFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', newReceiptFile);
        const uploadRes = await apiRequest<{url: string}>('/files/upload', { method: 'POST', body: formData });
        finalReceiptUrl = uploadRes.url;
        setUploading(false);
      }

      const start = new Date(newStartDate);
      const nextBilling = new Date(start.getTime());
      if (newCycle === 'Monthly') {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      } else {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }

      await api.createSubscription({
        name: newName,
        cost: parseFloat(newCost),
        cycle: newCycle,
        startDate: newStartDate,
        nextBilling: nextBilling.toISOString(),
        receiptUrl: finalReceiptUrl || undefined
      });
      
      setShowAddForm(false);
      setNewName('');
      setNewCost('');
      setNewCycle('Monthly');
      setNewStartDate(new Date().toISOString().split('T')[0]);
      setNewReceiptUrl('');
      setNewReceiptFile(null);
      toast.success('Subscription added successfully');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add subscription');
      setUploading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string, name: string) => {
    try {
      await api.updateSubscription(id, { status: 'Cancelled' });
      toast.info(`${name} subscription cancelled.`);
      load();
    } catch (e: any) {
      toast.error('Failed to cancel subscription');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary tracking-tight">Enterprise Subscriptions</h1>
          <p className="text-secondary mt-1">Manage company software licenses and recurring infrastructure billing.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Monthly Run Rate</p>
            <p className="text-2xl font-bold text-primary mt-1">${monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Services</p>
            <p className="text-2xl font-bold text-primary mt-1">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Upcoming Renewals</p>
            <p className="text-2xl font-bold text-primary mt-1">{subs.filter(s => s.status === 'Active' && new Date(s.nextBilling).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000).length}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-outline-variant/30 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary-container" />
            Billing Overview
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-sm text-secondary animate-pulse">Loading subscriptions...</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest">
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Service Name</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Cost</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Cycle</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Receipt</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Start Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20">Next Billing</th>
                <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredSubs.map((sub) => (
                  <motion.tr 
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      <span className="font-bold text-primary text-sm">{sub.name}</span>
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      <span className="font-medium text-secondary">${parseFloat(sub.cost as string).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      <span className="text-xs text-secondary">{sub.cycle}</span>
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                        sub.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      {sub.receiptUrl ? (
                        <a href={sub.receiptUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                          <LinkIcon className="w-3 h-3" /> View
                        </a>
                      ) : (
                        <span className="text-xs text-outline">-</span>
                      )}
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      <span className="text-sm text-secondary">{new Date(sub.startDate || sub.nextBilling).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10">
                      <span className="text-sm text-secondary">{new Date(sub.nextBilling).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-5 border-b border-outline-variant/10 text-right">
                      {(role === 'ceo' || role === 'manager') && sub.status === 'Active' && (
                        <button 
                          onClick={() => handleCancel(sub.id, sub.name)}
                          className="text-[10px] font-bold text-error uppercase hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-secondary">
                    No subscriptions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-lg relative border border-outline-variant/30"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-8 right-8 text-secondary hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold text-primary mb-2">Add Subscription</h3>
              <p className="text-secondary text-sm mb-8">Register a new software or infrastructure billing cycle to the enterprise account.</p>
              
              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Service Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="e.g. Figma Enterprise"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Cost (USD) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input 
                        type="number" 
                        required
                        value={newCost}
                        onChange={(e) => setNewCost(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary-container"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Billing Cycle</label>
                    <select 
                      value={newCycle}
                      onChange={(e) => setNewCycle(e.target.value as 'Monthly' | 'Yearly')}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary-container appearance-none"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Start Date *</label>
                    <input 
                      type="date" 
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Receipt (URL or File)</label>
                    <div className="space-y-2">
                      <input 
                        type="url" 
                        value={newReceiptUrl}
                        onChange={(e) => { setNewReceiptUrl(e.target.value); setNewReceiptFile(null); }}
                        disabled={!!newReceiptFile}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-2 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-50"
                        placeholder="https://... (or upload below)"
                      />
                      <input 
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setNewReceiptFile(e.target.files[0]);
                            setNewReceiptUrl('');
                          }
                        }}
                        className="w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3.5 bg-surface-container-high text-secondary rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-6 py-3.5 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : submitting ? 'Saving...' : 'Save Subscription'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
