import React from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Layers, 
  Database, 
  Network, 
  Code2, 
  GitBranch,
  Terminal,
  Activity,
  Zap,
  Lock
} from 'lucide-react';

export default function Platform() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-8 py-24 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-white text-[10px] font-black tracking-[0.3em] mb-8 uppercase"
            >
              The Architecture
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-7xl lg:text-9xl font-black text-primary mb-12 tracking-tighter leading-[0.8]"
            >
              Core <br/>Infrastructure.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-secondary text-xl max-w-xl leading-relaxed font-medium"
            >
              A robust, deterministic operating system for high-stakes financial operations. Built with zero-trust security and sub-millisecond data synchronization.
            </motion.p>
          </div>
          <div className="relative">
            <div className="bg-white border border-outline-variant/30 rounded-[3rem] p-12 shadow-2xl shadow-primary/5">
              <div className="space-y-12">
                 <div className="flex items-center justify-between pb-8 border-b border-outline-variant/20">
                    <span className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase">System Latency</span>
                    <span className="text-2xl font-mono font-bold text-outline-variant">--ms</span>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    {[65, 85, 45, 95, 75, 55].map((h, i) => (
                      <div key={i} className="h-32 bg-surface-container rounded-2xl relative overflow-hidden flex items-end px-2 gap-1 pb-4">
                         {[...Array(8)].map((_, j) => (
                           <div key={j} className="flex-1 bg-primary/20 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                         ))}
                         <div className="absolute inset-x-0 bottom-0 py-1 bg-primary/5 text-center">
                            <span className="text-[8px] font-bold text-primary italic uppercase">NODE {i+1}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -left-12 size-48 bg-primary-container/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-48 bg-white border-y border-outline-variant/20">
         <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-32">
               <h2 className="font-display text-5xl font-black text-primary mb-8">Hardware-Grade Software.</h2>
               <p className="text-secondary text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold">The ENAKO stack is optimized for absolute execution certainty.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
               {[
                 { icon: Network, title: 'Mesh Network', desc: 'Global node synchronization with low-latency p2p architecture.' },
                 { icon: Database, title: 'Atomic Persistence', desc: 'Deterministic transaction logging that prevents double-spend and state drift.' },
                 { icon: Code2, title: 'Developer SDK', desc: 'Comprehensive API surfaces for custom integration into core OS layers.' },
                 { icon: Terminal, title: 'Binary Protocol', desc: 'Proprietary financial communication protocol for high-packet density.' }
               ].map((stack, i) => (
                 <div key={i} className="space-y-8">
                    <div className="size-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container">
                       <stack.icon className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="font-display text-lg font-black text-primary mb-4 uppercase tracking-tighter">{stack.title}</h4>
                       <p className="text-secondary text-sm leading-relaxed">{stack.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* OS Layers */}
      <section className="py-48 max-w-[1440px] mx-auto px-8">
         <div className="bg-primary rounded-[4rem] px-12 md:px-24 py-32 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:32px_32px]"></div>
            </div>
            <div className="max-w-3xl relative z-10">
               <h2 className="font-display text-4xl lg:text-7xl font-black mb-12 tracking-tight">Three Layers of <br/>Operational Integrity.</h2>
               <div className="space-y-16">
                  {[
                    { label: 'LAYER 1: KERNEL', title: 'Deterministic Ledger', desc: 'The immutable source of truth for all value movement within the OS.' },
                    { label: 'LAYER 2: PROTOCOL', title: 'Liquidity Gateway', desc: 'Smart routing and execution logic that aggregates global financial rails.' },
                    { label: 'LAYER 3: INTERFACE', title: 'Unified Dashboard', desc: 'High-fidelity UI built for human oversight of high-stakes automation.' }
                  ].map((layer, i) => (
                    <div key={i} className="flex gap-12 group cursor-default">
                       <span className="text-[10px] font-black tracking-[0.4em] opacity-30 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                       <div>
                          <p className="text-[10px] font-black text-primary-fixed uppercase tracking-[0.2em] mb-2">{layer.label}</p>
                          <h4 className="text-2xl font-display font-black mb-2">{layer.title}</h4>
                          <p className="text-on-primary-container text-lg font-medium opacity-70">{layer.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
