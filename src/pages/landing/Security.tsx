import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  ShieldAlert, 
  Fingerprint, 
  Eye, 
  Binary,
  Cpu,
  Key,
  Shield,
  Zap,
  Activity,
  History
} from 'lucide-react';

export default function Security() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-8 py-32 max-w-[1440px] mx-auto text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-error text-white text-[10px] font-black tracking-[0.3em] mb-12 uppercase"
        >
          Zero Trust Architecture
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-7xl lg:text-9xl font-black text-primary mb-12 tracking-tighter leading-[0.8]"
        >
          Security is <br/>the Core.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-secondary text-2xl max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest mb-16"
        >
          Not an afterthought. ENAKO OS is built from the hardware layer up to ensure absolute data integrity and operational safety.
        </motion.p>
        <div className="flex justify-center items-center gap-12 bg-white border border-outline-variant/30 px-12 py-6 rounded-3xl w-fit mx-auto shadow-sm">
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">ISO 27001 Certified</span>
           </div>
           <div className="w-[1px] h-6 bg-outline-variant/30"></div>
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">SOC 2 Type II</span>
           </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="px-8 py-48 bg-primary text-white relative">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Fingerprint, title: 'Biometric Gateway', desc: 'Secure every high-stakes operation with hardware-level biometric validation.' },
              { icon: Binary, title: 'Encrypted Ledger', desc: 'Atomic, encrypted transaction logging that is mathematically immutable.' },
              { icon: Eye, title: 'Audit Transparency', desc: 'Complete historical visibility into every operational decision with zero gaps.' },
              { icon: Lock, title: 'Cold-Node Sync', desc: 'Critical state data synchronized across isolated cold-nodes for total DR.' }
            ].map((pillar, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="p-12 border border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-xl group hover:bg-white/10 transition-all duration-500"
               >
                  <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center mb-10 group-hover:bg-white group-hover:text-primary transition-colors">
                     <pillar.icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-display text-2xl font-black mb-4 uppercase tracking-tighter leading-tight">{pillar.title}</h4>
                  <p className="text-on-primary-container text-sm font-medium opacity-70 leading-relaxed">{pillar.desc}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Defensive Layers */}
      <section className="py-48 max-w-[1440px] mx-auto px-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative">
               <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white border border-outline-variant/30 rounded-2xl flex items-center justify-between group hover:border-primary transition-all shadow-sm"
                    >
                       <div className="flex items-center gap-6">
                          <div className="size-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">ENKO_SEC_NODE_0{i+1} ACTIVE</span>
                       </div>
                       <Activity className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                    </motion.div>
                  ))}
               </div>
            </div>
            <div>
               <h2 className="font-display text-6xl font-black text-primary mb-12 tracking-tighter leading-[0.9]">Proactive <br/>Defense Engine.</h2>
               <div className="space-y-12">
                  {[
                    { icon: ShieldAlert, title: 'Real-time Threat Mitigation', desc: 'AI-driven system nodes identify and isolate anomalous pattern behaviors in sub-milliseconds.' },
                    { icon: History, title: 'Immutable Delta Logging', desc: 'Every data mutation is tracked, signed, and stored in a multi-region cryptographic vault.' },
                    { icon: Key, title: 'Hardware Security Modules', desc: 'Key management handled via dedicated HSMs for cold and warm liquidity gateways.' }
                  ].map((defense, i) => (
                    <div key={i} className="flex gap-8 group">
                       <div className="size-14 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary-container group-hover:text-white transition-all">
                          <defense.icon className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="text-xl font-display font-black text-primary mb-2 uppercase tracking-tight">{defense.title}</h4>
                          <p className="text-secondary text-base leading-relaxed font-medium">{defense.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Trust & Compliance */}
      <section className="py-48 bg-surface-container-low border-t border-outline-variant/20">
         <div className="max-w-[1440px] mx-auto px-8 text-center">
            <h3 className="font-display text-4xl font-black text-primary mb-24 tracking-tighter uppercase">Certified Resilience</h3>
            <div className="flex flex-wrap justify-center gap-24 items-center opacity-40 hover:opacity-80 transition-opacity">
               {['CYBERTRUST', 'SOC2_II', 'ISO_27001', 'PCIDSS_L1', 'GDPR_COMPLIANT'].map(badge => (
                 <span key={badge} className="text-2xl font-display font-black tracking-[0.5em] text-primary">{badge}</span>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
