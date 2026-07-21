import React, { useState } from 'react';
import { LifeBuoy, Book, MessageCircle, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export default function Help() {
  const [activeTab, setActiveTab] = useState<'options' | 'knowledge' | 'ticket'>('options');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const options = [
    { id: 'knowledge', icon: Book, title: 'Knowledge Base', desc: 'Browse our comprehensive guides and system architecture.' },
    { id: 'chat', icon: MessageCircle, title: 'Live Chat Support', desc: 'Speak with our customer success team in real-time.' },
    { id: 'ticket', icon: FileText, title: 'Submit a Ticket', desc: 'Create a support ticket for technical issues.' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createSupportTicket(form);
      alert('Email successfully sent to noungajoseph58@gmail.com');
      setForm({ name: '', email: '', subject: '', message: '' });
      setActiveTab('options');
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-primary">Help & Support Center</h1>
            <p className="text-secondary mt-1">How can we assist you today?</p>
          </div>
        </div>
        {activeTab !== 'options' && (
          <button onClick={() => setActiveTab('options')} className="text-sm font-bold text-primary flex items-center gap-2 hover:bg-surface-container px-3 py-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" /> Close
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'options' && (
          <motion.div key="options" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt, i) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => opt.id !== 'chat' && setActiveTab(opt.id as any)}
                className="bg-white border border-outline-variant/30 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <opt.icon className="w-8 h-8 text-secondary group-hover:text-primary transition-colors mx-auto mb-4" />
                <h3 className="font-bold text-primary mb-2">{opt.title}</h3>
                <p className="text-xs text-secondary mb-6">{opt.desc}</p>
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors">
                  {opt.id === 'chat' ? 'Coming Soon' : 'Access \u2192'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'ticket' && (
          <motion.div key="ticket" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-xl font-bold font-display text-primary mb-6">Submit a Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Your Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border border-outline-variant/50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Your Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2 border border-outline-variant/50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-2 border border-outline-variant/50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-2 border border-outline-variant/50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <p className="text-xs text-secondary mb-4 italic">This will send an email directly to our support inbox at noungajoseph58@gmail.com.</p>
              <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'knowledge' && (
          <motion.div key="knowledge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm prose prose-sm max-w-none prose-headings:text-primary prose-a:text-primary">
              <h2 className="text-xl font-bold font-display text-primary mb-4">ENAKO OS System Architecture</h2>
              <p className="text-secondary mb-6">Below is a diagram of the overarching architecture and module boundaries of the system. This will help you understand data flow when troubleshooting.</p>
              
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 mb-8 overflow-auto">
                <pre className="text-xs text-secondary font-mono">
{`flowchart TD
    A[Client UI - React/Vite] -->|REST / JSON| B(Backend API - NestJS)
    B --> C{Authentication}
    C -->|JWT Valid| D[Modules]
    D --> E(Users & Auth)
    D --> F(Finance & Transactions)
    D --> G(Operations & Tasks)
    D --> H(Outreach & Events)
    
    D --> I[(PostgreSQL DB)]
    
    E -.-> I
    F -.-> I
    G -.-> I
    H -.-> I
`}
                </pre>
              </div>

              <h3 className="text-lg font-bold text-primary mb-2">Common Troubleshooting</h3>
              <ul className="list-disc pl-5 space-y-2 text-secondary">
                <li><strong className="text-primary">Transactions not appearing:</strong> Ensure the date filters are correctly configured in the Finance dashboard. Wait 5 minutes for caching layers to expire.</li>
                <li><strong className="text-primary">Cannot assign tasks:</strong> You must have Manager or CEO role to assign tasks to other users. Employees can only manage their own tasks.</li>
                <li><strong className="text-primary">Outreach Donations:</strong> Donations are synced from external payment gateways automatically. If a webhook is missed, the 'Sync' button will trigger a manual fetch.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
