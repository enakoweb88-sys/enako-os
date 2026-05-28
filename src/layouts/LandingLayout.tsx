import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[15px] text-[#0f172a] tracking-tight leading-none block">ENAKO OS</span>
              <span className="text-[9px] text-gray-400 tracking-widest uppercase font-semibold leading-none block mt-0.5">Enterprise Operating System</span>
            </div>
          </Link>

          {/* Access Workspace Button */}
          <Link
            to="/select-role"
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#2563EB] text-[#2563EB] rounded-lg text-[12px] font-bold uppercase tracking-wider hover:bg-[#2563EB] hover:text-white transition-all duration-200"
          >
            <Lock className="w-3.5 h-3.5" />
            Access Workspace
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-[73px]">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6">
        <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          © 2025 ENAKO. All rights reserved.
          <span className="text-gray-300">·</span>
          <ShieldCheck className="w-4 h-4 text-gray-400 inline" />
          Internal Enterprise System
        </p>
      </footer>
    </div>
  );
}
