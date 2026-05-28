import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShieldCheck,
  Wallet,
  Target,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Search,
  HelpCircle,
  MessageSquare,
  UtensilsCrossed,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/app/dashboard' },
  { icon: Users,           label: 'Employees',      path: '/app/employees' },
  { icon: CreditCard,      label: 'Transactions',   path: '/app/transactions' },
  { icon: ShieldCheck,     label: 'KYC Compliance', path: '/app/kyc' },
  { icon: Wallet,          label: 'Expenses',       path: '/app/expenses' },
  { icon: Target,          label: 'Goals & KPIs',   path: '/app/goals' },
  { icon: MessageSquare,   label: 'Communications', path: '/app/chat' },
  { icon: UtensilsCrossed, label: 'Staff Meals',    path: '/app/meals' },
  { icon: Bell,            label: 'Announcements',  path: '/app/announcements' },
  { icon: BarChart3,       label: 'Reports',        path: '/app/reports' },
  { icon: User,            label: 'Profile',        path: '/app/profile' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const role = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const fullName = user?.fullName ?? 'Executive';
  const email = user?.email ?? '';

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    api.notifications()
      .then(notifs => setUnreadCount(notifs.filter((n: any) => !n.readAt).length))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const filteredNavItems = navItems.filter((item) => {
    if (role === 'employee') {
      return ['Dashboard', 'Expenses', 'Staff Meals', 'Communications', 'Announcements', 'Profile'].includes(item.label);
    }
    if (role === 'manager') {
      return !['Investments', 'Settings'].includes(item.label);
    }
    return true; // CEO sees everything
  });

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col">
        <div className="px-6 py-8">
          <NavLink to="/" className="font-display text-2xl tracking-tighter font-bold text-primary block hover:opacity-80 transition-opacity">
            ENAKO OS
          </NavLink>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-8 scrollbar-hide">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-secondary hover:bg-surface-container-high/50',
                )
              }
            >
              <item.icon
                className={cn(
                  'w-5 h-5',
                  location.pathname === item.path ? 'text-on-primary-container' : 'text-secondary group-hover:text-primary transition-colors',
                )}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 border-t border-outline-variant/20 mt-4">
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                  isActive ? 'bg-primary-container text-on-primary-container' : 'text-secondary hover:bg-surface-container-high/50',
                )
              }
            >
              <Settings className="w-5 h-5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* User strip */}
        <div className="p-4 bg-surface-container mt-auto">
          <div className="flex items-center gap-3">
            <NavLink to="/app/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
              <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden ring-2 ring-white flex items-center justify-center text-primary font-black text-sm uppercase group-hover:ring-primary/20 transition-all">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-primary truncate uppercase tracking-wider group-hover:text-primary-container transition-colors">
                  {fullName}
                </p>
                <p className="text-[10px] text-secondary uppercase font-bold tracking-tighter truncate">
                  {email || role}
                </p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-64 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-8 py-4">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Search enterprise-wide data…"
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-on-primary-container focus:border-on-primary-container text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-6">
              <button className="relative text-secondary hover:text-primary transition-colors">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-error rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button className="text-secondary hover:text-primary transition-colors">
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">ENAKO OS CORE</span>
              <span className="text-[10px] text-on-primary-container font-mono">SERVER: EST-US-01 [ACTIVE]</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-surface-container-low border-t border-outline-variant/30 px-8 py-4 flex justify-between items-center mt-auto">
          <p className="text-[11px] text-secondary">© 2025 ENAKO OS. Secure Enterprise Operations.</p>
          <div className="flex gap-6">
            <button className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider">API Docs</button>
            <button className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider">Compliance</button>
            <button className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider">Support</button>
          </div>
        </footer>
      </main>
    </div>
  );
}
