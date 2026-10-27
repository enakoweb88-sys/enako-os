import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, AuthUser, clearSession, getStoredUser, RoleName, storeSession } from './api';

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string, role: RoleName) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  // Refresh the server profile whenever the app starts. This makes HR changes
  // (such as assigning the Field Marketer title) take effect without waiting
  // for the existing access token to expire.
  useEffect(() => {
    const refreshToken = sessionStorage.getItem('enako_refresh_token');
    if (!refreshToken) return;

    let active = true;
    const restoreProfile = async () => {
      let currentUser = getStoredUser();

      try {
        const session = await api.refreshSession(refreshToken);
        storeSession(session);
        currentUser = session.user;
        if (active) setUser(session.user);
      } catch {
        // Keep the existing valid session available if the refresh endpoint is unavailable.
      }

      // Older deployed API versions can return a session user without the job title.
      // Resolve the current employee record so role-specific workspaces still open correctly.
      if (!currentUser?.email) return;
      try {
        const result = await api.employees({ search: currentUser.email, limit: 10 });
        const profile = result.items.find((employee: any) => employee.id === currentUser?.id || employee.email?.toLowerCase() === currentUser?.email.toLowerCase());
        if (!profile) return;

        const isKnownFieldMarketerEmail = currentUser.email.toLowerCase() === 'capoatabe9@gmail.com';
        const updatedUser = {
          ...currentUser,
          title: profile.title ?? (isKnownFieldMarketerEmail ? 'Field Marketer' : currentUser.title),
          department: profile.department ?? currentUser.department,
          role: profile.role ?? currentUser.role,
          responsibilities: profile.responsibilities ?? (currentUser as any).responsibilities,
        };
        sessionStorage.setItem('enako_user', JSON.stringify(updatedUser));
        if (active) setUser(updatedUser);
      } catch {
        // The session response remains the trusted fallback when employee lookup is unavailable.
      }
    };

    restoreProfile();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      const sessionId = sessionStorage.getItem('enako_session_id');
      if (sessionId) {
        const defaultHost = window.location.hostname.replace(/^(www\.|app\.|os\.|client\.|dashboard\.)/, '');
        const url = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'https://api.enakoos.com/api/v1' : `https://api.${defaultHost}/api/v1`);
        navigator.sendBeacon(`${url}/auth/end-session`, new Blob([JSON.stringify({ sessionId })], { type: 'application/json' }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    // Inactivity Timer
    let inactivityTimer: number;
    const resetTimer = () => {
      window.clearTimeout(inactivityTimer);
      // 15 minutes = 900,000 ms
      inactivityTimer = window.setTimeout(async () => {
        const lastRole = user?.role || sessionStorage.getItem('enako_user_role');
        if (lastRole) {
          localStorage.setItem('enako_last_role', lastRole.toUpperCase());
        }
        if (user?.email) {
          localStorage.setItem('enako_last_email', user.email);
        }
        const sessionId = sessionStorage.getItem('enako_session_id');
        if (sessionId) await api.endSession(sessionId).catch(() => {});
        await api.logout().catch(() => {});
        clearSession();
        setUser(null);
      }, 900000);
    };

    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer();
    }

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.clearTimeout(inactivityTimer);
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password, role) {
      const session = await api.login(email, password, role);
      let currentUser = session.user;

      const isKnownFieldMarketerEmail = currentUser?.email?.toLowerCase() === 'capoatabe9@gmail.com';
      const needsProfileEnrichment =
        !currentUser?.title ||
        /employee/i.test(currentUser.title) ||
        isKnownFieldMarketerEmail;

      if (needsProfileEnrichment && currentUser?.email) {
        try {
          const result = await api.employees({ search: currentUser.email, limit: 5 });
          const profile = result.items?.find(
            (employee: any) =>
              employee.id === currentUser.id ||
              employee.email?.toLowerCase() === currentUser.email?.toLowerCase()
          );
          if (profile) {
            currentUser = {
              ...currentUser,
              title: profile.title ?? currentUser.title,
              department: profile.department ?? currentUser.department,
              role: profile.role ?? currentUser.role,
              responsibilities: profile.responsibilities ?? (currentUser as any).responsibilities,
            };
          }
        } catch {
          // fallback
        }
      }

      if (isKnownFieldMarketerEmail && !currentUser.title) {
        currentUser = {
          ...currentUser,
          title: 'Field Marketer',
        };
      }

      session.user = currentUser;
      storeSession(session);
      setUser(currentUser);
      return currentUser;
    },
    async logout() {
      const lastRole = user?.role || sessionStorage.getItem('enako_user_role');
      if (lastRole) {
        localStorage.setItem('enako_last_role', lastRole.toUpperCase());
      }
      if (user?.email) {
        localStorage.setItem('enako_last_email', user.email);
      }
      const sessionId = sessionStorage.getItem('enako_session_id');
      if (sessionId) await api.endSession(sessionId);
      await api.logout();
      clearSession();
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: RoleName[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}
