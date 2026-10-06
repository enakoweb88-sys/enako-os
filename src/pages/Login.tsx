import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Role = 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'OUTREACH_MANAGER';

const ROLE_LABELS: Record<Role, string> = {
  CEO: 'Chief Executive Officer',
  MANAGER: 'Department Manager',
  EMPLOYEE: 'Staff Member',
  OUTREACH_MANAGER: 'Outreach Manager'
};

const ROLE_OPTIONS: { role: Role; label: string; short: string }[] = [
  { role: 'EMPLOYEE', label: 'Staff Member', short: 'Staff' },
  { role: 'MANAGER', label: 'Department Manager', short: 'Manager' },
  { role: 'OUTREACH_MANAGER', label: 'Outreach Manager', short: 'Outreach' },
  { role: 'CEO', label: 'Chief Executive Officer', short: 'CEO' },
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
    <div className="flex min-h-screen w-full font-sans bg-[#FAF9FC]">

      {/* ── Left Panel: Visual & Brand ── */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0F2C] via-[#001F5B] to-[#0A1838] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00C2C7] blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00C2C7] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-xl text-left">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 text-white mb-12 group">
            <img src="/logo.png" alt="ENAKO OS" className="w-10 h-10 rounded-xl shadow-md object-contain group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight uppercase leading-none text-white">ENAKO</span>
              <span className="text-[10px] font-bold tracking-widest text-[#00C2C7] uppercase mt-0.5">CLOUD SYSTEM</span>
            </div>
          </Link>

          <h1 className="text-white font-display text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tight">
            Sovereign Financial <br />
            <span className="text-[#00C2C7]">Control Center.</span>
          </h1>
          <p className="text-slate-300 text-base lg:text-lg max-w-md mb-10 leading-relaxed font-normal">
            Deploy enterprise infrastructure for traditional finance and digital assets. Secure, compliant, and infinitely scalable.
          </p>

          {/* Visual Showcase Card */}
          <div className="w-full aspect-[4/3] rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl relative p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00C2C7]" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">ENAKO OS Core v2.4</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#00C2C7]/20 text-[#00C2C7] text-[10px] font-bold border border-[#00C2C7]/40 uppercase tracking-widest">
                System Online
              </span>
            </div>

            <div className="my-auto text-center py-6">
              <img
                src="/logo.png"
                alt="ENAKO OS Logo"
                className="w-24 h-24 mx-auto object-contain drop-shadow-[0_10px_20px_rgba(0,194,199,0.3)] mb-4"
              />
              <p className="text-white font-extrabold text-lg">Multi-Tier Workspace Authentication</p>
              <p className="text-slate-300 text-xs mt-1">Role-Based Access Control & Audited Operations</p>
            </div>

            {/* Security badge overlay */}
            <div className="bg-black/50 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00C2C7]" />
                <div>
                  <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">Security Layer</span>
                  <span className="text-white font-bold text-xs">256-Bit Encrypted Portal</span>
                </div>
              </div>
              <span className="text-[#00C2C7] text-xs font-black">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Panel: Login Form ── */}
      <section className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile & Tablet Real Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="ENAKO OS Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col text-left">
                <span className="font-black text-xl tracking-tight text-[#0F172A] leading-none">ENAKO</span>
                <span className="text-[10px] font-bold tracking-widest text-[#00C2C7] uppercase mt-0.5">CLOUD SYSTEM</span>
              </div>
            </Link>
          </div>

          {/* Interactive Role Switcher - Redesigned Seamless Segmented Control (NO CARDS, NO EMOJIS) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Workspace / Role
              </label>
              <Link
                to="/select-role"
                className="text-xs font-bold text-[#001F5B] hover:text-[#00C2C7] hover:underline transition-colors flex items-center gap-1"
              >
                <span>All Portals</span>
                <span className="text-[10px]">→</span>
              </Link>
            </div>

            {/* Seamless Segmented Tab Bar */}
            <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/70 shadow-xs">
              {ROLE_OPTIONS.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleChange(r.role)}
                    className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-[#001F5B] text-[#00C2C7] shadow-sm shadow-[#001F5B]/30 font-extrabold scale-[1.01]'
                        : 'text-slate-600 hover:text-[#001F5B] hover:bg-white/80'
                    }`}
                  >
                    {r.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role badge */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border mb-6 transition-all"
            style={{ borderColor: 'rgba(0,194,199,0.25)', background: 'rgba(0,194,199,0.06)' }}
          >
            <img src="/logo.png" alt="ENAKO OS" className="w-5 h-5 rounded object-contain shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#001F5B]">Authenticating into</p>
              <p className="font-extrabold text-sm text-[#001F5B] leading-tight truncate">
                {ROLE_LABELS[selectedRole]} <span className="text-[#00C2C7] font-bold text-xs">({selectedRole})</span>
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-left">
            <h2 className="text-[#0F172A] font-display text-3xl font-black mb-1.5 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-sm sm:text-base">Authenticate to access your workspace portal.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 mb-6 text-left">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 font-semibold leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider" htmlFor="email">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00C2C7]/40 focus:border-[#00C2C7] outline-none transition-all font-semibold text-slate-800"
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">
                  Security Password
                </label>
                <button type="button" className="text-xs font-bold text-[#001F5B] hover:text-[#00C2C7] hover:underline transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00C2C7]/40 focus:border-[#00C2C7] outline-none transition-all font-medium text-slate-800"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 text-[#001F5B] border-slate-300 rounded focus:ring-[#00C2C7]"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600">
                Trust this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 bg-[#001F5B] hover:bg-[#001540] text-white rounded-xl font-extrabold shadow-lg shadow-[#001F5B]/25 hover:shadow-xl hover:shadow-[#001F5B]/35 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00C2C7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="ml-2 w-5 h-5 text-[#00C2C7]" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex justify-center gap-6 text-[#001F5B]">
              <button className="text-[11px] font-bold hover:text-[#00C2C7] uppercase tracking-wider transition-colors cursor-pointer">Privacy Policy</button>
              <button className="text-[11px] font-bold hover:text-[#00C2C7] uppercase tracking-wider transition-colors cursor-pointer">Terms of Service</button>
              <button className="text-[11px] font-bold hover:text-[#00C2C7] uppercase tracking-wider transition-colors cursor-pointer">Security Audits</button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

