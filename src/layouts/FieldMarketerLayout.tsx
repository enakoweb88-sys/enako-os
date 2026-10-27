
import { useEffect, useState } from 'react';

import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  LayoutDashboard,
  LogOut,
  Target,
  MapPinned,
  BarChart3,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';

import { useAuth } from '../lib/auth';

const marketerPaths = [
  '/app',
  '/app/dashboard',
  '/app/marketer/leads',
  '/app/marketer/territory',
  '/app/marketer/performance',
  '/app/marketer/daily-report'
];

const navigationItems = [
  { path: '/app/dashboard', label: 'My workspace', icon: LayoutDashboard },
  { path: '/app/marketer/leads', label: 'Leads & follow-ups', icon: ClipboardList },
  { path: '/app/marketer/territory', label: 'My territory', icon: MapPinned },
  { path: '/app/marketer/performance', label: 'My performance', icon: BarChart3 },
  { path: '/app/marketer/daily-report', label: 'Daily report', icon: Target }
];

export default function FieldMarketerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Tracks whether the mobile sidebar is open
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close with Escape and prevent background scrolling
  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    navigate('/login', { replace: true });
  };

  if (!marketerPaths.includes(location.pathname)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">

      {/* DARK OVERLAY - MOBILE ONLY */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* RESPONSIVE SIDEBAR */}
      <aside
        id="marketer-navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-[#001f5b] text-white
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          md:static md:z-auto md:w-60 md:shrink-0
          md:translate-x-0
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* SIDEBAR HEADER */}
        <div className="h-16 shrink-0 border-b border-white/10 flex items-center px-4 gap-3">

          <img
            src="/logo1.png"
            alt="ENAKO Logo"
            className="w-12 h-12 object-contain shrink-0"
          />

          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-bold text-sm">ENAKO</p>
            <p className="text-[9px] tracking-widest text-slate-300 uppercase">
              Field marketer
            </p>
          </div>

          {/* CLOSE BUTTON - MOBILE ONLY */}
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">

          {navigationItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-[#214f8b] text-white'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

        </nav>

        {/* EMPLOYEE PROFILE AND LOGOUT */}
        <div className="shrink-0 p-3 border-t border-white/10 space-y-3">

          <div className="flex items-center gap-2 px-2">
            <Target className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                {user?.fullName || 'Field Marketer'}
              </p>
              <p className="text-[10px] text-slate-300">
                Monthly KPI workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>

      </aside>

      {/* RIGHT SIDE: MOBILE HEADER AND DASHBOARD */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">

        {/* MOBILE TOP BAR */}
        <header className="md:hidden h-16 shrink-0 bg-[#001f5b] text-white flex items-center gap-3 px-4">

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="marketer-navigation"
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Menu className="w-6 h-6" />
          </button>

          <img
            src="/logo1.png"
            alt="ENAKO Logo"
            className="w-9 h-9 object-contain"
          />

          <div className="leading-tight">
            <p className="text-sm font-bold">ENAKO</p>
            <p className="text-[9px] uppercase tracking-widest text-slate-300">
              Field marketer
            </p>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-[#f5f8fc]">

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>

        </main>

      </div>
    </div>
  );
}
