import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Target, MapPinned, BarChart3, ClipboardList } from 'lucide-react';
import { useAuth } from '../lib/auth';

/** A deliberately small workspace for field marketers: no admin, finance, API or settings access. */
export default function FieldMarketerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const marketerPaths = ['/app', '/app/dashboard', '/app/marketer/leads', '/app/marketer/territory', '/app/marketer/performance', '/app/marketer/daily-report'];
  if (!marketerPaths.includes(location.pathname)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-[76px] sm:w-60 bg-[#001f5b] text-white flex flex-col shrink-0">
        <div className="h-16 border-b border-white/10 flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-[#001f5b] font-black text-xs flex items-center justify-center">E</div>
          <div className="hidden sm:block leading-tight">
            <p className="font-bold text-sm">ENAKO</p>
            <p className="text-[9px] tracking-widest text-slate-300 uppercase">Field marketer</p>
          </div>
        </div>

        <nav className="p-3 space-y-2">
          {[
            ['/app/dashboard', 'My workspace', LayoutDashboard],
            ['/app/marketer/leads', 'Leads & follow-ups', ClipboardList],
            ['/app/marketer/territory', 'My territory', MapPinned],
            ['/app/marketer/performance', 'My performance', BarChart3],
            ['/app/marketer/daily-report', 'Daily report', Target],
          ].map(([path, label, Icon]: any) => <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold transition-colors ${isActive ? 'bg-[#214f8b] text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}><Icon className="w-5 h-5 shrink-0" /><span className="hidden sm:inline">{label}</span></NavLink>)}
        </nav>

        <div className="mt-auto p-3 border-t border-white/10 space-y-3">
          <div className="hidden sm:flex items-center gap-2 px-2">
            <Target className="w-4 h-4 text-slate-300" />
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.fullName || 'Field Marketer'}</p>
              <p className="text-[10px] text-slate-300">Monthly KPI workspace</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-[#f5f8fc]">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
