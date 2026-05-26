import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Users2, 
  Globe2, 
  Workflow, 
  Settings2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Handshake,
  Headset
} from 'lucide-react';

export default function Enterprise() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-8 py-24 max-w-[1440px] mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black tracking-[0.3em] mb-12 uppercase"
        >
          Institutional Grade
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-7xl lg:text-9xl font-black text-primary mb-12 tracking-tighter leading-[0.8]"
        >
          OS for the <br/>Global Scale.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-secondary text-2xl max-w-3xl mx-auto leading-relaxed font-black uppercase tracking-tight"
        >
          Engineered for companies managing over $1B in volume. Personalized architecture, dedicated support tiers, and absolute stability.
        </motion.p>
      </section>

      {/* Enterprise Pillars */}
      <section className="px-8 py-32 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {[
           { icon: Building2, title: 'Dedicated Infrastructure', desc: 'Deploy on isolated nodes for maximum performance and security isolation.' },
           { icon: Workflow, title: 'Custom Workflows', desc: 'Modify core operational logic to fit your specific organizational hierarchy and auth structures.' },
           { icon: Headset, title: 'Priority Support', desc: 'Direct line to our senior engineering desk for 24/7 mission-critical assistance.' }
         ].map((pillar, i) => (
            <div key={i} className="p-16 bg-white border border-outline-variant/30 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-700">
               <div className="size-20 rounded-3xl bg-surface-container flex items-center justify-center text-primary-container mb-12">
                  <pillar.icon className="w-10 h-10" />
               </div>
               <h3 className="font-display text-4xl font-black text-primary mb-6 tracking-tight">{pillar.title}</h3>
               <p className="text-secondary text-lg leading-relaxed font-bold uppercase tracking-wider">{pillar.desc}</p>
            </div>
         ))}
      </section>

      {/* Corporate Features */}
      <section className="bg-surface-container-low py-48 border-y border-outline-variant/20">
         <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
               <div className="space-y-16">
                  <h2 className="font-display text-6xl font-black text-primary leading-tight tracking-tighter">Your Core <br/>Intelligence Hub.</h2>
                  <div className="space-y-8">
                     {[
                       'Multi-entity organizational support',
                       'Custom compliance rule-set engine',
                       'Granular role-based access control (RBAC)',
                       'SSO & SAML Enterprise integration',
                       'Dedicated uptime SLA (99.99%)',
                       'Quarterly on-site strategic reviews'
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-6 group">
                          <div className="size-6 rounded-full border-2 border-primary-container flex items-center justify-center group-hover:bg-primary-container transition-colors">
                             <CheckCircle2 className="w-4 h-4 text-primary-container group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-xl font-display font-black text-primary uppercase tracking-tight">{item}</span>
                       </div>
                     ))}
                  </div>
                  <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all active:scale-95 group">
                    Connect with Sales <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="relative">
                  <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border border-outline-variant/30 relative z-10">
                     <div className="aspect-[4/3] w-full bg-surface-container rounded-[2.5rem] flex items-center justify-center">
                        <div className="relative size-32">
                           <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
                           <div className="absolute inset-0 border-4 border-primary rounded-full"></div>
                           <ShieldCheck className="absolute inset-0 m-auto w-16 h-16 text-primary" />
                        </div>
                     </div>
                  </div>
                  <div className="absolute -top-12 -right-12 size-64 bg-on-tertiary-container/5 rounded-full blur-3xl animate-pulse"></div>
               </div>
            </div>
         </div>
      </section>

      {/* Global Presence */}
      <section className="py-48 max-w-[1440px] mx-auto px-8 text-center">
         <h2 className="font-display text-4xl font-black text-secondary uppercase tracking-[0.3em] mb-24">Global Execution Nodes</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-24 opacity-60">
            {['LONDON', 'NEW YORK', 'TOKYO', 'SINGAPORE', 'ZURICH', 'FRANKFURT'].map(city => (
              <div key={city} className="space-y-4">
                 <Globe2 className="w-10 h-10 mx-auto text-primary" />
                 <p className="font-black text-[12px] tracking-widest">{city}</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
