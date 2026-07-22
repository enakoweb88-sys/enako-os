import React, { useState } from 'react';
import { LifeBuoy, Book, MessageCircle, FileText, X, ShieldCheck, Users, Landmark, FileSpreadsheet, Target, Megaphone, Activity, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

export default function Help() {
  const [activeTab, setActiveTab] = useState<'options' | 'knowledge' | 'ticket'>('options');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

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
      alert('Support inquiry submitted successfully! A notification email has been dispatched to noungajoseph58@gmail.com');
      setForm({ name: '', email: '', subject: '', message: '' });
      setActiveTab('options');
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
          <motion.div key="ticket" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-8 border border-outline-variant/30 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-xl font-bold font-display text-primary mb-2">Submit an Executive Support Ticket</h2>
            <p className="text-xs text-secondary mb-6">Our technical operations center will review your inquiry and respond within 2 business hours.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Your Full Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Official Email Address *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Subject / Issue Title *</label>
                <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" placeholder="e.g. Inquiry regarding transaction reconciliation" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Detailed Description *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium resize-none" placeholder="Provide complete details including steps to reproduce any issue..." />
              </div>
              <p className="text-[11px] text-secondary italic">Notice: Dispatches a prioritized ticket directly to noungajoseph58@gmail.com</p>
              <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow hover:shadow-lg transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                {submitting ? 'Transmitting Ticket...' : 'Dispatch Ticket Now'}
              </button>
            </form>
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
                <li><strong>Technical Support:</strong> If an operational issue persists, click <strong>Submit a Support Ticket</strong> above to dispatch an automated issue alert to our senior systems engineer at <code>noungajoseph58@gmail.com</code>.</li>
              </ul>
            </section>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
