import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-surface font-sans overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-outline-variant/30 z-[100]">
        <div className="max-w-[1440px] mx-auto px-8 py-5 flex justify-between items-center">
          <Link to="/" className="font-display text-2xl tracking-tighter font-bold text-primary hover:opacity-80 transition-opacity">
            ENAKO OS
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-secondary">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Internal Access Only
            </div>
            <Link to="/login" className="bg-primary text-white text-[11px] font-bold uppercase tracking-widest px-8 py-3 rounded-xl hover:shadow-xl transition-all active:scale-95 shadow-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant/30 px-8 py-6">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between gap-3 text-[11px] font-bold uppercase tracking-widest text-secondary">
          <span>ENAKO OS Core</span>
          <span>Private enterprise operations platform</span>
        </div>
      </footer>
    </div>
  );
}
