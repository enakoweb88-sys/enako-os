import React, { useNavigate } from 'react-router-dom';

interface RoleCard {
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER';
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bg: string;
}

const ROLES: RoleCard[] = [
  {
    role: 'CEO',
    emoji: '👔',
    title: 'CEO',
    subtitle: 'Chief Executive Officer',
    description: 'Full access to enterprise command center, financial analytics, and strategic operations.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.06)',
  },
  {
    role: 'MANAGER',
    emoji: '📊',
    title: 'Manager',
    subtitle: 'Department Manager',
    description: 'Oversee department operations, approve requests, and manage team performance.',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.06)',
  },
  {
    role: 'EMPLOYEE',
    emoji: '👤',
    title: 'Employee',
    subtitle: 'Staff Member',
    description: 'Access your personal workspace, tasks, expenses, and daily operations.',
    color: '#059669',
    bg: 'rgba(5,150,105,0.06)',
  },
  {
    role: 'OUTREACH_MANAGER',
    emoji: '🌍',
    title: 'Outreach Manager',
    subtitle: 'Community Impact',
    description: 'Manage outreach programs, verify applications, publish blogs, and send newsletters.',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.06)',
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  const handleSelect = (role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER') => {
    localStorage.setItem('enako_selected_role', role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Minimal Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5">
          <img src="/logo.png" alt="ENAKO OS" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <span className="font-bold text-[14px] text-[#0f172a] tracking-tight leading-none block">ENAKO OS</span>
            <span className="text-[9px] text-gray-400 tracking-widest uppercase font-semibold leading-none block">Enterprise Operating System</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 text-[11px] font-bold tracking-widest uppercase"
            style={{ borderColor: 'rgba(37,99,235,0.3)', color: '#2563EB', background: 'rgba(37,99,235,0.05)' }}
          >
            Secure Access Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] mb-3 tracking-tight">
            Who are you logging in as?
          </h1>
          <p className="text-gray-400 text-[15px] max-w-sm mx-auto leading-relaxed">
            Select your role to access your personalised workspace.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
          {ROLES.map((card) => (
            <button
              key={card.role}
              onClick={() => handleSelect(card.role)}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
              style={{
                borderColor: 'rgba(0,0,0,0.08)',
                background: '#fff',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = card.color;
                el.style.background = card.bg;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = `0 12px 32px ${card.color}22`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(0,0,0,0.08)';
                el.style.background = '#fff';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Logo Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-200 p-3"
                style={{ background: card.bg }}
              >
                <img src="/logo.png" alt="ENAKO OS" className="w-full h-full object-contain" />
              </div>

              {/* Title */}
              <h2
                className="font-black text-xl mb-1 tracking-tight transition-colors duration-200"
                style={{ color: '#0f172a' }}
              >
                {card.title}
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: card.color }}>
                {card.subtitle}
              </p>

              {/* Description */}
              <p className="text-gray-400 text-[13px] leading-relaxed">
                {card.description}
              </p>

              {/* Arrow */}
              <div
                className="mt-6 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-200"
                style={{ color: card.color }}
              >
                Select Role
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Security note */}
        <p className="mt-10 text-[12px] text-gray-400 text-center max-w-sm">
          🔒 Access is restricted to authorised ENAKO personnel only.
          All login attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
}
