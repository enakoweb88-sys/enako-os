import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Globe2, 
  Users2, 
  BarChart3,
  Rocket,
  Building2,
  Gem
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Pricing() {
  const plans = [
    {
      name: 'Growth',
      price: '4,200',
      desc: 'Optimized for scaling fintechs and modern commerce desks.',
      features: [
        'Global Multi-Currency Ledger',
        'Standard KYC/AML Screening',
        'Staff Meals & Expenses Dashboard',
        'Operational Chat Gateway',
        'Up to 100 Corporate Seats',
        'Shared Operating Nodes'
      ],
      icon: Rocket,
      cta: 'Start Deploying',
      highlight: false
    },
    {
      name: 'Institutional',
      price: '12,800',
      desc: 'The gold standard for high-volume financial architectures.',
      features: [
        'Everything in Growth',
        'Deterministic FX Settlement Engine',
        'Advanced Asset Allocation Analytics',
        'Biometric Auth Integration',
        'Up to 500 Corporate Seats',
        'Dedicated Performance Nodes',
        'Quarterly Uptime Reports'
      ],
      icon: Gem,
      cta: 'Scale Now',
      highlight: true
    },
    {
      name: 'Custom',
      price: 'Quote',
      desc: 'Bespoke infrastructure for the world’s largest institutions.',
      features: [
        'Everything in Institutional',
        'White-Label Interface Deployment',
        'Custom Regulatory Integration',
        'HSM Key Management Governance',
        'Unlimited Global Headcount',
        'On-Premise Node Capability',
        '24/7 Senior Engineering Desk'
      ],
      icon: Building2,
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  return (
    <div className="pt-32 pb-24">
      {/* Header */}
      <section className="px-8 py-24 max-w-[1440px] mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-white text-[10px] font-black tracking-[0.3em] mb-8 uppercase"
        >
          Predictable Stability
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-7xl lg:text-9xl font-black text-primary mb-12 tracking-tighter leading-[0.8]"
        >
          Investment in <br/>Certainty.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-secondary text-2xl max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest"
        >
          No hidden fees. No unexpected latency. Just pure deterministic performance for your global enterprise.
        </motion.p>
      </section>

      {/* Pricing Grid */}
      <section className="px-8 py-24 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative p-12 rounded-[3.5rem] border transition-all duration-700 flex flex-col group",
                plan.highlight ? "bg-primary text-white border-primary shadow-2xl scale-105 z-10" : "bg-white border-outline-variant/30 text-primary hover:border-primary shadow-sm hover:shadow-xl"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-on-tertiary-container text-white px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase">
                  MOST DEPLOYED
                </div>
              )}
              <div className="mb-12">
                <div className={cn(
                  "size-16 rounded-2xl flex items-center justify-center mb-10 transition-colors",
                  plan.highlight ? "bg-white/10 text-white group-hover:bg-white group-hover:text-primary" : "bg-surface-container text-primary-container group-hover:bg-primary group-hover:text-white"
                )}>
                  <plan.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display text-3xl font-black mb-4 uppercase tracking-tighter">{plan.name}</h3>
                <p className={cn(
                  "text-lg leading-relaxed font-medium",
                  plan.highlight ? "text-white/70" : "text-secondary"
                )}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-12">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-black uppercase tracking-widest opacity-60">$</span>
                  <span className="text-6xl font-display font-black tracking-tighter">{plan.price}</span>
                  {plan.price !== 'Quote' && <span className="text-sm font-black uppercase tracking-widest opacity-60">/MO</span>}
                </div>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] opacity-60",
                )}>BILLED ANNUALLY IN USD / USDT</p>
              </div>

              <div className="space-y-6 mb-16 flex-grow">
                 {plan.features.map(f => (
                   <div key={f} className="flex items-center gap-4">
                      <CheckCircle2 className={cn("w-5 h-5 shrink-0", plan.highlight ? "text-white" : "text-primary-container")} />
                      <span className="text-sm font-bold tracking-tight">{f}</span>
                   </div>
                 ))}
              </div>

              <button className={cn(
                "w-full py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-3",
                plan.highlight ? "bg-white text-primary hover:bg-primary-fixed" : "bg-primary text-white hover:shadow-xl"
              )}>
                {plan.cta} <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison Bottom */}
      <section className="py-48 max-w-[1440px] mx-auto px-8">
         <div className="bg-surface-container-low p-16 md:p-24 rounded-[4rem] border border-outline-variant/10 text-center">
            <h2 className="font-display text-5xl font-black text-primary mb-8 tracking-tighter">Enterprise Sovereignty.</h2>
            <p className="text-secondary text-lg max-w-xl mx-auto mb-16 font-medium leading-relaxed">
              We offer specialized on-premise hardware nodes for governments and ultra-high-volume banks requiring physical data isolation.
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-24 opacity-60">
              {[
                { icon: ShieldCheck, label: 'Full Data Sovereignty' },
                { icon: Globe2, label: 'Global Settlement Rails' },
                { icon: BarChart3, label: 'Real-time OS Analytics' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                   <item.icon className="w-8 h-8 text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              ))}
            </div>
         </div>
      </section>
    </div>
  );
}
