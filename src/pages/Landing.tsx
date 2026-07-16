import React from 'react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  ShieldCheck,
  Users,
  BarChart3,
  Zap,
  Lock,
  ArrowRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   3-D Orbital Shield Graphic (pure CSS)
   ───────────────────────────────────────────── */
function OrbitalShield() {
  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: 340, height: 340, perspective: '900px' }}
      aria-hidden="true"
    >
      {/* Outer glowing sphere backdrop */}
      <div
        className="enako-sphere absolute rounded-full pointer-events-none"
        style={{
          inset: 20,
          background:
            'radial-gradient(circle at 40% 35%, rgba(219,234,254,0.85) 0%, rgba(191,219,254,0.45) 40%, rgba(219,234,254,0.1) 70%, transparent 90%)',
        }}
      />

      {/* Translucent middle sphere layer */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: 52,
          background:
            'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.9) 0%, rgba(219,234,254,0.5) 60%, transparent 90%)',
        }}
      />

      {/* ── Orbital rings (3-D perspective) ── */}
      {/* Ring 1 – steeply tilted (like latitude near pole) */}
      <div
        className="enako-ring enako-ring-1"
        style={{ inset: 30 }}
      />
      {/* Ring 2 – moderate tilt, different axis */}
      <div
        className="enako-ring enako-ring-2"
        style={{ inset: 14, borderColor: 'rgba(37,99,235,0.18)' }}
      />
      {/* Ring 3 – near-vertical (longitude style) */}
      <div
        className="enako-ring enako-ring-3"
        style={{ inset: 22, borderColor: 'rgba(37,99,235,0.22)' }}
      />
      {/* Ring 4 – diagonal cross orbit */}
      <div
        className="enako-ring enako-ring-4"
        style={{ inset: 46, borderColor: 'rgba(37,99,235,0.15)' }}
      />

      {/* ── Center Shield Icon ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
        <div
          className="enako-shield-core rounded-2xl bg-white flex items-center justify-center"
          style={{ width: 88, height: 88 }}
        >
          <ShieldCheck
            className="text-[#2563EB]"
            style={{ width: 46, height: 46 }}
            strokeWidth={1.6}
          />
        </div>
      </div>

      {/* ── Floating dots ── */}
      <div
        className="enako-dot-a absolute rounded-full bg-[#2563EB]"
        style={{ width: 10, height: 10, top: '12%', right: '9%' }}
      />
      <div
        className="enako-dot-b absolute rounded-full bg-[#2563EB]"
        style={{ width: 7, height: 7, top: '28%', left: '4%' }}
      />
      <div
        className="enako-dot-c absolute rounded-full"
        style={{
          width: 9,
          height: 9,
          bottom: '22%',
          right: '13%',
          background: 'rgba(37,99,235,0.5)',
        }}
      />
      <div
        className="enako-dot-d absolute rounded-full bg-[#2563EB]"
        style={{ width: 5, height: 5, top: '62%', left: '7%' }}
      />
      <div
        className="enako-dot-e absolute rounded-full"
        style={{
          width: 8,
          height: 8,
          top: '48%',
          right: '3%',
          background: 'rgba(37,99,235,0.35)',
        }}
      />
      <div
        className="enako-dot-a absolute rounded-full bg-[#2563EB]"
        style={{ width: 6, height: 6, bottom: '10%', left: '20%', animationDelay: '1.4s' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feature Card
   ───────────────────────────────────────────── */
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}
function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="enako-fade-up flex flex-col items-center text-center px-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(37,99,235,0.07)' }}
      >
        <div className="text-[#2563EB]">{icon}</div>
      </div>
      <h3 className="font-bold text-[#0f172a] text-[15px] mb-2">{title}</h3>
      <p className="text-gray-500 text-[13px] leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="bg-white font-sans overflow-x-hidden">

      {/* ── Hero Section ── */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20">

        {/* 3-D Orbital Shield */}
        <div className="mb-8">
          <OrbitalShield />
        </div>

        {/* Badge */}
        <div
          className="enako-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[11px] font-bold tracking-widest uppercase"
          style={{
            borderColor: 'rgba(37,99,235,0.35)',
            color: '#2563EB',
            background: 'rgba(37,99,235,0.05)',
            animationDelay: '100ms',
          }}
        >
          Welcome to ENAKO
        </div>

        {/* Main Heading */}
        <h1
          className="enako-fade-up font-black text-5xl sm:text-6xl md:text-7xl leading-none mb-5 tracking-tight"
          style={{ color: '#0f172a', animationDelay: '200ms' }}
        >
          ENAKO{' '}
          <span style={{ color: '#2563EB' }}>OS</span>
        </h1>

        {/* Sub-heading */}
        <p
          className="enako-fade-up text-[#334155] text-lg sm:text-xl font-medium mb-4"
          style={{ animationDelay: '300ms' }}
        >
          Enterprise Operations &amp; Management System
        </p>

        {/* Description */}
        <p
          className="enako-fade-up text-gray-400 text-[15px] max-w-md leading-relaxed mb-10"
          style={{ animationDelay: '400ms' }}
        >
          A unified platform designed to streamline operations, enhance productivity,
          and drive efficiency across the organisation.
        </p>

        {/* CTA Button */}
        <Link
          to="/select-role"
          className="enako-fade-up inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-bold text-[15px] shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: '#2563EB',
            boxShadow: '0 4px 24px rgba(37,99,235,0.35)',
            animationDelay: '500ms',
          }}
        >
          <Lock className="w-4 h-4" />
          Access Workspace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Features Row ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Secure"
            description="Enterprise-grade security for your data."
            delay={0}
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Collaborative"
            description="Work together seamlessly across departments."
            delay={100}
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Intelligent"
            description="Real-time insights for smarter decisions."
            delay={200}
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Efficient"
            description="Automate processes and maximise productivity."
            delay={300}
          />
        </div>
      </section>

      {/* ── Security Notice Banner ── */}
      <section className="py-10 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div
            className="enako-fade-up flex items-start gap-5 p-6 rounded-2xl"
            style={{
              background: 'rgba(37,99,235,0.04)',
              border: '1.5px solid rgba(37,99,235,0.12)',
              animationDelay: '400ms',
            }}
          >
            {/* Lock icon block */}
            <div
              className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.1)' }}
            >
              <Lock className="w-6 h-6 text-[#2563EB]" />
            </div>

            <div>
              <h4 className="font-bold text-[#0f172a] text-[16px] mb-1.5">
                Private. Secure. Built for ENAKO.
              </h4>
              <p className="text-gray-500 text-[13px] leading-relaxed">
                This system is for authorised personnel only.
                All activities are monitored and protected.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
