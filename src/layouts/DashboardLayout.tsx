import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard, Users, CreditCard, ShieldCheck, Wallet, Target,
  Bell, BarChart3, Settings, LogOut, Search, HelpCircle,
  MessageSquare, UtensilsCrossed, User, Briefcase, Megaphone,
  Headphones, ClipboardList, TrendingUp, Menu, ChevronLeft, ChevronRight,
  PenTool, Calendar, FileText, Mail
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard', roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
  { icon: Users, label: 'Employees', path: '/app/employees', roles: ['ceo', 'manager', 'admin'] },
  { icon: CreditCard, label: 'Transactions', path: '/app/transactions', roles: ['ceo', 'manager', 'finance'] },
  { icon: Wallet, label: 'Expenses', path: '/app/expenses', roles: ['ceo', 'manager', 'finance', 'employee'] },
  { icon: ShieldCheck, label: 'KYC Compliance', path: '/app/kyc', roles: ['ceo', 'manager', 'bd', 'support'] },
  { icon: Target, label: 'Goals & KPIs', path: '/app/goals', roles: ['ceo', 'manager', 'bd', 'digital'] },
  { icon: Megaphone, label: 'Marketing', path: '/app/marketing', roles: ['ceo', 'digital', 'bd'] },
  { icon: MessageSquare, label: 'Communications', path: '/app/chat', roles: ['ceo', 'manager', 'support', 'bd', 'digital', 'employee', 'outreach_manager'] },
  { icon: Headphones, label: 'Support Tickets', path: '/app/tickets', roles: ['ceo', 'support'] },
  { icon: UtensilsCrossed, label: 'Staff Meals', path: '/app/meals', roles: ['ceo', 'manager', 'admin', 'employee'] },
  { icon: Bell, label: 'Announcements', path: '/app/announcements', roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
  { icon: BarChart3, label: 'Reports', path: '/app/reports', roles: ['ceo', 'manager', 'finance', 'admin'] },
  { icon: CreditCard, label: 'Subscriptions', path: '/app/subscriptions', roles: ['ceo', 'manager', 'finance', 'admin', 'employee'] },
  
  // Outreach Manager specifics
  { icon: PenTool, label: 'Blog & Content', path: '/app/outreach/cms', roles: ['outreach_manager'] },
  { icon: Calendar, label: 'Events & Fundraisers', path: '/app/outreach/events', roles: ['outreach_manager'] },
  { icon: FileText, label: 'Applications', path: '/app/outreach/applications', roles: ['outreach_manager'] },
  { icon: Mail, label: 'Newsletters', path: '/app/outreach/newsletters', roles: ['outreach_manager'] },

  { icon: User, label: 'Profile', path: '/app/profile', roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
      .then(notifs => {
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.readAt).length);
      })
      .catch(() => { });
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    setShowNotif(false);
  };

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex">
      <Toaster position="top-center" richColors />
      {/* ── Sidebar ── */}
      <aside className={cn("fixed left-0 top-0 bottom-0 bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col transition-all duration-300", sidebarOpen ? "w-64" : "w-20")}>
        <div className="px-6 py-8 flex items-center justify-between">
          <NavLink to="/" className={cn("flex items-center gap-2.5 hover:opacity-80 transition-opacity", !sidebarOpen && "justify-center w-full")}>
            <img src="/logo.png" alt="ENAKO OS" className="w-8 h-8 rounded-md object-contain shrink-0" />
            {sidebarOpen && <span className="font-display text-xl tracking-tighter font-bold text-primary whitespace-nowrap">ENAKO OS</span>}
          </NavLink>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-8 scrollbar-hide">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 py-2 rounded-lg transition-all duration-200 group',
                  sidebarOpen ? 'px-3' : 'justify-center',
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-secondary hover:bg-surface-container-high/50',
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 shrink-0',
                  location.pathname === item.path ? 'text-on-primary-container' : 'text-secondary group-hover:text-primary transition-colors',
                )}
              />
              {sidebarOpen && <span className="text-[11px] font-bold uppercase tracking-wider truncate">{item.label}</span>}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-outline-variant/20 mt-4">
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 py-2 rounded-lg transition-all duration-200 group',
                  sidebarOpen ? 'px-3' : 'justify-center',
                  isActive ? 'bg-primary-container text-on-primary-container' : 'text-secondary hover:bg-surface-container-high/50',
                )
              }
              title={!sidebarOpen ? 'Settings' : undefined}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-[11px] font-bold uppercase tracking-wider truncate">Settings</span>}
            </NavLink>
          </div>
        </nav>

        {/* User strip */}
        <div className={cn("p-4 bg-surface-container mt-auto flex", sidebarOpen ? "items-center gap-3" : "flex-col gap-3 items-center justify-center")}>
          <NavLink to="/app/profile" className={cn("flex items-center group flex-1 min-w-0", sidebarOpen ? "gap-3" : "justify-center")} title={!sidebarOpen ? fullName : undefined}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-primary-fixed overflow-hidden ring-2 ring-white flex items-center justify-center text-primary font-black text-sm uppercase group-hover:ring-primary/20 transition-all">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-primary truncate uppercase tracking-wider group-hover:text-primary-container transition-colors">
                  {fullName}
                </p>
                <p className="text-[10px] text-secondary uppercase font-bold tracking-tighter truncate">
                  {email || role}
                </p>
              </div>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={cn("flex-1 min-w-0 flex flex-col transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-8 py-4">
          <div className="flex items-center flex-1 max-w-xl gap-4" ref={searchRef}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-secondary hover:bg-surface-container rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(e.target.value.length > 0); }}
                onFocus={() => { if (searchQuery.length > 0) setShowSearch(true); }}
                placeholder="Search enterprise-wide data…"
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-on-primary-container focus:border-on-primary-container text-sm transition-all outline-none"
              />

              {/* Global Search Dropdown */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-full bg-white border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                      <p className="px-3 py-1 text-[9px] font-bold text-secondary uppercase tracking-widest">Transactions</p>
                      <button onClick={() => navigate('/app/transactions')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <div><p className="text-sm font-bold text-primary">TX-99824</p><p className="text-[10px] text-secondary">Acme Corp • 150,000 FCFA</p></div>
                      </button>
                      <p className="px-3 py-1 text-[9px] font-bold text-secondary uppercase tracking-widest mt-2">Employees</p>
                      <button onClick={() => navigate('/app/employees')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-3">
                        <User className="w-4 h-4 text-green-600" />
                        <div><p className="text-sm font-bold text-primary">Sarah Jenkins</p><p className="text-[10px] text-secondary">BD Officer</p></div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-6 relative">
              {/* Messages Inbox */}
              <button onClick={() => navigate('/app/chat')} className="relative text-secondary hover:text-primary transition-colors">
                <MessageSquare className="w-6 h-6" />
              </button>

              {/* Notification Bell */}
              <button onClick={() => setShowNotif(!showNotif)} className="relative text-secondary hover:text-primary transition-colors">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-error rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Help */}
              <button onClick={() => navigate('/app/help')} className="relative text-secondary hover:text-primary transition-colors">
                <HelpCircle className="w-6 h-6" />
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-white border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                      <h4 className="font-bold text-primary">Notifications</h4>
                      <button onClick={markAllRead} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((n, i) => (
                        <div key={i} className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${!n.readAt ? 'bg-primary-fixed/20' : ''}`}>
                          <p className="text-sm font-bold text-primary">{n.title || 'System Alert'}</p>
                          <p className="text-xs text-secondary mt-0.5">{n.content || 'Please check your dashboard.'}</p>
                          <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-widest">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now'}</p>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-secondary text-sm">No new notifications</div>
                      )}
                    </div>
                    <button onClick={() => setShowNotif(false)} className="w-full p-3 text-[10px] font-bold text-secondary uppercase tracking-widest hover:bg-surface-container-low text-center border-t border-outline-variant/20">Close</button>
                  </motion.div>
                )}
              </AnimatePresence>


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
          <p className="text-[11px] text-secondary">©2026 ENAKO OS. Secure Enterprise Operations.</p>
          <div className="flex gap-6">
            <Link to="/app/docs" className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider">API Docs</Link>
            <Link to="/app/kyc" className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider">Compliance</Link>
            <Link to="/app/support" className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider">Support</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
