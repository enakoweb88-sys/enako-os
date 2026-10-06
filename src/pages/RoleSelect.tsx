import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface RoleCard {
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER';
  title: string;
  subtitle: string;
  description: string;
  color: string;
  badgeBg: string;
  borderHover: string;
}

const ROLES: RoleCard[] = [
  {
    role: 'CEO',
    title: 'CEO Workspace',
    subtitle: 'Chief Executive Officer',
    description: 'Full strategic control over enterprise command center, financial analytics, employee rosters, and system performance.',
    color: 'text-[#001F5B]',
    badgeBg: 'bg-[#001F5B]/10 text-[#001F5B] border-[#001F5B]/20',
    borderHover: 'hover:border-[#00C2C7] hover:shadow-[#001F5B]/10',
  },
  {
    role: 'MANAGER',
    title: 'Manager Portal',
    subtitle: 'Department Operations',
    description: 'Oversee department workflows, approve requests, monitor employee activities, and manage team productivity.',
    color: 'text-[#00C2C7]',
    badgeBg: 'bg-[#00C2C7]/15 text-[#001F5B] border-[#00C2C7]/30',
    borderHover: 'hover:border-[#00C2C7] hover:shadow-[#00C2C7]/10',
  },
  {
    role: 'EMPLOYEE',
    title: 'Employee Portal',
    subtitle: 'Staff Workspace',
    description: 'Access personal workspace, submit expense reports, request staff meals, view announcements, and track assigned tasks.',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    borderHover: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
  },
  {
    role: 'OUTREACH_MANAGER',
    title: 'Outreach Manager',
    subtitle: 'Community Impact',
    description: 'Manage outreach programs, review applications, publish blogs, handle newsletter subscriptions, and track web analytics.',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/60',
    borderHover: 'hover:border-purple-300 hover:shadow-purple-500/10',
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  const handleSelect = (role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER') => {
    sessionStorage.setItem('enako_selected_role', role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen font-sans bg-[#FAF9FC] text-[#1E293B] antialiased flex flex-col justify-between selection:bg-[#00C2C7] selection:text-[#001F5B]">
      
      {/* ── HEADER NAVIGATION ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 transition-all sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Back to Homepage Link */}
          <Link
            to="/"
            className="text-xs sm:text-sm font-extrabold text-[#001F5B] hover:text-[#00C2C7] transition-colors"
          >
            ← Back to Homepage
          </Link>

          {/* Real Company Logo & Title */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/logo.png"
              alt="ENAKO Logo"
              className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#0F172A] leading-none">
                ENAKO
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#00C2C7] uppercase mt-0.5">
                CLOUD SYSTEM
              </span>
            </div>
          </Link>

        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center w-full">
        
        {/* Title & Subtitle */}
        <div className="text-center mb-8 sm:mb-12 flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight mb-3 sm:mb-4">
            Select Your Role Workspace
          </h1>
          <p className="text-[#475569] text-sm sm:text-base max-w-md mx-auto leading-relaxed font-normal">
            Choose your designated enterprise authority to enter your customized dashboard interface.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {ROLES.map((card) => (
            <button
              key={card.role}
              type="button"
              onClick={() => handleSelect(card.role)}
              className={`group flex flex-col justify-between text-left p-7 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1.5 ${card.borderHover}`}
            >
              <div>
                {/* Subtitle Badge */}
                <span className={`inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border mb-4 ${card.badgeBg}`}>
                  {card.subtitle}
                </span>

                {/* Title */}
                <h2 className="font-black text-xl text-[#0F172A] mb-2 tracking-tight group-hover:text-[#001F5B] transition-colors">
                  {card.title}
                </h2>

                {/* Description */}
                <p className="text-[#64748B] text-xs leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {/* Action Link */}
              <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold ${card.color}`}>
                <span>Authenticate Session</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white border-t border-slate-200/60 py-6 px-6 text-center text-[#64748B] text-xs font-medium">
        <p>&copy; {new Date().getFullYear()} ENAKO Cloud System. Encrypted Role Access Portal.</p>
      </footer>

    </div>
  );
}

