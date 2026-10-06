import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef, useMemo } from 'react';
import {
  LayoutDashboard, CreditCard, Wallet, DollarSign, TrendingUp,
  ClipboardList, UtensilsCrossed, Target, Users, Calendar, User,
  ShieldCheck, MessageSquare, Headphones, Bell, Megaphone,
  Share2, PenTool, Globe, Building2, BookOpen, Heart, FileText,
  Mail, HelpCircle, Settings, LogOut, Search, Menu,
  ChevronLeft, ChevronRight, ChevronDown, Plus, X, Home,
  SlidersHorizontal, CheckSquare, Eye, Loader2, UserCheck, Clock,
  Code, Lock, Layers, HeartHandshake, Coins, Code2, History
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

interface SubNavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string | number;
  roles: string[];
}

interface NavSection {
  title: string;
  items: SubNavItem[];
}

interface RailCategory {
  id: string;
  label: string;
  icon: any;
  landingPath?: string;
  actionButton: {
    label: string;
    path: string;
  };
  sections: NavSection[];
  views?: { label: string; count?: number | string; path?: string; icon?: any; subtitle?: string; hasDropdown?: boolean; dropdownType?: string }[];
  roles: string[];
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  
  // Dual-sidebar state
  const [subSidebarOpen, setSubSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Departments & Security dropdown in Quick View
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(true);
  const [securityDropdownOpen, setSecurityDropdownOpen] = useState(true);
  const [hrActiveDepts, setHrActiveDepts] = useState<string[]>([]);

  const [announcement, setAnnouncement] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showNotifBanner, setShowNotifBanner] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const userRole = (user?.role ?? 'EMPLOYEE').toLowerCase();
  const userDept = (user?.department?.name || user?.department || '').toString().toLowerCase();

  const getEffectiveRole = () => {
    if (userRole === 'ceo') return 'ceo';
    if (userRole === 'manager') return 'manager';
    if (userRole === 'outreach_manager' || userDept.includes('outreach')) return 'outreach_manager';
    if (userRole === 'digital' || userDept.includes('digital') || userDept.includes('marketing')) return 'digital';
    if (userRole === 'finance' || userDept.includes('finance') || userDept.includes('account')) return 'finance';
    if (userRole === 'bd' || userDept.includes('business') || userDept.includes('sales') || userDept.includes('bd')) return 'bd';
    if (userRole === 'support' || userDept.includes('support') || userDept.includes('customer')) return 'support';
    if (userRole === 'admin' || userDept.includes('admin') || userDept.includes('hr')) return 'admin';
    return userRole;
  };

  const role = getEffectiveRole();
  const fullName = user?.fullName ?? 'Executive User';
  const email = user?.email ?? '';

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  // Route to Rail Category Resolver
  const getCategoryForPath = (path: string): string => {
    if (path.startsWith('/app/dashboard') || path.startsWith('/app/reports') || path.startsWith('/app/metrics')) {
      return 'dashboard';
    }
    if (
      path.startsWith('/app/transactions') ||
      path.startsWith('/app/expenses') ||
      path.startsWith('/app/cash-collections') ||
      path.startsWith('/app/subscriptions')
    ) {
      return 'finance';
    }
    if (
      path.startsWith('/app/tasks') ||
      path.startsWith('/app/goals') ||
      path.startsWith('/app/meals')
    ) {
      return 'operations';
    }
    if (
      path.startsWith('/app/employees') ||
      path.startsWith('/app/leaves') ||
      path.startsWith('/app/profile')
    ) {
      return 'team';
    }
    if (path.startsWith('/app/kyc')) {
      return 'compliance';
    }
    if (
      path.startsWith('/app/chat') ||
      path.startsWith('/app/tickets') ||
      path.startsWith('/app/announcements')
    ) {
      return 'comms';
    }
    if (
      path.startsWith('/app/marketing') ||
      path.startsWith('/app/content') ||
      path.startsWith('/app/leads')
    ) {
      return 'marketing';
    }
    if (path.startsWith('/app/websites') || path.startsWith('/app/outreach')) {
      return 'websites';
    }
    if (path.startsWith('/app/apis') || path.startsWith('/app/api') || path.startsWith('/app/docs')) {
      return 'apis';
    }
    if (path.startsWith('/app/security')) {
      return 'security';
    }
    if (
      path.startsWith('/app/help') ||
      path.startsWith('/app/settings')
    ) {
      return 'docs';
    }
    return 'dashboard';
  };

  const [activeCategory, setActiveCategory] = useState<string>(() => getCategoryForPath(location.pathname));
  const [activeHash, setActiveHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  useEffect(() => {
    setActiveHash(location.hash);
  }, [location.pathname, location.hash]);

  // Sync category when user navigates
  useEffect(() => {
    const matchedCategory = getCategoryForPath(location.pathname);
    setActiveCategory(matchedCategory);
  }, [location.pathname]);

  // Fetch departments with active assigned employees for HR Quick View
  useEffect(() => {
    if (location.pathname.startsWith('/app/employees')) {
      api.employees({ limit: 1000 }).then(res => {
        const items: any[] = res?.items || [];
        const depts = Array.from(new Set(items.map((e: any) => (e.department || '').trim()).filter(Boolean))) as string[];
        setHrActiveDepts(depts.sort());
      }).catch(console.error);
    }
  }, [location.pathname]);

  const getWebsitesSections = (pathname: string): NavSection[] => {
    const baseSection: NavSection = {
      title: 'DIGITAL PLATFORMS & PORTALS',
      items: [
        { label: 'All Online Platforms', path: '/app/websites', icon: Layers, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
        { label: 'Main Website', path: '/app/websites/main', icon: Globe, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
        { label: 'Outreach Website', path: '/app/websites/outreach', icon: HeartHandshake, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
        { label: 'KYC Vault Website', path: '/app/websites/kyc', icon: ShieldCheck, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
        { label: 'Cash Collection Website', path: '/app/websites/cash', icon: Coins, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
        { label: 'System API Website', path: '/app/websites/apis', icon: Code2, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
      ]
    };

    // If on All Websites page (/app/websites), do NOT show TELEMETRY & INITIATIVES section
    const cleanPath = pathname.split('?')[0].replace(/\/+$/, '');
    if (cleanPath === '/app/websites' || cleanPath === '/app/websites/all') {
      return [baseSection];
    }

    if (pathname.startsWith('/app/websites/main')) {
      return [
        baseSection,
        {
          title: 'TELEMETRY & INITIATIVES',
          items: [
            { label: 'Web Insights & SEO', path: '/app/websites/main/insights', icon: TrendingUp, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Projects & Initiatives', path: '/app/websites/main/projects', icon: Building2, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Beneficiary Applications', path: '/app/websites/main/applications', icon: FileText, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
          ]
        }
      ];
    }

    if (pathname.startsWith('/app/websites/outreach') || pathname.startsWith('/app/outreach')) {
      return [
        baseSection,
        {
          title: 'TELEMETRY & INITIATIVES',
          items: [
            { label: 'Web Insights & SEO', path: '/app/websites/outreach/insights', icon: TrendingUp, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Projects & Initiatives', path: '/app/websites/outreach/projects', icon: Building2, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Beneficiary Applications', path: '/app/websites/outreach/applications', icon: FileText, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Events & Fundraisers', path: '/app/websites/outreach/events', icon: Calendar, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Donations & CSR', path: '/app/websites/outreach/donations', icon: Heart, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
          ]
        }
      ];
    }

    if (pathname.startsWith('/app/websites/kyc')) {
      return [
        baseSection,
        {
          title: 'TELEMETRY & INITIATIVES',
          items: [
            { label: 'Web Insights & SEO', path: '/app/websites/kyc/insights', icon: TrendingUp, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Projects & Initiatives', path: '/app/websites/kyc/projects', icon: Building2, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Beneficiary Applications', path: '/app/websites/kyc/applications', icon: FileText, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
          ]
        }
      ];
    }

    if (pathname.startsWith('/app/websites/cash')) {
      return [
        baseSection,
        {
          title: 'TELEMETRY & INITIATIVES',
          items: [
            { label: 'Web Insights & SEO', path: '/app/websites/cash/insights', icon: TrendingUp, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Projects & Initiatives', path: '/app/websites/cash/projects', icon: Building2, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Beneficiary Applications', path: '/app/websites/cash/applications', icon: FileText, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
          ]
        }
      ];
    }

    if (pathname.startsWith('/app/websites/apis')) {
      return [
        baseSection,
        {
          title: 'TELEMETRY & INITIATIVES',
          items: [
            { label: 'Web Insights & SEO', path: '/app/websites/apis/insights', icon: TrendingUp, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Projects & Initiatives', path: '/app/websites/apis/projects', icon: Building2, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
            { label: 'Beneficiary Applications', path: '/app/websites/apis/applications', icon: FileText, roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'] },
          ]
        }
      ];
    }

    return [baseSection];
  };

  // Perfectly grouped categories with real system page names that march together
  const railCategories: RailCategory[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      landingPath: '/app/dashboard',
      actionButton: { label: '+ View Reports', path: '/app/reports' },
      roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'],
      sections: [
        {
          title: 'EXECUTIVE OVERVIEW',
          items: [
            { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
            { label: 'System Reports', path: '/app/reports', icon: FileText, roles: ['ceo', 'manager', 'finance', 'admin', 'outreach_manager'] },
          ]
        }
      ],
      views: [
        {
          label: 'Recent Financial Transactions',
          subtitle: 'Live transaction activity across all business units',
          path: '/app/dashboard#recent-transactions',
          icon: CreditCard
        },
        {
          label: 'Live Field Cash Collections Stream',
          subtitle: 'Real-time field cash flow stream',
          path: '/app/dashboard#cash-collections',
          icon: Wallet
        },
        {
          label: 'Market Command & Rate Matrix',
          subtitle: 'Live buying & selling exchange rates',
          path: '/app/dashboard#exchange-rates',
          icon: TrendingUp
        }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: CreditCard,
      landingPath: '/app/expenses',
      actionButton: { label: '+ New Expense', path: '/app/expenses/new' },
      roles: ['ceo', 'manager', 'finance', 'admin', 'employee', 'outreach_manager'],
      sections: [
        {
          title: 'FINANCE & ACCOUNTS',
          items: [
            { label: 'Expenses', path: '/app/expenses', icon: Wallet, roles: ['ceo', 'manager', 'finance', 'employee'] },
            { label: 'Cash Collections', path: '/app/cash-collections', icon: DollarSign, roles: ['ceo', 'manager', 'finance', 'admin', 'outreach_manager'] },
            { label: 'Subscriptions', path: '/app/subscriptions', icon: CreditCard, roles: ['ceo', 'manager', 'finance', 'admin', 'employee', 'outreach_manager'] },
          ]
        }
      ],
      views: location.pathname.startsWith('/app/subscriptions')
        ? [
            {
              label: 'Add Subscription',
              subtitle: 'Log enterprise software contract',
              path: '/app/subscriptions/new',
              icon: Plus
            }
          ]
        : location.pathname.startsWith('/app/cash-collections')
        ? [
            {
              label: 'Create Cash Task',
              subtitle: 'Assign field collection pickup',
              path: '/app/cash-collections/new',
              icon: Plus
            }
          ]
        : [
            {
              label: 'New Expense',
              subtitle: 'Submit reimbursement claim',
              path: '/app/expenses/new',
              icon: Plus
            },
            {
              label: 'Pending Approvals',
              subtitle: 'Awaiting CEO & manager review',
              path: '/app/expenses/pending',
              icon: Clock
            }
          ]
    },
    {
      id: 'comms',
      label: 'Messages',
      icon: Mail,
      landingPath: '/app/chat',
      actionButton: { label: '+ New Message', path: '/app/chat' },
      roles: ['ceo', 'manager', 'support', 'bd', 'digital', 'employee', 'outreach_manager', 'finance', 'admin'],
      sections: [
        {
          title: 'COMMUNICATIONS',
          items: [
            { label: 'Communications', path: '/app/chat', icon: MessageSquare, roles: ['ceo', 'manager', 'support', 'bd', 'digital', 'employee', 'outreach_manager'] },
            { label: 'Support Tickets', path: '/app/tickets', icon: Headphones, roles: ['ceo', 'support', 'manager', 'outreach_manager'] },
            { label: 'Announcements', path: '/app/announcements', icon: Bell, badge: announcement ? '1' : undefined, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
          ]
        }
      ],
      views: []
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      landingPath: '/app/marketing/accounts',
      actionButton: { label: '+ Create Post', path: '/app/marketing/create-post' },
      roles: ['digital'],
      sections: [
        {
          title: 'DIGITAL MARKETING',
          items: [
            { label: 'Social Accounts', path: '/app/marketing/accounts', icon: Share2, roles: ['digital'] },
            { label: 'Create Post & AI Studio', path: '/app/marketing/create-post', icon: PenTool, roles: ['digital'] },
            { label: 'Ad Campaigns', path: '/app/marketing/campaigns', icon: Megaphone, roles: ['digital'] },
            { label: 'Content Posts & Schedule', path: '/app/content', icon: ClipboardList, roles: ['digital'] },
            { label: 'Marketing Leads', path: '/app/leads', icon: Users, roles: ['digital'] },
          ]
        }
      ],
      views: [
        { label: 'Scheduled Content', path: '/app/content' },
        { label: 'Active Ad Campaigns', path: '/app/marketing/campaigns' },
        { label: 'New Inbound Leads', path: '/app/leads' }
      ]
    },
    {
      id: 'websites',
      label: 'Websites',
      icon: Globe,
      landingPath: '/app/websites',
      actionButton: { label: '+ Platform Telemetry', path: '/app/websites' },
      roles: ['outreach_manager', 'ceo', 'manager', 'digital', 'admin', 'finance', 'bd', 'support', 'employee'],
      sections: getWebsitesSections(location.pathname),
      views: []
    },
    {
      id: 'docs',
      label: 'Docs',
      icon: BookOpen,
      landingPath: '/app/help',
      actionButton: { label: '+ Help Center', path: '/app/help' },
      roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'],
      sections: [
        {
          title: 'RESOURCES & SYSTEM',
          items: [
            { label: 'Help & Support', path: '/app/help', icon: HelpCircle, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
            { label: 'API Docs', path: '/app/docs', icon: FileText, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
            { label: 'Settings', path: '/app/settings', icon: Settings, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
          ]
        }
      ],
      views: [
        { label: 'Knowledge Base', path: '/app/help/knowledge-base' },
        { label: 'API Specifications', path: '/app/apis' },
        { label: 'Account Preferences', path: '/app/settings/preferences' }
      ]
    },
    {
      id: 'apis',
      label: "API's",
      icon: Code,
      landingPath: '/app/apis',
      actionButton: { label: '+ Core Endpoints', path: '/app/apis' },
      roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'],
      sections: [
        {
          title: 'DEVELOPER & API PORTAL',
          items: [
            { label: 'API Specifications', path: '/app/apis', icon: Code, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
            { label: 'API Documentation', path: '/app/docs', icon: FileText, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
          ]
        }
      ],
      views: location.pathname.startsWith('/app/docs')
        ? [
            { label: 'Overview & Architecture', subtitle: 'REST principles & base URLs', path: '/app/docs#overview' },
            { label: 'Authentication & Tokens', subtitle: 'Bearer JWT & header format', path: '/app/docs#authentication' },
            { label: 'Rate Limits & Quotas', subtitle: 'Tiered thresholds & 429 backoff', path: '/app/docs#rate-limits' },
            { label: 'Error Codes & Handling', subtitle: 'RFC 7807 machine-readable codes', path: '/app/docs#error-handling' },
            { label: 'Webhooks & Event Delivery', subtitle: 'HMAC SHA-256 signed events', path: '/app/docs#webhooks' },
          ]
        : [
            { label: 'Transactions API', subtitle: 'Ledger, rates & exchange ops', path: '/app/apis#transactions' },
            { label: 'KYC & Verification API', subtitle: 'Submissions & compliance audit', path: '/app/apis#kyc' },
            { label: 'Employees & Roster API', subtitle: 'Operative profiles & clearance', path: '/app/apis#employees' },
            { label: 'Cash Collections API', subtitle: 'Vault drops & audited envelopes', path: '/app/apis#cash' },
            { label: 'System & Health API', subtitle: 'Gateway uptime & latency telemetry', path: '/app/apis#system' },
          ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: Lock,
      landingPath: '/app/security',
      actionButton: { label: '+ Security Vault', path: '/app/security' },
      roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'],
      sections: [
        {
          title: 'ACCESS & CREDENTIALS',
          items: [
            { label: 'Profile ID & Security Vault', path: '/app/security', icon: Lock, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
            { label: 'System Audit', path: '/app/security/audit', icon: History, roles: ['ceo', 'manager', 'finance', 'bd', 'digital', 'support', 'admin', 'employee', 'outreach_manager'] },
          ]
        }
      ],
      views: [
        { label: 'Profile ID & Credential', subtitle: 'Corporate verified identity token', path: '/app/security#profile-id' },
        { label: 'Password Governance', subtitle: 'Argon2id encrypted access keys', path: '/app/security#password' },
        { label: 'Two-Factor Authentication', subtitle: 'TOTP 2FA & recovery codes', path: '/app/security#mfa' },
        { label: 'Active Device Sessions', subtitle: 'Hardware bindings & active sessions', path: '/app/security#sessions' },
      ]
    }
  ], [announcement, unreadCount, location.pathname]);

  // Filter rail categories by user role
  const accessibleCategories = useMemo(() => {
    return railCategories.filter(cat => {
      if (cat.roles.includes(role)) return true;
      return cat.sections.some(s => s.items.some(item => item.roles.includes(role)));
    });
  }, [railCategories, role]);

  // Current active category configuration
  const currentCategory = useMemo(() => {
    return accessibleCategories.find(c => c.id === activeCategory) || accessibleCategories[0] || railCategories[0];
  }, [accessibleCategories, activeCategory]);

  // Handle clicking a rail category icon
  const handleRailClick = (cat: RailCategory) => {
    setActiveCategory(cat.id);
    setSubSidebarOpen(true);

    // Determine target landing path for this category
    let target = cat.landingPath;
    if (!target) {
      for (const sec of cat.sections) {
        const item = sec.items.find(it => it.roles.includes(role));
        if (item) {
          target = item.path;
          break;
        }
      }
    }
    if (!target) {
      target = cat.sections[0]?.items[0]?.path || '/app/dashboard';
    }

    // Always navigate to the category landing page if user is not already exactly on that page (or if hash is present)
    if (location.pathname !== target || location.hash) {
      navigate(target);
    }
  };

  // Global search & notifications listeners
  useEffect(() => {
    api.notifications()
      .then(notifs => {
        const arr = Array.isArray(notifs) ? notifs : [];
        setNotifications(arr);
        setUnreadCount(arr.filter((n: any) => !n.readAt).length);
      })
      .catch(() => { });

    api.announcements()
      .then(anns => {
        const activeAnns = Array.isArray(anns) ? anns : [];
        if (activeAnns.length > 0) {
          setAnnouncement(activeAnns[0]);
        }
      })
      .catch(() => { });
  }, [location.pathname]);

  // Search debouncing
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = searchQuery.toLowerCase();
        const localMatches: any[] = [];
        
        railCategories.forEach(cat => {
          cat.sections.forEach(sec => {
            sec.items.forEach(it => {
              if (it.roles.includes(role) && it.label.toLowerCase().includes(q)) {
                localMatches.push({
                  id: `nav-${it.path}`,
                  type: 'PAGE',
                  title: it.label,
                  subtitle: `${cat.label} • Navigation`,
                  link: it.path
                });
              }
            });
          });
        });

        const results = await api.globalSearch(searchQuery);
        setSearchResults([...localMatches, ...(results || [])]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, railCategories, role]);

  const handleLogout = async () => {
    await logout();
    navigate('/select-role');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    setShowNotif(false);
  };

  // Close search dropdown on click outside
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
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden font-sans text-slate-800">
      <Toaster position="top-center" richColors />

      {/* ── Mobile Overlay Backdrop ── */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden transition-opacity"
        />
      )}

      {/* ── TIER 1: PRIMARY RAIL (Pure White, 88px width) ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[88px] bg-white border-r border-slate-200/90 z-50 flex flex-col items-center py-3 transition-transform duration-200 shadow-[1px_0_6px_rgba(0,0,0,0.02)]",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand / Logo Top */}
        <Link
          to="/app/dashboard"
          className="h-14 w-full flex items-center justify-center hover:opacity-85 transition-opacity border-b border-slate-100 mb-2 px-2"
          title="ENAKO Workplace Home"
        >
          <img src="/logo.png" alt="ENAKO OS" className="w-9 h-9 rounded-lg object-contain p-0.5" />
        </Link>

        {/* Primary Rail Category Icons */}
        <nav className="flex-1 w-full flex flex-col items-center gap-2.5 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
          {accessibleCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleRailClick(cat)}
                className={cn(
                  "relative w-full py-3.5 px-1.5 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer",
                  isActive ? "text-[#001f5b]" : "text-slate-500 hover:text-slate-900"
                )}
                title={cat.label}
              >
                {/* Active Pill Indicator on left border - ENAKO Oxford Navy #001f5b */}
                {isActive && (
                  <motion.div
                    layoutId="railActiveIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-8 bg-[#001f5b] rounded-r-full shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon Container with subtle background when active */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-[#001f5b]/10 text-[#001f5b] ring-1 ring-[#001f5b]/30 shadow-xs font-bold"
                      : "text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-900"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11.5px] tracking-tight leading-tight text-center max-w-[80px] break-words",
                    isActive ? "font-bold text-slate-900" : "font-medium text-slate-500 group-hover:text-slate-800"
                  )}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Rail Bottom Actions (Settings, Avatar, Logout) */}
        <div className="w-full flex flex-col items-center gap-2 pt-2 border-t border-slate-100">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors group",
                isActive ? "bg-[#001f5b]/10 text-[#001f5b]" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              )
            }
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/app/profile"
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700 hover:ring-2 hover:ring-[#001f5b] transition-all"
            title={fullName}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── TIER 2: SECONDARY SUB-SIDEBAR (Clean White Panel, 240px width) ── */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 w-[240px] bg-[#FCFDFE] border-r border-slate-200/90 z-40 flex flex-col transition-all duration-200 shadow-[1px_0_4px_rgba(0,0,0,0.02)]",
          subSidebarOpen ? "left-[88px] translate-x-0" : "left-[88px] -translate-x-[240px] pointer-events-none opacity-0 md:opacity-0",
          mobileDrawerOpen && subSidebarOpen ? "translate-x-0" : ""
        )}
      >
        {/* Sub-Sidebar Top Header with Collapse/Minimize Button */}
        <div className="p-3.5 pb-2.5 border-b border-slate-100/90 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white bg-[#001f5b] shrink-0 shadow-2xs">
                <currentCategory.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                {currentCategory.label}
              </h2>
            </div>

            {/* Collapse / Close Button (visible on all viewports) */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileDrawerOpen(false);
                } else {
                  setSubSidebarOpen(false);
                }
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Minimize sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Sidebar Nav Lists */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-hide text-xs">
          {currentCategory.sections.map((section, idx) => {
            const accessibleItems = section.items.filter(item => item.roles.includes(role));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {/* Section Header */}
                <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <span>{section.title}</span>
                </div>

                {/* Section Links */}
                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const isItemActive = (() => {
                      if (location.pathname === item.path) return true;
                      // Keep parent website link active in DIGITAL PLATFORMS & PORTALS when navigating subpages
                      if (item.path.startsWith('/app/websites/') && item.path !== '/app/websites' && item.path !== '/app/websites/all') {
                        if (location.pathname.startsWith(`${item.path}/`)) {
                          return true;
                        }
                      }
                      // Handle outreach legacy route alias
                      if (item.path === '/app/websites/outreach' && location.pathname.startsWith('/app/outreach')) {
                        return true;
                      }
                      return false;
                    })();
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setMobileDrawerOpen(false);
                          }
                        }}
                        className={() =>
                          cn(
                            "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group",
                            isItemActive
                              ? "bg-[#001f5b]/10 text-[#001f5b] font-bold shadow-2xs border-l-3 border-[#001f5b]"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
                          )
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          {ItemIcon && (
                            <ItemIcon
                              className={cn(
                                "w-3.5 h-3.5 shrink-0 transition-colors",
                                isItemActive ? "text-[#001f5b]" : "text-slate-400 group-hover:text-slate-600"
                              )}
                            />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#001f5b]/10 text-[#001f5b]">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* VIEWS Section */}
          {currentCategory.views && currentCategory.views.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                <span>QUICK VIEWS</span>
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                {currentCategory.views.map((v, i) => {
                  const ViewIcon = v.icon || Eye;

                  if (v.hasDropdown) {
                    if (v.dropdownType === 'security') {
                      const isSecuritySub = location.pathname.startsWith('/app/security/');

                      return (
                        <div key={v.path || i} className="space-y-1">
                          <div
                            onClick={() => setSecurityDropdownOpen(!securityDropdownOpen)}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group cursor-pointer",
                              isSecuritySub
                                ? "bg-[#001f5b]/10 text-[#001f5b] font-bold shadow-2xs border-l-3 border-[#001f5b]"
                                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                            )}
                          >
                            <div className="flex flex-col min-w-0 pr-1 text-left">
                              <div className="flex items-center gap-2 truncate">
                                <ViewIcon
                                  className={cn(
                                    "w-3.5 h-3.5 shrink-0 transition-colors",
                                    isSecuritySub
                                      ? "text-[#001f5b]"
                                      : "text-slate-400 group-hover:text-slate-600"
                                  )}
                                />
                                <span className="truncate font-semibold">{v.label}</span>
                              </div>
                              {v.subtitle && (
                                <span className="text-[10px] text-slate-400 font-normal pl-5 truncate max-w-[170px]">
                                  {v.subtitle}
                                </span>
                              )}
                            </div>
                            <span className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                              {securityDropdownOpen ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </div>

                          {/* Collapsible Dropdown for Security dedicated sub-pages */}
                          {securityDropdownOpen && (
                            <div className="pl-5 space-y-0.5 border-l border-slate-200/90 ml-3.5 py-0.5">
                              {[
                                { label: 'Official Profile Badge', path: '/app/security/badge' },
                                { label: '2FA & Active Sessions', path: '/app/security/sessions' },
                                { label: 'Security Audit Specs', path: '/app/security/audit' }
                              ].map((sec) => {
                                const isSelected = location.pathname === sec.path;
                                return (
                                  <NavLink
                                    key={sec.path}
                                    to={sec.path}
                                    onClick={() => {
                                      if (window.innerWidth < 768) {
                                        setMobileDrawerOpen(false);
                                      }
                                    }}
                                    className={cn(
                                      "block px-2.5 py-1 rounded-md text-[11px] transition-colors truncate font-medium",
                                      isSelected
                                        ? "bg-[#001f5b] text-white font-bold shadow-2xs"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                  >
                                    {sec.label}
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isDeptPage = location.pathname.startsWith('/app/employees/departments');
                    const currentParamDept = new URLSearchParams(location.search).get('dept');

                    return (
                      <div key={v.path || i} className="space-y-1">
                        <div
                          onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group cursor-pointer",
                            isDeptPage && !currentParamDept
                              ? "bg-[#001f5b]/10 text-[#001f5b] font-bold shadow-2xs border-l-3 border-[#001f5b]"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                          )}
                        >
                          <div className="flex flex-col min-w-0 pr-1 text-left">
                            <div className="flex items-center gap-2 truncate">
                              <ViewIcon
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0 transition-colors",
                                  isDeptPage
                                    ? "text-[#001f5b]"
                                    : "text-slate-400 group-hover:text-slate-600"
                                )}
                              />
                              <span className="truncate font-semibold">{v.label}</span>
                            </div>
                            {v.subtitle && (
                              <span className="text-[10px] text-slate-400 font-normal pl-5 truncate max-w-[170px]">
                                {v.subtitle}
                              </span>
                            )}
                          </div>
                          <span className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                            {deptDropdownOpen ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>

                        {/* Collapsible Dropdown listing all departments that have employees */}
                        {deptDropdownOpen && (
                          <div className="pl-5 space-y-0.5 border-l border-slate-200/90 ml-3.5 py-0.5">
                            {hrActiveDepts.length === 0 ? (
                              <span className="text-[10px] text-slate-400 block px-2 py-1">
                                Loading departments...
                              </span>
                            ) : (
                              hrActiveDepts.map((dept) => {
                                const isSelected = isDeptPage && currentParamDept === dept;
                                return (
                                  <NavLink
                                    key={dept}
                                    to={`/app/employees/departments?dept=${encodeURIComponent(dept)}`}
                                    onClick={() => {
                                      if (window.innerWidth < 768) {
                                        setMobileDrawerOpen(false);
                                      }
                                    }}
                                    className={cn(
                                      "block px-2.5 py-1 rounded-md text-[11px] transition-colors truncate font-medium",
                                      isSelected
                                        ? "bg-[#001f5b] text-white font-bold shadow-2xs"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                  >
                                    {dept}
                                  </NavLink>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isCurrent = (() => {
                    if (!v.path) return false;
                    if (v.path.includes('#')) {
                      const hashIndex = v.path.indexOf('#');
                      const targetBasePath = v.path.substring(0, hashIndex);
                      const targetHash = v.path.substring(hashIndex);
                      const pathMatches = !targetBasePath || location.pathname === targetBasePath;
                      const currentHash = activeHash || location.hash;
                      return pathMatches && !!currentHash && currentHash === targetHash;
                    }
                    return location.pathname === v.path;
                  })();

                  return (
                    <NavLink
                      key={v.path || i}
                      to={v.path || '#'}
                      onClick={(e) => {
                        if (window.innerWidth < 768) {
                          setMobileDrawerOpen(false);
                        }
                        if (v.path?.includes('#')) {
                          const hashIndex = v.path.indexOf('#');
                          const targetBasePath = v.path.substring(0, hashIndex);
                          const hash = v.path.substring(hashIndex);

                          if (location.pathname === targetBasePath || !targetBasePath) {
                            e.preventDefault();
                            const el = document.querySelector(hash);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              window.history.pushState(null, '', v.path);
                              setActiveHash(hash);
                              window.dispatchEvent(new Event('hashchange'));
                            }
                          }
                        }
                      }}
                      className={() =>
                        cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group",
                          isCurrent
                            ? "bg-[#001f5b]/10 text-[#001f5b] font-bold shadow-2xs border-l-3 border-[#001f5b]"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                        )
                      }
                    >
                      <div className="flex flex-col min-w-0 pr-1 text-left">
                        <div className="flex items-center gap-2 truncate">
                          <ViewIcon
                            className={cn(
                              "w-3.5 h-3.5 shrink-0 transition-colors",
                              isCurrent
                                ? "text-[#001f5b]"
                                : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          <span className="truncate font-semibold">{v.label}</span>
                        </div>
                        {v.subtitle && (
                          <span className="text-[10px] text-slate-400 font-normal pl-5 truncate max-w-[190px]">
                            {v.subtitle}
                          </span>
                        )}
                      </div>
                      {v.count !== undefined && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0",
                            isCurrent
                              ? "bg-[#001f5b] text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {v.count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sub-Sidebar Footer */}
        <div className="p-2 border-t border-slate-100 bg-white flex items-center justify-center">
          <span className="text-[10px] text-slate-400 font-mono">ENAKO OS</span>
        </div>
      </aside>

      {/* Floating Re-Open Button when Sub-Sidebar is Collapsed */}
      {!subSidebarOpen && (
        <button
          onClick={() => setSubSidebarOpen(true)}
          className="hidden md:flex fixed left-[88px] top-20 z-40 p-1.5 bg-white border border-slate-200 shadow-md rounded-r-md text-slate-500 hover:text-[#001f5b] hover:bg-slate-50 transition-all cursor-pointer"
          title="Expand sub-sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main
        className={cn(
          "flex-1 min-w-0 flex flex-col transition-all duration-200 w-full",
          subSidebarOpen ? "md:ml-[328px] ml-0" : "md:ml-[88px] ml-0"
        )}
      >
        {/* Banner Announcements - ENAKO Brand Colors */}
        <div className="flex flex-col z-40 sticky top-0">
          <AnimatePresence>
            {announcement && showBanner && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#001f5b] text-white border-b border-[#001744] px-4 py-2 flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <Megaphone className="w-4 h-4 text-white" />
                  <p className="text-xs sm:text-sm font-bold">
                    {announcement.title}: <span className="font-normal text-slate-200">{announcement.content}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {unreadCount > 0 && showNotifBanner && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#001f5b] text-white px-4 py-2 flex items-center justify-between shadow-xs border-b border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <p className="text-xs sm:text-sm font-medium">
                    You have <span className="font-bold">{unreadCount}</span> unread alert{unreadCount > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNotif(true)}
                    className="text-xs font-bold uppercase tracking-wider hover:underline text-white/95 cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setShowNotifBanner(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── TOP HEADER (Clean White, Quick Access | Search, Support, Notifications, Profile) ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-4 shadow-2xs">
          {/* Left section: Hamburger & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileDrawerOpen(!mobileDrawerOpen);
                } else {
                  setSubSidebarOpen(!subSidebarOpen);
                }
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Active Module */}
            <h1 className="text-base font-bold text-slate-900 tracking-tight capitalize">
              {currentCategory.label}
            </h1>
          </div>

          {/* Center/Right section: Quick Access Search Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-52 sm:w-72" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(e.target.value.length > 0); }}
                onFocus={() => { if (searchQuery.length > 0) setShowSearch(true); }}
                placeholder="Quick Access | Search (Alt + q)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#001f5b] focus:border-[#001f5b] transition-all"
              />

              {/* Global Search Results Dropdown */}
              <AnimatePresence>
                {showSearch && searchQuery.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full right-0 mt-2 w-72 sm:w-84 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="w-5 h-5 text-[#001f5b] animate-spin" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(result => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => {
                              navigate(result.link);
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex flex-col"
                          >
                            <p className="text-xs font-bold text-slate-900">{result.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {result.type}
                              </span>
                              <p className="text-[10px] text-slate-400">{result.subtitle}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No results for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Headset / Support Icon */}
            <button
              onClick={() => navigate('/app/tickets')}
              className="p-1.5 text-slate-500 hover:text-[#001f5b] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Help & Support Desk"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="p-1.5 text-slate-500 hover:text-[#001f5b] hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h4 className="font-bold text-slate-900 text-xs">System Alerts</h4>
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-[#001f5b] uppercase tracking-wider hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-3 hover:bg-slate-50 transition-colors",
                              !n.readAt && "bg-slate-50"
                            )}
                          >
                            <p className="text-xs font-bold text-slate-900">{n.title || 'System Notification'}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{n.content || 'Please check your dashboard.'}</p>
                            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          No unread notifications
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotif(false)}
                      className="w-full p-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 text-center border-t border-slate-100 cursor-pointer"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Home Icon */}
            <Link
              to="/app/dashboard"
              className="p-1.5 text-slate-500 hover:text-[#001f5b] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Dashboard Home"
            >
              <Home className="w-4 h-4" />
            </Link>

            {/* User Mini Profile Avatar */}
            <NavLink to="/app/profile" className="flex items-center gap-2 group pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#001f5b] font-bold text-xs uppercase group-hover:ring-2 group-hover:ring-[#001f5b] transition-all">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  initials
                )}
              </div>
            </NavLink>
          </div>
        </header>

        {/* ── PAGE OUTLET ── */}
        <div className="flex-1 p-4 sm:p-6 lg:p-7">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </div>

        {/* ── ENTERPRISE FOOTER ── */}
        <footer className="bg-white border-t border-slate-200/80 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
          <p className="text-[11px] font-medium text-slate-500">
            © 2026 ENAKO COMPANY PLC. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/app/docs" className="text-[11px] font-semibold text-slate-500 hover:text-[#001f5b] transition-colors">
              Documentation
            </Link>
            <Link to="/app/kyc" className="text-[11px] font-semibold text-slate-500 hover:text-[#001f5b] transition-colors">
              Compliance Vault
            </Link>
            <Link to="/app/help" className="text-[11px] font-semibold text-slate-500 hover:text-[#001f5b] transition-colors">
              System Support
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
