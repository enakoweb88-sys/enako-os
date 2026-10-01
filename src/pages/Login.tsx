import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Role = 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER';

const ROLE_LABELS: Record<Role, string> = {
  CEO: 'Chief Executive Officer',
  MANAGER: 'Department Manager',
  EMPLOYEE: 'Staff Member',
  OUTREACH_MANAGER: 'Outreach Manager'
};

const ROLE_EMOJIS: Record<Role, string> = {
  CEO: '👔',
  MANAGER: '📊',
  EMPLOYEE: '👤',
  OUTREACH_MANAGER: '🌍'
};

const ROLE_OPTIONS: { role: Role; label: string; short: string; emoji: string }[] = [
  { role: 'EMPLOYEE', label: 'Staff Member', short: 'Staff', emoji: '👤' },
  { role: 'MANAGER', label: 'Department Manager', short: 'Manager', emoji: '📊' },
  { role: 'OUTREACH_MANAGER', label: 'Outreach Manager', short: 'Outreach', emoji: '🌍' },
  { role: 'CEO', label: 'Chief Executive Officer', short: 'CEO', emoji: '👔' },
];

function isValidRole(r: string | null): r is Role {
  return r === 'CEO' || r === 'MANAGER' || r === 'EMPLOYEE' || r === 'OUTREACH_MANAGER';
}

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRole = searchParams.get('role')?.toUpperCase();
  const sessionRole = sessionStorage.getItem('enako_selected_role')?.toUpperCase();
  const localRole = localStorage.getItem('enako_last_role')?.toUpperCase();

  // Pick previous active role: query > session > local storage > fallback to EMPLOYEE
  const initialRole = [queryRole, sessionRole, localRole].find(isValidRole);
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole || 'EMPLOYEE');

  const [email, setEmail] = useState(() => localStorage.getItem('enako_last_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    sessionStorage.setItem('enako_selected_role', role);
    localStorage.setItem('enako_last_role', role);
    setSearchParams({ role });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      localStorage.setItem('enako_last_role', selectedRole);
      localStorage.setItem('enako_last_email', email.trim());
      await login(email.trim(), password, selectedRole);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
        setError('Cannot reach the server. Check your connection or try again later.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">

      {/* ── Left Panel: Visual & Brand ── */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0F2C] to-[#1B2A4A] relative overflow-hidden items-center justify-center p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#6f88ad] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#afc8f0] blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-xl text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center gap-3 text-white mb-12">
            <img src="/logo.png" alt="ENAKO OS" className="w-10 h-10 rounded-xl shadow-sm object-contain" />
            <h2 className="text-2xl font-bold tracking-tight font-display uppercase">ENAKO OS</h2>
          </div>

          <h1 className="text-white font-display text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight font-black">
            Sovereign Financial Control.
          </h1>
          <p className="text-[#6f88ad] text-lg max-w-md mb-10 leading-relaxed">
            Deploy world-class infrastructure for digital assets and traditional finance.
            Secure, compliant, and infinitely scalable for the modern enterprise.
          </p>

          {/* Image placeholder — enterprise server room */}
          <div className="w-full aspect-[4/3] rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl relative">
            <img
              src="/logo.png"
              alt="ENAKO OS Logo"
              className="w-full h-full object-contain opacity-90 p-8"
              loading="lazy"
            />
            {/* Security badge overlay */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Security Status</span>
              </div>
              <div className="text-white font-bold text-sm">Active · Tier 4</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Panel: Login Form ── */}
      <section className="w-full lg:w-1/2 bg-surface flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile & Tablet Real Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/logo.png" alt="ENAKO OS Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl tracking-tight text-[#0F172A] leading-none">ENAKO</span>
              <span className="text-[10px] font-bold tracking-widest text-[#0066FF] uppercase mt-0.5">CLOUD SYSTEM</span>
            </div>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider text-slate-500">
                Select Workspace / Role
              </label>
              <Link
                to="/select-role"
                className="text-[11px] font-semibold text-[#001f5b] hover:underline"
              >
                All Portals
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLE_OPTIONS.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleChange(r.role)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#001f5b] text-white border-[#001f5b] shadow-2xs ring-2 ring-[#001f5b]/20 scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base mb-1">{r.emoji}</span>
                    <span className="truncate max-w-full font-semibold">{r.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role badge */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border mb-6"
            style={{ borderColor: 'rgba(0,31,91,0.15)', background: 'rgba(0,31,91,0.03)' }}
          >
            <img src="/logo.png" alt="ENAKO OS" className="w-5 h-5 rounded object-contain shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authenticating into</p>
              <p className="font-bold text-[13px] text-[#001f5b] leading-tight truncate">
                {ROLE_LABELS[selectedRole]} ({selectedRole})
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-on-surface font-display text-3xl font-black mb-1">Welcome Back</h2>
            <p className="text-secondary text-base">Authenticate to access your secure workspace.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-2 uppercase tracking-wider" htmlFor="email">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-outline" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary transition-all font-bold"
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider" htmlFor="password">
                  Security Password
                </label>
                <button type="button" className="text-sm font-semibold text-primary-container hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-outline" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary transition-all"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 text-primary-container border-outline-variant rounded focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm text-secondary">
                Trust this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>Sign In to System<ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-8 border-t border-outline-variant">
            <div className="flex justify-center gap-6">
              <button className="text-[11px] font-bold text-outline hover:text-on-surface uppercase tracking-wider">Privacy</button>
              <button className="text-[11px] font-bold text-outline hover:text-on-surface uppercase tracking-wider">Terms</button>
              <button className="text-[11px] font-bold text-outline hover:text-on-surface uppercase tracking-wider">Security</button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
