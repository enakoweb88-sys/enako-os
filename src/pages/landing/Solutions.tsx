import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  ArrowRight,
  Target,
  Rocket
} from 'lucide-react';

export default function Solutions() {
  const solutions = [
    { 
      title: 'Global Fintechs', 
      icon: Globe, 
      desc: 'Seamless multi-currency ledger management and cross-border settlement infrastructure for the next generation of financial apps.',
      features: ['Real-time FX conversion', 'Global KYC/AML integration', 'Merchant settlement APIs']
    },
    { 
      title: 'Enterprise Treasury', 
      icon: BarChart3, 
      desc: 'Optimize corporate idle capital with automated yield-seeking strategies and deterministic risk management parameters.',
      features: ['Automated liquidity sweeps', 'Risk exposure analytics', 'Fixed-income allocation']
    },
    { 
      title: 'Digital Asset Desks', 
      icon: Cpu, 
      desc: 'Institutional grade connectivity to top-tier liquidity providers with deep order books and sub-second execution.',
      features: ['Direct OTC gateway', 'Cold-storage custody sync', 'Deterministic trade settlement']
    }
  ];

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-8 py-24 max-w-[1440px] mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-white text-[10px] font-black tracking-[0.3em] mb-8 uppercase"
        >
          Specialized Architectures
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-6xl lg:text-8xl font-black text-primary mb-12 tracking-tight leading-[0.9]"
        >
          Engineered for <br/>Your Industry.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-secondary text-xl max-w-2xl mx-auto leading-relaxed"
        >
          ENAKO OS provides the modular infrastructure required to scale high-stakes financial operations across different sectors with absolute certainty.
        </motion.p>
      </section>

      {/* Solutions Grid */}
      <section className="px-8 py-24 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {solutions.map((s, i) => (
            <motion.div 
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-12 bg-white border border-outline-variant/30 rounded-[3rem] hover:border-primary transition-all duration-700 shadow-sm hover:shadow-2xl"
            >
              <div className="size-20 rounded-3xl bg-surface-container flex items-center justify-center text-primary mb-12 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner">
                <s.icon className="w-10 h-10" />
              </div>
              <h3 className="font-display text-3xl font-black text-primary mb-6 tracking-tight uppercase">{s.title}</h3>
              <p className="text-secondary text-lg mb-10 leading-relaxed font-medium">
                {s.desc}
              </p>
              <ul className="space-y-4 mb-12">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-primary tracking-tight">
                    <Zap className="w-4 h-4 text-primary-container" fill="currentColor" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.3em] group-hover:gap-5 transition-all">
                Learn More <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Deep Dive */}
      <section className="bg-primary py-32 px-8 overflow-hidden relative">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="text-white relative z-10">
               <h2 className="font-display text-5xl font-black mb-8 leading-tight">Scale Without <br/>Operational Friction.</h2>
               <p className="text-on-primary-container text-xl opacity-80 mb-12 leading-relaxed">
                  The OS is designed to absorb the complexity of global compliance, banking rails, and liquidity management, so your team can focus on product innovation.
               </p>
               <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: 'Settlement Speed', val: '-' },
                    { label: 'Market Depth', val: '-' }
                  ].map(stat => (
                    <div key={stat.label}>
                       <p className="text-[10px] font-bold text-primary-fixed/50 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                       <p className="text-3xl font-display font-black">{stat.val}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative">
               <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl relative z-10">
                 <div className="space-y-6">
                    {[
                      { icon: ShieldCheck, title: 'Compliance-First', desc: 'Every transaction is vetted through real-time KYC/AML filters.' },
                      { icon: Rocket, title: 'High Velocity', desc: 'Proprietary settlement engine built for institutional volume.' },
                      { icon: Target, title: 'Precision Reporting', desc: 'Granular ledger exports for audit-ready financial statements.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-start">
                         <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                           <item.icon className="w-6 h-6 text-white" />
                         </div>
                         <div>
                            <h4 className="text-white font-bold mb-1">{item.title}</h4>
                            <p className="text-white/60 text-sm">{item.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
               <div className="absolute -top-12 -right-12 size-64 bg-primary-container/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
         </div>
      </section>
    </div>
  );
}
