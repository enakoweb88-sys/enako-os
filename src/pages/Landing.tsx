import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Building2, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-surface font-sans">
      <section className="min-h-[calc(100vh-84px)] pt-40 pb-20 flex items-center">
        <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 text-primary text-[10px] font-black tracking-[0.3em] mb-10 uppercase">
              <LockKeyhole className="w-4 h-4" />
              ENAKO Internal System
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-black text-primary max-w-4xl mb-8 leading-[0.95]">
              Enterprise operations control for ENAKO teams.
            </h1>
            <p className="text-secondary text-lg max-w-2xl mb-10 leading-relaxed">
              Secure access to employee management, KYC review, expenses, meals, transactions, tasks, announcements, and executive reporting.
            </p>
            <Link to="/login" className="inline-flex bg-primary text-white px-9 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] items-center gap-3 hover:shadow-2xl transition-all active:scale-95 group">
              Access ENAKO OS
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Workspace</p>
                <h2 className="text-2xl font-display font-black text-primary">Authorized Staff Only</h2>
              </div>
            </div>
            <div className="space-y-4">
              {[
                'JWT authentication and role-based access',
                'Live database-backed operational records',
                'Manager review and CEO approval workflows',
                'Real-time internal updates and notifications',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
