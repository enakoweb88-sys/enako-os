import React, { useState } from 'react';
import { LifeBuoy, Book, MessageCircle, FileText, X, ShieldCheck, Users, Landmark, FileSpreadsheet, Target, Megaphone, Activity, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

export default function Help() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'options' | 'knowledge' | 'ticket'>('options');
  const [form, setForm] = useState({ name: user?.fullName || '', email: user?.email || '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [viewTicket, setViewTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.supportTickets();
      const isAdmin = user?.role === 'CEO' || user?.role === 'MANAGER' || user?.role === 'SUPPORT';
      const items = res.items || [];
      const filtered = isAdmin ? items : items.filter((t: any) => t.clientEmail === user?.email);
      setTickets(filtered);
      
      if (viewTicket) {
        const updated = items.find((t: any) => t.id === viewTicket.id);
        if (updated) setViewTicket(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ticket') {
      fetchTickets();
    }
  }, [activeTab]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewTicket || !replyMessage.trim()) return;
    setReplying(true);
    try {
      await api.replySupportTicket(viewTicket.id, replyMessage);
      setReplyMessage('');
      alert('Reply sent successfully');
      fetchTickets();
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setReplying(false);
    }
  };

  const options = [
    { id: 'knowledge', icon: Book, title: 'Knowledge Base', desc: 'Read comprehensive operational guides and system architecture documentation.' },
    { id: 'chat', icon: MessageCircle, title: 'Live Chat Support', desc: 'Speak directly with our executive technical support team.' },
    { id: 'ticket', icon: FileText, title: 'Submit a Support Ticket', desc: 'Log an official system inquiry or technical issue ticket.' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createSupportTicket(form);
      alert('Support ticket submitted successfully! The admin will get back to you in short time.');
      setForm({ name: user?.fullName || '', email: user?.email || '', subject: '', message: '' });
      setIsFormVisible(false);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center text-white shadow-sm">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Help & Support Center</h1>
            <p className="text-secondary text-sm mt-0.5">Comprehensive documentation, system guides, and helpdesk resources</p>
          </div>
        </div>
        {activeTab !== 'options' && (
          <button 
            onClick={() => setActiveTab('options')} 
            className="text-xs font-bold text-primary flex items-center gap-2 hover:bg-surface-container px-4 py-2 rounded-xl transition-all border border-outline-variant/40"
          >
            <X className="w-4 h-4" /> Return to Menu
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Navigation Cards */}
        {activeTab === 'options' && (
          <motion.div key="options" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt, i) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => opt.id !== 'chat' && setActiveTab(opt.id as any)}
                className="bg-white border border-outline-variant/30 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <opt.icon className="w-10 h-10 text-secondary group-hover:text-primary transition-colors mx-auto mb-4" />
                  <h3 className="font-bold text-primary text-base mb-2">{opt.title}</h3>
                  <p className="text-xs text-secondary leading-relaxed mb-6">{opt.desc}</p>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary bg-surface-container group-hover:bg-primary group-hover:text-white px-4 py-2.5 rounded-xl transition-all w-full">
                  {opt.id === 'chat' ? '24/7 Channel Active' : 'Explore System Guide \u2192'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Support Ticket Modal/Form */}
        {activeTab === 'ticket' && (
          <motion.div key="ticket" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
              <div>
                <h2 className="text-xl font-bold font-display text-primary">Support Tickets Desk</h2>
                <p className="text-xs text-secondary mt-1">Review your tickets history or request administrative help.</p>
              </div>
              <button 
                onClick={() => {
                  setIsFormVisible(!isFormVisible);
                  setViewTicket(null);
                }} 
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
              >
                {isFormVisible ? 'Back to Tickets List' : 'Submit New Ticket'}
              </button>
            </div>

            {isFormVisible ? (
              <div className="bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm">
                <h3 className="text-lg font-bold font-display text-primary mb-2">Create a Support Ticket</h3>
                <p className="text-xs text-secondary mb-6">Our technical team will review your inquiry shortly.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-secondary mb-1 font-display uppercase tracking-wider">Your Full Name</label>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary mb-1 font-display uppercase tracking-wider">Official Email Address</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1 font-display uppercase tracking-wider">Subject / Issue Title *</label>
                    <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" placeholder="e.g. Inquiry regarding transaction reconciliation" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1 font-display uppercase tracking-wider">Detailed Description *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium resize-none" placeholder="Provide complete details..." />
                  </div>
                  <p className="text-[11px] text-secondary italic">Notice: Dispatches a prioritized ticket directly to the administration queue.</p>
                  <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow hover:shadow-lg transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                    {submitting ? 'Transmitting Ticket...' : 'Dispatch Ticket Now'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tickets list panel */}
                <div className="md:col-span-1 bg-white border border-outline-variant/30 rounded-2xl p-4 shadow-sm h-[450px] flex flex-col">
                  <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-3 pl-1">Inquiries ({tickets.length})</h4>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {loadingTickets ? (
                      <p className="text-xs text-center text-secondary py-6 animate-pulse">Loading...</p>
                    ) : tickets.length === 0 ? (
                      <p className="text-xs text-center text-secondary py-6">No tickets filed.</p>
                    ) : (
                      tickets.map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => setViewTicket(t)}
                          className={cn(
                            "w-full text-left p-3.5 rounded-xl border text-xs transition-all flex flex-col gap-1.5",
                            viewTicket?.id === t.id ? "bg-primary-container/10 border-primary" : "bg-surface hover:bg-surface-container-low border-outline-variant/20"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary truncate max-w-[130px]">{t.subject}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider",
                              t.status === 'Resolved' ? "bg-green-50 text-green-700 border border-green-200" :
                              t.status === 'Escalated' ? "bg-red-50 text-red-700 border border-red-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            )}>
                              {t.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-secondary truncate max-w-full">{t.description}</span>
                          <span className="text-[8px] text-outline uppercase">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Conversation/Thread panel */}
                <div className="md:col-span-2 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm h-[450px] flex flex-col">
                  {viewTicket ? (
                    <div className="h-full flex flex-col justify-between">
                      <div className="border-b border-outline-variant/20 pb-3 mb-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-primary">{viewTicket.subject}</h4>
                          <span className="text-[9px] text-outline font-bold uppercase tracking-wider">#{viewTicket.id.substring(0, 8)}</span>
                        </div>
                        <p className="text-[10px] text-secondary mt-1">Status: <span className="font-bold text-primary">{viewTicket.status}</span></p>
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 text-xs">
                        {/* Client original message */}
                        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                          <div className="flex justify-between items-center text-[10px] font-bold text-secondary mb-2 uppercase tracking-wider">
                            <span>{viewTicket.customer || 'You'}</span>
                            <span>{new Date(viewTicket.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{viewTicket.description}</p>
                        </div>

                        {/* Replies */}
                        {(viewTicket.replies || []).map((reply: any) => (
                          <div 
                            key={reply.id} 
                            className={cn(
                              "rounded-2xl p-4 max-w-[85%] border",
                              reply.isAdmin 
                                ? "bg-primary/5 border-primary/10 ml-auto" 
                                : "bg-surface border-outline-variant/20 mr-auto"
                            )}
                          >
                            <div className="flex justify-between items-center text-[10px] font-bold text-secondary mb-2 uppercase tracking-wider gap-4">
                              <span>{reply.isAdmin ? 'ENAKO Admin' : (viewTicket.customer || 'You')}</span>
                              <span>{new Date(reply.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handleReply} className="flex gap-2 items-center border-t border-outline-variant/20 pt-4">
                        <input 
                          type="text"
                          required
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          placeholder="Write a message to support..."
                          className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary font-medium"
                        />
                        <button 
                          type="submit" 
                          disabled={replying || !replyMessage.trim()}
                          className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 shrink-0"
                        >
                          {replying ? 'Sending...' : 'Reply'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <HelpCircle className="w-12 h-12 text-outline-variant/40" />
                      <h4 className="text-sm font-bold text-primary">No Ticket Selected</h4>
                      <p className="text-xs text-secondary max-w-xs">Select a ticket from the left panel to view replies and talk with the support staff.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Knowledge Base Content - Directly on page background (NO outer box or container card) */}
        {activeTab === 'knowledge' && (
          <motion.div key="knowledge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 text-slate-800 leading-relaxed pt-2">
            
            {/* Knowledge Base Header */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                <Book className="w-4 h-4" />
                <span>System Operations Manual & Reference Guide</span>
              </div>
              <h2 className="text-3xl font-black font-display text-primary tracking-tight">ENAKO OS Enterprise Architecture & Operations Manual</h2>
              <p className="text-secondary text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
                Welcome to the official ENAKO OS documentation portal. This comprehensive manual details the complete architecture, governance models, role permissions, operational workflows, and security protocols across the entire organization.
              </p>
            </div>

            {/* SECTION 1: System Overview & Architecture */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-2xl font-bold text-primary">System Overview & Core Architecture</h3>
              </div>
              <p className="text-sm md:text-base text-slate-700">
                ENAKO OS is an enterprise-grade cloud system engineered to unify organizational management, staff administration, financial tracking, outreach operations, and compliance oversight into a single real-time infrastructure. Powered by a decoupled client-server model, ENAKO OS separates high-frequency administrative interfaces from core database services, providing resilient scalability and bank-grade data security.
              </p>
              <p className="text-sm text-slate-700">
                The ecosystem operates across three interconnected layers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="p-4 border-l-4 border-primary pl-4 bg-slate-50/50 rounded-r-xl">
                  <h4 className="font-bold text-primary text-sm mb-1">1. Frontend Control Hub</h4>
                  <p className="text-xs text-secondary leading-relaxed">Single-Page Application built with React, Vite, and Tailwind CSS. Delivers real-time dashboards, interactive charts, and instant navigation.</p>
                </div>
                <div className="p-4 border-l-4 border-emerald-600 pl-4 bg-slate-50/50 rounded-r-xl">
                  <h4 className="font-bold text-primary text-sm mb-1">2. Core NestJS API Service</h4>
                  <p className="text-xs text-secondary leading-relaxed">Robust Node.js backend executing modular controllers, JWT authentication guards, rate limiters, and Prisma ORM data validation.</p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 pl-4 bg-slate-50/50 rounded-r-xl">
                  <h4 className="font-bold text-primary text-sm mb-1">3. PostgreSQL Database</h4>
                  <p className="text-xs text-secondary leading-relaxed">Relational database storing transaction logs, staff meal balances, KYC documentation, outreach applications, and web telemetry.</p>
                </div>
              </div>
            </section>

            {/* SECTION 2: Role-Based Access Control (RBAC) */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-2xl font-bold text-primary">Role-Based Access Control (RBAC) & Governance</h3>
              </div>
              <p className="text-sm text-slate-700">
                ENAKO OS enforces strict privilege separation to safeguard sensitive organizational assets and maintain regulatory compliance. Every active user account is assigned one of the following primary roles:
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary">Executive Leadership (CEO & Managers):</strong> Full operational visibility across all financial accounts, global staff management, system configurations, and final authorization power over high-value transactions and strategic goals.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Landmark className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary">Finance & Billing Officers:</strong> Dedicated access to ledger accounting, treasury management, subscription billing, expense verification, and automated transaction reconciliation.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary">Outreach Managers:</strong> Dedicated command over the public outreach portal, community fundraiser management, scholarship application reviews, newsletter publishing, and visitor click heatmap web insights.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary">General Employees & Staff:</strong> Access to personal task boards, staff meal allowance tracking, company-wide announcements, interactive comments, daily activity reporting, and leave request applications.
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Financial Management & Transactions */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="text-2xl font-bold text-primary">Financial Operations, Transactions & Subscriptions</h3>
              </div>
              <p className="text-sm text-slate-700">
                The financial engine processes high-volume payments, subscription billing cycles, and operational expenditures in Central African CFA Francs (XAF) and international currencies.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li><strong>Ledger Reconciliation:</strong> Every transaction undergoes automated status transitions (PENDING → SETTLED or REJECTED). Proof documents and payment gateway transaction receipts are archived for audit compliance.</li>
                <li><strong>Subscription Governance:</strong> System subscriptions track active service contracts, renewal dates, recurring costs, and license allocations across departments.</li>
                <li><strong>Staff Meal Allowances:</strong> Meal records auto-calculate daily contributions (e.g. 500 XAF company subsidy and 500 XAF employee deduction) with built-in dispute resolution workflows.</li>
              </ul>
            </section>

            {/* SECTION 4: KYC & Applicant Compliance */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">4</span>
                <h3 className="text-2xl font-bold text-primary">KYC Verification & Applicant Compliance</h3>
              </div>
              <p className="text-sm text-slate-700">
                To fulfill international anti-money laundering (AML) and partner verification requirements, ENAKO OS includes an integrated Know Your Customer (KYC) engine.
              </p>
              <p className="text-sm text-slate-700">
                Applicants submit digital identity credentials (national IDs, passports, tax certificates, and organization charters). Reviewers evaluate incoming submissions, attach verified compliance stamps, and maintain an immutable audit trail of all approvals or rejections.
              </p>
            </section>

            {/* SECTION 5: Outreach Manager CMS & Web Analytics */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">5</span>
                <h3 className="text-2xl font-bold text-primary">Outreach CMS, Event Publishing & Web Insights</h3>
              </div>
              <p className="text-sm text-slate-700">
                The Outreach Manager portal provides end-to-end control over public charity campaigns and digital web assets:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-outline-variant/30 rounded-xl p-4 bg-white/40">
                  <h4 className="font-bold text-primary text-sm mb-1 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    Content Management System (CMS)
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    Create, update, and publish blog updates across categories like <em>Latest News</em>, <em>Emergency Relief</em>, <em>Crisis</em>, and <em>Archives</em>. Published items instantly synchronize with the public website.
                  </p>
                </div>
                <div className="border border-outline-variant/30 rounded-xl p-4 bg-white/40">
                  <h4 className="font-bold text-primary text-sm mb-1 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Web Insights & Heatmap Analytics
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    Real-time monitoring of visitor pageviews, cookie consent ratios, Google Ads / SEO campaign conversion ROI, and interactive visitor click heatmaps.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 6: Internal Announcements & Engagement */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">6</span>
                <h3 className="text-2xl font-bold text-primary">Internal Announcements, Likes & Commenting</h3>
              </div>
              <p className="text-sm text-slate-700">
                Organization-wide updates are broadcasted through the central Announcements feed. Executive leadership can pin critical policy updates to the top of the feed.
              </p>
              <p className="text-sm text-slate-700">
                All staff members can actively engage with announcements by clicking the <strong>Like</strong> button to express agreement or opening the <strong>Reply / Comments</strong> drawer to post feedback and discuss operational updates with colleagues in real time.
              </p>
            </section>

            {/* SECTION 7: Troubleshooting & Support Desk */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">7</span>
                <h3 className="text-2xl font-bold text-primary">Troubleshooting Guidelines & Support Desk</h3>
              </div>
              <p className="text-sm text-slate-700">
                If you encounter unexpected system behavior or permission errors, follow these standard diagnostic steps:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li><strong>Session Expiration:</strong> Authentication tokens expire after 24 hours of inactivity. Re-authenticate by signing out and logging back in if requests return 401 Unauthorized errors.</li>
                <li><strong>Role Permissions:</strong> Ensure your account is assigned the appropriate role for restricted actions (e.g. approving expenses requires Finance or CEO role).</li>
                <li><strong>Technical Support:</strong> If an operational issue persists, click <strong>Submit a Support Ticket</strong> above to dispatch an automated issue alert to the administration team.</li>
              </ul>
            </section>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
