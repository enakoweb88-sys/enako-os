import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ChevronLeft } from 'lucide-react';
import * as authService from '../services/authService';

type Role = 'CEO' | 'MANAGER' | 'EMPLOYEE';

const ROLE_LABELS: Record<Role, string> = {
  CEO: 'Chief Executive Officer',
  MANAGER: 'Department Manager',
  EMPLOYEE: 'Staff Member',
};

const ROLE_EMOJIS: Record<Role, string> = {
  CEO: '👔',
  MANAGER: '📊',
  EMPLOYEE: '👤',
};

function isValidRole(r: string | null): r is Role {
  return r === 'CEO' || r === 'MANAGER' || r === 'EMPLOYEE';
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const rawRole = searchParams.get('role');
  const selectedRole: Role = isValidRole(rawRole) ? rawRole : 'CEO';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password, selectedRole);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      // If backend is unreachable, offer a descriptive error
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
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
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#000613] to-[#001f3f] relative overflow-hidden items-center justify-center p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#6f88ad] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#afc8f0] blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-xl text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center gap-3 text-white mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
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
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
              alt="Enterprise data centre"
              className="w-full h-full object-cover opacity-80"
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
      <section className="w-full lg:w-1/2 bg-surface flex flex-col justify-center items-center p-8 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-primary text-xl font-bold font-display uppercase">ENAKO OS</h2>
          </div>

          {/* Back to role selection */}
          <Link
            to="/select-role"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary uppercase tracking-wider hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Change Role
          </Link>

          {/* Role badge */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border mb-8"
            style={{ borderColor: 'rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)' }}
          >
            <span className="text-xl">{ROLE_EMOJIS[selectedRole]}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Logging in as</p>
              <p className="font-bold text-[14px] text-[#2563EB] leading-tight">{selectedRole} — {ROLE_LABELS[selectedRole]}</p>
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

          {/* Dev credentials hint */}
          <details className="mt-8 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low text-[11px]">
            <summary className="font-bold uppercase tracking-wider text-secondary cursor-pointer select-none">
              🔑 Test Credentials (Dev)
            </summary>
            <div className="mt-3 space-y-2 font-mono text-secondary">
              <p><span className="text-primary font-bold">CEO:</span> ceo@enako.os / EnakoOS@CEO2025</p>
              <p><span className="text-primary font-bold">MGR:</span> manager@enako.os / EnakoOS@Mgr2025</p>
              <p><span className="text-primary font-bold">EMP:</span> employee@enako.os / EnakoOS@Emp2025</p>
            </div>
          </details>

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
